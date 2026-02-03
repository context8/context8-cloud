import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { Login } from '@/pages/Login';
import { SignInShell } from '@/pages/shells/SignInShell';

export const Route = createFileRoute('/login')({
  ssr: false,
  component: LoginRoute,
});

function LoginRoute() {
  return (
    <AppShell hideChrome>
      <SignInShell>
        <Login />
      </SignInShell>
    </AppShell>
  );
}
