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

export function LandingCta() {
  const { session } = useSession();
  const authHref = session?.token ? '/dashboard/solutions' : '/login';
  const authLabel = session?.token ? 'Dashboard' : 'Sign in';

  return (
    <section className="border-default border-t">
      <div className="container relative mx-auto px-6 py-16 md:py-24 lg:px-16 xl:px-20 xl:pt-32 !pb-0">
        <div className="rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.55)] p-10 text-center">
          <h2 className="text-3xl tracking-tight text-foreground md:text-4xl">Start building in seconds.</h2>
          <p className="mt-4 text-base text-foreground-light">
            Try the demo, or sign in to save and search your own solutions.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link to="/demo" className={primaryButton}>
              <span className="truncate">Try demo</span>
            </Link>
            <Link to={authHref} className={secondaryButton}>
              <span className="truncate">{authLabel}</span>
            </Link>
          </div>
        </div>

        <div className="h-16" />
      </div>
    </section>
  );
}

