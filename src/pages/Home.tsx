import * as React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import type { ThemeMode, Solution } from '@/types';
import { useSession } from '@/state/session';

type Props = {
  theme: ThemeMode;
  initialSolutions: Solution[];
  initialError?: string | null;
};

const pillBase =
  'relative isolate inline-flex shrink-0 items-center justify-center border font-mono text-base/6 uppercase tracking-widest ' +
  'focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500 ' +
  'data-[disabled]:opacity-50 [&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:shrink-0 ' +
  '[&>[data-slot=icon]]:sm:my-1 gap-x-3 px-4 py-2 sm:text-sm [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:sm:size-4';

const pillOutline =
  'border-[--btn-border] bg-[--btn-bg] text-[--btn-text] hover:bg-[--btn-hover] rounded-full ' +
  '[--btn-bg:transparent] [--btn-border:theme(colors.primary/25%)] [--btn-hover:theme(colors.secondary/20%)] [--btn-text:theme(colors.primary)]';

const pillSolid =
  'border-[--btn-border] bg-[--btn-bg] text-[--btn-text] hover:border-[--btn-hover] hover:bg-[--btn-hover] rounded-full ' +
  '[--btn-bg:theme(colors.primary)] [--btn-border:theme(colors.primary)] [--btn-hover:theme(colors.primary/80%)] [--btn-text:theme(colors.background)]';

function formatLongDate(dateStr?: string | null) {
  if (!dateStr) return 'Unknown date';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).format(d);
}

function pickCategory(solution: Solution) {
  if (solution.errorType) return solution.errorType.toLowerCase();
  if (solution.tags?.[0]) return solution.tags[0].toLowerCase();
  return 'solution';
}

