'use client';

import Image from 'next/image';
import ReleaseCountdown from '../components/ReleaseCountdown';
import { useEffect, useMemo, useState } from 'react';
import { BillingCycle, planGroups, plans, Tier } from '@/lib/plans';
import { fallbackContent, SiteContent } from '@/lib/content';
import { supabase } from '@/lib/supabaseClient';
export default function HomePage() {
  const [tier, setTier] = useState<Tier>('adventurer');
  const [billing, setBilling] = useState<BillingCycle>('quarterly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<SiteContent>(fallbackContent);
const nextRelease = 'April 1, 2026';
const enrollmentCloses = 'March 15, 2026';
  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setContent({ ...fallbackContent, ...data }))
      .catch(() => setContent(fallbackContent));
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.tier === tier && plan.billing === billing)!,
    [tier, billing]
  );

  async function subscribe() {
  setLoading(true);

  try {
    const authResult = await supabase.auth.getUser();
    const user = authResult.data.user;
    if (!user) {
  alert('Please create an account or log in before purchasing.');
  window.location.href = '/account';
  return;
}

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier,
        billing,
        email: user?.email || email,
        userId: user?.id || '',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Checkout is not connected yet.');
    }

    window.location.href = data.url;
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : 'Checkout is not connected yet.'
    );
    setLoading(false);
  }
}

  return (
    <main className="bg-black text-white min-h-screen overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="relative max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="#" className="text-2xl tracking-[0.35em] font-light">BANGERS</a>

          <nav className="hidden md:flex items-center gap-10 text-sm uppercase tracking-[0.2em] text-neutral-300">
            <a href="#concept" className="hover:text-white transition">Concept</a>
            <a href="#membership" className="hover:text-white transition">Membership</a>
            <a href="/founder" className="hover:text-white transition">Behind the Lens</a>
            <a href="#experience" className="hover:text-white transition">Experience</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
            <a href="/gallery">Gallery</a>
            <a href="/account" className="hover:text-white transition">Account</a>
          </nav>
          <button
  type="button"
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  className="md:hidden border border-white/20 px-4 py-2 rounded-xl hover:bg-white hover:text-black transition"
>
  Menu
</button>
          {mobileMenuOpen && (
  <div className="absolute top-full left-0 right-0 bg-black border-t border-white/10 md:hidden">
    <div className="flex flex-col p-6 gap-4 text-sm uppercase tracking-[0.2em] text-neutral-300">
      <a href="#experience">Experience</a>
      <a href="/founder">Behind the Lens</a>
      <a href="#membership">Membership</a>
      <a href="/gallery">Gallery</a>
      <a href="#faq">FAQ</a>
      <a href="/account">Account</a>
    </div>
  </div>
)}

          <a href="#membership" className="border border-white/20 px-5 py-2 rounded-xl hover:bg-white hover:text-black transition">Join</a>
        </div>
      </header>

      <section
        className="relative min-h-screen flex items-center justify-center px-6"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,.88)), url('${content.hero_image_url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative max-w-6xl text-center pt-24">
          <p className="uppercase tracking-[0.45em] text-sm text-neutral-300 mb-6">
            {content.hero_kicker}
          </p>

        <div className="mb-8 flex justify-center">
  <img
  src={content.logo_image_url}
  alt="BANGERS"
  className="w-full max-w-4xl h-auto"
/>
</div>

          <p className="max-w-3xl mx-auto text-xl md:text-3xl text-neutral-200 leading-relaxed mb-12 font-light whitespace-pre-line">
            {content.hero_subtitle}
          </p>
<ReleaseCountdown />

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a href="#membership" className="bg-white text-black px-10 py-5 rounded-2xl text-lg font-medium hover:scale-105 transition duration-300 shadow-2xl">
              Become a Collector
            </a>

            <a href="#concept" className="border border-white/30 px-10 py-5 rounded-2xl text-lg hover:bg-white/10 transition duration-300">
              What Is A Banger?
            </a>
          </div>
        </div>
      </section>

      <section id="concept" className="py-32 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="uppercase tracking-[0.3em] text-sm text-neutral-400 mb-5">What Is A Banger?</p>

            <h2 className="text-5xl md:text-6xl font-extralight mb-10 leading-tight">
              You know it when you capture one.
            </h2>

            <div className="space-y-7 text-neutral-300 text-xl leading-relaxed font-light">
              <p>Some photos are technically good. Some are beautiful. But every once in a while, you capture something different.</p>
              <p>A true Banger feels rare. It tells a story. It freezes a moment that can never happen again.</p>
              <p>Every image released through this membership was captured during real travel experiences — mountain storms, alpine lakes, hidden roads, and places most people never see.</p>
              <p>These photos are never released publicly, never posted on social media, and never sold outside the membership.</p>
            </div>
          </div>

          <div className="bg-neutral-950 border border-white/10 rounded-[2rem] p-8 shadow-[0_0_80px_rgba(255,255,255,0.05)]">
            <div className="border border-white/10 rounded-[1.5rem] p-8 bg-black">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-8">
                <img
                  src={content.collector_image_url}
                  alt="Collector print example"
                  className="w-full h-full object-cover hover:scale-105 transition duration-700"
                />
              </div>

              <h3 className="text-3xl font-extralight">{content.collector_title}</h3>
              <p className="text-neutral-400 text-lg mt-2">{content.collector_location}</p>
              <p className="text-neutral-300 leading-relaxed text-lg font-light pt-4 mt-4 border-t border-white/10">
                {content.collector_story}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="membership" className="py-32 px-6 border-t border-white/10 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="uppercase tracking-[0.3em] text-sm text-neutral-400 mb-5">Membership Options</p>
            <h2 className="text-5xl md:text-7xl font-extralight mb-8">Choose Your Edition</h2>
            <p className="text-neutral-400 max-w-3xl mx-auto text-xl font-light leading-relaxed">
              No hard edition limits at launch — every member gets the quarterly BANGER release in their chosen size.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {planGroups.map((group) => (
              <div key={group.tier} className="border border-white/10 rounded-[2rem] p-10 bg-black hover:-translate-y-2 hover:border-white/20 transition duration-300">
                <p className="text-neutral-400 uppercase tracking-widest text-sm mb-4">{group.size} Fine Art Print</p>
                <h3 className="text-5xl font-extralight mb-4">{group.name}</h3>
                <p className="text-neutral-500 text-lg leading-relaxed font-light mb-8">{group.description}</p>

                <div className="space-y-5 mb-10">
                  <div className="flex justify-between border-b border-white/10 pb-4 text-lg">
                    <span className="text-neutral-400">Quarterly</span>
                    <span>{group.quarterly}</span>
                  </div>

                  <div className="flex justify-between border-b border-white/10 pb-4 text-lg">
                    <span className="text-neutral-400">Annual Discount</span>
                    <span>{group.annual}</span>
                  </div>

                  <div className="flex justify-between border-b border-white/10 pb-4 text-lg">
                    <span className="text-neutral-400">US Shipping</span>
                    <span>$9.99</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTier(group.tier);
                    document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-white text-black py-5 rounded-2xl text-lg font-medium hover:scale-[1.02] transition duration-300 shadow-xl"
                >
                  Select {group.name}
                </button>
              </div>
            ))}
          </div>

          <div id="checkout" className="bg-black border border-white/10 rounded-[2rem] p-10 md:p-14 shadow-[0_0_80px_rgba(255,255,255,0.05)]">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <p className="uppercase tracking-[0.2em] text-sm text-neutral-500 mb-4">Subscription Checkout</p>
                <h3 className="text-4xl font-extralight mb-6">BANGERS Membership</h3>
                <p className="text-neutral-300 text-lg leading-relaxed font-light">
                  Choose your edition and billing cycle. Stripe securely handles payment, tax, US shipping address, receipts, and recurring billing.
                </p>
              </div>

              <div className="bg-neutral-950 border border-white/10 rounded-[2rem] p-8 space-y-6">
                <div>
                  <label className="block text-sm uppercase tracking-[0.2em] text-neutral-500 mb-3">Select Edition</label>
                  <select value={tier} onChange={(event) => setTier(event.target.value as Tier)} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white">
                    <option value="explorer">Explorer Edition — 8x10</option>
                    <option value="adventurer">Adventurer Edition — 16x20</option>
                    <option value="collector">Collector Edition — 20x24</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-[0.2em] text-neutral-500 mb-3">Billing Frequency</label>
                  <select value={billing} onChange={(event) => setBilling(event.target.value as BillingCycle)} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white">
                    <option value="quarterly">Quarterly Billing</option>
                    <option value="annual">Annual Billing — Discounted</option>
                  </select>
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="collector@email.com"
                  className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-neutral-600"
                />

                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between text-lg mb-2">
                    <span className="text-neutral-400">Membership</span>
                    <span>{selectedPlan.amount} / {selectedPlan.billing === 'quarterly' ? 'quarter' : 'year'}</span>
                  </div>

                  <div className="flex justify-between text-sm text-neutral-500 mb-6">
                    <span>{selectedPlan.name}</span>
                    <span>{selectedPlan.size}</span>
                  </div>
<div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
  <p className="text-white text-lg font-light mb-3">
    You will not be charged today.
  </p>

  <p className="text-neutral-400 text-sm leading-relaxed">
    Your membership reserves a spot in the next available BANGERS quarterly release.
    Enrollment closes 15 days before each release. Billing occurs on the upcoming
    release date, and your first print ships at the same time.
  </p>
</div>
                  <button
                    onClick={subscribe}
                    disabled={loading}
                    className="w-full bg-white text-black py-5 rounded-2xl text-xl font-medium hover:scale-[1.02] transition duration-300 shadow-xl disabled:opacity-50"
                  >
                    {loading ? 'Opening Stripe...' : 'Continue to Stripe Checkout'}
                  </button>

                  <p className="text-center text-neutral-500 text-sm mt-5 leading-relaxed">
                    US shipping is $9.99. Checkout activates after Stripe keys are added.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className="py-32 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="uppercase tracking-[0.3em] text-sm text-neutral-400 mb-5">The Collector Experience</p>
            <h2 className="text-5xl md:text-7xl font-extralight leading-tight mb-8">
              {content.experience_heading}
            </h2>
            <p className="text-xl text-neutral-300 leading-relaxed font-light">
              {content.experience_text}
            </p>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10">
            <img
              src={content.experience_image_url}
              alt="Premium print packaging"
              className="w-full h-full object-cover hover:scale-105 transition duration-700"
            />
          </div>
        </div>
      </section>
      {/* QUARTERLY RELEASE SCHEDULE */}
      <section id="release-schedule" className="py-32 px-6 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="uppercase tracking-[0.3em] text-sm text-neutral-400 mb-5">
              Quarterly Release Schedule
            </p>

            <h2 className="text-5xl md:text-7xl font-extralight mb-8">
              Four releases. One shared drop.
            </h2>

            <p className="text-neutral-400 text-xl leading-relaxed max-w-4xl mx-auto font-light">
              BANGERS operates on a quarterly release model. Enrollment closes 15 days before each release, giving time to finalize edition counts, print, number, package, and ship every collector&apos;s print together.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              ['March 15', 'April 1'],
              ['June 15', 'July 1'],
              ['September 15', 'October 1'],
              ['December 15', 'January 1']
            ].map(([closes, ships]) => (
              <div key={closes} className="bg-neutral-950 border border-white/10 rounded-[2rem] p-8 text-center">
                <p className="text-neutral-500 uppercase tracking-[0.2em] text-sm mb-4">
                  Enrollment Closes
                </p>

                <h3 className="text-3xl font-extralight mb-8">
                  {closes}
                </h3>

                <div className="border-t border-white/10 pt-8">
                  <p className="text-neutral-500 uppercase tracking-[0.2em] text-sm mb-4">
                    Release Ships
                  </p>

                  <p className="text-3xl font-extralight">
                    {ships}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-neutral-950 border border-white/10 rounded-[2rem] p-10 md:p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-extralight mb-6">
              Printed, numbered, and shipped together.
            </h3>

            <p className="text-neutral-400 text-xl leading-relaxed max-w-4xl mx-auto font-light">
              Every quarterly release is individually numbered based on the final membership count for each edition. If you enroll after the cutoff date, your first print will be included in the following quarterly release.
            </p>
          </div>
        </div>
      </section>
      <section id="faq" className="py-32 px-6 bg-neutral-950 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="uppercase tracking-[0.3em] text-sm text-neutral-400 mb-5">FAQ</p>
            <h2 className="text-5xl md:text-7xl font-extralight">Common Questions</h2>
          </div>

          <div className="space-y-6">
            {[
              ['Are these photos posted online anywhere else?', 'No. Every image released through BANGERS is exclusive to members and will never be posted publicly or sold elsewhere.'],
              ['Are the prints limited?', 'Not at launch. Limited runs can be added later if the brand scales into collectible drops.'],
              ['Is shipping included?', 'Shipping is charged separately at checkout. Launch shipping is $9.99 and US only.'],
              ['Can I cancel my membership?', 'Yes. Memberships can be managed, paused, or canceled through Stripe once checkout is fully connected.']
            ].map(([question, answer]) => (
              <div key={question} className="border border-white/10 rounded-[2rem] p-8 bg-black">
                <h3 className="text-2xl font-light mb-4">{question}</h3>
                <p className="text-neutral-400 text-lg leading-relaxed font-light">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-2xl tracking-[0.35em] font-light mb-2">BANGERS</h3>
            <p className="text-neutral-500">Exclusive fine art travel photography.</p>
          </div>

          <div className="flex gap-8 text-neutral-400 uppercase tracking-[0.2em] text-sm">
            <a href="#membership">Membership</a>
            <a href="#faq">FAQ</a>
            <a href="mailto:hello@bangersprints.com">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}            
