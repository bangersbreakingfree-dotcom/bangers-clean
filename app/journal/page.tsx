import Link from 'next/link';
import type { Metadata } from 'next';
import { listJournalPosts } from '@/lib/journal-server';
import type { JournalPost } from '@/lib/journal';

export const metadata: Metadata = {
  title: 'The Journal | BANGERS',
  description: 'Travel stories, original photography, and thoughtful recommendations from the journeys behind BANGERS.'
};
export const dynamic = 'force-dynamic';

function Cover({ post, className = '' }: { post: JournalPost; className?: string }) {
  return post.cover_image ? <img src={post.cover_image} alt={post.cover_alt || post.title}
    className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] ${className}`} />
    : <div className="h-full w-full bg-neutral-900" />;
}

export default async function JournalIndex() {
  let posts: JournalPost[] = [];
  try { posts = await listJournalPosts(); } catch { /* Database may not be configured yet. */ }
  const featured = posts.find(p => p.featured) || posts[0];
  const others = posts.filter(p => p.id !== featured?.id);

  return <main className="min-h-screen bg-black text-white">
    <header className="border-b border-white/10 px-6 py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="text-xl font-light tracking-[.3em]">BANGERS</Link>
        <nav className="flex items-center gap-6 text-xs uppercase tracking-[.17em] text-neutral-300">
          <Link href="/journal" className="text-white">Journal</Link>
          <Link href="/" className="hover:text-white">Membership</Link>
        </nav>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:pt-24">
      <p className="mb-5 text-xs uppercase tracking-[.35em] text-neutral-400">Stories from beyond the lens</p>
      <h1 className="mb-6 text-5xl font-extralight tracking-tight md:text-8xl">The Journal<span className="text-amber-500">.</span></h1>
      <p className="mb-14 max-w-2xl text-lg font-light leading-relaxed text-neutral-400 md:text-xl">
        Places worth getting lost in. The moments I brought home, photographs along the way,
        and a few recommendations for your next adventure.
      </p>

      {featured ? <>
        <Link href={`/journal/${featured.slug}`} className="group relative block overflow-hidden rounded-xl border border-white/10">
          <div className="h-[340px] md:h-[560px]"><Cover post={featured} /></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-7 md:p-12">
            <p className="mb-3 text-xs uppercase tracking-[.25em] text-neutral-200">Featured story · {featured.location || featured.country}</p>
            <h2 className="mb-3 max-w-4xl text-3xl font-light md:text-6xl">{featured.title}</h2>
            <p className="max-w-2xl text-neutral-200">{featured.subtitle}</p>
            <span className="mt-5 inline-block border-b border-white/60 pb-1 text-sm">Read the story →</span>
          </div>
        </Link>
        {others.length > 0 && <div className="mt-16">
          <h2 className="mb-8 text-2xl font-light">More stories</h2>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {others.map(post => <Link key={post.id} href={`/journal/${post.slug}`} className="group block">
              <div className="mb-5 aspect-[4/3] overflow-hidden rounded-lg"><Cover post={post} /></div>
              <p className="mb-2 text-xs uppercase tracking-[.2em] text-neutral-500">{post.location || post.country}</p>
              <h3 className="mb-2 text-2xl font-light">{post.title}</h3>
              <p className="text-sm leading-7 text-neutral-400">{post.subtitle}</p>
            </Link>)}
          </div>
        </div>}
      </> : <div className="rounded-xl border border-white/10 bg-neutral-950 px-8 py-16 text-center">
        <h2 className="mb-3 text-2xl font-light">The first story is on its way.</h2>
        <p className="text-neutral-400">A collection of journeys, through my camera and in my own words.</p>
      </div>}
    </div>
    <footer className="border-t border-white/10 px-6 py-10 text-center text-xs tracking-[.2em] text-neutral-500">BANGERS · EXCLUSIVE PRINTS. OPEN ROADS.</footer>
  </main>;
}
