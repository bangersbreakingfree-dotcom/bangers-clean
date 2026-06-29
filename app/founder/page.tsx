export default function FounderPage() {
  return (
    <main className="bg-black text-white">

      {/* HERO */}

      <section className="min-h-[85vh] flex items-center justify-center px-6">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-20 items-center">

          <div>
            <p className="uppercase tracking-[0.35em] text-neutral-500 text-sm mb-6">
              Meet the Founder
            </p>

            <h1 className="text-6xl md:text-7xl font-extralight leading-none mb-8">
              Every print begins
              <br />
              with a story.
            </h1>

            <p className="text-xl text-neutral-300 leading-9 max-w-xl">
              Hi, I'm Sawyer.
              I created BANGERS because I wanted incredible travel photography
              to be experienced the way it was meant to be—
              printed, displayed, and collected.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="rounded-[3rem] overflow-hidden border border-white/10 bg-neutral-900">
              <img
                src="/founder.jpg"
                alt="Founder"
                className="w-[500px] h-[650px] object-cover"
              />
            </div>
          </div>

        </div>
      </section>


      {/* STORY */}

      <section className="max-w-5xl mx-auto px-6 py-28">

        <h2 className="text-5xl font-extralight mb-10">
          Why BANGERS exists
        </h2>

        <div className="space-y-8 text-xl text-neutral-300 leading-10">

          <p>
            I fell in love with photography because it lets us hold onto moments
            that disappear in seconds. Standing beneath mountains,
            watching wildlife, exploring remote places...
            those experiences deserve more than another forgotten image on a phone.
          </p>

          <p>
            Somewhere along the way I realized something:
            thousands of incredible photographs are taken every day,
            but almost none of them ever become real prints.
          </p>

          <p>
            BANGERS changes that.
          </p>

          <p>
            Every quarter I release a single photograph.
            That's it.
            No massive catalog.
            No unlimited downloads.
            Just one image I believe deserves a permanent place on your wall.
          </p>

        </div>

      </section>


      {/* VIDEO */}

      <section className="px-6 py-20">

        <div className="max-w-6xl mx-auto">

          <h2 className="text-5xl font-extralight mb-10">
            Come behind the lens
          </h2>

          <div className="rounded-[2rem] overflow-hidden border border-white/10">

            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Founder Video"
                allowFullScreen
              />
            </div>

          </div>

        </div>

      </section>


      {/* VALUES */}

      <section className="max-w-6xl mx-auto px-6 py-28">

        <h2 className="text-5xl font-extralight mb-16">
          What every member receives
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {[
            {
              title: "One Exclusive Release",
              body:
                "Only one photograph is released each quarter, making every collection intentional.",
            },
            {
              title: "Museum Quality",
              body:
                "Every print is produced on premium archival paper built to last for decades.",
            },
            {
              title: "Personally Curated",
              body:
                "Every image is selected, prepared, and released by me—not an algorithm.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border border-white/10 rounded-[2rem] p-10 bg-neutral-950"
            >
              <h3 className="text-2xl font-light mb-5">
                {item.title}
              </h3>

              <p className="text-neutral-400 leading-8">
                {item.body}
              </p>
            </div>
          ))}

        </div>

      </section>


      {/* GEAR */}

      <section className="px-6 py-28">

        <div className="max-w-6xl mx-auto border border-white/10 rounded-[2rem] p-12 bg-neutral-950">

          <h2 className="text-5xl font-extralight mb-12">
            My current setup
          </h2>

          <div className="grid md:grid-cols-2 gap-10 text-lg">

            <div>
              <p className="uppercase tracking-[0.25em] text-neutral-500 mb-2">
                Camera
              </p>

              <p>Sony A7 IV</p>
            </div>

            <div>
              <p className="uppercase tracking-[0.25em] text-neutral-500 mb-2">
                Favorite Lens
              </p>

              <p>Sony 24–70mm GM II</p>
            </div>

            <div>
              <p className="uppercase tracking-[0.25em] text-neutral-500 mb-2">
                Drone
              </p>

              <p>DJI Mini Series</p>
            </div>

            <div>
              <p className="uppercase tracking-[0.25em] text-neutral-500 mb-2">
                Printing
              </p>

              <p>Canon imagePROGRAF + archival fine art paper.</p>
            </div>

          </div>

        </div>

      </section>


      {/* CLOSING */}

      <section className="px-6 pb-40">

        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-6xl font-extralight mb-8">
            Thanks for being here.
          </h2>

          <p className="text-xl text-neutral-300 leading-9 mb-12">
            Whether you become a member or simply enjoy following the journey,
            thank you for supporting independent photography.
            I can't wait to share what's coming next.
          </p>

          <p className="text-neutral-500 uppercase tracking-[0.3em]">
            — Sawyer
          </p>

        </div>

      </section>

    </main>
  );
}
