import { NextRequest, NextResponse } from 'next/server';
import { currentJournalAdmin, journalDb, sameOrigin, validateJournalInput } from '@/lib/journal-server';

export const dynamic = 'force-dynamic';
type Context = { params: { id: string } };
const validId = (id: string) => /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(id);

export async function PATCH(req: NextRequest, { params }: Context) {
  if (!sameOrigin(req) || !(await currentJournalAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  if (!validId(id)) return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
  try {
    const body = await req.json();
    if (body?.status === 'published' && body?.exclusiveConfirmed !== true) {
      return NextResponse.json({ error: 'Confirm that every photo is non-exclusive before publishing' }, { status: 400 });
    }
    const input = validateJournalInput(body);
    const result = await journalDb(`?id=eq.${id}&select=*`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ ...input, published_at: input.status === 'published' ? new Date().toISOString() : null })
    });
    if (!result[0]) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json({ post: result[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Save failed' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  if (!sameOrigin(req) || !(await currentJournalAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  if (!validId(id)) return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
  try {
    await journalDb(`?id=eq.${id}`, { method: 'DELETE' });
    return NextResponse.json({ deleted: true });
  } catch { return NextResponse.json({ error: 'Delete failed' }, { status: 500 }); }
}
