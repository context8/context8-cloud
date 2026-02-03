import * as React from 'react';
import { Link } from '@tanstack/react-router';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="sb min-h-screen font-sans antialiased overflow-x-hidden">
      <header className="sticky top-0 z-30 border-default border-b backdrop-blur-sm bg-[hsl(var(--sb-bg)/0.7)]">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-6 lg:px-16 xl:px-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-[hsl(var(--sb-fg)/0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sb-fg-light))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--sb-bg))]"
            aria-label="Context8 Home"
          >
            <img alt="Context8 Logo" src="/logo.png" className="h-6 w-auto" />
            <span className="text-sm font-medium tracking-tight text-foreground">Context8</span>
          </Link>
          <Link to="/learn" className="text-sm text-foreground-light hover:text-foreground">
            Learn
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-6 py-12">
        <div className="w-full rounded-xl border border-default bg-[hsl(var(--sb-bg)/0.55)] p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

