import { createFileRoute } from '@tanstack/react-router';
import { ApiKeysView } from '@/pages/Dashboard/views/ApiKeysView';
import { useTheme } from '@/state/theme';
import { useSession } from '@/state/session';

export const Route = createFileRoute('/dashboard/apikeys')({
  ssr: false,
  component: ApiKeysRoute,
});

function ApiKeysRoute() {
  const { theme } = useTheme();
  const { session } = useSession();

  return <ApiKeysView token={session?.token ?? null} theme={theme} />;
}

