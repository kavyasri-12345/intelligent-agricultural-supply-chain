"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getStoredToken, getStoredUser, getRoleDashboard, isRoleAuthorizedForDashboard } from '@/lib/auth';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredDashboard?: 'farmer' | 'distributor' | 'retailer' | 'admin';
}

export default function AuthGuard({ children, allowedRoles, requiredDashboard }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
      // Unauthenticated -> redirect to login
      router.replace('/login');
      return;
    }

    const role = (user.role || '').toUpperCase();

    // Check dashboard specific authorization
    if (pathname && !isRoleAuthorizedForDashboard(role, pathname)) {
      const targetDashboard = getRoleDashboard(role);
      router.replace(targetDashboard);
      return;
    }

    // Check explicit allowedRoles if provided
    if (allowedRoles && allowedRoles.length > 0) {
      const isAllowed = role === 'ADMIN' || allowedRoles.map(r => r.toUpperCase()).includes(role);
      if (!isAllowed) {
        const targetDashboard = getRoleDashboard(role);
        router.replace(targetDashboard);
        return;
      }
    }

    setAuthorized(true);
    setChecking(false);
  }, [pathname, router, allowedRoles, requiredDashboard]);

  if (checking || !authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Verifying Authorization & Session</p>
            <p className="text-xs text-slate-400 mt-1">Checking cryptographic JWT & role permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
