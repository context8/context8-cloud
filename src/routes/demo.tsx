import { createFileRoute } from '@tanstack/react-router';
import { DemoChat } from '@/pages/DemoChat';

export const Route = createFileRoute('/demo')({
  ssr: false,
  component: DemoChat,
});

