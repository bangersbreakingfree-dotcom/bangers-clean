export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <section className="max-w-4xl mx-auto">
        <a
          href="/"
          className="inline-flex mb-10 border border-white/20 px-5 py-2 rounded-xl hover:bg-white hover:text-black transition"
        >
          ← Back to Home
        </a>

        <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-5">
          BANGERS
        </p>

        <h1 className="text-5xl md:text-7xl font-extralight mb-8">
          Terms & Licensing Agreement
        </h1>

        <p className="text-neutral-400 mb-12">
          Last updated: June 2026 · Version 1.0
        </p>

        <div className="space-y-10 text-neutral-300 text-lg leading-relaxed">
          <section>
            <h2 className="text-3xl text-white font-extralight mb-4">
              1. Ownership of Photography
            </h2>
            <p>
              All photographs, prints, digital images, artwork, stories, written content,
              branding, and related materials provided by BANGERS remain the intellectual
              property of Sawyer Kuepker and BANGERS unless otherwise stated in writing.
            </p>
          </section>

          <section>
            <h2 className="text-3xl text-white font-extralight mb-4">
              2. Physical Print Ownership
            </h2>
            <p>
              A BANGERS membership or purchase gives you ownership of the physical print
              delivered to you. It does not transfer copyright, licensing rights,
              reproduction rights, distribution rights, commercial rights, or digital usage
              rights.
            </p>
          </section>

          <section>
            <h2 className="text-3xl text-white font-extralight mb-4">
              3. Personal Display Use
            </h2>
            <p>
              You may display your physical BANGERS print for personal, non-commercial use
              in your home, office, or personal space.
            </p>
          </section>

          <section>
            <h2 className="text-3xl text-white font-extralight mb-4">
              4. Restrictions
            </h2>
            <p>
              You may not reproduce, scan, photograph for reproduction, digitize, copy,
              distribute, sell, resell, sublicense, modify, create derivative works from,
              upload high-resolution copies of, or commercially use any BANGERS photograph
              or print without prior written permission from BANGERS.
            </p>
          </section>

          <section>
            <h2 className="text-3xl text-white font-extralight mb-4">
              5. Website Images
            </h2>
            <p>
              Images displayed on the BANGERS website, including gallery images and example
              work, are provided for viewing and reference only. These images may not be
              downloaded, copied, reused, reproduced, sold, or used for commercial purposes
              without written consent.
            </p>
          </section>

          <section>
            <h2 className="text-3xl text-white font-extralight mb-4">
              6. Membership Releases
            </h2>
            <p>
              BANGERS membership releases are exclusive physical print releases. Receiving
              a membership print does not grant any right to reproduce or distribute the
              image in any format.
            </p>
          </section>

          <section>
            <h2 className="text-3xl text-white font-extralight mb-4">
              7. Agreement
            </h2>
            <p>
              By creating an account or subscribing to BANGERS, you acknowledge and agree
              to these terms and understand that all photography rights remain with the
              creator unless separate written permission is granted.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
