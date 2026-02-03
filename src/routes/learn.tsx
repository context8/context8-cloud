import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { Learn, LEARN_NAV_ITEMS } from '@/pages/Learn';
import { DocsShell } from '@/pages/shells/DocsShell';

export const Route = createFileRoute('/learn')({
  component: LearnRoute,
});

function LearnRoute() {
  return (
    <AppShell hideChrome>
      <DocsShell title="Learn" navItems={LEARN_NAV_ITEMS}>
        <Learn />
      </DocsShell>
    </AppShell>
  );
}
