import React, { useEffect, useMemo, useRef, useState } from 'react';
import { runOpenRouterAssistant } from '../services/openrouterAssistant';
import { GeminiChatInput } from '../components/GeminiChatInput';
import { GeminiReasoningBlock } from '../components/GeminiReasoningBlock';
import { SearchResult, ThemeMode, View } from '../types';
import { AlertTriangle, Database, Terminal } from 'lucide-react';

type SessionState = {
  session: { token: string; email: string } | null;
  apiKey: string | null;
};

type Props = {
  sessionState: SessionState;
  onViewChange: (view: View) => void;
  theme: ThemeMode;
};

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

export const DemoChat: React.FC<Props> = ({ sessionState, onViewChange, theme }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(true);
  const [deepThinkingEnabled, setDeepThinkingEnabled] = useState(false);

  const auth = useMemo(() => ({
    token: sessionState.session?.token,
    apiKey: sessionState.apiKey,
  }), [sessionState.session?.token, sessionState.apiKey]);

  const authLabel = useMemo(() => {
    if (auth.apiKey) return `X-API-Key ${auth.apiKey.slice(0, 6)}...`;
    if (auth.token) return 'Bearer (saved session)';
    return 'No auth detected';
  }, [auth.apiKey, auth.token]);

  useEffect(() => {
    if (autoScroll) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, status, autoScroll]);

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

  const handleSend = async (prompt: string) => {
    setError(null);
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
      const trace = result.toolTrace.length > 0
        ? result.toolTrace.join('\n')
        : 'No tool calls were made.';

      updateMessage(assistantId, {
        content: result.reply,
        thought: trace,
        thoughtDuration: Number(duration.toFixed(1)),
        hits: result.hits,
      });

      setStatus('idle');
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || 'Assistant failed');
      updateMessage(assistantId, {
        content: 'I hit an error while contacting the assistant. Please try again.',
      });
    }
  };

  const resetChat = () => {
    setMessages(initialMessages);
    setError(null);
    setStatus('idle');
    setResetToken((prev) => prev + 1);
  };

  const isDark = theme === 'dark';
  const latestHits = messages
    .slice()
    .reverse()
    .find((msg) => msg.hits && msg.hits.length > 0)?.hits;

  return (
    <div className={`rounded-3xl border ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'} shadow-sm overflow-hidden`}>
      <header className={`flex items-center justify-between px-6 py-4 border-b backdrop-blur-md ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-lg ${isDark ? 'bg-gradient-to-br from-slate-600 to-slate-800 shadow-slate-900/40' : 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-200'}`}>
            C
          </div>
          <div>
            <h1 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Context8 Demo Assistant</h1>
            <p className={`text-[10px] font-mono tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>LLM PROXY • SEARCH • TOOLS</p>
          </div>
        </div>
        <button
          onClick={resetChat}
          className={`px-3 py-1 text-xs rounded-full transition-colors border ${isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
        >
          New Chat
        </button>
      </header>

      <div className={`border-b ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50/50'} px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs`}>
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-emerald-500" />
          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>LLM tool-driven triage</span>
        </div>
        <div className="flex items-center gap-2">
          <Database size={14} className="text-emerald-500" />
          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Search auth: {authLabel}</span>
        </div>
        {!auth.apiKey && !auth.token && (
          <div className="flex items-center gap-2 text-amber-500">
            <AlertTriangle size={14} /> Login or set API key for private results.
          </div>
        )}
      </div>

      <main
        ref={chatScrollRef}
        className={`relative min-h-[520px] max-h-[70vh] overflow-y-auto ${isDark ? 'bg-slate-950' : 'bg-white'}`}
      >
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex flex-col items-center">
                  <div className={`h-9 w-9 rounded-2xl flex items-center justify-center text-xs font-semibold ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-600'}`}>
                    C8
                  </div>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl border px-4 py-3 shadow-sm transition-all ${
                  msg.role === 'user'
                    ? isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-900'
                    : isDark
                      ? 'bg-slate-900/60 border-slate-800 text-slate-100'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-slate-400">
                  <span>{msg.role === 'user' ? 'You' : 'Assistant'}</span>
                  {msg.flags?.deepSearch && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                      Deep Search
                    </span>
                  )}
                  {msg.flags?.deepThinking && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                      Deep Thinking
                    </span>
                  )}
                </div>

                {msg.role === 'assistant' && msg.thought && (
                  <div className="mt-3">
                    <GeminiReasoningBlock
                      title="Retrieval steps"
                      detail={msg.thought}
                      duration={msg.thoughtDuration}
                      theme={theme}
                    />
                  </div>
                )}

                <div className={`mt-3 text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  {msg.content || (status === 'loading' && msg.role === 'assistant' ? <span className="animate-pulse">...</span> : msg.content)}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="flex flex-col items-center">
                  <div className={`h-9 w-9 rounded-2xl flex items-center justify-center text-xs font-semibold ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-600'}`}>
                    You
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} className="h-4" />
        </div>
        {showScrollToBottom && (
          <button
            onClick={() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className={`sticky bottom-6 ml-auto mr-6 flex items-center gap-2 rounded-full border px-4 py-2 text-xs shadow-md ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Jump to latest
          </button>
        )}
      </main>

      <div className={isDark ? 'bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-4' : 'bg-gradient-to-t from-white via-white to-transparent pt-4'}>
        <GeminiChatInput
          onSend={handleSend}
          disabled={status === 'loading'}
          theme={theme}
          resetToken={resetToken}
          deepSearchEnabled={deepSearchEnabled}
          deepThinkingEnabled={deepThinkingEnabled}
          onToggleDeepSearch={() => setDeepSearchEnabled((prev) => !prev)}
          onToggleDeepThinking={() => setDeepThinkingEnabled((prev) => !prev)}
        />
      </div>

      <section className={`border-t ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50/40'} px-6 py-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-emerald-500" />
              <h3 className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Context8 Matches</h3>
            </div>
            <span className={isDark ? 'text-xs text-slate-500' : 'text-xs text-slate-500'}>
              {latestHits?.length || 0} results
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestHits && latestHits.length > 0 ? (
              latestHits.slice(0, 4).map((hit) => (
                <div
                  key={hit.id}
                  className={`rounded-lg p-4 transition-colors ${
                    isDark ? 'bg-slate-900 border border-slate-800 hover:border-emerald-500/40' : 'bg-white border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {hit.errorType || 'Unknown'}
                    </span>
                    <span className={isDark ? 'text-[10px] text-slate-500' : 'text-[10px] text-slate-400'}>
                      {hit.createdAt ? new Date(hit.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    {hit.title || 'Untitled'}
                  </p>
                  <p className={`text-xs mt-2 line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {hit.preview || 'No preview available'}
                  </p>
                </div>
              ))
            ) : (
              <div className={`col-span-full py-10 text-center border-2 border-dashed rounded-xl ${isDark ? 'border-slate-800 text-slate-500' : 'border-emerald-100 text-slate-500'}`}>
                Ask a bug question to see matching solutions.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${isDark ? 'bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              Open Dashboard
            </button>
            <button
              onClick={() => onViewChange('home')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${isDark ? 'border border-slate-700 text-slate-300 hover:bg-slate-900' : 'border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
            >
              Back to Home
            </button>
          </div>

          {error && (
            <p className="mt-4 text-xs text-red-500">{error}</p>
          )}
        </div>
      </section>
    </div>
  );
};
