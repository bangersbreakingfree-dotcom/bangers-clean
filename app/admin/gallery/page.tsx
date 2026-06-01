'use client';

import { useEffect, useState } from 'react';

type GalleryImage = {
  id: number;
  image_url: string;
  title: string | null;
  sort_order: number | null;
};

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [message, setMessage] = useState('');

  async function loadImages() {
    const response = await fetch('/api/admin/gallery');
    const result = await response.json();
    setImages(result.images || []);
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function addImage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('Adding image...');
    if (!file) {
  setMessage('Please choose an image file first.');
  return;
}

const formData = new FormData();
formData.append('file', file);
formData.append('title', title);
formData.append('sort_order', sortOrder || '0');

    const response = await fetch('/api/admin/gallery', {
  method: 'POST',
  body: formData,
});

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || 'Unable to add image.');
      return;
    }

    setFile(null);
    setTitle('');
    setSortOrder('');
    setMessage('Image added.');
    loadImages();
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <section className="max-w-5xl mx-auto">
        <a
          href="/admin"
          className="inline-flex mb-8 border border-white/20 px-5 py-2 rounded-xl hover:bg-white hover:text-black transition"
        >
          ← Back to Admin
        </a>

        <h1 className="text-5xl font-extralight mb-6">Gallery Manager</h1>

        <p className="text-neutral-400 text-lg mb-10">
          Add example photos to the public BANGERS Gallery. These are past work examples and not membership release images.
        </p>

        <form onSubmit={addImage} className="bg-neutral-950 border border-white/10 rounded-[2rem] p-8 mb-10 space-y-5">

          <input
  required
  type="file"
  accept="image/*"
  onChange={(e) => setFile(e.target.files?.[0] || null)}
  className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white"
/>

          <input
            placeholder="Title, example: Yosemite Valley"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white"
          />

          <input
            type="number"
            placeholder="Sort order, example: 2"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white"
          />

          <button className="bg-white text-black px-6 py-3 rounded-xl">
            Add Gallery Image
          </button>

          {message && <p className="text-neutral-300">{message}</p>}
        </form>

        <div className="bg-neutral-950 border border-white/10 rounded-[2rem] overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-6 py-4 text-xs uppercase tracking-[0.2em] text-neutral-500 border-b border-white/10">
            <div>ID</div>
            <div>Title</div>
            <div>Image URL</div>
            <div>Sort Order</div>
          </div>

          {images.map((image) => (
            <div
              key={image.id}
              className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/10 text-sm"
            >
              <div>{image.id}</div>
              <div>{image.title || '—'}</div>
              <div className="break-all text-neutral-400">{image.image_url}</div>
              <div>{image.sort_order ?? '—'}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
