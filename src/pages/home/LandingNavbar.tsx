import * as React from 'react';
import { Link } from '@tanstack/react-router';
import { Github, Menu, X } from 'lucide-react';
import { useSession } from '@/state/session';

const navItemBase =
  'group/menu-item flex items-center text-sm select-none gap-3 rounded-md p-2 leading-none no-underline outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-[hsl(var(--sb-fg-light))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--sb-bg))] ' +
  'hover:text-foreground hover:bg-[hsl(var(--sb-fg)/0.06)]';

const buttonBase =
  'relative justify-center cursor-pointer inline-flex items-center space-x-2 text-center font-regular ease-out duration-200 ' +
  'rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border text-sm px-4 py-2 h-[38px]';

const primaryButton =
  `${buttonBase} bg-[hsl(var(--sb-brand-bg))] text-[hsl(var(--sb-on-brand))] ` +
  'border-[color:rgba(62,207,142,0.3)] hover:bg-[color:rgba(0,98,57,0.9)]';

const secondaryButton =
  `${buttonBase} bg-alternative text-foreground border-strong hover:bg-selection hover:border-stronger`;

type Item =
  | { kind: 'internal'; label: string; to: string }
  | { kind: 'external'; label: string; href: string };

const navItems: Item[] = [
  { kind: 'internal', label: 'Learn', to: '/learn' },
  { kind: 'internal', label: 'Search', to: '/dashboard/search' },
  { kind: 'internal', label: 'Demo', to: '/demo' },
  { kind: 'external', label: 'GitHub', href: 'https://github.com/context8' },
  { kind: 'external', label: 'Discord', href: 'https://discord.gg/BDGVMmws' },
];

