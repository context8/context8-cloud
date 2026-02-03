import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeRoute,
});

function HomeRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Context8</h1>
        <p className="text-sm text-slate-500">
          Migrating to TanStack Start. Routes and UI will be wired up next.
        </p>
      </div>
    </div>
  );
}

