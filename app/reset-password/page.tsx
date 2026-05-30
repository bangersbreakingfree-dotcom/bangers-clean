'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function updatePassword() {
    setMessage('Updating password...');

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setPassword('');
    setMessage('Password updated successfully. You can now log in.');
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <section className="max-w-xl mx-auto">
        <a
          href="/"
          className="inline-flex mb-8 border border-white/20 px-5 py-2 rounded-xl hover:bg-white hover:text-black transition"
        >
          ← Back to Home
        </a>

        <h1 className="text-5xl font-extralight mb-6">Reset Password</h1>

        <p className="text-neutral-400 text-lg mb-8">
          Enter your new BANGERS account password below.
        </p>

        <input
          type="password"
          required
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white mb-5"
        />

        <button
          onClick={updatePassword}
          className="w-full bg-white text-black py-5 rounded-2xl text-lg font-medium"
        >
          Save New Password
        </button>

        {message && <p className="text-neutral-300 mt-6">{message}</p>}
      </section>
    </main>
  );
}
