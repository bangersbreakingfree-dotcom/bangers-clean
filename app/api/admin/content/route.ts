import { NextResponse } from 'next/server';
import { fallbackContent } from '@/lib/content';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
async function uploadImage(file: File, prefix: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase is not connected.');
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'site-images';
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${prefix}-${Date.now()}.${ext}`;
  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, { contentType: file.type, upsert: true });
  if (error) throw new Error(error.message);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json(fallbackContent);
  const { data } = await supabase.from('site_content').select('*').eq('id','home').single();
  return NextResponse.json({ ...fallbackContent, ...(data || {}) });
}
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    if (!process.env.ADMIN_PASSWORD || String(form.get('password')||'') !== process.env.ADMIN_PASSWORD) return NextResponse.json({error:'Invalid admin password.'},{status:401});
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({error:'Supabase is not connected.'},{status:400});
    const heroFile=form.get('hero_image') as File|null, collectorFile=form.get('collector_image') as File|null, experienceFile=form.get('experience_image') as File|null;
    const payload:any={id:'home', updated_at:new Date().toISOString()};
    for (const key of ['hero_kicker','hero_title','hero_subtitle','hero_image_url','collector_title','collector_location','collector_story','collector_image_url','experience_heading','experience_text','experience_image_url']) payload[key]=String(form.get(key)||'');
    if (heroFile && heroFile.size>0) payload.hero_image_url=await uploadImage(heroFile,'hero');
    if (collectorFile && collectorFile.size>0) payload.collector_image_url=await uploadImage(collectorFile,'collector');
    if (experienceFile && experienceFile.size>0) payload.experience_image_url=await uploadImage(experienceFile,'experience');
    const { error } = await supabase.from('site_content').upsert(payload,{onConflict:'id'});
    if (error) return NextResponse.json({error:error.message},{status:400});
    return NextResponse.json({ok:true, content:payload});
  } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:'Unable to update content.'},{status:400}); }
}
