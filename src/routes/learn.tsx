import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { Learn } from '@/pages/Learn';
import { useTheme } from '@/state/theme';

export const Route = createFileRoute('/learn')({
  component: LearnRoute,
});

function LearnRoute() {
  const { theme } = useTheme();
  return (
    <AppShell>
      <Learn theme={theme} />
    </AppShell>
  );
}

