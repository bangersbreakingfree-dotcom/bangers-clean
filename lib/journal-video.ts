/** Whitelisted external video links only. Never accept arbitrary iframe HTML. */
export type JournalVideo = { src: string; provider: 'YouTube' | 'Vimeo' };

export function parseJournalVideoUrl(input: string): JournalVideo | null {
  if (!input || input.length > 500) return null;
  try {
    const link = new URL(input.trim());
    if (link.protocol !== 'https:' || link.username || link.password) return null;
    const host = link.hostname.toLowerCase();
    const parts = link.pathname.split('/').filter(Boolean);
    let youtubeId: string | null = null;
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com',
      'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      if (link.pathname === '/watch') youtubeId = link.searchParams.get('v');
      else if (parts.length === 2 && ['embed', 'shorts', 'live'].includes(parts[0])) youtubeId = parts[1];
    } else if (['youtu.be', 'www.youtu.be'].includes(host) && parts.length === 1) {
      youtubeId = parts[0];
    }
    if (youtubeId !== null) {
      return /^[A-Za-z0-9_-]{11}$/.test(youtubeId)
        ? { src: `https://www.youtube-nocookie.com/embed/${youtubeId}`, provider: 'YouTube' }
        : null;
    }
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
      const id = parts.length === 1 ? parts[0]
        : parts.length === 2 && parts[0] === 'video' ? parts[1] : null;
      if (id && /^\d{6,12}$/.test(id)) {
        return { src: `https://player.vimeo.com/video/${id}`, provider: 'Vimeo' };
      }
    }
  } catch { /* Not a valid absolute URL */ }
  return null;
}
