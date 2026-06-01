import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not connected' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('gallery_images')
    .select('id, image_url, title, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ images: data || [] });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not connected' }, { status: 500 });
  }

  const formData = await request.formData();

  const file = formData.get('file') as File | null;
  const title = String(formData.get('title') || '');
  const sortOrder = Number(formData.get('sort_order') || 0);

  if (!file) {
    return NextResponse.json({ error: 'Missing image file' }, { status: 400 });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

const { error: uploadError } = await supabase.storage
  .from('gallery')
  .upload(fileName, buffer, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage
    .from('gallery')
    .getPublicUrl(fileName);

  const { data: existingImages } = await supabase
    .from('gallery_images')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);

  const nextId = existingImages?.[0]?.id ? Number(existingImages[0].id) + 1 : 1;

  const { error: insertError } = await supabase.from('gallery_images').insert({
    id: nextId,
    image_url: publicUrlData.publicUrl,
    title,
    sort_order: sortOrder,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
