"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { NavProvider } from '@/context/NavContext';

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return (
      <main className="w-full min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 sm:px-6">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 w-full relative">
      <Sidebar />
      <div className="flex-1 w-full lg:ml-64 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider>
      <ShellInner>{children}</ShellInner>
    </NavProvider>
  );
}
