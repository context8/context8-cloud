import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { SolutionsView } from '@/pages/Dashboard/views/SolutionsView';
import { useSession } from '@/state/session';

export const Route = createFileRoute('/dashboard/solutions')({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    const create = search.create === '1' ? '1' : undefined;
    return create ? { create } : {};
  },
  component: SolutionsRoute,
});

function SolutionsRoute() {
  const { create } = Route.useSearch();
  const navigate = useNavigate();
  const { session, apiKey } = useSession();

  return (
    <>
      <SolutionsView
        token={session?.token ?? null}
        apiKey={apiKey}
        autoOpenCreate={create === '1'}
        onAutoOpenCreateHandled={() => {
          navigate({ to: '/dashboard/solutions', search: {}, replace: true });
        }}
      />
      <Outlet />
    </>
  );
}
