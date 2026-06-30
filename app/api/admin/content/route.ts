import { NextResponse } from 'next/server';
import { fallbackContent } from '@/lib/content';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

async function uploadImage(file: File, prefix: string) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new Error('Supabase is not connected.');
  }

  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'site-images';

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${prefix}-${Date.now()}.${ext}`;

  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(fallbackContent);
  }

  const { data } = await supabase
    .from('site_content')
    .select('*')
    .eq('id', 'home')
    .single();

  return NextResponse.json({
    ...fallbackContent,
    ...(data || {}),
  });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();

    if (
      (process.env.ADMIN_PASSWORD || '').trim() !==
      String(form.get('password') || '').trim()
    ) {
      return NextResponse.json(
        { error: 'Invalid admin password.' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not connected.' },
        { status: 400 }
      );
    }

    const heroFile = form.get('hero_image') as File | null;
    const collectorFile = form.get('collector_image') as File | null;
    const experienceFile = form.get('experience_image') as File | null;
    const logoFile = form.get('logo_image') as File | null;

    const founderFile = form.get('founder_image') as File | null;
    const founderPortraitFile = form.get('founder_portrait') as File | null;

    const payload: any = {
      id: 'home',
      updated_at: new Date().toISOString(),
    };

    const fields = [
      'hero_kicker',
      'hero_title',
      'hero_subtitle',
      'hero_image_url',
      'logo_image_url',

      'collector_title',
      'collector_location',
      'collector_story',
      'collector_image_url',

      'experience_heading',
      'experience_text',
      'experience_image_url',

      'founder_heading',
      'founder_intro',
      'founder_story',
      'founder_video',
      'founder_image_url',
      'founder_portrait_url'
    ];

    for (const key of fields) {
      payload[key] = String(form.get(key) || '');
    }

    if (heroFile && heroFile.size > 0) {
      payload.hero_image_url = await uploadImage(heroFile, 'hero');
    }

    if (collectorFile && collectorFile.size > 0) {
      payload.collector_image_url = await uploadImage(
        collectorFile,
        'collector'
      );
    }

    if (experienceFile && experienceFile.size > 0) {
      payload.experience_image_url = await uploadImage(
        experienceFile,
        'experience'
      );
    }

    if (logoFile && logoFile.size > 0) {
      payload.logo_image_url = await uploadImage(
        logoFile,
        'logo'
      );
    }

    if (founderFile && founderFile.size > 0) {
      payload.founder_image_url = await uploadImage(
        founderFile,
        'founder'
      );
    }

    if (founderPortraitFile && founderPortraitFile.size > 0) {
      payload.founder_portrait_url = await uploadImage(
        founderPortraitFile,
        'founder-portrait'
      );
    }

    const { error } = await supabase
      .from('site_content')
      .upsert(payload, {
        onConflict: 'id',
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      content: payload,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : 'Unable to update content.',
      },
      { status: 400 }
    );
  }
}
