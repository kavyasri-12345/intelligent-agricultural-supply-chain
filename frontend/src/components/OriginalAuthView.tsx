"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wheat, 
  LogIn, 
  UserCheck, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle,
  Tractor,
  Truck,
  Store,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { getBackendUrl } from '@/lib/api';
import { setSession, getStoredToken, getStoredUser, getRoleDashboard } from '@/lib/auth';

const QUICK_ROLES = [
  {
    role: 'ADMIN',
    title: 'Chief Administrator',
    email: 'admin@agri.org',
    password: 'password123',
    desc: 'System-wide orchestration, user management & audit trails',
    dashboard: '/admin-dashboard'
  },
  {
    role: 'DISTRIBUTOR',
    title: 'Regional Agri Distributor',
    email: 'distributor@agri.org',
    password: 'password123',
    desc: 'Cold storage hub allocation, fleet telematics & FEFO dispatch',
    dashboard: '/distributor-dashboard'
  },
  {
    role: 'FARMER',
    title: 'Lead Producer Farmer',
    email: 'farmer@agri.org',
    password: 'password123',
    desc: 'Harvest batch submission, spatial clustering & APMC mandi prices',
    dashboard: '/farmer-dashboard'
  },
  {
    role: 'RETAILER',
    title: 'Retail Store Manager',
    email: 'retailer@agri.org',
    password: 'password123',
    desc: 'Daily produce orders, delivery time-windows & freshness tracking',
    dashboard: '/retailer-dashboard'
  },
  {
    role: 'PLANNER',
    title: 'Supply Chain Planner',
    email: 'planner@agri.org',
    password: 'password123',
    desc: 'Mathematical solver execution, scenario testing & dispatch sign-off',
    dashboard: '/admin-dashboard'
  },
  {
    role: 'STORAGE_MANAGER',
    title: 'Cold Hub Supervisor',
    email: 'storage@agri.org',
    password: 'password123',
    desc: 'Bay occupancy monitoring & climate setpoint adjustments',
    dashboard: '/distributor-dashboard'
  },
  {
    role: 'TRANSPORT_MANAGER',
    title: 'Fleet Logistics Lead',
    email: 'transport@agri.org',
    password: 'password123',
    desc: 'VRPTW vehicle route assignments & cold-chain telematics',
    dashboard: '/distributor-dashboard'
  }
];

interface OriginalAuthViewProps {
  initialMode?: 'login' | 'signup';
}

export default function OriginalAuthView({ initialMode = 'login' }: OriginalAuthViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Login form state
  const [email, setEmail] = useState('planner@agri.org');
  const [password, setPassword] = useState('password123');

  // Signup form state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'FARMER' | 'DISTRIBUTOR' | 'RETAILER'>('FARMER');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user) {
      const targetDashboard = getRoleDashboard(user.role);
      router.push(targetDashboard);
    }
  }, [router]);

  const handleLogin = async (e?: React.FormEvent, customCreds?: { email: string; password: string }) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

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

      setSession(data.token, data.user);
      const targetDashboard = getRoleDashboard(data.user?.role);
      router.push(targetDashboard);
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    // Validations
    if (!signupFullName.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Security check: Never allow ADMIN signup
    if (signupRole as string === 'ADMIN') {
      setError('Admin registration is not publicly available.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(getBackendUrl('/api/v1/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: signupFullName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role: signupRole
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSession(data.token, data.user);
      setSuccessMsg('Account created successfully! Redirecting to your dashboard...');
      
      const targetDashboard = getRoleDashboard(data.user?.role);
      setTimeout(() => {
        router.push(targetDashboard);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        {/* Left Column: Form (Login or Signup) */}
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

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center space-x-1.5 ${
                mode === 'login'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center space-x-1.5 ${
                mode === 'signup'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Account</span>
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              {mode === 'login' ? 'Sign In to Your Workspace' : 'Create Your AgriOptima Account'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'login' 
                ? 'JWT Secured Role-Based Access Control' 
                : 'Select your supply chain role for tailored dashboard access'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Traditional Login Form (Exact Original Design) */
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agri.org"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
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

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  Don't have an account? <span className="text-emerald-400 underline font-medium">Register here</span>
                </button>
              </div>
            </form>
          ) : (
            /* Role-Based Signup Form */
            <form onSubmit={handleSignup} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="ramesh@producer.org"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Select Your Supply Chain Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('FARMER')}
                    className={`p-2 rounded-lg border text-left transition flex flex-col items-center justify-center space-y-1 ${
                      signupRole === 'FARMER'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Tractor className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Farmer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('DISTRIBUTOR')}
                    className={`p-2 rounded-lg border text-left transition flex flex-col items-center justify-center space-y-1 ${
                      signupRole === 'DISTRIBUTOR'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Distributor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('RETAILER')}
                    className={`p-2 rounded-lg border text-left transition flex flex-col items-center justify-center space-y-1 ${
                      signupRole === 'RETAILER'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Retailer</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  Note: Admin accounts can only be provisioned by authorized system administrators.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Password</label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-950/40 disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  Already have an account? <span className="text-emerald-400 underline font-medium">Sign in</span>
                </button>
              </div>
            </form>
          )}

          <p className="text-[11px] text-slate-400 text-center">
            Final-Year B.Tech CSE Research Capstone Project
          </p>
        </div>

        {/* Right Column: 1-Click Role Switcher (Preserved from Original Version) */}
        <div className="border-l border-slate-800 pl-0 md:pl-8 space-y-4 flex flex-col justify-center">
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              Quick-Demo Role Selector (1-Click Login)
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Select any pre-configured actor to access their role-specific dashboard:
            </p>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
            {QUICK_ROLES.map((r) => (
              <button
                key={r.email}
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

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Role-Based Redirection Active</span>
            </span>
            <span className="text-emerald-400 font-mono text-[10px]">RBAC v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
