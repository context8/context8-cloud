import React, { useEffect, useMemo, useRef, useState } from 'react';
import { runOpenRouterAssistant } from '../services/openrouterAssistant';
import { GeminiChatInput } from '../components/GeminiChatInput';
import { GeminiReasoningBlock } from '../components/GeminiReasoningBlock';
import { SearchResult, View } from '../types';
import { AlertTriangle, Database, Terminal } from 'lucide-react';

type ThemeMode = 'light' | 'dark';

type SessionState = {
  session: { token: string; email: string } | null;
  apiKey: string | null;
};

type Props = {
  sessionState: SessionState;
  onViewChange: (view: View) => void;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  thoughtDuration?: number;
  hits?: SearchResult[];
};

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Describe your bug and I will search Context8 solutions before answering.',
  },
];

export const DemoChat: React.FC<Props> = ({ sessionState, onViewChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

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
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    const startTime = Date.now();

    try {
      const result = await runOpenRouterAssistant({ prompt, auth });
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
  };

  const isDark = theme === 'dark';
  const latestHits = messages
    .slice()
    .reverse()
    .find((msg) => msg.hits && msg.hits.length > 0)?.hits;

  return (
    <div className={`rounded-3xl border ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-emerald-100 bg-white text-slate-900'} shadow-sm overflow-hidden`}>
      <header className={`flex items-center justify-between px-6 py-4 border-b backdrop-blur-md ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white/80 border-emerald-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg ${isDark ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/30' : 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-200'}`}>
            C
          </div>
          <div>
            <h1 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Context8 Demo Assistant</h1>
            <p className={`text-[10px] font-mono tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>OPENROUTER • FUNCTION CALL • SEARCH</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-full transition-colors border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'}`}
            title="Toggle Theme"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9l-.707.707M12 21v-1m0-5a3 3 0 110-6 3 3 0 010 6z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={resetChat}
            className={`px-3 py-1 text-xs rounded-full transition-colors border ${isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100'}`}
          >
            New Chat
          </button>
        </div>
      </header>

      <div className={`border-b ${isDark ? 'border-slate-800 bg-slate-950' : 'border-emerald-100 bg-emerald-50/50'} px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs`}>
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

      <main className={`min-h-[520px] max-h-[70vh] overflow-y-auto ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[90%] transition-all duration-300 ${
                  msg.role === 'user'
                    ? `${isDark ? 'bg-slate-900 shadow-sm' : 'bg-emerald-50 shadow-sm'} p-4 rounded-2xl rounded-tr-none ${isDark ? 'text-slate-100' : 'text-emerald-900'}`
                    : 'w-full'
                }`}
              >
                {msg.role === 'assistant' && msg.thought && (
                  <GeminiReasoningBlock
                    title="Retrieval steps"
                    detail={msg.thought}
                    duration={msg.thoughtDuration}
                    theme={theme}
                  />
                )}
                <div className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'assistant' ? (isDark ? 'text-slate-200' : 'text-slate-800') : ''
                }`}>
                  {msg.content || (status === 'loading' && msg.role === 'assistant' ? <span className="animate-pulse">...</span> : msg.content)}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} className="h-4" />
        </div>
      </main>

      <div className={isDark ? 'bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-4' : 'bg-gradient-to-t from-white via-white to-transparent pt-4'}>
        <GeminiChatInput onSend={handleSend} disabled={status === 'loading'} theme={theme} />
      </div>

      <section className={`border-t ${isDark ? 'border-slate-800 bg-slate-950' : 'border-emerald-100 bg-emerald-50/40'} px-6 py-6`}>
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
                    isDark ? 'bg-slate-900 border border-slate-800 hover:border-emerald-500/40' : 'bg-white border border-emerald-100 hover:border-emerald-200'
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
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${isDark ? 'bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
            >
              Open Dashboard
            </button>
            <button
              onClick={() => onViewChange('home')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${isDark ? 'border border-slate-700 text-slate-300 hover:bg-slate-900' : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
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
