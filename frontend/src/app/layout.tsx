import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "AgriOptima - Spoilage-Aware Agricultural Supply Chain Platform",
  description: "Deep Learning, Operations Research & Spoilage-Aware Coordination for Perishable Produce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
