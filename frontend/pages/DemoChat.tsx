import React, { useEffect, useMemo, useRef, useState } from 'react';
import { runOpenRouterAssistant } from '../services/openrouterAssistant';
import { SearchResult, View } from '../types';
import { AlertTriangle, Database, Loader2, Sparkles, Terminal } from 'lucide-react';

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
  hits?: SearchResult[];
  toolTrace?: string[];
};

const suggestions = [
  'TypeError: cannot read properties of undefined',
  'Build fails with vite: failed to resolve import',
  'Postgres connection timeout on deploy',
  'CORS blocked when calling API',
];

const ChatInput: React.FC<{ onSend: (value: string) => void; disabled?: boolean }> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const submit = (value?: string) => {
    const payload = (value ?? input).trim();
    if (!payload || disabled) return;
    onSend(payload);
    setInput('');
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {suggestions.map((text) => (
          <button
            key={text}
            onClick={() => submit(text)}
            className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs transition-colors whitespace-nowrap bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50"
          >
            <Sparkles size={12} />
            {text}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative border rounded-2xl p-4 shadow-sm bg-white border-emerald-100 focus-within:border-emerald-300"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the bug or paste the error message..."
          rows={3}
          className="w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-slate-800 placeholder-slate-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-100">
          <div className="text-xs text-slate-400">
            Enter to send • Shift+Enter for newline
          </div>
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              input.trim() && !disabled
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-emerald-50 text-emerald-300'
            }`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export const DemoChat: React.FC<Props> = ({ sessionState, onViewChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: 'Describe your bug and I will search Context8 solutions before answering.',
  }]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSend = async (prompt: string) => {
    setError(null);
    setStatus('loading');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await runOpenRouterAssistant({ prompt, auth });
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.reply,
        hits: result.hits,
        toolTrace: result.toolTrace,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStatus('idle');
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || 'Assistant failed');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        <div className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold uppercase tracking-wide">
            <Terminal size={16} /> Context8 Demo
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 mt-4">
            LLM-assisted bug triage with real solution retrieval
          </h1>
          <p className="text-slate-500 mt-3 text-base">
            This demo routes your bug report through an OpenRouter agent, forces a Context8 search tool call, and responds with grounded fixes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-700"
              onClick={() => onViewChange('dashboard')}
            >
              Open Dashboard
            </button>
            <button
              className="border border-emerald-200 text-emerald-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-50"
              onClick={() => onViewChange('home')}
            >
              Back to Home
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold">
            <Database size={16} /> Live Signals
          </div>
          <div className="mt-4 grid gap-4">
            <div className="bg-white rounded-2xl border border-emerald-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Search Auth</p>
              <p className="text-sm text-slate-700 mt-1">{authLabel}</p>
              {!auth.apiKey && !auth.token && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> Login or set API key to fetch private solutions.
                </p>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Assistant Status</p>
              <p className="text-sm text-slate-700 mt-1">
                {status === 'loading' ? 'Thinking...' : status === 'error' ? 'Error' : 'Ready'}
              </p>
              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 min-h-[520px]">
          <div className="flex-1 space-y-6 overflow-y-auto pr-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-slate-800 border border-emerald-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {status === 'loading' && (
              <div className="flex justify-start">
                <div className="bg-emerald-50 border border-emerald-100 text-slate-600 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Thinking with OpenRouter...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <ChatInput onSend={handleSend} disabled={status === 'loading'} />
        </div>

        <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Latest Context Matches</h2>
          {messages
            .slice()
            .reverse()
            .find((msg) => msg.hits && msg.hits.length > 0)?.hits?.slice(0, 5)
            ?.map((hit) => (
              <div key={hit.id} className="border border-emerald-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                <p className="text-sm font-semibold text-slate-900">
                  {hit.title || 'Untitled'}
                </p>
                <p className="text-xs text-slate-500 mt-1">{hit.errorType || 'Unknown type'}</p>
                <p className="text-xs text-slate-600 mt-3 line-clamp-3">
                  {hit.preview || 'No preview available'}
                </p>
                {hit.tags && hit.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {hit.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          {!messages.some((msg) => msg.hits && msg.hits.length > 0) && (
            <div className="text-sm text-slate-400">
              Ask a bug question to see matching solutions.
            </div>
          )}

          <div className="border-t border-emerald-100 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tool Trace</h3>
            <div className="mt-2 space-y-2">
              {messages
                .slice()
                .reverse()
                .find((msg) => msg.toolTrace && msg.toolTrace.length > 0)?.toolTrace?.map((trace) => (
                  <div key={trace} className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
                    {trace}
                  </div>
                ))}
              {!messages.some((msg) => msg.toolTrace && msg.toolTrace.length > 0) && (
                <p className="text-xs text-slate-400">No tool calls yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
