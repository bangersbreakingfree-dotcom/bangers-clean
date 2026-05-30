'use client';

import { useEffect, useState } from 'react';

function getUpcomingRelease(now: Date) {
  const year = now.getFullYear();

  const schedule = [
    { closeMonth: 2, closeDay: 15, releaseMonth: 3, releaseDay: 1 },
    { closeMonth: 5, closeDay: 15, releaseMonth: 6, releaseDay: 1 },
    { closeMonth: 8, closeDay: 15, releaseMonth: 9, releaseDay: 1 },
    { closeMonth: 11, closeDay: 15, releaseMonth: 0, releaseDay: 1, releaseYearOffset: 1 }
  ];

  for (const item of schedule) {
    const releaseYear = year + (item.releaseYearOffset || 0);

    const close = new Date(year, item.closeMonth, item.closeDay, 23, 59, 59);
    const release = new Date(releaseYear, item.releaseMonth, item.releaseDay, 0, 0, 0);
    const end = new Date(releaseYear, item.releaseMonth, item.releaseDay, 23, 59, 59);

    if (now <= end) {
      return { close, release, end };
    }
  }

  return {
    close: new Date(year + 1, 2, 15, 23, 59, 59),
    release: new Date(year + 1, 3, 1, 0, 0, 0),
    end: new Date(year + 1, 3, 1, 23, 59, 59)
  };
}

export default function ReleaseCountdown() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const current = getUpcomingRelease(now || new Date());

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
          year: 'numeric'
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
}          </div>
        </>
      )}
    </div>
  );
}
