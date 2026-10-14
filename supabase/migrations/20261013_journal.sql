-- BANGERS Journal is intentionally separate from the exclusive subscription gallery.
-- Run in the same Supabase project used by the live site, after review.
create extension if not exists pgcrypto;

create table if not exists public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  subtitle text not null default '',
  location text not null default '',
  country text not null default '',
  cover_image text not null default '',
  cover_alt text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  travel_tips jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_posts_published_idx
  on public.journal_posts (published_at desc) where status = 'published';

create or replace function public.touch_journal_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists journal_posts_touch on public.journal_posts;
create trigger journal_posts_touch before update on public.journal_posts
for each row execute function public.touch_journal_updated_at();

alter table public.journal_posts enable row level security;
-- Anonymous/authenticated readers can view published stories only.
-- All writes go through the server and its service-role key after admin verification.
drop policy if exists "Journal published stories only" on public.journal_posts;
create policy "Journal published stories only" on public.journal_posts
for select to anon, authenticated using (status = 'published');

-- Dedicated PUBLIC images bucket. DO NOT upload exclusive subscription photos.
-- This bucket has no client-side upload policies: uploads use the protected server route.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('journal-photos', 'journal-photos', true, 12582912,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;
