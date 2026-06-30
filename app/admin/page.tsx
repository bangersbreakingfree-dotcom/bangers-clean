'use client';

import { useEffect, useState } from 'react';
import { fallbackContent, SiteContent } from '@/lib/content';

export default function AdminPage() {
  const [content, setContent] = useState<SiteContent>(fallbackContent);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((d) => setContent({ ...fallbackContent, ...d }))
      .catch(() => {});
  }, []);

  const field = (key: keyof SiteContent, value: string) => {
    setContent((current) => ({ ...current, [key]: value }));
  };

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setStatus('Saving...');

    const form = new FormData(e.currentTarget);
    form.set('password', password);

    Object.entries(content).forEach(([key, value]) => {
      form.set(key, value);
    });

    const res = await fetch('/api/admin/content', {
      method: 'POST',
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error || 'Error');
      setSaving(false);
      return;
    }

    setContent({ ...fallbackContent, ...data.content });
    setStatus('Saved. Refresh the site.');
    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <section className="max-w-5xl mx-auto">
        <p className="uppercase tracking-[0.3em] text-sm text-neutral-400 mb-4">
          BANGERS Admin
        </p>

        <h1 className="text-5xl md:text-7xl font-extralight mb-6">
          Update your site.
        </h1>

        <form onSubmit={save} className="space-y-8">
          <div className="bg-neutral-950 border border-white/10 rounded-[2rem] p-8">
            <label className="block text-sm uppercase tracking-[0.2em] text-neutral-500 mb-3">
              Admin Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white"
              required
            />
          </div>

          <Editor title="Hero Section">
            <Input label="Kicker" value={content.hero_kicker} onChange={(v) => field('hero_kicker', v)} />
            <Input label="Title" value={content.hero_title} onChange={(v) => field('hero_title', v)} />
            <Text label="Subtitle" value={content.hero_subtitle} onChange={(v) => field('hero_subtitle', v)} />
            <File name="hero_image" label="Upload Hero Image" />
            <Input label="Hero Image URL" value={content.hero_image_url} onChange={(v) => field('hero_image_url', v)} />
            <File name="logo_image" label="Upload Logo Image" />
            <Input label="Logo Image URL" value={content.logo_image_url} onChange={(v) => field('logo_image_url', v)} />
          </Editor>

          <Editor title="Collector Card">
            <Input label="Title" value={content.collector_title} onChange={(v) => field('collector_title', v)} />
            <Input label="Location / Date" value={content.collector_location} onChange={(v) => field('collector_location', v)} />
            <Text label="Story" value={content.collector_story} onChange={(v) => field('collector_story', v)} />
            <File name="collector_image" label="Upload Collector Image" />
            <Input label="Collector Image URL" value={content.collector_image_url} onChange={(v) => field('collector_image_url', v)} />
          </Editor>

          <Editor title="Experience Section">
            <Input label="Heading" value={content.experience_heading} onChange={(v) => field('experience_heading', v)} />
            <Text label="Text" value={content.experience_text} onChange={(v) => field('experience_text', v)} />
            <File name="experience_image" label="Upload Experience Image" />
            <Input label="Experience Image URL" value={content.experience_image_url} onChange={(v) => field('experience_image_url', v)} />
          </Editor>

          <Editor title="Founder Page">
            <Input label="Kicker" value={content.founder_kicker} onChange={(v) => field('founder_kicker', v)} />
            <Input label="Title" value={content.founder_title} onChange={(v) => field('founder_title', v)} />
            <Text label="Subtitle" value={content.founder_subtitle} onChange={(v) => field('founder_subtitle', v)} />
            <File name="founder_image" label="Upload Founder Image" />
            <File
  name="founder_portrait"
  label="Upload Founder Portrait"
/>

<Input
  label="Founder Portrait URL"
  value={content.founder_portrait_url}
  onChange={(v) => field('founder_portrait_url', v)}
/>
            <Input label="Founder Image URL" value={content.founder_image_url} onChange={(v) => field('founder_image_url', v)} />
            <Input label="Story Heading" value={content.founder_story_heading} onChange={(v) => field('founder_story_heading', v)} />
            <Text label="Founder Story" value={content.founder_story} onChange={(v) => field('founder_story', v)} />
            <Input label="Video Heading" value={content.founder_video_heading} onChange={(v) => field('founder_video_heading', v)} />
            <Input label="YouTube URL" value={content.founder_youtube_url} onChange={(v) => field('founder_youtube_url', v)} />
            <Input label="Camera" value={content.founder_camera} onChange={(v) => field('founder_camera', v)} />
            <Input label="Lens" value={content.founder_lens} onChange={(v) => field('founder_lens', v)} />
            <Input label="Drone" value={content.founder_drone} onChange={(v) => field('founder_drone', v)} />
            <Input label="Printing" value={content.founder_printing} onChange={(v) => field('founder_printing', v)} />
            <Input label="Closing Title" value={content.founder_closing_title} onChange={(v) => field('founder_closing_title', v)} />
            <Text label="Closing Text" value={content.founder_closing_text} onChange={(v) => field('founder_closing_text', v)} />
            <Input label="Signature" value={content.founder_signature} onChange={(v) => field('founder_signature', v)} />
          </Editor>

          <button
            disabled={saving}
            className="w-full bg-white text-black py-5 rounded-2xl text-xl font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Site Updates'}
          </button>

          {status && <p className="text-center text-neutral-300">{status}</p>}
        </form>
      </section>
    </main>
  );
}

function Editor({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-950 border border-white/10 rounded-[2rem] p-8 space-y-5">
      <h2 className="text-3xl font-extralight">{title}</h2>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm uppercase tracking-[0.2em] text-neutral-500 mb-2">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white"
      />
    </label>
  );
}

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm uppercase tracking-[0.2em] text-neutral-500 mb-2">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-32 bg-black border border-white/10 rounded-2xl px-5 py-4 text-white"
      />
    </label>
  );
}

function File({ label, name }: { label: string; name: string }) {
  return (
    <label className="block">
      <span className="block text-sm uppercase tracking-[0.2em] text-neutral-500 mb-2">
        {label}
      </span>

      <input
        name={name}
        type="file"
        accept="image/*"
        className="block w-full text-neutral-300"
      />
    </label>
  );
}
