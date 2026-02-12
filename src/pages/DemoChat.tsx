import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertTriangle, Database, Terminal } from 'lucide-react';
import { runOpenRouterAssistant, generateFollowUpSuggestions } from '../services/openrouterAssistant';
import { GeminiChatInput } from '../components/GeminiChatInput';
import { GeminiReasoningBlock } from '../components/GeminiReasoningBlock';
import { ErrorTypeBadge } from '../components/Common/ErrorTypeBadge';
import { TagCloud } from '../components/Common/TagCloud';
import { Modal } from '../components/Common/Modal';
import { SearchResult, Solution } from '../types';
import { solutionsService } from '../services/api/solutions';
import { useSession } from '@/state/session';
import { useTheme } from '@/state/theme';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  thoughtDuration?: number;
  hits?: SearchResult[];
  flags?: {
    deepSearch?: boolean;
    deepThinking?: boolean;
  };
};

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Describe your bug and I will search Context8 solutions before answering.',
  },
];

function SbMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="mt-4 text-xl font-semibold text-foreground">{children}</h1>,
        h2: ({ children }) => <h2 className="mt-4 text-lg font-semibold text-foreground">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-3 text-base font-semibold text-foreground">{children}</h3>,
        p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground">{children}</p>,
        ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 text-foreground">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 text-foreground">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        code: ({ className, children }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="rounded-md border border-default bg-[hsl(var(--sb-bg)/0.7)] px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
                {children}
              </code>
            );
          }
          return <code className="block overflow-x-auto p-4 font-mono text-sm text-foreground">{children}</code>;
        },
        pre: ({ children }) => (
          <pre className="mb-3 overflow-hidden rounded-xl border border-default bg-[hsl(var(--sb-bg)/0.55)]">
            {children}
          </pre>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-link underline underline-offset-4 hover:no-underline"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-2 border-default pl-4 text-foreground-light">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export const DemoChat: React.FC = () => {
  const { theme } = useTheme();
  const { session, apiKey } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [resetToken, setResetToken] = useState(0);
  const [prefill, setPrefill] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(true);
  const [deepThinkingEnabled, setDeepThinkingEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const auth = useMemo(
    () => ({
      token: session?.token,
      apiKey: apiKey ?? undefined,
    }),
    [session?.token, apiKey]
  );

  const authLabel = useMemo(() => {
    if (auth.apiKey) return `X-API-Key ${auth.apiKey.slice(0, 6)}...`;
    if (auth.token) return 'Bearer (saved session)';
    return 'No auth detected';
  }, [auth.apiKey, auth.token]);

  const scrollChatToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = chatScrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollChatToBottom('smooth');
    }
  }, [messages, status, autoScroll]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('q') ?? '';
    const fromStorage = localStorage.getItem('ctx8_demo_prefill') ?? '';
    const next = (fromQuery || fromStorage).trim();
    if (!next) return;
    localStorage.removeItem('ctx8_demo_prefill');
    setPrefill(next);
  }, []);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distance < 80;
      setAutoScroll(atBottom);
      setShowScrollToBottom(!atBottom);
    };

    handleScroll();
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const updateMessage = (id: string, update: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, ...update } : msg)));
  };

  const buildHitPreview = (hit: SearchResult) => {
    if (hit.errorMessage) return hit.errorMessage;
    if (hit.preview) return hit.preview;
    return 'No preview available';
  };

  const handleOpenSolution = async (solutionId: string) => {
    setIsDetailLoading(true);
    setSelectedSolution({ id: solutionId } as Solution);
    try {
      const hasAuth = Boolean(auth.apiKey || auth.token);
      const detail = hasAuth
        ? await solutionsService.getEs(auth, solutionId)
        : await solutionsService.getPublicEs(solutionId);
      setSelectedSolution(detail);
    } catch (err) {
      console.error('[DemoChat] Failed to load solution details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSend = async (prompt: string) => {
    setStatus('loading');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
    };

    const assistantId = `assistant-${Date.now() + 1}`;
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      thought: '',
      thoughtDuration: 0,
      flags: {
        deepSearch: deepSearchEnabled,
        deepThinking: deepThinkingEnabled,
      },
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    const startTime = Date.now();

    try {
      const requestPrompt = deepThinkingEnabled
        ? `${prompt}\n\nPlease provide a thorough diagnosis and fix plan with clear steps.`
        : prompt;

      const result = await runOpenRouterAssistant({
        prompt: requestPrompt,
        auth,
        limit: deepSearchEnabled ? 8 : 5,
      });

      const duration = (Date.now() - startTime) / 1000;
      const trace = result.toolTrace.length > 0 ? result.toolTrace.join('\n') : 'No tool calls were made.';

      updateMessage(assistantId, {
        content: result.reply,
        thought: trace,
        thoughtDuration: Number(duration.toFixed(1)),
        hits: result.hits,
      });

      setStatus('idle');

      generateFollowUpSuggestions({
        userQuestion: prompt,
        aiResponse: result.reply,
        auth,
      })
        .then((newSuggestions) => {
          if (newSuggestions.length > 0) setSuggestions(newSuggestions);
        })
        .catch((err) => {
          console.error('Failed to generate suggestions:', err);
        });
    } catch (err: any) {
      setStatus('error');
      console.error('[DemoChat] Assistant error:', err?.message || err);
      updateMessage(assistantId, {
        content: 'I hit an error while contacting the assistant. Please try again.',
      });
    }
  };

  const resetChat = () => {
    setMessages(initialMessages);
    setStatus('idle');
    setSuggestions([]);
    setResetToken((prev) => prev + 1);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-16 xl:px-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-foreground-light">Demo</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            A debugging library that scales.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground-light sm:text-base">
            Describe the bug, and Context8 will search relevant solutions before answering.
          </p>
        </div>
        <button type="button" onClick={resetChat} className="sb-btn-secondary h-10 px-4 text-xs">
          New chat
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-default bg-[hsl(var(--sb-bg)/0.55)]">
        <div className="border-b border-default bg-[hsl(var(--sb-bg)/0.6)] px-4 py-3 text-xs">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-4 text-foreground-light">
              <span className="inline-flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                LLM tool-driven triage
              </span>
              <span className="inline-flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                Search auth: <span className="text-foreground">{authLabel}</span>
              </span>
              {!auth.apiKey && !auth.token ? (
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    Sign in or set an API key for private results.{' '}
                    <Link to="/login" className="text-brand-link underline underline-offset-4 hover:no-underline">
                      Sign in
                    </Link>
                  </span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex min-h-[70vh] flex-col">
          <div ref={chatScrollRef} className="relative flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-default bg-[hsl(var(--sb-bg)/0.6)] text-xs font-semibold text-foreground">
                        C8
                      </div>
                    </div>
                  ) : null}

                  <div className="flex w-full max-w-[85%] flex-col gap-3 overflow-hidden">
                    <div
                      className={[
                        'rounded-2xl border px-4 py-3 transition-colors',
                        msg.role === 'user'
                          ? 'border-[hsl(var(--sb-brand)/0.25)] bg-[hsl(var(--sb-brand)/0.08)] text-foreground'
                          : 'border-default bg-[hsl(var(--sb-bg)/0.55)] text-foreground',
                      ].join(' ')}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-foreground-light">
                        <span>{msg.role === 'user' ? 'You' : 'Context8'}</span>
                        {msg.flags?.deepSearch ? (
                          <span className="rounded-full border border-[hsl(var(--sb-brand)/0.35)] bg-[hsl(var(--sb-brand)/0.12)] px-2 py-0.5 text-[10px] text-foreground">
                            Deep Search
                          </span>
                        ) : null}
                        {msg.flags?.deepThinking ? (
                          <span className="rounded-full border border-default bg-[hsl(var(--sb-fg)/0.06)] px-2 py-0.5 text-[10px] text-foreground">
                            Deep Thinking
                          </span>
                        ) : null}
                      </div>

                      {msg.role === 'assistant' && msg.thought ? (
                        <div className="mt-3">
                          <GeminiReasoningBlock
                            title="Retrieval steps"
                            detail={msg.thought}
                            duration={msg.thoughtDuration}
                            theme={theme}
                          />
                        </div>
                      ) : null}

                      <div className="mt-3 text-sm leading-relaxed md:text-base">
                        {msg.content ? (
                          msg.role === 'assistant' ? (
                            <SbMarkdown content={msg.content} />
                          ) : (
                            <span className="whitespace-pre-wrap text-foreground">{msg.content}</span>
                          )
                        ) : status === 'loading' && msg.role === 'assistant' ? (
                          <span className="animate-pulse">...</span>
                        ) : null}
                      </div>
                    </div>

                    {msg.role === 'assistant' && msg.hits && msg.hits.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-foreground-light">
                          <span>Matches</span>
                          <span className="rounded-full border border-[hsl(var(--sb-brand)/0.35)] bg-[hsl(var(--sb-brand)/0.12)] px-2 py-0.5 text-[10px] text-foreground">
                            {msg.hits.length} found
                          </span>
                        </div>
                        <div className="grid w-full gap-2">
                          {msg.hits.slice(0, 5).map((hit) => (
                            <div
                              key={hit.id}
                              className="overflow-hidden rounded-xl border border-default bg-[hsl(var(--sb-bg)/0.45)] p-3 transition-colors hover:border-[hsl(var(--sb-brand)/0.35)]"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1 overflow-hidden">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <ErrorTypeBadge type={hit.errorType} size="sm" theme={theme} />
                                    <span className="block truncate text-sm font-semibold text-foreground">
                                      {hit.title || 'Untitled Solution'}
                                    </span>
                                  </div>
                                  <p className="mt-2 line-clamp-2 break-words text-xs text-foreground-light">
                                    {buildHitPreview(hit)}
                                  </p>
                                </div>
                                <button type="button" onClick={() => handleOpenSolution(hit.id)} className="sb-btn-secondary h-9 px-3 text-xs">
                                  Open
                                </button>
                              </div>
                              {hit.tags && hit.tags.length > 0 ? (
                                <div className="mt-2 overflow-hidden">
                                  <TagCloud tags={hit.tags} maxVisible={4} size="sm" theme={theme} />
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {msg.role === 'user' ? (
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-default bg-[hsl(var(--sb-bg)/0.6)] text-xs font-semibold text-foreground">
                        You
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
              <div className="h-4" />
            </div>

            {showScrollToBottom ? (
              <button
                type="button"
                onClick={() => scrollChatToBottom('smooth')}
                className="sticky bottom-6 ml-auto mr-6 flex items-center gap-2 rounded-full border border-default bg-[hsl(var(--sb-bg)/0.75)] px-4 py-2 text-xs text-foreground hover:bg-[hsl(var(--sb-bg))]"
              >
                Jump to latest
              </button>
            ) : null}
          </div>

          <div className="border-t border-default">
            <GeminiChatInput
              onSend={handleSend}
              disabled={status === 'loading'}
              resetToken={resetToken}
              initialValue={prefill}
              deepSearchEnabled={deepSearchEnabled}
              deepThinkingEnabled={deepThinkingEnabled}
              onToggleDeepSearch={() => setDeepSearchEnabled((prev) => !prev)}
              onToggleDeepThinking={() => setDeepThinkingEnabled((prev) => !prev)}
              suggestions={suggestions}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedSolution}
        onClose={() => setSelectedSolution(null)}
        title={selectedSolution?.title || 'Solution Details'}
        size="xl"
      >
        {selectedSolution && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ErrorTypeBadge type={selectedSolution.errorType} size="md" theme={theme} />
              {selectedSolution.tags && selectedSolution.tags.length > 0 ? (
                <TagCloud tags={selectedSolution.tags} maxVisible={5} size="sm" theme={theme} />
              ) : null}
            </div>

            {isDetailLoading ? <div className="text-sm text-gray-500 dark:text-slate-400">Loading full details...</div> : null}

            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                Error Message
              </h4>
              <div className="rounded-lg bg-red-50 p-3 font-mono text-sm text-red-700 dark:bg-slate-800 dark:text-red-300">
                {selectedSolution.errorMessage || 'No error message'}
              </div>
            </div>

            {selectedSolution.context ? (
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Context
                </h4>
                <p className="text-slate-700 dark:text-slate-300">{selectedSolution.context}</p>
              </div>
            ) : null}

            {selectedSolution.rootCause ? (
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Root Cause
                </h4>
                <p className="text-slate-700 dark:text-slate-300">{selectedSolution.rootCause}</p>
              </div>
            ) : null}

            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Solution
              </h4>
              <div className="rounded-lg bg-emerald-50/50 p-4 dark:bg-slate-800/50">
                <SbMarkdown content={selectedSolution.solution || 'No solution provided'} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
