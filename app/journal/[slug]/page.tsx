import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getJournalPost } from '@/lib/journal-server';
import type { JournalPost, StoryBlock } from '@/lib/journal';
import { JournalVideoEmbed } from '@/components/journal/VideoEmbed';

export const dynamic = 'force-dynamic';
type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  let post: JournalPost | null = null;
  try { post = await getJournalPost(slug); } catch { /* unavailable */ }
  if (!post) return { title: 'Story not found | BANGERS' };
  return {
    title: `${post.title} | The BANGERS Journal`, description: post.subtitle,
    openGraph: { title: post.title, description: post.subtitle,
      images: post.cover_image ? [{ url: post.cover_image, alt: post.cover_alt || post.title }] : [] }
  };
}

export function StoryContent({ blocks }: { blocks: StoryBlock[] }) {
  return <div className="space-y-9">
    {blocks.map((b, index) => {
      if (b.type === 'paragraph') return <p key={index} className="whitespace-pre-line text-lg font-light leading-9 text-neutral-300">{b.text}</p>;
      if (b.type === 'heading') return <h2 key={index} className="pt-5 text-3xl font-light leading-snug md:text-4xl">{b.text}</h2>;
      if (b.type === 'image') return <figure key={index} className="-mx-0 md:-mx-16">
        <img src={b.src} alt={b.alt || 'Travel photograph'} className="w-full rounded-lg" loading="lazy" />
        {b.caption && <figcaption className="pt-3 text-center text-sm text-neutral-500">{b.caption}</figcaption>}
      </figure>;
      if (b.type === 'video') return <JournalVideoEmbed key={index} url={b.url} caption={b.caption} className="md:-mx-16" />;
      if (b.type === 'pair') return <figure key={index} className="-mx-0 md:-mx-16">
        <div className="grid grid-cols-2 gap-3">{b.photos.map((p, i) => <img key={i} src={p.src} alt={p.alt || 'Travel photograph'} loading="lazy" className="h-full w-full rounded-lg object-cover" />)}</div>
        {b.caption && <figcaption className="pt-3 text-center text-sm text-neutral-500">{b.caption}</figcaption>}
      </figure>;
      return null;
    })}
  </div>;
}

export default async function StoryPage({ params }: Props) {
  const { slug } = params;
  let post: JournalPost | null = null;
  try { post = await getJournalPost(slug); } catch { notFound(); }
  if (!post) notFound();
  const published = post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
  const categories = Array.from(new Set(post.recommendations.map(r => r.category)));
  return <main className="min-h-screen bg-black text-white">
    <header className="border-b border-white/10 px-6 py-5"><nav className="mx-auto flex max-w-7xl items-center justify-between">
      <Link href="/" className="text-xl font-light tracking-[.3em]">BANGERS</Link>
      <Link href="/journal" className="text-xs uppercase tracking-[.2em] text-neutral-300">← The Journal</Link>
    </nav></header>
    <article>
      <div className="mx-auto max-w-5xl px-6 pb-10 pt-20 text-center">
        <p className="mb-5 text-xs uppercase tracking-[.3em] text-amber-500">{post.location} {post.country && `· ${post.country}`}</p>
        <h1 className="mb-7 text-5xl font-extralight leading-tight md:text-7xl">{post.title}</h1>
        <p className="mx-auto max-w-2xl text-lg leading-8 text-neutral-400">{post.subtitle}</p>
        {published && <p className="mt-7 text-xs uppercase tracking-[.2em] text-neutral-600">BANGERS Journal · {published}</p>}
      </div>
      <figure className="mx-auto max-w-[1500px] px-0 md:px-6"><img src={post.cover_image} alt={post.cover_alt || post.title} className="max-h-[760px] w-full object-cover md:rounded-lg" /></figure>
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <StoryContent blocks={post.blocks} />
        {(post.recommendations.length > 0 || post.travel_tips.length > 0) && <section className="mt-24 border-t border-white/15 pt-16">
          <p className="mb-3 text-xs uppercase tracking-[.3em] text-amber-500">The useful stuff</p>
          <h2 className="mb-10 text-4xl font-extralight">If you're planning a visit</h2>
          {categories.map(category => <div key={category} className="mb-12">
            <h3 className="mb-6 text-xl font-light text-white">{category}</h3>
            <div className="space-y-6">{post.recommendations.filter(r => r.category === category).map((r, i) => <div key={i} className="border-l border-white/20 pl-5">
              <h4 className="mb-2 text-lg font-medium">{r.url ? <a className="underline decoration-neutral-600 underline-offset-4 hover:decoration-white" href={r.url} target="_blank" rel="noreferrer noopener">{r.name} ↗</a> : r.name}</h4>
              {r.note && <p className="whitespace-pre-line leading-7 text-neutral-400">{r.note}</p>}
            </div>)}</div>
          </div>)}
          {post.travel_tips.length > 0 && <div className="mt-12 rounded-xl border border-white/10 bg-neutral-950 p-8">
            <h3 className="mb-7 text-2xl font-light">Before you go</h3>
            <dl className="space-y-5">{post.travel_tips.map((tip, i) => <div key={i} className="grid gap-2 border-b border-white/10 pb-5 last:border-0 last:pb-0 md:grid-cols-[170px_1fr]">
              <dt className="font-medium">{tip.label}</dt><dd className="whitespace-pre-line leading-7 text-neutral-400">{tip.detail}</dd>
            </div>)}</dl>
          </div>}
        </section>}
      </div>
    </article>
    <div className="border-t border-white/10 px-6 py-20 text-center">
      <p className="mb-3 text-xs uppercase tracking-[.25em] text-neutral-500">More than a photograph</p>
      <h2 className="mb-5 text-3xl font-extralight md:text-4xl">Explore the BANGERS photography club.</h2>
      <p className="mx-auto mb-8 max-w-xl text-neutral-400">The quarterly print collection is completely separate from the photos shared in this journal. Every subscriber print remains exclusive.</p>
      <Link href="/" className="inline-block rounded-lg border border-white/25 px-7 py-4 text-sm transition hover:bg-white hover:text-black">Discover BANGERS →</Link>
    </div>
    <footer className="border-t border-white/10 px-6 py-8 text-center text-xs tracking-[.2em] text-neutral-600">BANGERS · THE JOURNAL</footer>
  </main>;
}
