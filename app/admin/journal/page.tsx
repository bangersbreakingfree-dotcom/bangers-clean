'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { JournalInput, JournalPost, Recommendation, StoryBlock } from '@/lib/journal';
import { blankJournalPost, slugify } from '@/lib/journal';
import { parseJournalVideoUrl } from '@/lib/journal-video';
import { JournalVideoEmbed } from '@/components/journal/VideoEmbed';

const inputClass = 'w-full rounded-lg border border-white/15 bg-neutral-950 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-white/50 focus:outline-none';
const buttonClass = 'rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:border-white/50 hover:bg-white/10 disabled:opacity-40';
const categories: Recommendation['category'][] = ['See & Do', 'Stay', 'Eat & Drink', 'Photography', 'Other'];

async function jsonFetch(url: string, init?: RequestInit) {
  const result = await fetch(url, { ...init, cache: 'no-store' });
  const body = await result.json().catch(() => ({}));
  if (!result.ok) throw new Error(body.error || `Request failed (${result.status})`);
  return body;
}

function EditorField({ label, value, onChange, placeholder, rows = 0 }: {
  label: string; value: string; onChange: (s: string) => void; placeholder?: string; rows?: number;
}) {
  return <label className="block">
    <span className="mb-2 block text-xs uppercase tracking-[.12em] text-neutral-400">{label}</span>
    {rows ? <textarea rows={rows} className={inputClass} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      : <input className={inputClass} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />}
  </label>;
}

