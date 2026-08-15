// src/components/AdminAuthWrapper.tsx
// Direct port — no react-router-dom or BaseContext dependency here, so
// nothing about the Astro migration required structural changes. Auth is
// checked entirely client-side via supabase.auth (session + onAuthStateChange),
// so this works as a plain client:load island with no server-side gating.

import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User } from '@supabase/supabase-js';

type Props = {
  children: React.ReactNode;
};

export default function AdminAuthWrapper({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--muted-foreground)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-bg)] px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-[var(--brand-dark)] mb-6 text-center">
            Admin Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-dark)] transition font-semibold"
            >
              Sign In
            </button>
          </form>

          <p className="text-xs text-[var(--muted-foreground)] text-center mt-6">
            Contact your administrator if you need access
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border-b border-[var(--border)] px-6 py-3 flex justify-between items-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          Logged in as <strong>{user.email}</strong>
        </p>
        <button
          onClick={handleLogout}
          className="text-sm text-[var(--brand-primary)] hover:text-[var(--brand-dark)] font-semibold"
        >
          Logout
        </button>
      </div>

      {children}
    </div>
  );
}
