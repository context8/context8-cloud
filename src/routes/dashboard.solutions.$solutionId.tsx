import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MarkdownRenderer } from '@/components/Common/MarkdownRenderer';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import type { Solution, ThemeMode } from '@/types';
import { solutionsService } from '@/services/api/solutions';
import { useSession } from '@/state/session';
import { useTheme } from '@/state/theme';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Common/Toast';
import { DashButton } from '@/components/dashboard-ui/DashButton';
import { DashModal } from '@/components/dashboard-ui/DashModal';
import { normalizeErrorType } from '@/components/Common/ErrorTypeBadge';

export const Route = createFileRoute('/dashboard/solutions/$solutionId')({
  ssr: false,
  component: SolutionDetailRoute,
});

function formatErrorTypeLabel(type?: string) {
  const normalized = normalizeErrorType(type);
  if (normalized === 'ui_ux') return 'UI/UX';
  if (normalized === 'ops_infra') return 'Ops/Infra';
  if (normalized === 'build_ci') return 'Build/CI';
  if (normalized === 'install_setup') return 'Install/Setup';
  if (normalized === 'question_support') return 'Support';
  if (normalized === 'api_integration') return 'API';
  if (normalized === 'docs_request') return 'Docs';
  return normalized
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function SolutionDetailRoute() {
  const navigate = useNavigate();
  const { solutionId } = Route.useParams();
  const { theme } = useTheme();
  const { session, apiKey } = useSession();
  const { toasts, error, dismiss } = useToast();

  const [isLoading, setIsLoading] = React.useState(true);
  const [solution, setSolution] = React.useState<Solution | null>(null);

  const auth = React.useMemo(() => ({ token: session?.token ?? undefined, apiKey: apiKey ?? undefined }), [
    session?.token,
    apiKey,
  ]);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      try {
        const detail = await solutionsService.getEs(auth, solutionId);
        if (!cancelled) setSolution(detail);
      } catch (e) {
        if (!cancelled) {
          error(e instanceof Error ? e.message : 'Failed to load solution details');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [auth, error, solutionId]);

  const close = () => {
    navigate({ to: '/dashboard/solutions', search: {} });
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={dismiss} />
      <DashModal isOpen onClose={close} title={solution?.title || 'Solution details'} size="xl">
        {isLoading || !solution ? (
          <div className="py-8 text-center text-foreground-light">Loading…</div>
        ) : (
          <SolutionDetail
            theme={theme}
            solution={solution}
            onUpdate={setSolution}
            onError={(message) => error(message)}
          />
        )}
      </DashModal>
    </>
  );
}

function SolutionDetail({
  solution,
  theme,
  onUpdate,
  onError,
}: {
  solution: Solution;
  theme: ThemeMode;
  onUpdate: (next: Solution) => void;
  onError: (message: string) => void;
}) {
  const { session, apiKey } = useSession();
  const auth = React.useMemo(() => ({ token: session?.token ?? undefined, apiKey: apiKey ?? undefined }), [
    session?.token,
    apiKey,
  ]);

  const handleVote = async (value: 1 | -1) => {
    try {
      const current = solution.myVote ?? null;
      const resp = current === value
        ? await solutionsService.clearVote(auth, solution.id)
        : await solutionsService.vote(auth, solution.id, value);
      onUpdate({
        ...solution,
        upvotes: resp.upvotes,
        downvotes: resp.downvotes,
        voteScore: resp.voteScore,
        myVote: resp.myVote ?? null,
      });
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to vote');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-default bg-alternative px-2 py-0.5 text-xs text-foreground-light">
            {formatErrorTypeLabel(solution.errorType)}
          </span>
          {(solution.tags ?? []).slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md border border-default bg-alternative px-2 py-0.5 text-xs text-foreground-light"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <DashButton
            size="sm"
            variant="default"
            className={
              solution.myVote === 1
                ? 'bg-[hsl(var(--dash-brand)/0.12)] text-[hsl(var(--dash-brand))] border-[hsl(var(--dash-brand)/0.35)]'
                : undefined
            }
            onClick={() => handleVote(1)}
          >
            <ThumbsUp size={16} />
            <span>{solution.upvotes ?? 0}</span>
          </DashButton>
          <DashButton
            size="sm"
            variant="default"
            className={
              solution.myVote === -1
                ? 'bg-[hsl(0_84%_60%/0.12)] text-[hsl(0_84%_60%)] border-[hsl(0_84%_60%/0.35)]'
                : undefined
            }
            onClick={() => handleVote(-1)}
          >
            <ThumbsDown size={16} />
            <span>{solution.downvotes ?? 0}</span>
          </DashButton>
          <span className="text-sm px-2 text-foreground-light">Score {solution.voteScore ?? 0}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-widest mb-2 text-foreground-light">Error message</h4>
          <div className="rounded-lg border border-default bg-alternative p-4 font-mono text-sm whitespace-pre-wrap text-foreground">
            {solution.errorMessage || 'No error message provided'}
          </div>
        </div>

        {solution.context ? (
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest mb-2 text-foreground-light">Context</h4>
            <div className="rounded-lg border border-default bg-alternative p-4">
              <MarkdownRenderer content={solution.context} theme={theme} />
            </div>
          </div>
        ) : null}

        {solution.rootCause ? (
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest mb-2 text-foreground-light">Root cause</h4>
            <div className="rounded-lg border border-default bg-alternative p-4">
              <MarkdownRenderer content={solution.rootCause} theme={theme} />
            </div>
          </div>
        ) : null}

        <div>
          <h4 className="text-xs font-mono uppercase tracking-widest mb-2 text-foreground-light">Solution</h4>
          <div className="rounded-lg border border-default bg-alternative p-4">
            <MarkdownRenderer content={solution.solution || 'No solution provided'} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}
