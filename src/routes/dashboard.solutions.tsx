import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SolutionsView } from '@/pages/Dashboard/views/SolutionsView';
import { useTheme } from '@/state/theme';
import { useSession } from '@/state/session';

export const Route = createFileRoute('/dashboard/solutions')({
  ssr: false,
  component: SolutionsRoute,
});

function SolutionsRoute() {
  const { theme } = useTheme();
  const { session, apiKey } = useSession();

  return (
    <>
      <SolutionsView token={session?.token ?? null} apiKey={apiKey} theme={theme} />
      <Outlet />
    </>
  );
}

