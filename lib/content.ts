export type SiteContent = {
  hero_kicker: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;

  collector_title: string;
  collector_location: string;
  collector_story: string;
  collector_image_url: string;

  experience_heading: string;
  experience_text: string;
  experience_image_url: string;

  logo_image_url: string;

  founder_kicker: string;
  founder_title: string;
  founder_subtitle: string;
  founder_image_url: string;
  founder_portrait_url: string;
  founder_story_heading: string;
  founder_story: string;
  founder_video_heading: string;
  founder_youtube_url: string;
  founder_camera: string;
  founder_lens: string;
  founder_drone: string;
  founder_printing: string;
  founder_closing_title: string;
  founder_closing_text: string;
  founder_signature: string;
};

export const fallbackContent: SiteContent = {
  hero_kicker: 'Exclusive Fine Art Photography Club',
  hero_title: 'BANGERS',
  hero_subtitle:
    'Rare travel photography delivered quarterly. Never posted online. Never sold publicly. Only available to members.',
  hero_image_url:
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070&auto=format&fit=crop',

  collector_title: 'First Light Over Moraine Lake',
  collector_location: 'Banff National Park · September 2026',
  collector_story:
    'Captured after hiking before sunrise through freezing rain. The clouds opened for less than two minutes before disappearing completely.',
  collector_image_url:
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1974&auto=format&fit=crop',

  experience_heading: 'More than a print.',
  experience_text:
    'Every shipment is designed to feel intentional, cinematic, and personal. Prints are produced in-house using archival fine art materials, carefully packaged, and shipped directly from the studio.',
  experience_image_url:
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1974&auto=format&fit=crop',

  logo_image_url: '/bangers logo with clouds.png',

  founder_kicker: 'Meet the Founder',
  founder_title: 'Every print begins with a story.',
  founder_subtitle:
    "Hi, I'm Sawyer. I created BANGERS because I wanted incredible travel photography to be experienced the way it was meant to be—printed, displayed, and collected.",
  founder_image_url: '/founder.jpg',
  founder_portrait_url: '/founder.jpg',
  founder_story_heading: 'Why BANGERS exists',
  founder_story:
    'I fell in love with photography because it lets us hold onto moments that disappear in seconds. Standing beneath mountains, watching wildlife, exploring remote places... those experiences deserve more than another forgotten image on a phone.\n\nSomewhere along the way I realized something: thousands of incredible photographs are taken every day, but almost none of them ever become real prints.\n\nBANGERS changes that.\n\nEvery quarter I release a single photograph. That’s it. No massive catalog. No unlimited downloads. Just one image I believe deserves a permanent place on your wall.',
  founder_video_heading: 'Come behind the lens',
  founder_youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  founder_camera: 'Sony A7 IV',
  founder_lens: 'Sony 24–70mm GM II',
  founder_drone: 'DJI Mini Series',
  founder_printing: 'Canon imagePROGRAF + archival fine art paper.',
  founder_closing_title: 'Thanks for being here.',
  founder_closing_text:
    "Whether you become a member or simply enjoy following the journey, thank you for supporting independent photography. I can't wait to share what's coming next.",
  founder_signature: '— Sawyer',
};
