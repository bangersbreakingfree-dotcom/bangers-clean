import { NextRequest, NextResponse } from 'next/server';
import { currentJournalAdmin, sameOrigin, createJournalUploadUrl } from '@/lib/journal-server';

export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  if (!sameOrigin(req) || !(await currentJournalAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await req.json();
    if (data.exclusiveConfirmed !== true) {
      return NextResponse.json({ error: 'Confirm this is NOT an exclusive BANGERS subscription photograph' }, { status: 400 });
    }
    const signed = await createJournalUploadUrl(data.mimeType, data.fileSize);
    return NextResponse.json(signed);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Photo upload failed' }, { status: 400 });
  }
}
