'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, KeyRound, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, setToken } from '@/lib/api-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@portfolio.local');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.loginAdmin({ email, password });
      if (res?.token) {
        setToken(res.token);
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin');
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>
        <span className="text-xs font-mono text-neutral-500 uppercase">CMS // AUTH</span>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full mx-auto bg-[#181818] border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#3E4F36]/30 border border-[#A3B899]/30 text-[#A3B899] flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
            Admin Portal
          </h1>
          <p className="text-xs text-neutral-400">
            Sign in to manage portfolio projects, showcases, and system settings.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Authenticated successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase font-bold text-neutral-400 mb-1.5 font-mono">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@portfolio.local"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-neutral-400 mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
              />
            </div>
          </div>

          {/* Demo Helper Button */}
          <button
            type="button"
            onClick={() => {
              setEmail('admin@portfolio.local');
              setPassword('admin123');
            }}
            className="text-[11px] font-mono text-[#A3B899] hover:underline block text-left"
          >
            ⚡ Autofill demo credentials (admin@portfolio.local / admin123)
          </button>

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-3 rounded-xl bg-[#3E4F36] hover:bg-[#2E3B27] border border-[#A3B899]/30 text-white font-bold text-sm transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-neutral-600 font-mono">
        Edgar (&quot;Raged&quot;) Portfolio System • Admin Console
      </div>
    </div>
  );
}
