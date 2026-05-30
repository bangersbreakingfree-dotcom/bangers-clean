'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('Signing in...');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setUserEmail(email);
    setMessage('');
  }

  async function signUp() {
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

  async function signOut() {
    await supabase.auth.signOut();
    setUserEmail(null);
  }

 if (userEmail) {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <section className="max-w-3xl mx-auto">
        <a
          href="/"
          className="inline-flex mb-8 border border-white/20 px-5 py-2 rounded-xl hover:bg-white hover:text-black transition"
        >
          ← Back to Home
        </a>

        <h1 className="text-5xl font-extralight mb-6">Your Account</h1>
        <p className="text-neutral-300 mb-8">Signed in as {userEmail}</p>

          <div className="bg-neutral-950 border border-white/10 rounded-[2rem] p-8">
            <h2 className="text-3xl font-extralight mb-4">Subscription</h2>

            <button
              onClick={openPortal}
              className="bg-white text-black px-6 py-3 rounded-xl"
            >
              Manage Subscription
            </button>
          </div>

          <button
            onClick={signOut}
            className="mt-8 border border-white/20 px-6 py-3 rounded-xl hover:bg-white hover:text-black transition"
          >
            Sign Out
          </button>
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
        </form>

        <button
          onClick={signUp}
          className="w-full mt-4 border border-white/20 py-5 rounded-2xl text-lg hover:bg-white hover:text-black transition"
        >
          Create Account
        </button>

        {message && <p className="text-neutral-300 mt-6">{message}</p>}
      </section>
    </main>
  );
}
