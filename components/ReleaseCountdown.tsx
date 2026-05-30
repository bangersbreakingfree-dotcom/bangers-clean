'use client';

import { useEffect, useState } from 'react';

const releases = [
  { close: new Date('2026-06-15T23:59:59'), release: new Date('2026-07-01T00:00:00'), end: new Date('2026-07-01T23:59:59') },
  { close: new Date('2026-09-15T23:59:59'), release: new Date('2026-10-01T00:00:00'), end: new Date('2026-10-01T23:59:59') },
  { close: new Date('2026-12-15T23:59:59'), release: new Date('2027-01-01T00:00:00'), end: new Date('2027-01-01T23:59:59') },
  { close: new Date('2027-03-15T23:59:59'), release: new Date('2027-04-01T00:00:00'), end: new Date('2027-04-01T23:59:59') },
];

export default function ReleaseCountdown() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const current = releases.find((item) => !now || now <= item.end) || releases[0];

  const enrollmentOpen = !now || now <= current.close;
  const releaseDay = now && now >= current.release && now <= current.end;
  const inProduction = now && now > current.close && now < current.release;

  const target = enrollmentOpen ? current.close : current.release;
  const timeLeft = now ? Math.max(target.getTime() - now.getTime(), 0) : 0;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);

  return (
    <div className="max-w-3xl mx-auto mb-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-6">
      <p className="uppercase tracking-[0.3em] text-xs text-neutral-400 mb-3">
        Next BANGERS Release
      </p>

      <p className="text-3xl md:text-5xl font-extralight mb-3">
        {current.release.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>

      {releaseDay ? (
        <p className="text-neutral-400 text-lg">Release ships today.</p>
      ) : inProduction ? (
        <p className="text-neutral-400 text-lg">
          Enrollment is closed. This release is currently in production.
        </p>
      ) : (
        <>
          <p className="text-neutral-400 text-lg mb-4">
  Enrollment closes on{' '}
  {current.close.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  })}{' '}
  in
</p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-2xl font-light">{days}</p>
              <p className="text-xs uppercase tracking-widest text-neutral-500">Days</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-2xl font-light">{hours}</p>
              <p className="text-xs uppercase tracking-widest text-neutral-500">Hours</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-2xl font-light">{minutes}</p>
              <p className="text-xs uppercase tracking-widest text-neutral-500">Minutes</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
