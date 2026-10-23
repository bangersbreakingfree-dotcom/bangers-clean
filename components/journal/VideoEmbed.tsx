import { parseJournalVideoUrl } from '@/lib/journal-video';

export function JournalVideoEmbed({ url, caption, className = '' }: {
  url: string; caption?: string; className?: string;
}) {
  const video = parseJournalVideoUrl(url);
  if (!video) return null;
  return <figure className={className}>
    <div className="aspect-video overflow-hidden rounded-lg bg-neutral-900">
      <iframe
        className="h-full w-full"
        src={video.src}
        title={`${video.provider} video`}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
    {caption && <figcaption className="pt-3 text-center text-sm text-neutral-500">{caption}</figcaption>}
  </figure>;
}
