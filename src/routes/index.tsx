import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { Home } from '@/pages/Home';
import { useSession } from '@/state/session';

export const Route = createFileRoute('/')({
  component: IndexRoute,
});

function IndexRoute() {
  const navigate = useNavigate();
  const { session } = useSession();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const solutionId = params.get('solutionId');
    if (!solutionId) return;

    if (session?.token) {
      navigate({ to: '/dashboard/solutions/$solutionId', params: { solutionId } });
      return;
    }

    navigate({ to: '/login' });
  }, [navigate, session?.token]);

  return (
    <AppShell hideChrome>
      <Home />
    </AppShell>
  );
}
