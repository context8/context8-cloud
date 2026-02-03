import * as React from 'react';

const pill =
  'inline-flex items-center rounded-full border border-default bg-[hsl(var(--sb-bg)/0.6)] px-3 py-1 text-xs text-foreground-light';

const wordmark =
  'flex h-10 items-center justify-center rounded-md border border-default bg-[hsl(var(--sb-bg)/0.5)] px-3 text-xs font-mono uppercase tracking-widest text-foreground-light';

const pills = ['Startups', 'Agencies', 'Open source', 'Teams', 'Indie devs'];
const wordmarks = ['Postgres', 'React', 'Node', 'Python', 'Go', 'TypeScript'];

export function LandingTrustedBy() {
  return (
    <section className="pb-14 md:pb-24">
      <div className="container relative mx-auto px-6">
        <div className="text-center text-sm text-foreground-light">
          Trusted by fast-moving teams who ship.
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {pills.map((p) => (
            <span key={p} className={pill}>
              {p}
            </span>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {wordmarks.map((w) => (
            <div key={w} className={wordmark}>
              {w}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

