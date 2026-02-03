import { createFileRoute } from '@tanstack/react-router';
import { ApiKeysView } from '@/pages/Dashboard/views/ApiKeysView';
import { useSession } from '@/state/session';

export const Route = createFileRoute('/dashboard/apikeys')({
  ssr: false,
  component: ApiKeysRoute,
});

function ApiKeysRoute() {
  const { session } = useSession();

  return <ApiKeysView token={session?.token ?? null} />;
}