export function LandingNavbar() {
  const { session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const toggleBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const firstMenuItemRef = React.useRef<HTMLAnchorElement | null>(null);
  const panelId = React.useId();
  const panelTitleId = `${panelId}-title`;

  React.useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    window.setTimeout(() => firstMenuItemRef.current?.focus(), 0);
  }, [open]);

  const authLabel = session?.token ? 'Dashboard' : 'Sign in';

  return (
    <>
      <nav
        className={[
          'sticky top-0 z-40 border-default border-b backdrop-blur-sm transition-colors',
          scrolled ? 'bg-[hsl(var(--sb-bg)/0.7)]' : 'bg-transparent',
        ].join(' ')}
      >
        <div className="relative flex justify-between h-16 mx-auto lg:container lg:px-16 xl:px-20">
          <div className="flex items-center px-6 lg:px-0 flex-1 sm:items-stretch justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="block w-auto h-6 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-[hsl(var(--sb-fg-light))] focus-visible:ring-offset-4 focus-visible:ring-offset-[hsl(var(--sb-bg))] focus-visible:rounded-sm"
                aria-label="Context8 Home"
              >
                <span className="inline-flex items-center gap-2">
                  <img alt="Context8 Logo" src="/logo.png" className="h-6 w-auto" />
                  <span className="text-sm font-medium tracking-tight">Context8</span>
                </span>
              </Link>

              <div className="relative z-10 flex-1 items-center justify-center hidden pl-8 sm:space-x-1 lg:flex h-16">
                {navItems.map((item) => {
                  if (item.kind === 'internal') {
                    if (item.to === '/dashboard/search') {
                      return (
                        <Link
                          key={item.label}
                          to="/dashboard/search"
                          search={{}}
                          className={`${navItemBase} text-foreground`}
                        >
                          <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-1">
                              <p className="leading-snug">{item.label}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    }
                    return (
                      <Link key={item.label} to={item.to} className={`${navItemBase} text-foreground`}>
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-1">
                            <p className="leading-snug">{item.label}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`${navItemBase} text-foreground`}
                    >
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1">
                          <p className="leading-snug">{item.label}</p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 animate-fade-in !scale-100 delay-300">
              <div className="flex items-center gap-2 transition-opacity opacity-100">
                <a
                  href="https://github.com/context8"
                  target="_blank"
                  rel="noreferrer"
                  className="relative justify-center cursor-pointer items-center space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 border border-transparent text-xs px-2.5 py-1 h-[26px] hidden group lg:flex text-foreground-light hover:text-foreground"
                >
                  <span className="truncate">
                    <span className="flex items-center gap-1">
                      <Github className="h-4 w-4" aria-hidden="true" />
                      <span>GitHub</span>
                    </span>
                  </span>
                </a>

                {session?.token ? (
                  <Link
                    to="/dashboard/solutions"
                    search={{}}
                    className={`${secondaryButton} hidden lg:inline-flex h-[26px] py-1 px-2.5 text-xs`}
                  >
                    <span className="truncate">{authLabel}</span>
                  </Link>
                ) : (
                  <Link to="/login" className={`${secondaryButton} hidden lg:inline-flex h-[26px] py-1 px-2.5 text-xs`}>
                    <span className="truncate">{authLabel}</span>
                  </Link>
                )}
                <Link to="/demo" className={`${primaryButton} hidden lg:inline-flex h-[26px] py-1 px-2.5 text-xs`}>
                  <span className="truncate">Try demo</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="inset-y-0 flex mr-2 items-center px-4 lg:hidden">
            <button
              type="button"
              ref={toggleBtnRef}
              className="text-foreground-light hover:text-foreground transition-colors hover:bg-[color:rgba(250,250,250,0.06)] inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--sb-fg-light))]"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </nav>

      {open ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={panelTitleId}
          id={panelId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu overlay"
            onClick={() => {
              setOpen(false);
              toggleBtnRef.current?.focus();
            }}
          />
          <div className="absolute right-0 top-0 h-full w-[320px] max-w-[85vw] border-l border-default bg-[hsl(var(--sb-bg))] p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium" id={panelTitleId}>
                Menu
              </div>
              <button
                type="button"
                className="rounded-md p-2 hover:bg-[color:rgba(250,250,250,0.06)]"
                aria-label="Close menu"
                onClick={() => {
                  setOpen(false);
                  toggleBtnRef.current?.focus();
                }}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 space-y-2">
              {navItems.map((item, idx) => {
                if (item.kind === 'internal') {
                  if (item.to === '/dashboard/search') {
                    return (
                      <Link
                        key={item.label}
                        to="/dashboard/search"
                        search={{}}
                        ref={idx === 0 ? firstMenuItemRef : undefined}
                        className="block rounded-md px-3 py-2 text-sm hover:bg-[color:rgba(250,250,250,0.06)]"
                        onClick={() => {
                          setOpen(false);
                          toggleBtnRef.current?.focus();
                        }}
                      >
                        {item.label}
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      ref={idx === 0 ? firstMenuItemRef : undefined}
                      className="block rounded-md px-3 py-2 text-sm hover:bg-[color:rgba(250,250,250,0.06)]"
                      onClick={() => {
                        setOpen(false);
                        toggleBtnRef.current?.focus();
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    ref={idx === 0 ? firstMenuItemRef : undefined}
                    className="block rounded-md px-3 py-2 text-sm hover:bg-[color:rgba(250,250,250,0.06)]"
                    onClick={() => {
                      setOpen(false);
                      toggleBtnRef.current?.focus();
                    }}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2">
              {session?.token ? (
                <Link
                  to="/dashboard/solutions"
                  search={{}}
                  className={secondaryButton}
                  onClick={() => {
                    setOpen(false);
                    toggleBtnRef.current?.focus();
                  }}
                >
                  <span className="truncate">{authLabel}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className={secondaryButton}
                  onClick={() => {
                    setOpen(false);
                    toggleBtnRef.current?.focus();
                  }}
                >
                  <span className="truncate">{authLabel}</span>
                </Link>
              )}
              <Link
                to="/demo"
                className={primaryButton}
                onClick={() => {
                  setOpen(false);
                  toggleBtnRef.current?.focus();
                }}
              >
                <span className="truncate">Try demo</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
