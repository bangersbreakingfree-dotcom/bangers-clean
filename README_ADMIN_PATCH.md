# BANGERS Admin Dashboard Patch

Upload these files into your existing GitHub repo, replacing files with the same name.

Adds `/admin` so you can update homepage images and text.

## Supabase setup
Create a Supabase project. Create a public storage bucket named `site-images`.

Run this SQL in Supabase SQL Editor:

```sql
create table if not exists public.site_content (
  id text primary key default 'home',
  hero_kicker text, hero_title text, hero_subtitle text, hero_image_url text,
  collector_title text, collector_location text, collector_story text, collector_image_url text,
  experience_heading text, experience_text text, experience_image_url text,
  updated_at timestamptz default now()
);
insert into public.site_content (id) values ('home') on conflict (id) do nothing;
```

## Vercel env vars
Add these in Vercel Settings > Environment Variables:

```text
ADMIN_PASSWORD=make-a-strong-password
NEXT_PUBLIC_SUPABASE_URL=your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=your Supabase service role key
SUPABASE_STORAGE_BUCKET=site-images
```

Then redeploy. Go to `/admin`.
