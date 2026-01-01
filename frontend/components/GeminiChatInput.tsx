import React, { useEffect, useState } from 'react';
import { ThemeMode } from '../types';

interface GeminiChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  theme: ThemeMode;
  resetToken?: number;
}

const suggestions = [
  { icon: '✨', text: 'TypeError: cannot read properties of undefined' },
  { icon: '🔍', text: 'Build fails with vite: failed to resolve import' },
  { icon: '🌲', text: 'Postgres connection timeout on deploy' },
  { icon: '📂', text: 'CORS blocked when calling API' },
];

export const GeminiChatInput: React.FC<GeminiChatInputProps> = ({
  onSend,
  disabled,
  theme,
  resetToken,
}) => {
  const [input, setInput] = useState('');

  useEffect(() => {
    setInput('');
  }, [resetToken]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload = input.trim();
    if (payload && !disabled) {
      onSend(payload);
      setInput('');
    }
  };

  const handleSuggestionClick = (text: string) => {
    if (!disabled) onSend(text);
  };

  const isDark = theme === 'dark';

  return (
    <div className="px-4 pb-8 max-w-4xl mx-auto w-full">
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {suggestions.map((s) => (
          <button
            key={s.text}
            onClick={() => handleSuggestionClick(s.text)}
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs transition-colors whitespace-nowrap ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-emerald-200 hover:bg-slate-800'
                : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span className="text-emerald-400 text-xs">{s.icon}</span>
            {s.text}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className={`relative border rounded-2xl p-4 shadow-sm transition-all duration-300 ${
          isDark
            ? 'bg-slate-950 border-slate-800 focus-within:border-emerald-500'
            : 'bg-white border-emerald-100 focus-within:border-emerald-300'
        }`}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the bug or paste the error message..."
          rows={2}
          name="demoChatMessage"
          id="demo-chat-message"
          className={`w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed transition-colors ${
            isDark ? 'text-slate-100 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <div
          className={`flex items-center justify-between mt-2 pt-2 border-t transition-colors ${
            isDark ? 'border-slate-800/60' : 'border-emerald-100'
          }`}
        >
          <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Enter to send • Shift+Enter for newline
          </div>
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              input.trim() && !disabled
                ? isDark
                  ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                : isDark
                  ? 'bg-slate-800 text-slate-600'
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
