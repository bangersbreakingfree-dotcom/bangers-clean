'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [printSize, setPrintSize] = useState<string | null>(null);
  const [nextChargeDate, setNextChargeDate] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      setUserEmail(data.user?.email ?? null);

      if (data.user?.email) {
        const response = await fetch('/api/account-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.user.email }),
        });

        const profile = await response.json();

        setSubscriptionStatus(profile?.subscription_status ?? null);
        setPlanName(profile?.plan_name ?? null);
        setPrintSize(profile?.print_size ?? null);
        setNextChargeDate(profile?.current_period_end ?? null);
      }
    }

    loadUser();
  }, []);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('Signing in...');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      return;
    }

    setUserEmail(email);
    setMessage('');
  }

  async function signUp() {
    if (!termsAccepted) {
  setMessage('You must agree to the Terms & Licensing Agreement before creating an account.');
  return;
}
    setMessage('Creating account...');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://bangersprints.com/account',
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Account created. Check your email to confirm it, then log in.');
  }

  async function openPortal() {
    const { data } = await supabase.auth.getUser();

    const response = await fetch('/api/customer-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: data.user?.id }),
    });

    const result = await response.json();

    if (result.url) {
      window.location.href = result.url;
    } else {
      alert(result.error || 'Unable to open subscription portal.');
    }
  }

  async function updatePassword() {
    setMessage('Updating password...');

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setNewPassword('');
    setMessage('Password updated successfully.');
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserEmail(null);
  }

  if (userEmail) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-20">
        <section className="max-w-5xl mx-auto">
          <a
            href="/"
            className="inline-flex mb-8 border border-white/20 px-5 py-2 rounded-xl hover:bg-white hover:text-black transition"
          >
            ← Back to Home
          </a>

          <h1 className="text-5xl font-extralight mb-6">Your Account</h1>
          <p className="text-neutral-300 mb-8">Signed in as {userEmail}</p>

          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5">
              <p className="text-neutral-500 uppercase tracking-[0.2em] text-xs mb-3">Membership Status</p>
              <p className="text-2xl font-extralight">
                {subscriptionStatus === 'trialing'
  ? 'Reserved'
  : subscriptionStatus === 'active'
  ? 'Reserved'
  : subscriptionStatus === 'incomplete_expired'
  ? 'Action Required'
  : subscriptionStatus || 'No Membership'}
              </p>
            </div>

            <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5">
              <p className="text-neutral-500 uppercase tracking-[0.2em] text-xs mb-3">Membership</p>
              <p className="text-2xl font-extralight">{planName || '—'}</p>
            </div>

            <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5">
              <p className="text-neutral-500 uppercase tracking-[0.2em] text-xs mb-3">Print Size</p>
              <p className="text-2xl font-extralight">{printSize || '—'}</p>
            </div>

            <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5">
              <p className="text-neutral-500 uppercase tracking-[0.2em] text-xs mb-3">Next Charge Date</p>
              <p className="text-2xl font-extralight">
                {nextChargeDate
                  ? new Date(nextChargeDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })
                  : '—'}
              </p>
            </div>

            <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5">
              <p className="text-neutral-500 uppercase tracking-[0.2em] text-xs mb-3">Next Shipment Date</p>
              <p className="text-2xl font-extralight">July 1, 2026</p>
            </div>
          </div>

          <div className="bg-neutral-950 border border-white/10 rounded-[2rem] p-8 mb-8">
            <h2 className="text-3xl font-extralight mb-4">Subscription</h2>

            <button onClick={openPortal} className="bg-white text-black px-6 py-3 rounded-xl">
              Manage Subscription
            </button>
          </div>

          <div className="bg-neutral-950 border border-white/10 rounded-[2rem] p-8 mb-8">
            <h2 className="text-3xl font-extralight mb-4">Update Password</h2>

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white mb-4"
            />

            <button onClick={updatePassword} className="bg-white text-black px-6 py-3 rounded-xl">
              Save New Password
            </button>
          </div>

          <button
            onClick={signOut}
            className="border border-white/20 px-6 py-3 rounded-xl hover:bg-white hover:text-black transition"
          >
            Sign Out
          </button>

          {message && <p className="text-neutral-300 mt-6">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <section className="max-w-xl mx-auto">
        <h1 className="text-5xl font-extralight mb-6">Member Login</h1>

        <p className="text-neutral-400 text-lg mb-8">
          Log in with your email and password, or create a new account.
        </p>

        <form onSubmit={login} className="space-y-5">
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white"
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white"
          />

          <button className="w-full bg-white text-black py-5 rounded-2xl text-lg font-medium">
            Log In
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!email) {
                setMessage('Enter your email first, then click forgot password.');
                return;
              }

              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://bangersprints.com/reset-password',
              });

              if (error) {
                setMessage(error.message);
                return;
              }

              setMessage('Password reset email sent. Check your inbox.');
            }}
            className="w-full text-neutral-400 text-sm hover:text-white transition"
          >
            Forgot password?
          </button>
        </form>

        <label className="flex items-start gap-3 text-sm text-neutral-300 mt-6">
  <input
    type="checkbox"
    checked={termsAccepted}
    onChange={(e) => setTermsAccepted(e.target.checked)}
    className="mt-1"
  />
  <span>
    I have read and agree to the{' '}
    <a href="/terms" className="underline text-white" target="_blank">
      BANGERS Terms & Licensing Agreement
    </a>
    .
  </span>
</label>
        <button
  onClick={signUp}
  disabled={!termsAccepted}
  className="w-full mt-4 border border-white/20 py-5 rounded-2xl text-lg hover:bg-white hover:text-black transition disabled:opacity-40 disabled:cursor-not-allowed"
>
  Create Account
</button>
        {message && <p className="text-neutral-300 mt-6">{message}</p>}
      </section>
    </main>
  );
}
