import * as React from 'react';
import { Link } from '@tanstack/react-router';

export function SignInShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="appdash min-h-screen font-sans antialiased overflow-x-hidden">
      <header className="h-14 border-b border-default bg-surface">
        <div className="mx-auto flex h-14 w-full items-center justify-between px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-[hsl(var(--dash-fg)/0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--dash-ring))]"
            aria-label="Context8 Home"
          >
            <img alt="Context8 Logo" src="/logo.png" className="h-6 w-6 rounded" />
            <span className="text-sm font-medium tracking-tight text-foreground">Context8</span>
          </Link>

          <Link to="/learn" className="text-sm text-foreground-light hover:text-foreground">
            Learn
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-md items-center px-4 py-12">
        <div className="w-full rounded-xl border border-default bg-surface p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

