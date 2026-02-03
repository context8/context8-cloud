import * as React from 'react';
import { Menu, X } from 'lucide-react';
import { LandingFooter } from '@/pages/home/LandingFooter';
import { LandingNavbar } from '@/pages/home/LandingNavbar';

export type DocsNavItem = {
  id: string;
  title: string;
};

function getHashId() {
  if (typeof window === 'undefined') return '';
  return window.location.hash.replace('#', '');
}

export function DocsShell({
  title,
  navItems,
  children,
}: {
  title?: string;
  navItems: DocsNavItem[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [activeId, setActiveId] = React.useState('');
  const toggleBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const firstItemRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    const onHash = () => setActiveId(getHashId());
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.setTimeout(() => firstItemRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const scrollTo = React.useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    setActiveId(id);
  }, []);

  const SideNav = (
    <nav aria-label={title ?? 'Docs'} className="space-y-1">
      {navItems.map((item, idx) => (
        <button
          key={item.id}
          type="button"
          ref={idx === 0 ? firstItemRef : undefined}
          className="docs-nav-item w-full text-left"
          data-active={activeId === item.id ? 'true' : 'false'}
          onClick={() => {
            scrollTo(item.id);
            setOpen(false);
            toggleBtnRef.current?.focus();
          }}
        >
          {item.title}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="sb min-h-screen flex flex-col font-sans antialiased overflow-x-hidden">
      <LandingNavbar />

      <div className="mx-auto w-full flex-1 px-6 py-10 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.55)] p-4">
              {title ? <div className="mb-3 text-xs font-mono uppercase tracking-widest text-foreground-light">{title}</div> : null}
              {SideNav}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
              <div className="text-sm font-mono uppercase tracking-widest text-foreground-light">{title ?? 'Docs'}</div>
              <button
                type="button"
                ref={toggleBtnRef}
                className="inline-flex items-center gap-2 rounded-md border border-default bg-[hsl(var(--sb-bg)/0.55)] px-3 py-2 text-sm text-foreground hover:bg-[hsl(var(--sb-bg)/0.7)]"
                aria-expanded={open}
                aria-label={open ? 'Close navigation' : 'Open navigation'}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
                Navigate
              </button>
            </div>

            <div className="docs-content">{children}</div>
          </div>
        </div>
      </div>

      <LandingFooter />

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close navigation"
            onClick={() => {
              setOpen(false);
              toggleBtnRef.current?.focus();
            }}
          />
          <div className="absolute left-0 top-0 h-full w-[320px] max-w-[85vw] border-r border-default bg-[hsl(var(--sb-bg))] p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">{title ?? 'Docs'}</div>
              <button
                type="button"
                className="rounded-md p-2 hover:bg-[hsl(var(--sb-fg)/0.06)]"
                aria-label="Close"
                onClick={() => {
                  setOpen(false);
                  toggleBtnRef.current?.focus();
                }}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6">{SideNav}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

