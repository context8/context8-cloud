import * as React from 'react';
import { Link } from '@tanstack/react-router';
import { useSession } from '@/state/session';

const buttonBase =
  'relative justify-center cursor-pointer inline-flex items-center space-x-2 text-center font-regular ease-out duration-200 ' +
  'rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border text-sm px-4 py-2 h-[38px]';

const primaryButton =
  `${buttonBase} bg-[hsl(var(--sb-brand-bg))] text-[hsl(var(--sb-on-brand))] ` +
  'border-[color:rgba(62,207,142,0.3)] hover:bg-[color:rgba(0,98,57,0.9)] active:bg-[color:rgba(0,98,57,0.85)]';

const secondaryButton =
  `${buttonBase} bg-alternative text-foreground border-strong hover:bg-selection hover:border-stronger active:bg-[hsl(var(--sb-fg)/0.04)]`;

export function LandingHero() {
  const { session } = useSession();
  const authHref = session?.token ? '/dashboard/solutions' : '/login';
  const authLabel = session?.token ? 'Dashboard' : 'Sign in';

  return (
    <div className="relative -mt-[65px]">
      <div className="sm:py-18 container relative mx-auto px-6 py-16 md:py-24 lg:px-16 lg:py-24 xl:px-20 pt-8 pb-10 md:pt-16 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 520px at 50% 30%, hsl(var(--sb-fg) / 0.08), transparent 60%),' +
              'radial-gradient(700px 420px at 20% 65%, hsl(var(--sb-brand) / 0.12), transparent 60%),' +
              'radial-gradient(700px 420px at 80% 70%, hsl(var(--sb-brand) / 0.10), transparent 60%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(to right, hsl(var(--sb-border) / 0.35) 1px, transparent 1px),' +
              'linear-gradient(to bottom, hsl(var(--sb-border) / 0.35) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(circle at 50% 35%, black 0%, transparent 65%)',
          }}
        />
        <div className="relative">
          <div className="mx-auto">
            <div className="mx-auto max-w-2xl lg:col-span-6 lg:flex lg:items-center justify-center text-center">
              <div className="relative z-10 lg:h-auto pt-[90px] lg:pt-[90px] lg:min-h-[300px] flex flex-col items-center justify-center sm:mx-auto md:w-3/4 lg:mx-0 lg:w-full gap-4 lg:gap-8">
                <div className="flex flex-col items-center">
                  <h1 className="text-foreground text-4xl sm:text-5xl sm:leading-none lg:text-7xl">
                    <span className="block text-foreground">Build a fix in minutes</span>
                    <span className="text-brand block md:ml-0">Scale your debugging knowledge</span>
                  </h1>
                  <p className="pt-2 text-foreground my-3 text-sm sm:mt-5 lg:mb-0 sm:text-base lg:text-lg">
                    Context8 is a community-backed library of real-world error solutions.
                    <br className="hidden md:block" />
                    Search patterns, save fixes, and ship faster—across teams and stacks.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link to="/demo" className={primaryButton}>
                    <span className="truncate">Try demo</span>
                  </Link>
                  <Link to={authHref} className={secondaryButton}>
                    <span className="truncate">{authLabel}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
