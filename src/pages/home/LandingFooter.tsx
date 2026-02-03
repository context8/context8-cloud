import * as React from 'react';
import { Link } from '@tanstack/react-router';
import { Check, Github, Moon, Sun, Twitter, Youtube, MessageSquare } from 'lucide-react';
import { useTheme } from '@/state/theme';

type FooterLink =
  | { kind: 'internal'; label: string; to: string }
  | { kind: 'external'; label: string; href: string };

const groups: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: 'Product',
    links: [
      { kind: 'internal', label: 'Home', to: '/' },
      { kind: 'internal', label: 'Demo chat', to: '/demo' },
      { kind: 'internal', label: 'Dashboard', to: '/dashboard/solutions' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { kind: 'external', label: 'Documentation', href: 'https://github.com/context8' },
      { kind: 'internal', label: 'API keys', to: '/dashboard/apikeys' },
      { kind: 'internal', label: 'Search', to: '/dashboard/search' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { kind: 'internal', label: 'Learn', to: '/learn' },
      { kind: 'external', label: 'Status', href: 'https://status.context8.cloud' },
      { kind: 'external', label: 'GitHub', href: 'https://github.com/context8' },
    ],
  },
  {
    title: 'Company',
    links: [
      { kind: 'external', label: 'Contact', href: 'mailto:contact@context8.cloud' },
      { kind: 'external', label: 'X', href: 'https://x.com/context8_org' },
      { kind: 'external', label: 'Discord', href: 'https://discord.gg/BDGVMmws' },
    ],
  },
];

function FooterHref({ link }: { link: FooterLink }) {
  if (link.kind === 'internal') {
    return (
      <Link to={link.to} className="text-sm transition-colors text-foreground-light hover:text-foreground">
        {link.label}
      </Link>
    );
  }
  return (
    <a
      href={link.href}
      className="text-sm transition-colors text-foreground-light hover:text-foreground"
      target={link.href.startsWith('http') ? '_blank' : undefined}
      rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
    >
      {link.label}
    </a>
  );
}

export function LandingFooter() {
  const { toggleTheme } = useTheme();

  return (
    <footer aria-labelledby="footerHeading" className="border-default mt-0 border-t bg-alternative">
      <h2 id="footerHeading" className="sr-only">
        Footer
      </h2>

      <div className="w-full !py-0">
        <div className="sm:py-[4.5rem] container relative mx-auto px-6 py-16 md:py-24 lg:px-16 lg:py-24 xl:px-20 grid grid-cols-2 md:flex items-center justify-between text-foreground md:justify-center gap-8 md:gap-16 xl:gap-28 !py-6 md:!py-10 text-sm">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <span>Ship your code faster</span>
            <a className="text-brand-link hover:underline" href="/learn">
              Learn more
            </a>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-[hsl(var(--sb-border))] to-transparent" />
      </div>

      <div className="sm:py-[4.5rem] container relative mx-auto px-6 py-16 md:py-24 lg:px-16 lg:py-24 xl:px-20 py-8 bg-[hsl(var(--sb-bg))]">
        <div className="xl:grid xl:grid-cols-7 xl:gap-4">
          <div className="space-y-8 xl:col-span-2">
            <Link to="/" className="w-40 inline-flex items-center gap-2" aria-label="Context8 Home">
              <img alt="Context8 Logo" src="/logo.png" className="h-7 w-auto" />
              <span className="text-sm font-medium tracking-tight">Context8</span>
            </Link>

            <div className="flex space-x-5">
              <a href="https://x.com/context8_org" className="text-foreground-light hover:text-foreground transition">
                <span className="sr-only">X</span>
                <Twitter className="h-[22px] w-[22px]" aria-hidden="true" />
              </a>
              <a href="https://github.com/context8" className="text-foreground-light hover:text-foreground transition">
                <span className="sr-only">GitHub</span>
                <Github className="h-[22px] w-[22px]" aria-hidden="true" />
              </a>
              <a href="https://discord.gg/BDGVMmws" className="text-foreground-light hover:text-foreground transition">
                <span className="sr-only">Discord</span>
                <MessageSquare className="h-[22px] w-[22px]" aria-hidden="true" />
              </a>
              <a href="https://www.youtube.com" className="text-foreground-light hover:text-foreground transition">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-[22px] w-[22px]" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8 xl:col-span-5 xl:mt-0 sm:grid-cols-4">
            {groups.map((group) => (
              <div key={group.title}>
                <h6 className="text-foreground text-base">{group.title}</h6>
                <ul className="mt-4 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <FooterHref link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-default mt-32 flex justify-between border-t pt-8">
          <small className="text-foreground-light text-xs">© {new Date().getFullYear()} Context8</small>
          <div>
            <button
              id="user-settings-dropdown"
              className="flex items-center justify-center h-7 w-7 text-foreground-light hover:text-foreground transition"
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              <Moon className="h-[20px] w-[20px] rotate-90 transition-all dark:rotate-0 dark:hidden" aria-hidden="true" />
              <Sun className="h-[20px] w-[20px] transition-all hidden dark:block" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
