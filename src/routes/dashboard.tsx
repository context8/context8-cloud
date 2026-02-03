import * as React from 'react';
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { useSession } from '@/state/session';
import { DashboardShell } from '@/pages/shells/DashboardShell';

export const Route = createFileRoute('/dashboard')({
  ssr: false,
  component: DashboardRoute,
});

function DashboardRoute() {
  const { session } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  React.useEffect(() => {
    if (!session?.token) {
      navigate({ to: '/login' });
      return;
    }
    if (pathname === '/dashboard') {
      navigate({ to: '/dashboard/solutions', search: {}, replace: true });
    }
  }, [navigate, pathname, session?.token]);

  return (
    <AppShell hideChrome>
      <DashboardShell>
        <Outlet />
      </DashboardShell>
    </AppShell>
  );
}
