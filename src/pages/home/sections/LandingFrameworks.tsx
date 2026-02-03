import * as React from 'react';

const chip =
  'inline-flex items-center rounded-full border border-default bg-[hsl(var(--sb-bg)/0.6)] px-3 py-1 text-xs text-foreground-light ' +
  'hover:border-stronger hover:text-foreground transition-colors';

const frameworks = ['React', 'Next.js', 'Node', 'Python', 'Go', 'Java', 'Rust', 'Postgres'];

export function LandingFrameworks() {
  return (
    <section className="border-default border-t">
      <div className="container relative mx-auto px-6 py-16 md:py-24 lg:px-16 xl:px-20">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="text-sm font-mono uppercase tracking-widest text-foreground-light">Developers</div>
            <h2 className="mt-4 text-3xl tracking-tight text-foreground md:text-4xl">
              Works with your stack.
            </h2>
            <p className="mt-4 text-base text-foreground-light">
              Context8 is tool-agnostic: capture the fix, keep the context, and reuse it anywhere.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {frameworks.map((f) => (
              <span key={f} className={chip}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.55)] p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <div className="text-sm text-foreground">Bring your error</div>
              <p className="mt-2 text-sm text-foreground-light">
                Paste logs, stack traces, or symptoms—Context8 keeps the full story.
              </p>
            </div>
            <div>
              <div className="text-sm text-foreground">Find the pattern</div>
              <p className="mt-2 text-sm text-foreground-light">
                Search by message, tags, or tech; spot repeats across projects.
              </p>
            </div>
            <div>
              <div className="text-sm text-foreground">Ship the fix</div>
              <p className="mt-2 text-sm text-foreground-light">
                Store the root cause and solution so the same bug becomes a one‑minute task.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

