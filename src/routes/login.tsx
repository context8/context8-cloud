import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { Login } from '@/pages/Login';
import { AuthShell } from '@/pages/shells/AuthShell';

export const Route = createFileRoute('/login')({
  ssr: false,
  component: LoginRoute,
});

function LoginRoute() {
  return (
    <AppShell hideChrome>
      <AuthShell>
        <Login />
      </AuthShell>
    </AppShell>
  );
}
