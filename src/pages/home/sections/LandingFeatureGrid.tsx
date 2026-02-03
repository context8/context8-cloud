import * as React from 'react';
import { Key, Library, Search, Terminal, Users, Vault } from 'lucide-react';

type Feature = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  colSpanClass: string;
};

const features: Feature[] = [
  {
    title: 'Public library',
    description: 'Browse real-world fixes shared by developers across stacks.',
    Icon: Library,
    colSpanClass: 'md:col-span-6',
  },
  {
    title: 'Personal vault',
    description: 'Save private solutions and keep the root cause documented.',
    Icon: Vault,
    colSpanClass: 'md:col-span-6',
  },
  {
    title: 'Search',
    description: 'Find similar errors fast with tags, keywords, and patterns.',
    Icon: Search,
    colSpanClass: 'md:col-span-4',
  },
  {
    title: 'API keys',
    description: 'Integrate Context8 into your tools with scoped API access.',
    Icon: Key,
    colSpanClass: 'md:col-span-4',
  },
  {
    title: 'CLI workflow',
    description: 'Capture fixes where you work: terminal-first, low friction.',
    Icon: Terminal,
    colSpanClass: 'md:col-span-4',
  },
  {
    title: 'Team patterns',
    description: 'Turn recurring bugs into shared knowledge and playbooks.',
    Icon: Users,
    colSpanClass: 'md:col-span-12',
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const { Icon } = feature;
  return (
    <div
      className={[
        'group relative overflow-hidden rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.55)] p-6',
        'hover:border-stronger hover:bg-[hsl(var(--sb-bg)/0.7)] transition-colors',
        feature.colSpanClass,
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-default bg-[hsl(var(--sb-bg)/0.6)]">
          <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-foreground text-base">{feature.title}</h3>
          <p className="mt-2 text-sm text-foreground-light">{feature.description}</p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
        style={{ background: 'radial-gradient(circle, hsl(var(--sb-brand) / 0.20), transparent 60%)' }}
      />
    </div>
  );
}

export function LandingFeatureGrid() {
  return (
    <section className="border-default border-t">
      <div className="container relative mx-auto px-6 py-16 md:py-24 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-4 xl:gap-3 2xl:gap-6">
          <div className="md:col-span-5">
            <div className="text-sm font-mono uppercase tracking-widest text-foreground-light">Product</div>
            <h2 className="mt-4 text-3xl tracking-tight text-foreground md:text-4xl">
              A debugging library that scales.
            </h2>
            <p className="mt-4 text-base text-foreground-light">
              Store solutions with context and root cause—then retrieve them instantly when the bug returns.
            </p>
          </div>

          <div className="md:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-12">
              {features.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

