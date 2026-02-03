import * as React from 'react';

type Story = {
  title: string;
  description: string;
};

const stories: Story[] = [
  {
    title: 'Fewer repeat incidents',
    description: 'When the same bug returns, the fix is already documented—context included.',
  },
  {
    title: 'Faster onboarding',
    description: 'New teammates learn the system through real fixes, not tribal knowledge.',
  },
  {
    title: 'Cleaner postmortems',
    description: 'Root cause + remediation lives with the error, ready for future searches.',
  },
];

export function LandingStories() {
  return (
    <section className="border-default border-t">
      <div className="container relative mx-auto px-6 py-16 md:py-24 lg:px-16 xl:px-20 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(900px 520px at 20% 20%, hsl(var(--sb-brand) / 0.10), transparent 60%),' +
              'radial-gradient(900px 520px at 80% 80%, hsl(var(--sb-fg) / 0.06), transparent 60%)',
          }}
        />

        <div className="relative">
          <div className="text-sm font-mono uppercase tracking-widest text-foreground-light">Outcomes</div>
          <h2 className="mt-4 text-3xl tracking-tight text-foreground md:text-4xl">
            Common wins for teams.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-foreground-light">
            Context8 turns one-off debugging sessions into reusable knowledge—without pretending you have a perfect memory.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {stories.map((s) => (
              <div
                key={s.title}
                className="rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.55)] p-6 hover:border-stronger transition-colors"
              >
                <div className="text-foreground text-base">{s.title}</div>
                <p className="mt-2 text-sm text-foreground-light">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

