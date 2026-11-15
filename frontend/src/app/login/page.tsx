"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wheat, ShieldCheck, LogIn, ArrowRight, UserCheck } from 'lucide-react';
import { getBackendUrl } from '@/lib/api';

const QUICK_ROLES = [
  {
    role: 'ADMIN',
    title: 'Chief Administrator',
    email: 'admin@agri.org',
    password: 'password123',
    desc: 'System-wide orchestration, user management & audit trails'
  },
  {
    role: 'PLANNER',
    title: 'Supply Chain Planner',
    email: 'planner@agri.org',
    password: 'password123',
    desc: 'Mathematical solver execution, scenario testing & dispatch sign-off'
  },
  {
    role: 'FARMER',
    title: 'Lead Producer Farmer',
    email: 'farmer@agri.org',
    password: 'password123',
    desc: 'Harvest batch submission, spatial clustering & APMC mandi prices'
  },
  {
    role: 'RETAILER',
    title: 'Retail Store Manager',
    email: 'retailer@agri.org',
    password: 'password123',
    desc: 'Daily produce orders, delivery time-windows & freshness tracking'
  },
  {
    role: 'STORAGE_MANAGER',
    title: 'Cold Hub Supervisor',
    email: 'storage@agri.org',
    password: 'password123',
    desc: 'Bay occupancy monitoring & climate setpoint adjustments'
  },
  {
    role: 'TRANSPORT_MANAGER',
    title: 'Fleet Logistics Lead',
    email: 'transport@agri.org',
    password: 'password123',
    desc: 'VRPTW vehicle route assignments & cold-chain telematics'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('planner@agri.org');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent, customCreds?: { email: string; password: string }) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const loginEmail = customCreds ? customCreds.email : email;
    const loginPassword = customCreds ? customCreds.password : password;

    try {
      const res = await fetch(getBackendUrl('/api/v1/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('agri_jwt_token', data.token);
      localStorage.setItem('agri_user', JSON.stringify(data.user));

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (r: typeof QUICK_ROLES[0]) => {
    setEmail(r.email);
    setPassword(r.password);
    handleLogin(undefined, { email: r.email, password: r.password });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        {/* Left Column: Traditional Form */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Wheat className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Agri<span className="text-emerald-400">Optima</span></h2>
              <p className="text-xs text-slate-400">Decision-Support Platform Authentication</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Sign In to Your Workspace</h3>
            <p className="text-xs text-slate-400 mt-0.5">JWT Secured Role-Based Access Control</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center">
            Final-Year B.Tech CSE Research Capstone Project
          </p>
        </div>

        {/* Right Column: 1-Click Role Switcher */}
        <div className="border-l border-slate-800 pl-0 md:pl-8 space-y-4 flex flex-col justify-center">
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              Quick-Demo Role Selector (1-Click Login)
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Test the platform from the perspective of any supply chain actor:
            </p>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {QUICK_ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => handleQuickSelect(r)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                    {r.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {r.role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
