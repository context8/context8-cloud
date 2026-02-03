import * as React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { FileText, Key, LogOut, Search, Sun, Moon } from 'lucide-react';
import { CommandMenu } from '@/components/shell/CommandMenu';
import { useSession } from '@/state/session';
import { useTheme } from '@/state/theme';

type NavItem = {
  to: '/dashboard/solutions' | '/dashboard/search' | '/dashboard/apikeys';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { to: '/dashboard/solutions', label: 'Solutions', icon: FileText },
  { to: '/dashboard/search', label: 'Search', icon: Search },
  { to: '/dashboard/apikeys', label: 'API keys', icon: Key },
];

function SidebarItem({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      aria-label={item.label}
      className={[
        'group relative flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        active ? 'bg-[hsl(var(--dash-sidebar-accent))] text-foreground' : 'text-foreground-light hover:bg-[hsl(var(--dash-sidebar-accent))] hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--dash-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--dash-sidebar-bg))]',
      ].join(' ')}
      title={item.label}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-default bg-surface px-2 py-1 text-xs text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        {item.label}
      </span>
    </Link>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { session, logout } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const userBtnRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="appdash min-h-screen flex flex-col">
      <header className="h-14 border-b border-default bg-surface">
        <div className="mx-auto flex h-14 w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard/solutions" className="flex items-center gap-2" aria-label="Dashboard Home">
              <img alt="Context8 Logo" src="/logo.png" className="h-[26px] w-[26px] rounded" />
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-default bg-alternative px-3 py-1 text-xs text-foreground-light md:flex">
              <span className="text-foreground">Context8</span>
              <span className="h-3 w-px bg-[hsl(var(--dash-border))]" aria-hidden="true" />
              <span>Dashboard</span>
            </div>
          </div>

          <button
            type="button"
            className="dash-btn hidden min-w-[220px] justify-between pl-2 pr-1 md:flex"
            onClick={() => setMenuOpen(true)}
            aria-label="Open command menu"
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Search...</span>
            </span>
            <span className="rounded-full border border-default bg-transparent px-2 py-0.5 text-xs text-foreground-light">
              K
            </span>
          </button>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/solutions?create=1"
              className="inline-flex h-[26px] items-center justify-center gap-2 rounded-full border border-strong bg-alternative px-2.5 py-1 text-xs text-foreground hover:bg-[hsl(var(--dash-fg)/0.04)]"
            >
              New solution
            </Link>

            <button
              type="button"
              ref={userBtnRef}
              className="inline-flex h-[26px] items-center justify-center rounded-full border border-strong bg-alternative px-2.5 py-1 text-xs text-foreground hover:bg-[hsl(var(--dash-fg)/0.04)]"
              aria-label="User menu"
              aria-expanded={userOpen}
              onClick={() => setUserOpen((v) => !v)}
            >
              {session?.email?.split('@')[0] ?? 'User'}
            </button>
          </div>
        </div>

        {userOpen ? (
          <div className="relative">
            <div className="absolute right-4 top-2 z-40 w-56 overflow-hidden rounded-lg border border-default bg-surface shadow-lg">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-foreground hover:bg-[hsl(var(--dash-fg)/0.04)]"
                onClick={() => {
                  toggleTheme();
                  setUserOpen(false);
                  userBtnRef.current?.focus();
                }}
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                  Toggle theme
                </span>
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-foreground hover:bg-[hsl(var(--dash-fg)/0.04)]"
                onClick={() => {
                  logout();
                  setUserOpen(false);
                }}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="bg-sidebar border-r border-default pt-2">
          <div className="flex w-[48px] flex-col items-center gap-1">
            {navItems.map((item) => (
              <SidebarItem key={item.to} item={item} active={pathname.startsWith(item.to)} />
            ))}
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-6">{children}</div>
        </main>
      </div>

      <CommandMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </div>
  );
}

