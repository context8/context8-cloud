import * as React from 'react';
import { LandingFooter } from '@/pages/home/LandingFooter';
import { LandingNavbar } from '@/pages/home/LandingNavbar';

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="sb min-h-screen flex flex-col font-sans antialiased overflow-x-hidden">
      <LandingNavbar />
      <main className="relative flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}

