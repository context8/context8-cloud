import { createFileRoute } from '@tanstack/react-router';
import { SearchView } from '@/pages/Dashboard/views/SearchView';
import { useSession } from '@/state/session';

export const Route = createFileRoute('/dashboard/search')({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    const q = typeof search.q === 'string' ? search.q : undefined;
    return q ? { q } : {};
  },
  component: SearchRoute,
});

function SearchRoute() {
  const { q } = Route.useSearch();
  const { session, apiKey } = useSession();

  return <SearchView token={session?.token ?? null} apiKey={apiKey} initialQuery={q} />;
}
