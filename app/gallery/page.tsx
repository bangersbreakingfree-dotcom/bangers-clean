'use client';


import { useEffect, useState } from 'react';

type GalleryImage = {
  id: number;
  image_url: string;
  title: string | null;
  sort_order: number | null;
};

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      const response = await fetch('/api/gallery');
      const result = await response.json();

      setImages(result.images || []);
      setLoading(false);
    }

    loadImages();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <section className="max-w-7xl mx-auto">
        <a
          href="/"
          className="inline-flex mb-12 border border-white/20 px-5 py-2 rounded-xl hover:bg-white hover:text-black transition"
        >
          ← Back to Home
        </a>

        <div className="text-center mb-20">
          <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-5">
            BANGERS Gallery
          </p>

          <h1 className="text-5xl md:text-7xl font-extralight mb-8">
            Past work. Future trust.
          </h1>

          <p className="text-neutral-400 max-w-3xl mx-auto text-xl font-light leading-relaxed">
            This gallery features examples of my past photography. These images are not part of the BANGERS membership program and are not available as membership releases. They are here to give you a feel for my style, subjects, and approach to fine art travel photography.
          </p>
        </div>

        <div className="bg-neutral-950 border border-white/10 rounded-[2rem] p-8 mb-16">
          <p className="text-neutral-300 text-lg leading-relaxed font-light">
            BANGERS members receive exclusive quarterly prints that are never posted publicly or sold individually. The images below are simply examples of previous work so you can decide whether the style feels like something you would want delivered to your home.
          </p>
        </div>

        {loading ? (
          <p className="text-neutral-400 text-center">Loading gallery...</p>
        ) : images.length === 0 ? (
          <p className="text-neutral-400 text-center">Gallery images coming soon.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950 ${
                  index % 5 === 0 ? 'md:row-span-2' : ''
                }`}
              >
             <img
  src={image.image_url}
  alt={image.title || `BANGERS gallery example ${index + 1}`}
  className="w-full h-full object-cover hover:scale-105 transition duration-700"
/>
              </div>
            ))}
          </div>
        )}

        <div className="text-center bg-neutral-950 border border-white/10 rounded-[2rem] p-10">
          <h2 className="text-4xl md:text-5xl font-extralight mb-6">
            Like the style?
          </h2>

          <p className="text-neutral-400 max-w-2xl mx-auto text-lg leading-relaxed mb-8">
            Join BANGERS and receive exclusive quarterly fine art prints created only for members.
          </p>

          <a
            href="/#membership"
            className="inline-flex bg-white text-black px-8 py-4 rounded-xl uppercase tracking-[0.2em] text-sm font-medium"
          >
            Become a Member
          </a>
        </div>
      </section>
    </main>
  );
}