export function Home({ initialSolutions, initialError }: Props) {
  const navigate = useNavigate();
  const { session } = useSession();
  const [query, setQuery] = React.useState('');

  const solutions = React.useMemo(() => initialSolutions.slice(0, 3), [initialSolutions]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate({ to: '/demo' });
  };

  return (
    <div className="bg-background text-primary overflow-x-hidden font-sans antialiased">
      {/* Header */}
      <header className="group fixed inset-x-0 top-0 z-50 duration-200 -translate-y-0">
        <div className="pointer-events-none absolute inset-x-0 h-32 bg-gradient-to-b from-black duration-200 lg:h-24 lg:from-black/75 opacity-0" />
        <div className="mx-auto w-full px-4 lg:px-6 xl:max-w-7xl relative">
          <nav className="flex items-center justify-between gap-4 py-4 duration-200 lg:h-20">
            <Link aria-label="Context8 Homepage" to="/">
              <button
                className="-m-1 inline-flex cursor-pointer items-center justify-center p-1 transition-colors hover:bg-white/10"
                aria-label="Context8 Logo"
              >
                <img src="/logo.png" alt="Context8" className="size-8" />
              </button>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5">
              <Link to="/learn" className="text-primary/50 mono-tag hover:text-primary px-3 py-1.5 text-sm">
                Learn
              </Link>
              <Link to="/dashboard/search" className="text-primary/50 mono-tag hover:text-primary px-3 py-1.5 text-sm">
                Search
              </Link>
              <Link to="/demo" className="text-primary/50 mono-tag hover:text-primary px-3 py-1.5 text-sm">
                Demo
              </Link>
              <a
                href="https://github.com/context8"
                target="_blank"
                rel="noreferrer"
                className="text-primary/50 mono-tag hover:text-primary px-3 py-1.5 text-sm"
              >
                GitHub
              </a>
              <a
                href="https://discord.gg/BDGVMmws"
                target="_blank"
                rel="noreferrer"
                className="text-primary/50 mono-tag hover:text-primary px-3 py-1.5 text-sm"
              >
                Discord
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={session?.token ? '/dashboard/solutions' : '/login'}
                className={`${pillBase} ${pillOutline}`}
              >
                <span
                  className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
                  aria-hidden="true"
                />
                {session?.token ? 'Dashboard' : 'Sign in'}
              </Link>
              <Link to="/demo" className={`${pillBase} ${pillSolid}`}>
                <span
                  className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
                  aria-hidden="true"
                />
                Try Demo
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="border-border relative h-svh w-full overflow-hidden border-b pb-px md:overflow-x-hidden">
        <div className="relative h-full w-full">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(1100px 700px at 50% 25%, rgba(255,255,255,0.07), transparent 60%),' +
                'radial-gradient(900px 500px at 25% 75%, rgba(255, 99, 8, 0.07), transparent 60%),' +
                'radial-gradient(900px 500px at 75% 80%, rgba(151, 196, 255, 0.06), transparent 60%)',
            }}
          />

          <div className="mx-auto w-full px-4 lg:px-6 xl:max-w-7xl flex h-full flex-col">
            <div className="relative z-20 mt-20 flex h-full w-full items-center">
              <hgroup className="space-y-8 w-full">
                <div className="absolute inset-0 top-20 flex grow items-end justify-center">
                  <div className="w-full max-w-3xl">
                    <form
                      onSubmit={onSubmit}
                      className="relative w-full items-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-tr p-px from-primary/5 to-primary/20"
                    >
                      <textarea
                        name="query"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="block resize-none py-5 pl-4 pr-16 h-[120px] w-full rounded-3xl border-none focus:outline-none focus:ring-2 focus:ring-zinc-500 bg-background text-primary placeholder:text-primary/50"
                        placeholder="What error are you stuck on?"
                      />
                      <div className="absolute bottom-2.5 right-2.5 flex items-center">
                        <button
                          aria-label="Submit a query"
                          type="submit"
                          disabled={!query.trim()}
                          className={`${pillBase} aspect-square gap-x-1.5 px-3 py-1 [&>[data-slot=icon]]:size-4 [&>[data-slot=icon]]:sm:size-3 ${pillSolid} ${
                            query.trim() ? '' : 'opacity-50'
                          }`}
                        >
                          <span
                            className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
                            aria-hidden="true"
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                            data-slot="icon"
                            className="!size-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </hgroup>
            </div>

            <div className="pb-10">
              <div className="text-secondary text-sm lg:hidden">
                Public beta: browse community fixes now, sign in to save private solutions.
              </div>
              <div className="flex flex-col items-end gap-6 sm:gap-8 md:flex-row lg:gap-12">
                <div className="max-w-2xl">
                  <div className="hidden max-w-lg lg:block">
                    Public beta: browse community fixes now, sign in to save private solutions.
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 sm:flex-row">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className={`${pillBase} ${pillOutline} hidden lg:flex`}
                    href="https://github.com/context8"
                  >
                    <span
                      className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
                      aria-hidden="true"
                    />
                    <span>Read announcement</span>
                  </a>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className={`${pillBase} ${pillOutline} lg:hidden`}
                    href="https://github.com/context8"
                  >
                    <span
                      className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
                      aria-hidden="true"
                    />
                    <span>Public beta</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <section className="py-16 sm:py-32">
        <div className="mx-auto w-full px-4 lg:px-6 xl:max-w-7xl space-y-16 sm:space-y-32">
          <div className="space-y-12">
            <div>
              <div className="mono-tag flex items-center gap-2 text-sm">
                <span>[</span> <span>Products</span> <span>]</span>
              </div>
            </div>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-12">
                <h2 className="text-balance text-3xl tracking-tight md:text-4xl lg:text-5xl">
                  Debugging, distilled.
                </h2>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-3 lg:-space-x-px">
            <ProductCard
              title="Public Solutions"
              description="Browse real-world fixes shared by developers. Learn patterns across stacks and teams."
              href="/"
              cta="Explore"
            />
            <ProductCard
              title="Demo Chat"
              description="Describe your bug and watch the assistant search solutions before answering."
              href="/demo"
              cta="Use now"
            />
            <ProductCard
              title="Dashboard"
              description="Save private fixes, manage API keys, and search across your own knowledge base."
              href={session?.token ? '/dashboard/solutions' : '/login'}
              cta={session?.token ? 'Open' : 'Sign in'}
            />
          </div>
        </div>
      </section>

      {/* “Understand the universe” style break */}
      <div className="relative flex justify-center overflow-hidden pb-24">
        <div className="relative h-[600px] lg:h-[1000px] xl:h-[1200px]">
          <div className="absolute left-1/2 top-6 size-[600px] -translate-x-1/2 lg:size-[1000px] xl:size-[1200px]">
            <div
              className="h-full w-full rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.07), transparent 62%),' +
                  'radial-gradient(circle at 35% 65%, rgba(255, 99, 8, 0.10), transparent 55%),' +
                  'radial-gradient(circle at 70% 45%, rgba(151, 196, 255, 0.10), transparent 58%)',
              }}
            />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-6 flex flex-col justify-center">
          <div className="mx-auto flex w-full max-w-7xl">
            <div className="from-secondary to-primary inline-block text-balance bg-gradient-to-l bg-clip-text py-2 text-4xl leading-[2.25rem] tracking-tight text-transparent md:text-[5rem] md:leading-[5rem]">
              Understand
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-7xl justify-end">
            <div className="from-secondary to-primary inline-block text-balance bg-gradient-to-r bg-clip-text py-2 text-4xl leading-[2.25rem] tracking-tight text-transparent md:text-[5rem] md:leading-[5rem]">
              The Fix
            </div>
          </div>
        </div>
      </div>

      {/* Callout */}
      <section className="py-16 sm:py-32 relative overflow-hidden">
        <div className="mx-auto w-full px-4 lg:px-6 xl:max-w-7xl space-y-16 sm:space-y-32">
          <div className="relative flex items-center justify-center py-6">
            <div className="absolute inset-x-0 -top-16 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-40 sm:-top-32" />
            <div
              className="absolute -inset-x-[200px] -top-16 h-[500px] sm:-top-32 lg:-inset-x-[400px]"
              style={{
                background:
                  'linear-gradient(to right, rgba(255, 99, 8, 0.10), rgba(255, 99, 8, 0.10), rgba(189, 201, 230, 0.10), rgba(151, 196, 255, 0.10), rgba(151, 196, 255, 0.10))',
                mask: 'radial-gradient(ellipse at top, black, transparent 60%)',
              }}
            />
            <div className="relative flex max-w-lg flex-col items-center space-y-8 text-center">
              <div className="mono-tag text-sm leading-6 text-primary/70">Context8</div>
              <p className="text-balance text-3xl tracking-tight md:text-4xl">
                Save fixes once. Reuse forever.
              </p>
              <p className="text-secondary text-balance">
                Turn scattered debugging notes into a searchable knowledge base for you and your team.
              </p>
              <Link to={session?.token ? '/dashboard/solutions' : '/login'} className={`${pillBase} ${pillOutline}`}>
                <span
                  className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
                  aria-hidden="true"
                />
                {session?.token ? 'Open dashboard' : 'Sign up now'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest fixes */}
      <section className="py-16 sm:py-32">
        <div className="mx-auto w-full px-4 lg:px-6 xl:max-w-7xl space-y-16 sm:space-y-32">
          <div className="space-y-12">
            <div>
              <div className="mono-tag flex items-center gap-2 text-sm">
                <span>[</span> <span>Blog</span> <span>]</span>
              </div>
            </div>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-12">
                <h2 className="text-balance text-3xl tracking-tight md:text-4xl lg:text-5xl">Latest fixes</h2>
              </div>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-12">
                <div>
                  <Link to="/dashboard/search" className={`${pillBase} ${pillOutline}`}>
                    <span
                      className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
                      aria-hidden="true"
                    />
                    Explore more
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div>
            {initialError ? (
              <div className="border-border flex items-center justify-between gap-6 border-t py-10">
                <div className="text-secondary">{initialError}</div>
                <Link to="/demo" className={`${pillBase} ${pillOutline}`}>
                  <span
                    className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
                    aria-hidden="true"
                  />
                  Try demo
                </Link>
              </div>
            ) : (
              <div className="group relative">
                {solutions.map((sol, idx) => (
                  <div
                    key={sol.id ?? idx}
                    className="border-border flex flex-col gap-10 border-b py-16 first-of-type:border-t last-of-type:border-b-0 md:flex-row md:gap-12"
                  >
                    <div className="order-2 flex flex-1 flex-col gap-4 md:order-1 md:gap-12 xl:flex-row">
                      <div>
                        <p className="mono-tag text-xs leading-6">{formatLongDate(sol.createdAt)}</p>
                      </div>
                      <div className="flex flex-1 flex-col space-y-6">
                        <div className="block grow space-y-4">
                          <Link to="/demo">
                            <div className="absolute inset-0" />
                            <h3 className="text-xl leading-6">{sol.title || 'Untitled solution'}</h3>
                          </Link>
                          <p className="text-secondary grow text-balance">
                            {sol.errorMessage || 'A community-shared fix for a real-world error.'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="mono-tag text-xs">{pickCategory(sol)}</span>
                          </div>
                          <div>
                            <Link to="/demo" className={`${pillBase} ${pillOutline} px-3 py-1.5 text-xs`}>
                              <span
                                className="absolute left-1/2 top-1/2 size-[max(100%,2.5rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
                                aria-hidden="true"
                              />
                              Read
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {solutions.length === 0 && (
                  <div className="border-border flex items-center justify-between gap-6 border-t py-10">
                    <div className="text-secondary">No public solutions available.</div>
                    <Link to="/demo" className={`${pillBase} ${pillOutline}`}>
                      <span
                        className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
                        aria-hidden="true"
                      />
                      Try demo
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-border/50 relative w-full overflow-hidden border-t pb-32 md:pb-64">
        <section className="py-16 sm:py-32 border-b-0">
          <div className="mx-auto w-full px-4 lg:px-6 xl:max-w-7xl space-y-16 sm:space-y-32">
            <div className="relative grid gap-16 md:grid-cols-4">
              <div>
                <div className="space-y-5">
                  <div>
                    <span className="mono-tag text-sm">Try Demo On</span>
                  </div>
                  <div>
                    <Link className="hover:underline" to="/demo">
                      Web
                    </Link>
                  </div>
                  <div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                      href="https://github.com/context8"
                    >
                      CLI
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-5">
                  <div>
                    <span className="mono-tag text-sm">Products</span>
                  </div>
                  <div>
                    <Link className="hover:underline" to="/">
                      Public solutions
                    </Link>
                  </div>
                  <div>
                    <Link className="hover:underline" to="/dashboard/solutions">
                      Dashboard
                    </Link>
                  </div>
                  <div>
                    <Link className="hover:underline" to="/demo">
                      Demo chat
                    </Link>
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-5">
                  <div>
                    <span className="mono-tag text-sm">Company</span>
                  </div>
                  <div>
                    <a className="hover:underline" href="mailto:contact@context8.cloud">
                      Contact
                    </a>
                  </div>
                  <div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                      href="https://x.com/context8_org"
                    >
                      𝕏
                    </a>
                  </div>
                  <div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                      href="https://discord.gg/BDGVMmws"
                    >
                      Discord
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-5">
                  <div>
                    <span className="mono-tag text-sm">Resources</span>
                  </div>
                  <div>
                    <Link className="hover:underline" to="/learn">
                      Learn
                    </Link>
                  </div>
                  <div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                      href="https://status.context8.cloud"
                    >
                      Status
                    </a>
                  </div>
                  <div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                      href="https://github.com/context8"
                    >
                      Documentation
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProductCard({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  const isExternal = href.startsWith('http');
  const LinkOrA: React.ElementType = isExternal ? 'a' : Link;
  const linkProps = isExternal
    ? { href, target: '_blank', rel: 'noreferrer' }
    : { to: href };

  return (
    <div className="group relative flex h-full flex-col space-y-4 px-0 py-10 lg:p-8 from-secondary/10 border-border border-t via-transparent to-transparent lg:border-l lg:border-t-0 lg:hover:bg-gradient-to-b gap-10 overflow-hidden md:flex-row lg:flex-col">
      <div className="border-primary/10 pointer-events-none absolute inset-0 isolate z-10 border opacity-0 group-hover:opacity-100 hidden lg:block">
        <div className="bg-primary absolute -left-1 -top-1 z-10 size-2 -translate-x-px -translate-y-px" />
        <div className="bg-primary absolute -right-1 -top-1 z-10 size-2 -translate-y-px translate-x-px" />
        <div className="bg-primary absolute -bottom-1 -left-1 z-10 size-2 -translate-x-px translate-y-px" />
        <div className="bg-primary absolute -bottom-1 -right-1 z-10 size-2 translate-x-px translate-y-px" />
      </div>

      <div className="group max-w-sm grow">
        <LinkOrA {...linkProps}>
          <div className="absolute inset-0" />
          <h3 className="text-xl group-hover:text-primary">{title}</h3>
        </LinkOrA>
        <p className="text-secondary mt-4 group-hover:text-primary">{description}</p>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="pointer-events-none flex-1 opacity-75">
          <div className="origin-bottom opacity-30 duration-100 group-hover:scale-110 group-hover:opacity-60">
            <svg className="-mt-4 w-full origin-top-right scale-[115%]" viewBox="0 0 600 420" fill="none">
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="hsl(var(--secondary))" stopOpacity="0.25" />
                  <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path
                d="M40 310C160 210 210 120 310 95c95-23 150 30 250 0"
                stroke="url(#g)"
                strokeWidth="2"
              />
              <path d="M70 360c95-60 165-120 260-140 95-20 170 20 240-10" stroke="url(#g)" strokeWidth="2" />
              <path d="M60 250c140-110 250-120 420-170" stroke="url(#g)" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="mono-tag text-xs text-primary/50 group-hover:text-primary">Context8</span>
          </div>
          <div>
            <LinkOrA {...linkProps} className={`${pillBase} ${pillOutline} px-3 py-1.5 text-xs`}>
              <span
                className="absolute left-1/2 top-1/2 size-[max(100%,2.5rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
                aria-hidden="true"
              />
              {cta}
            </LinkOrA>
          </div>
        </div>
      </div>
    </div>
  );
}

