import { NextRequest, NextResponse } from 'next/server';
import { createSession, currentJournalAdmin, sameOrigin, sessionCookie } from '@/lib/journal-server';

export const dynamic = 'force-dynamic';
export async function GET() {
  const admin = await currentJournalAdmin();
  return NextResponse.json({ authenticated: !!admin }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  try {
    const { password } = await req.json();
    if (typeof password !== 'string' || password.length > 1000) {
      return NextResponse.json({ error: 'Admin password required' }, { status: 400 });
    }
    let session: string;
    try { session = createSession(password); }
    catch { return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 }); }
    const res = NextResponse.json({ authenticated: true });
    res.cookies.set(sessionCookie(session));
    return res;
  } catch {
    return NextResponse.json({ error: 'Could not sign in. Check the Journal configuration.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set({ ...sessionCookie(''), maxAge: 0 });
  return res;
}
