"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return (
      <main className="w-full min-h-screen bg-slate-950">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 w-full">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
