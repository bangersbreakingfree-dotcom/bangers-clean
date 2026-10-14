/** Public journal content types. No subscription print assets are referenced here. */
export type StoryBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; src: string; alt: string; caption: string }
  | { type: 'pair'; photos: { src: string; alt: string }[]; caption: string };

export type Recommendation = {
  category: 'See & Do' | 'Stay' | 'Eat & Drink' | 'Photography' | 'Other';
  name: string;
  note: string;
  url: string;
};
export type TravelTip = { label: string; detail: string };
export type JournalStatus = 'draft' | 'published';

export type JournalPost = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  country: string;
  cover_image: string;
  cover_alt: string;
  blocks: StoryBlock[];
  recommendations: Recommendation[];
  travel_tips: TravelTip[];
  status: JournalStatus;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type JournalInput = Pick<JournalPost,
  'slug' | 'title' | 'subtitle' | 'location' | 'country' |
  'cover_image' | 'cover_alt' | 'blocks' | 'recommendations' | 'travel_tips' |
  'status' | 'featured'>;

export const blankJournalPost = (): JournalInput => ({
  slug: '', title: '', subtitle: '', location: '', country: '',
  cover_image: '', cover_alt: '',
  blocks: [{ type: 'paragraph', text: '' }],
  recommendations: [], travel_tips: [], status: 'draft', featured: false
});

export function slugify(input: string) {
  return input.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

export function isExternalLink(url: string) {
  if (!url) return true;
  try { const u = new URL(url); return ['https:', 'http:'].includes(u.protocol); }
  catch { return false; }
}
