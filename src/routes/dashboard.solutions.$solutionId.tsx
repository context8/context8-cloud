import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Modal } from '@/components/Common/Modal';
import { MarkdownRenderer } from '@/components/Common/MarkdownRenderer';
import { ErrorTypeBadge } from '@/components/Common/ErrorTypeBadge';
import { TagCloud } from '@/components/Common/TagCloud';
import { Button } from '@/components/Common/Button';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import type { Solution, ThemeMode } from '@/types';
import { solutionsService } from '@/services/api/solutions';
import { useSession } from '@/state/session';
import { useTheme } from '@/state/theme';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Common/Toast';

export const Route = createFileRoute('/dashboard/solutions/$solutionId')({
  ssr: false,
  component: SolutionDetailRoute,
});

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
      <Modal isOpen onClose={close} title={solution?.title || 'Solution Details'} size="xl">
        {isLoading || !solution ? (
          <div className={`py-8 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Loading…
          </div>
        ) : (
          <SolutionDetail
            theme={theme}
            solution={solution}
            onUpdate={setSolution}
            onError={(message) => error(message)}
          />
        )}
      </Modal>
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
  const isDark = theme === 'dark';
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
        <div className="flex items-center gap-3">
          <ErrorTypeBadge type={solution.errorType} size="md" theme={theme} />
          {solution.tags && solution.tags.length > 0 ? <TagCloud tags={solution.tags} theme={theme} /> : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={solution.myVote === 1 ? 'primary' : 'secondary'}
            onClick={() => handleVote(1)}
          >
            <ThumbsUp size={16} />
            <span className="ml-2">{solution.upvotes ?? 0}</span>
          </Button>
          <Button
            variant={solution.myVote === -1 ? 'primary' : 'secondary'}
            onClick={() => handleVote(-1)}
          >
            <ThumbsDown size={16} />
            <span className="ml-2">{solution.downvotes ?? 0}</span>
          </Button>
          <span className={`text-sm px-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Score {solution.voteScore ?? 0}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            Error Message
          </h4>
          <div className={`p-4 rounded-lg font-mono text-sm whitespace-pre-wrap ${isDark ? 'bg-slate-800/50 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
            {solution.errorMessage || 'No error message provided'}
          </div>
        </div>

        {solution.context ? (
          <div>
            <h4 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Context
            </h4>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <MarkdownRenderer content={solution.context} theme={theme} />
            </div>
          </div>
        ) : null}

        {solution.rootCause ? (
          <div>
            <h4 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Root Cause
            </h4>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <MarkdownRenderer content={solution.rootCause} theme={theme} />
            </div>
          </div>
        ) : null}

        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            Solution
          </h4>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-emerald-50/50'}`}>
            <MarkdownRenderer content={solution.solution || 'No solution provided'} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}
