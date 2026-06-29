import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <section className="max-w-3xl text-center">
        <p className="uppercase tracking-[0.3em] text-sm text-neutral-400 mb-6">Welcome to BANGERS</p>
        <h1 className="text-5xl md:text-7xl font-extralight leading-tight mb-8">Welcome To The Club.</h1>
        <p className="text-neutral-400 text-xl leading-relaxed mb-10">Your first exclusive fine art release will be prepared for your first scheduled quarterly shipment.</p>
        <Link href="/" className="inline-block bg-white text-black px-10 py-5 rounded-2xl text-lg font-medium hover:scale-105 transition">Return Home</Link>
      </section>
    </main>
  );
}
