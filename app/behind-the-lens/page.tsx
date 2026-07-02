import { fallbackContent } from '@/lib/content';

function getYouTubeEmbedUrl(url: string) {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`;
    }

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  } catch {
    return url;
  }
}

export default async function FounderPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bangersprints.com';

  let content = fallbackContent;

  try {
    const res = await fetch(`${siteUrl}/api/content`, { cache: 'no-store' });
    const data = await res.json();
    content = { ...fallbackContent, ...data };
  } catch {
    content = fallbackContent;
  }

  const youtubeEmbedUrl = getYouTubeEmbedUrl(content.founder_youtube_url);

  const storyParagraphs = content.founder_story
    .split('\n')
    .filter((paragraph) => paragraph.trim().length > 0);

  return (
    <main className="bg-black text-white">
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
  <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
    <a href="/" className="text-lg tracking-[0.45em] font-light">
      BANGERS
    </a>

    <div className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-neutral-300">
      <a href="/" className="hover:text-white transition">
        Home
      </a>

      <a href="/#membership" className="hover:text-white transition">
        Membership
      </a>
    </div>
  </div>
</div>
      <section
        className="min-h-screen flex items-center px-6 py-32 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${content.founder_image_url})` }}
      >
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative max-w-6xl mx-auto w-full">
          <p className="uppercase tracking-[0.35em] text-amber-300 text-sm mb-6">
            {content.founder_kicker}
          </p>

          <h1 className="text-6xl md:text-8xl font-extralight leading-none max-w-4xl mb-8">
            {content.founder_title}
          </h1>

          <p className="text-xl text-neutral-200 leading-9 max-w-2xl">
            {content.founder_subtitle}
          </p>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 border-y border-white/10">
        <div
  className="min-h-[650px] bg-cover bg-center"
  style={{
    backgroundImage: `url(${content.founder_portrait_url || content.founder_image_url})`,
  }}
/>

        <div className="px-8 md:px-20 py-28 flex items-center">
          <div>
            <p className="uppercase tracking-[0.35em] text-amber-300 text-sm mb-6">
              My Story
            </p>

            <h2 className="text-5xl md:text-6xl font-extralight mb-10">
              {content.founder_story_heading}
            </h2>

            <div className="space-y-7 text-lg text-neutral-300 leading-9">
              {storyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-28 bg-neutral-950">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="uppercase tracking-[0.35em] text-amber-300 text-sm mb-6">
              Come Behind the Lens
            </p>

            <h2 className="text-5xl md:text-6xl font-extralight mb-8">
              {content.founder_video_heading}
            </h2>

            <p className="text-lg text-neutral-400 leading-8 mb-8">
              Every image has a story behind it. Come travel with me and see how they’re made.
            </p>
          </div>

          <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-black">
            <div className="aspect-video">
              {youtubeEmbedUrl ? (
                <iframe
                  className="w-full h-full"
                  src={youtubeEmbedUrl}
                  title="Founder Video"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500">
                  Add a YouTube URL in Admin
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-amber-300 text-sm text-center mb-14">
            The Gear I Trust
          </p>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
  [content.founder_camera_label, content.founder_camera],
  [content.founder_lens_label, content.founder_lens],
  [content.founder_drone_label, content.founder_drone],
  [content.founder_printing_label, content.founder_printing],
].map(([label, value]) => (
              <div key={label} className="border border-white/10 rounded-[2rem] p-8 bg-neutral-950">
                <p className="uppercase tracking-[0.25em] text-neutral-500 text-xs mb-4">
                  {label}
                </p>
                <p className="text-xl font-light">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    <section className="relative overflow-hidden py-44 px-6">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08),transparent_55%)]" />

  <div className="relative max-w-5xl mx-auto text-center">
    <h2 className="text-6xl md:text-8xl font-extralight leading-none mb-16">
      {content.founder_manifesto_headline}
    </h2>

    <p className="max-w-3xl mx-auto text-xl leading-9 text-neutral-400 mb-14">
      {content.founder_closing_text}
    </p>

    <div className="flex flex-col sm:flex-row gap-5 justify-center">
      <a
        href="/#membership"
        className="bg-white text-black rounded-full px-10 py-5 text-lg hover:bg-amber-300 transition-all duration-300"
      >
        Become a Member
      </a>

      <a
        href="/"
        className="border border-white/20 rounded-full px-10 py-5 text-lg hover:bg-white hover:text-black transition-all duration-300"
      >
        Back Home
      </a>
    </div>

    <p className="mt-20 text-2xl italic text-amber-300">
      {content.founder_signature}
    </p>
  </div>
</section>
    </main>
  );
}
