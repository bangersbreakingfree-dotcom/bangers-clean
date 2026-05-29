export type SiteContent = {
  hero_kicker: string; hero_title: string; hero_subtitle: string; hero_image_url: string;
  collector_title: string; collector_location: string; collector_story: string; collector_image_url: string;
  experience_heading: string; experience_text: string; experience_image_url: string;
logo_image_url: string;
};
export const fallbackContent: SiteContent = {
  hero_kicker: 'Exclusive Fine Art Photography Club',
  hero_title: 'BANGERS',
  hero_subtitle: 'Rare travel photography delivered quarterly. Never posted online. Never sold publicly. Only available to members.',
  hero_image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070&auto=format&fit=crop',
  collector_title: 'First Light Over Moraine Lake',
  collector_location: 'Banff National Park · September 2026',
  collector_story: 'Captured after hiking before sunrise through freezing rain. The clouds opened for less than two minutes before disappearing completely.',
  collector_image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1974&auto=format&fit=crop',
  experience_heading: 'More than a print.',
  experience_text: 'Every shipment is designed to feel intentional, cinematic, and personal. Prints are produced in-house using archival fine art materials, carefully packaged, and shipped directly from the studio.',
  experience_image_url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1974&auto=format&fit=crop',

logo_image_url: '/bangers logo with clouds.png'
};
