import { NextRequest, NextResponse } from 'next/server';
import { currentJournalAdmin, journalDb, listJournalPosts, sameOrigin, validateJournalInput } from '@/lib/journal-server';

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const adminMode = req.nextUrl.searchParams.get('admin') === '1';
  if (adminMode && !(await currentJournalAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const posts = await listJournalPosts(adminMode);
    return NextResponse.json({ posts }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Journal database is unavailable' }, { status: 503 }); }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req) || !(await currentJournalAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (body?.status === 'published' && body?.exclusiveConfirmed !== true) {
      return NextResponse.json({ error: 'Confirm that no subscription-exclusive photos appear in this story' }, { status: 400 });
    }
    const input = validateJournalInput(body);
    const result = await journalDb('?select=*', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ ...input, published_at: input.status === 'published' ? new Date().toISOString() : null })
    });
    return NextResponse.json({ post: result[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not create post' }, { status: 400 });
  }
}
