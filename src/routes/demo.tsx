import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { DemoChat } from '@/pages/DemoChat';
import { MarketingShell } from '@/pages/shells/MarketingShell';

export const Route = createFileRoute('/demo')({
  ssr: false,
  component: DemoRoute,
});

function DemoRoute() {
  return (
    <AppShell hideChrome>
      <MarketingShell>
        <DemoChat />
      </MarketingShell>
    </AppShell>
  );
}
