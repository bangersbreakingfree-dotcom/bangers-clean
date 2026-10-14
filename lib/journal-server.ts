import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { JournalInput, JournalPost, StoryBlock } from './journal';
import { isExternalLink } from './journal';

const COOKIE = 'bangers_journal_admin';

function config() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !serviceKey) throw new Error('Journal Supabase environment variables missing');
  return { url, serviceKey };
}

function sessionSecret() {
  const secret = process.env.JOURNAL_SESSION_SECRET || '';
  if (secret.length < 32) throw new Error('JOURNAL_SESSION_SECRET must be at least 32 characters');
  return secret;
}

function adminPasswordMatches(provided: string) {
  const expected = (process.env.ADMIN_PASSWORD || '').trim();
  if (!expected || !provided) return false;
  const a = Buffer.from(provided.trim());
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(payload: string) {
  // Changing the existing admin password invalidates existing Journal sessions too.
  const sessionKey = createHmac('sha256', sessionSecret()).update(process.env.ADMIN_PASSWORD || '').digest();
  return createHmac('sha256', sessionKey).update(payload).digest('base64url');
}

export function createSession(password: string) {
  if (!adminPasswordMatches(password)) throw new Error('Invalid admin password');
  const payload = Buffer.from(JSON.stringify({ scope: 'journal', exp: Date.now() + 7 * 86400000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export async function currentJournalAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [payload, providedSignature, extra] = token.split('.');
  if (!payload || !providedSignature || extra) return null;
  try {
    const actual = Buffer.from(providedSignature, 'base64url');
    const expected = Buffer.from(sign(payload), 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const data: { scope: string; exp: number } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.scope !== 'journal' || typeof data.exp !== 'number' || data.exp < Date.now() || !process.env.ADMIN_PASSWORD) return null;
    return 'journal-editor';
  } catch { return null; }
}

export function sessionCookie(token: string) {
  return { name: COOKIE, value: token, httpOnly: true, sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 86400 };
}

export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || new URL(req.url).host;
    return new URL(origin).host === host;
  } catch { return false; }
}

export async function journalDb(path: string, init: RequestInit = {}) {
  const { url, serviceKey } = config();
  const response = await fetch(`${url}/rest/v1/journal_posts${path}`, {
    ...init, cache: 'no-store',
    headers: {
      'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  if (!response.ok) throw new Error(`Journal database error (${response.status}): ${(await response.text()).slice(0, 250)}`);
  return response.status === 204 ? null : response.json();
}

export async function listJournalPosts(includeDrafts = false): Promise<JournalPost[]> {
  const q = includeDrafts ? '?select=*&order=updated_at.desc&limit=200'
    : '?select=*&status=eq.published&order=published_at.desc&limit=200';
  return journalDb(q);
}

export async function getJournalPost(slug: string, includeDrafts = false): Promise<JournalPost | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const draftFilter = includeDrafts ? '' : '&status=eq.published';
  const rows: JournalPost[] = await journalDb(`?select=*&slug=eq.${encodeURIComponent(slug)}${draftFilter}&limit=1`);
  return rows[0] || null;
}

function ownedPhoto(url: string) {
  const { url: base } = config();
  if (!url || !url.startsWith(`${base}/storage/v1/object/public/journal-photos/`)) return false;
  const relative = url.slice(`${base}/storage/v1/object/public/journal-photos/`.length);
  return /^[a-f\d-]{36}\.(jpg|jpeg|png|webp|avif)$/.test(relative);
}

/** The public bucket is restricted to Journal photos, never the membership/gallery bucket. */
export function validateJournalInput(raw: unknown): JournalInput {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid story');
  const d = raw as Record<string, unknown>;
  const str = (name: string, max = 300) => {
    const v = d[name];
    if (typeof v !== 'string' || v.length > max) throw new Error(`Invalid ${name}`);
    return v.trim();
  };
  const title = str('title', 180);
  const slug = str('slug', 90);
  const status = d.status;
  if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Title and URL slug required');
  if (status !== 'draft' && status !== 'published') throw new Error('Invalid publishing status');
  const cover_image = str('cover_image', 500);
  if (cover_image && !ownedPhoto(cover_image)) throw new Error('Cover photo must be uploaded to the dedicated Journal bucket');
  if (status === 'published' && !cover_image) throw new Error('Add a cover photo before publishing');
  if (!Array.isArray(d.blocks) || d.blocks.length > 80) throw new Error('Invalid story sections');
  const blocks: StoryBlock[] = d.blocks.map((block: unknown) => {
    if (!block || typeof block !== 'object') throw new Error('Invalid story section');
    const b = block as Record<string, unknown>;
    if (b.type === 'paragraph' || b.type === 'heading') {
      if (typeof b.text !== 'string' || b.text.length > 10000) throw new Error('Story text is too long');
      return { type: b.type, text: b.text };
    }
    if (b.type === 'image') {
      if (typeof b.src !== 'string' || (b.src ? !ownedPhoto(b.src) : status === 'published')) throw new Error('Upload story images to the Journal bucket');
      return { type: 'image', src: b.src, alt: String(b.alt || '').slice(0, 250), caption: String(b.caption || '').slice(0, 300) };
    }
    if (b.type === 'pair') {
      if (!Array.isArray(b.photos) || b.photos.length !== 2) throw new Error('Paired photo blocks need two photos');
      const photos = b.photos.map((p: unknown) => {
        const photo = p as { src?: string; alt?: string };
        if (!photo || typeof photo.src !== 'string' || (photo.src ? !ownedPhoto(photo.src) : status === 'published')) throw new Error('Upload both paired photos to the Journal bucket');
        return { src: photo.src, alt: String(photo.alt || '').slice(0, 250) };
      });
      return { type: 'pair', photos, caption: String(b.caption || '').slice(0, 300) };
    }
    throw new Error('Unknown story block type');
  });
  if (status === 'published' && !blocks.some(b => b.type === 'paragraph' && b.text.trim())) {
    throw new Error('Add your story before publishing');
  }
  if (!Array.isArray(d.recommendations) || d.recommendations.length > 50) throw new Error('Too many recommendations');
  const categories = ['See & Do', 'Stay', 'Eat & Drink', 'Photography', 'Other'];
  const recommendations = d.recommendations.map((r: unknown) => {
    const x = r as Record<string, unknown>;
    if (!x || !categories.includes(String(x.category))) throw new Error('Invalid recommendation category');
    const name = String(x.name || '').trim().slice(0, 180);
    const note = String(x.note || '').trim().slice(0, 2000);
    const url = String(x.url || '').trim().slice(0, 1000);
    if (!name || !isExternalLink(url)) throw new Error('A recommendation needs a name and a valid link');
    return { category: x.category, name, note, url };
  }) as JournalInput['recommendations'];
  if (!Array.isArray(d.travel_tips) || d.travel_tips.length > 40) throw new Error('Too many travel details');
  const travel_tips = d.travel_tips.map((r: unknown) => {
    const x = r as Record<string, unknown>;
    const label = String(x?.label || '').trim().slice(0, 120);
    const detail = String(x?.detail || '').trim().slice(0, 2000);
    if (!label) throw new Error('Each travel detail needs a label');
    return { label, detail };
  });
  return {
    title, slug, subtitle: str('subtitle', 450), location: str('location', 150), country: str('country', 100),
    cover_image, cover_alt: str('cover_alt', 250), blocks, recommendations, travel_tips,
    status, featured: d.featured === true
  };
}

/** Issue a temporary upload URL so large photos bypass Vercel's 4.5MB function payload cap. */
export async function createJournalUploadUrl(mimeType: string, fileSize: number) {
  const { url, serviceKey } = config();
  const types: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif'
  };
  const ext = types[mimeType];
  if (!ext || !Number.isInteger(fileSize) || fileSize < 1 || fileSize > 12 * 1024 * 1024) {
    throw new Error('Use a JPEG, PNG, WebP, or AVIF photo up to 12 MB');
  }
  const objectName = `${crypto.randomUUID()}.${ext}`;
  const response = await fetch(`${url}/storage/v1/object/upload/sign/journal-photos/${objectName}`, {
    method: 'POST', cache: 'no-store', body: '{}',
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error(`Could not authorize photo upload (${response.status})`);
  const data: { url?: string } = await response.json();
  // Supabase returns a relative /object/upload/sign/... URL containing its temporary token.
  if (!data.url?.startsWith(`/object/upload/sign/journal-photos/${objectName}?`)) {
    throw new Error('Unexpected signed upload URL');
  }
  const uploadUrl = `${url}/storage/v1${data.url}`;
  return { uploadUrl, publicUrl: `${url}/storage/v1/object/public/journal-photos/${objectName}` };
}
