/// <reference types="vite/client" />

import * as React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';

import appCss from '@/styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { title: 'Context8 - Community Error Solutions for Developers' },
      {
        name: 'description',
        content:
          "Browse thousands of real-world error fixes shared by developers. Search by error message, tags, or technology. Save and share your debugging experiences.",
      },
      {
        name: 'keywords',
        content:
          'error solutions, debugging, developer tools, error fixes, programming help, code errors',
      },
      { property: 'og:title', content: 'Context8 - Community Error Solutions' },
      {
        property: 'og:description',
        content: "Learn from others' debugging experiences. Browse and share real-world error solutions.",
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Context8 - Community Error Solutions' },
      {
        name: 'twitter:description',
        content: 'Browse thousands of real-world error fixes shared by developers.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/logo.png?v=1' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/logo.png?v=1' },
      { rel: 'shortcut icon', type: 'image/png', href: '/logo.png?v=1' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Analytics />
        {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
        <Scripts />
      </body>
    </html>
  );
}

