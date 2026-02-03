import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { Home } from '@/pages/Home';
import { getApiBase } from '@/constants';
import type { Solution } from '@/types';
import { useTheme } from '@/state/theme';
import { useSession } from '@/state/session';

export const Route = createFileRoute('/')({
  loader: async () => {
    const apiBase = getApiBase();
    try {
      const res = await fetch(`${apiBase}/solutions?limit=50&publicOnly=true`);
      if (!res.ok) {
        const text = await res.text();
        return { solutions: [] as Solution[], error: text || `HTTP ${res.status}` };
      }
      const data = await res.json();
      return { solutions: Array.isArray(data) ? (data as Solution[]) : [], error: null as string | null };
    } catch (err) {
      return {
        solutions: [] as Solution[],
        error: err instanceof Error ? err.message : 'Failed to load public solutions',
      };
    }
  },
  component: IndexRoute,
});

function IndexRoute() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { session } = useSession();
  const { solutions, error } = Route.useLoaderData();

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
      <Home theme={theme} initialSolutions={solutions} initialError={error} />
    </AppShell>
  );
}
