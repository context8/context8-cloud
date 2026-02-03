import * as React from 'react';
import { Layout } from '@/components/Layout';
import { useSession } from '@/state/session';
import { useTheme } from '@/state/theme';

export function AppShell({
  children,
  hideChrome,
}: {
  children: React.ReactNode;
  hideChrome?: boolean;
}) {
  const { session, logout } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <Layout
      user={session ? { email: session.email } : null}
      onLogout={session ? logout : undefined}
      theme={theme}
      onToggleTheme={toggleTheme}
      hideChrome={hideChrome}
    >
      {children}
    </Layout>
  );
}