export default function JournalAdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [form, setForm] = useState<JournalInput>(blankJournalPost);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exclusiveConfirmed, setExclusiveConfirmed] = useState(false);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');

  const loadPosts = useCallback(async () => {
    const data = await jsonFetch('/api/journal/posts?admin=1');
    setPosts(data.posts);
  }, []);

  useEffect(() => {
    jsonFetch('/api/journal/auth').then(async data => {
      setAuthenticated(data.authenticated);
      if (data.authenticated) await loadPosts();
    }).catch(() => setNotice('Could not check your login.')).finally(() => setChecking(false));
    const unsaved = localStorage.getItem('bangers-journal-unsaved');
    if (unsaved) {
      try { setForm({ ...blankJournalPost(), ...JSON.parse(unsaved), status: 'draft' }); } catch { /* ignore */ }
    }
  }, [loadPosts]);

  useEffect(() => {
    if (!editingId) localStorage.setItem('bangers-journal-unsaved', JSON.stringify(form));
  }, [form, editingId]);

  function patch<K extends keyof JournalInput>(key: K, value: JournalInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }
  function changeBlock(index: number, next: StoryBlock) {
    setForm(prev => ({ ...prev, blocks: prev.blocks.map((b, i) => i === index ? next : b) }));
  }
  function reorder(index: number, by: number) {
    setForm(prev => {
      const blocks = [...prev.blocks];
      if (index + by < 0 || index + by >= blocks.length) return prev;
      [blocks[index], blocks[index + by]] = [blocks[index + by], blocks[index]];
      return { ...prev, blocks };
    });
  }
  function newStory() {
    const reset = blankJournalPost();
    setForm(reset); setEditingId(null); setExclusiveConfirmed(false); setPreview(false); setNotice('New story ready.');
    localStorage.removeItem('bangers-journal-unsaved');
  }
  function editStory(post: JournalPost) {
    const { id, published_at, created_at, updated_at, ...fields } = post;
    setForm(fields); setEditingId(id); setExclusiveConfirmed(false); setPreview(false); setNotice(`Editing “${post.title}”`);
  }

  async function login(e: FormEvent) {
    e.preventDefault(); setBusy(true); setNotice('');
    try {
      await jsonFetch('/api/journal/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password })
      });
      setAuthenticated(true); setPassword(''); await loadPosts();
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Login failed'); }
    finally { setBusy(false); }
  }
  async function logout() {
    await jsonFetch('/api/journal/auth', { method: 'DELETE' });
    setAuthenticated(false); setPosts([]); setPassword(''); setNotice('Signed out');
  }

  async function upload(file: File, onComplete: (url: string) => void) {
    if (!exclusiveConfirmed) { setNotice('Confirm that all images are NOT subscription-exclusive before uploading.'); return; }
    setUploading(true); setNotice('Uploading photo…');
    try {
      if (file.size > 12 * 1024 * 1024) throw new Error('Choose a photo smaller than 12 MB');
      const result = await jsonFetch('/api/journal/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exclusiveConfirmed: true, mimeType: file.type, fileSize: file.size })
      });
      // Direct browser-to-Supabase upload keeps photo bytes out of Vercel Functions.
      const fileData = new FormData();
      fileData.append('cacheControl', '3600');
      fileData.append('', file);
      const uploaded = await fetch(result.uploadUrl, {
        method: 'PUT', headers: { 'x-upsert': 'false' }, body: fileData
      });
      if (!uploaded.ok) throw new Error(`Photo upload failed (${uploaded.status})`);
      onComplete(result.publicUrl); setNotice('Photo uploaded to the Journal-only library.');
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Upload failed'); }
    finally { setUploading(false); }
  }
  function photoPicker(onComplete: (url: string) => void, label = 'Choose a photo') {
    return <label className={`${buttonClass} inline-flex cursor-pointer items-center gap-2 ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
      {uploading ? 'Uploading…' : label}
      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" disabled={uploading || !exclusiveConfirmed}
        onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file, onComplete); e.target.value = ''; }} />
    </label>;
  }

  async function save(status: 'draft' | 'published') {
    if (status === 'published' && !exclusiveConfirmed) {
      setNotice('Please confirm that the Journal contains no exclusive subscription prints.'); return;
    }
    setBusy(true); setNotice('Saving…');
    try {
      const data = await jsonFetch(editingId ? `/api/journal/posts/${editingId}` : '/api/journal/posts', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status, exclusiveConfirmed })
      });
      setEditingId(data.post.id);
      const { id, created_at, updated_at, published_at, ...fields } = data.post as JournalPost;
      setForm(fields);
      localStorage.removeItem('bangers-journal-unsaved');
      await loadPosts();
      setNotice(status === 'published' ? 'Published! Your story is live.' : 'Draft saved safely.');
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Save failed'); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!editingId || !window.confirm('Permanently delete this story? Uploaded photos will remain in the Journal bucket.')) return;
    setBusy(true);
    try {
      await jsonFetch(`/api/journal/posts/${editingId}`, { method: 'DELETE' });
      newStory(); await loadPosts(); setNotice('Story deleted.');
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Delete failed'); }
    finally { setBusy(false); }
  }

  if (checking) return <div className="min-h-screen bg-black p-12 text-white">Opening BANGERS Journal…</div>;
  if (!authenticated) return <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
    <form onSubmit={login} className="w-full max-w-md space-y-6 rounded-xl border border-white/15 bg-neutral-950 p-9">
      <a href="/" className="block text-xl tracking-[.3em]">BANGERS</a>
      <h1 className="text-3xl font-light">Journal editor</h1>
      <p className="text-sm leading-6 text-neutral-400">Use the same admin password you already use to edit BANGERS.</p>
      <label className="block"><span className="mb-2 block text-xs uppercase tracking-[.12em] text-neutral-400">Password</span>
        <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} required />
      </label>
      <button disabled={busy} className="w-full rounded-lg bg-white px-6 py-3 font-medium text-black disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
      {notice && <p role="alert" className="text-sm text-amber-300">{notice}</p>}
    </form>
  </main>;

  return <main className="min-h-screen bg-black text-white">
    <header className="border-b border-white/10 px-6 py-5"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
      <div><a href="/" className="text-xl tracking-[.3em]">BANGERS</a> <span className="ml-4 text-sm text-neutral-500">/ Journal editor</span></div>
      <div className="flex gap-3"><a href="/journal" target="_blank" className={buttonClass}>View Journal ↗</a><button className={buttonClass} onClick={logout}>Sign out</button></div>
    </div></header>
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6">
      <aside className="space-y-5">
        <button onClick={newStory} className="w-full rounded-lg bg-white px-5 py-3 font-medium text-black">+ New story</button>
        <div className="border-b border-white/10 pb-3 text-xs uppercase tracking-[.22em] text-neutral-400">Your stories ({posts.length})</div>
        {posts.length ? posts.map(p => <button key={p.id} onClick={() => editStory(p)}
          className={`block w-full rounded-lg border p-4 text-left ${editingId === p.id ? 'border-white/50 bg-neutral-900' : 'border-white/10 hover:bg-neutral-950'}`}>
          <span className="mb-2 block text-xs uppercase tracking-widest text-neutral-500">{p.status}</span>
          <span className="block font-medium">{p.title}</span>
          <span className="mt-2 block text-xs text-neutral-500">{p.location}</span>
        </button>) : <p className="text-sm text-neutral-500">No stories yet. Write your first one!</p>}
      </aside>

      <section className="min-w-0 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-3xl font-extralight md:text-4xl">{editingId ? 'Edit your story' : 'A new adventure'}</h1>
            <p className="mt-2 text-sm text-neutral-400">Tell the story, add your photos, then share your recommendations.</p></div>
          <button onClick={() => setPreview(!preview)} className={buttonClass}>{preview ? 'Back to editing' : 'Preview layout'}</button>
        </div>
        {notice && <div role="status" className="rounded-lg border border-amber-600/30 bg-amber-900/10 p-4 text-sm text-amber-200">{notice}</div>}

        <label className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-900/10 p-4 text-sm leading-6 text-neutral-200">
          <input type="checkbox" className="mt-1.5 h-4 w-4 accent-amber-500" checked={exclusiveConfirmed} onChange={e => setExclusiveConfirmed(e.target.checked)} />
          <span><strong>Journal photos only.</strong> I confirm that none of the photos I upload or publish are BANGERS subscription-exclusive print images. Check this before uploading photographs.</span>
        </label>

        {preview ? <div className="rounded-xl border border-white/10 bg-neutral-950 p-6 md:p-10">
          {form.cover_image && <img src={form.cover_image} alt={form.cover_alt} className="mb-8 aspect-video w-full rounded-lg object-cover" />}
          <p className="mb-3 text-xs uppercase tracking-[.25em] text-amber-400">{form.location} {form.country && `· ${form.country}`}</p>
          <h2 className="mb-5 text-4xl font-light">{form.title || 'Untitled story'}</h2>
          <p className="mb-10 text-neutral-400">{form.subtitle}</p>
          <div className="space-y-8">{form.blocks.map((b, i) => b.type === 'paragraph'
            ? <p key={i} className="whitespace-pre-line text-lg leading-9 text-neutral-300">{b.text}</p>
            : b.type === 'heading' ? <h3 key={i} className="text-3xl font-light">{b.text}</h3>
            : b.type === 'image' ? <figure key={i}><img src={b.src} alt={b.alt} className="w-full rounded-lg" /><figcaption className="text-center text-sm text-neutral-500">{b.caption}</figcaption></figure>
            : b.type === 'video' ? <div key={i}>{parseJournalVideoUrl(b.url)
              ? <JournalVideoEmbed url={b.url} caption={b.caption} />
              : <p className="text-sm text-amber-300">Add a valid YouTube or Vimeo URL to preview the video.</p>}</div>
            : <div key={i} className="grid grid-cols-2 gap-3">{b.photos.filter(p => p.src).map((p, j) => <img key={j} src={p.src} alt={p.alt} className="w-full rounded-lg" />)}</div>)}
          </div>
          <div className="mt-12 border-t border-white/15 pt-8"><h3 className="mb-5 text-2xl">My recommendations</h3>
            {form.recommendations.map((r, i) => <p key={i} className="mb-5"><strong>{r.name}</strong> <span className="text-neutral-500">· {r.category}</span><br />{r.note}</p>)}
            {form.travel_tips.map((t, i) => <p key={i} className="mb-4"><strong>{t.label}:</strong> {t.detail}</p>)}
          </div>
        </div> : <>
          <section className="space-y-5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-light">1. Your destination</h2>
            <EditorField label="Story title" value={form.title} onChange={v => setForm(p => ({ ...p, title: v, slug: editingId ? p.slug : slugify(v) }))} placeholder="A Week in the Northwoods" />
            <EditorField label="Short introduction" value={form.subtitle} onChange={v => patch('subtitle', v)} rows={2} placeholder="A couple of sentences to introduce the story…" />
            <div className="grid gap-4 md:grid-cols-2">
              <EditorField label="Destination / region" value={form.location} onChange={v => patch('location', v)} placeholder="Eagle River, Wisconsin" />
              <EditorField label="Country" value={form.country} onChange={v => patch('country', v)} placeholder="United States" />
            </div>
            <EditorField label="Story URL" value={form.slug} onChange={v => patch('slug', slugify(v))} placeholder="a-week-in-the-northwoods" />
          </section>

          <section className="space-y-5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-light">2. Your favorite location photo</h2>
            {form.cover_image && <img src={form.cover_image} alt={form.cover_alt} className="max-h-[450px] w-full rounded-lg object-cover" />}
            {photoPicker(url => patch('cover_image', url), form.cover_image ? 'Replace cover photo' : 'Upload cover photo')}
            <EditorField label="Describe the image (accessibility)" value={form.cover_alt} onChange={v => patch('cover_alt', v)} placeholder="Sunset above the lake in Eagle River" />
          </section>

          <section className="space-y-5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-light">3. Tell your story</h2>
            <p className="text-sm leading-6 text-neutral-400">Add text, headings, photos, and videos in any order. Use the arrows to move a section.</p>
            {form.blocks.map((b, index) => <div key={index} className="rounded-lg border border-white/10 bg-neutral-950 p-4">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="mr-auto text-xs uppercase tracking-[.2em] text-neutral-500">{index + 1} · {b.type}</span>
                <button className={buttonClass} disabled={index === 0} onClick={() => reorder(index, -1)} title="Move up">↑</button>
                <button className={buttonClass} disabled={index === form.blocks.length - 1} onClick={() => reorder(index, 1)} title="Move down">↓</button>
                <button className={buttonClass} onClick={() => patch('blocks', form.blocks.filter((_, i) => i !== index))}>Remove</button>
              </div>
              {b.type === 'paragraph' && <EditorField label="Story text" value={b.text} onChange={text => changeBlock(index, { type: 'paragraph', text })} rows={7} placeholder="Write naturally, just as you'd tell a friend about your trip…" />}
              {b.type === 'heading' && <EditorField label="Section heading" value={b.text} onChange={text => changeBlock(index, { type: 'heading', text })} placeholder="An unexpected sunrise" />}
              {b.type === 'image' && <div className="space-y-4">
                {b.src && <img src={b.src} alt={b.alt} className="max-h-[450px] w-full rounded-lg object-contain" />}
                {photoPicker(url => changeBlock(index, { ...b, src: url }), b.src ? 'Replace photo' : 'Upload photo')}
                <EditorField label="Photo description" value={b.alt} onChange={alt => changeBlock(index, { ...b, alt })} />
                <EditorField label="Caption (optional)" value={b.caption} onChange={caption => changeBlock(index, { ...b, caption })} />
              </div>}
              {b.type === 'video' && <div className="space-y-4">
                <EditorField label="YouTube or Vimeo video link" value={b.url}
                  onChange={url => changeBlock(index, { ...b, url })}
                  placeholder="https://www.youtube.com/watch?v=..." />
                <p className="text-xs text-neutral-500">Paste a video link (including YouTube Shorts). No embed code or uploads needed.</p>
                {b.url && (parseJournalVideoUrl(b.url)
                  ? <JournalVideoEmbed url={b.url} />
                  : <p className="text-sm text-amber-300">This link is not supported. Use a public YouTube or Vimeo URL.</p>)}
                <EditorField label="Video caption (optional)" value={b.caption}
                  onChange={caption => changeBlock(index, { ...b, caption })} />
              </div>}
              {b.type === 'pair' && <div className="space-y-4">
                <div className="grid gap-5 md:grid-cols-2">{b.photos.map((p, photoIndex) => <div key={photoIndex} className="space-y-3">
                  {p.src && <img src={p.src} alt={p.alt} className="aspect-[4/5] w-full rounded-lg object-cover" />}
                  {photoPicker(url => changeBlock(index, { ...b, photos: b.photos.map((v, j) => j === photoIndex ? { ...v, src: url } : v) }), `Photo ${photoIndex + 1}`)}
                  <EditorField label="Description" value={p.alt} onChange={alt => changeBlock(index, { ...b, photos: b.photos.map((v, j) => j === photoIndex ? { ...v, alt } : v) })} />
                </div>)}</div>
                <EditorField label="Caption (optional)" value={b.caption} onChange={caption => changeBlock(index, { ...b, caption })} />
              </div>}
            </div>)}
            <div className="flex flex-wrap gap-3">
              <button className={buttonClass} onClick={() => patch('blocks', [...form.blocks, { type: 'paragraph', text: '' }])}>+ Story text</button>
              <button className={buttonClass} onClick={() => patch('blocks', [...form.blocks, { type: 'heading', text: '' }])}>+ Heading</button>
              <button className={buttonClass} onClick={() => patch('blocks', [...form.blocks, { type: 'image', src: '', alt: '', caption: '' }])}>+ Photo</button>
              <button className={buttonClass} onClick={() => patch('blocks', [...form.blocks, { type: 'pair', photos: [{ src: '', alt: '' }, { src: '', alt: '' }], caption: '' }])}>+ Two photos</button>
              <button className={buttonClass} onClick={() => patch('blocks', [...form.blocks, { type: 'video', url: '', caption: '' }])}>+ Video</button>
            </div>
          </section>

          <section className="space-y-5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-light">4. Your recommendations</h2>
            <p className="text-sm text-neutral-400">Restaurants, hikes, hotels, photo spots—only add what makes sense for this location.</p>
            {form.recommendations.map((r, index) => <div key={index} className="space-y-3 rounded-lg border border-white/10 bg-neutral-950 p-4">
              <div className="flex items-center justify-between gap-3"><select className={inputClass} value={r.category} onChange={e => patch('recommendations', form.recommendations.map((v, j) => j === index ? { ...v, category: e.target.value as Recommendation['category'] } : v))}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select><button className={buttonClass} onClick={() => patch('recommendations', form.recommendations.filter((_, j) => j !== index))}>Remove</button></div>
              <EditorField label="Place / recommendation" value={r.name} onChange={name => patch('recommendations', form.recommendations.map((v, j) => j === index ? { ...v, name } : v))} />
              <EditorField label="Why you recommend it" rows={3} value={r.note} onChange={note => patch('recommendations', form.recommendations.map((v, j) => j === index ? { ...v, note } : v))} />
              <EditorField label="Website link (optional)" value={r.url} onChange={url => patch('recommendations', form.recommendations.map((v, j) => j === index ? { ...v, url } : v))} />
            </div>)}
            <button className={buttonClass} onClick={() => patch('recommendations', [...form.recommendations, { category: 'See & Do', name: '', note: '', url: '' }])}>+ Add recommendation</button>
          </section>

          <section className="space-y-5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-light">5. Before you go</h2>
            <p className="text-sm text-neutral-400">Optional practical details like best time to visit, how long to stay, or what you'd do differently.</p>
            {form.travel_tips.map((t, index) => <div key={index} className="grid items-end gap-3 md:grid-cols-[1fr_2fr_auto]">
              <EditorField label="Topic" value={t.label} onChange={label => patch('travel_tips', form.travel_tips.map((v, j) => j === index ? { ...v, label } : v))} placeholder="Best time to visit" />
              <EditorField label="Your advice" value={t.detail} onChange={detail => patch('travel_tips', form.travel_tips.map((v, j) => j === index ? { ...v, detail } : v))} />
              <button className={buttonClass} onClick={() => patch('travel_tips', form.travel_tips.filter((_, j) => j !== index))}>×</button>
            </div>)}
            <button className={buttonClass} onClick={() => patch('travel_tips', [...form.travel_tips, { label: '', detail: '' }])}>+ Add travel detail</button>
          </section>
        </>}

        <section className="space-y-5 rounded-xl border border-amber-500/25 bg-neutral-950 p-6">
          <h2 className="text-xl font-light">Ready when you are</h2>
          <label className="flex items-start gap-3 text-sm leading-6 text-neutral-200">
            <input type="checkbox" className="mt-1.5 h-4 w-4 accent-amber-500" checked={exclusiveConfirmed} onChange={e => setExclusiveConfirmed(e.target.checked)} />
            <span><strong>Every uploaded photo is non-exclusive.</strong> I confirm none of the images in this Journal story are, or will be, BANGERS subscription print photographs. The Journal image library is PUBLIC.</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-neutral-300">
            <input type="checkbox" checked={form.featured} onChange={e => patch('featured', e.target.checked)} className="h-4 w-4 accent-amber-500" />
            Feature this story on the Journal homepage
          </label>
          <div className="flex flex-wrap gap-3">
            <button disabled={busy || uploading} onClick={() => save('draft')} className={buttonClass}>{busy ? 'Saving…' : 'Save draft'}</button>
            <button disabled={busy || uploading || !exclusiveConfirmed} onClick={() => save('published')}
              className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-black disabled:opacity-40">{busy ? 'Saving…' : form.status === 'published' ? 'Update published story' : 'Publish story'}</button>
            {form.status === 'published' && <button disabled={busy} onClick={() => save('draft')} className={buttonClass}>Unpublish</button>}
            {editingId && <button disabled={busy} onClick={remove} className="ml-auto rounded-lg border border-red-600/40 px-4 py-3 text-sm text-red-300">Delete story</button>}
          </div>
          {form.status === 'published' && <a href={`/journal/${form.slug}`} target="_blank" rel="noreferrer" className="inline-block text-sm text-amber-300 underline">View published story ↗</a>}
          {!editingId && <p className="text-xs text-neutral-500">An unpublished writing backup is also kept locally in this browser.</p>}
        </section>
      </section>
    </div>
  </main>;
}
