'use client';

import { useEffect, useMemo, useState } from 'react';

type Subscriber = {
  email: string;
  subscription_status: string | null;
  plan_name: string | null;
  print_size: string | null;
  current_period_end: string | null;
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubscribers() {
      const response = await fetch('/api/admin/subscribers');
      const result = await response.json();

      setSubscribers(result.subscribers || []);
      setLoading(false);
    }

    loadSubscribers();
  }, []);

  const stats = useMemo(() => {
    return {
      total: subscribers.length,
      reserved: subscribers.filter((s) =>
        ['trialing', 'active'].includes(s.subscription_status || '')
      ).length,
      explorer: subscribers.filter((s) => s.plan_name === 'Explorer Edition').length,
      adventurer: subscribers.filter((s) => s.plan_name === 'Adventurer Edition').length,
      collector: subscribers.filter((s) => s.plan_name === 'Collector Edition').length,
    };
  }, [subscribers]);

  function exportCsv() {
    const rows = [
      ['Email', 'Status', 'Membership', 'Print Size', 'Next Charge Date'],
      ...subscribers.map((s) => [
        s.email,
        s.subscription_status || '',
        s.plan_name || '',
        s.print_size || '',
        s.current_period_end || '',
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'bangers-subscribers.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <section className="max-w-7xl mx-auto">
        <a
          href="/admin"
          className="inline-flex mb-8 border border-white/20 px-5 py-2 rounded-xl hover:bg-white hover:text-black transition"
        >
          ← Back to Admin
        </a>

        <div className="flex items-start justify-between gap-6 mb-10">
          <div>
            <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-4">
              Admin Dashboard
            </p>
            <h1 className="text-5xl font-extralight">Subscribers</h1>
          </div>

          <button
            onClick={exportCsv}
            className="bg-white text-black px-6 py-3 rounded-xl font-medium"
          >
            Export CSV
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-4 mb-10">
          {[
            ['Total', stats.total],
            ['Reserved', stats.reserved],
            ['Explorer', stats.explorer],
            ['Adventurer', stats.adventurer],
            ['Collector', stats.collector],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-neutral-950 border border-white/10 rounded-2xl p-5"
            >
              <p className="text-neutral-500 uppercase tracking-[0.2em] text-xs mb-3">
                {label}
              </p>
              <p className="text-4xl font-extralight">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-neutral-950 border border-white/10 rounded-[2rem] overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-6 py-4 text-xs uppercase tracking-[0.2em] text-neutral-500 border-b border-white/10">
            <div>Email</div>
            <div>Status</div>
            <div>Membership</div>
            <div>Print Size</div>
            <div>Next Charge</div>
          </div>

          {loading ? (
            <div className="p-6 text-neutral-400">Loading subscribers...</div>
          ) : subscribers.length === 0 ? (
            <div className="p-6 text-neutral-400">No subscribers yet.</div>
          ) : (
            subscribers.map((subscriber) => (
              <div
                key={subscriber.email}
                className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/10 text-sm"
              >
                <div className="text-neutral-200 break-all">{subscriber.email}</div>
                <div>{subscriber.subscription_status || '—'}</div>
                <div>{subscriber.plan_name || '—'}</div>
                <div>{subscriber.print_size || '—'}</div>
                <div>
                  {subscriber.current_period_end
                    ? new Date(subscriber.current_period_end).toLocaleDateString(
                        'en-US',
                        {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          timeZone: 'UTC',
                        }
                      )
                    : '—'}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
