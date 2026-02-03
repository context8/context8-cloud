import React, { useEffect, useState } from 'react';

interface GeminiChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  resetToken?: number;
  deepSearchEnabled?: boolean;
  deepThinkingEnabled?: boolean;
  onToggleDeepSearch?: () => void;
  onToggleDeepThinking?: () => void;
  suggestions?: string[];
  initialValue?: string;
}

const defaultSuggestions = [
  'TypeError undefined',
  'Vite import error',
  'DB timeout',
  'CORS blocked',
];

export const GeminiChatInput: React.FC<GeminiChatInputProps> = ({
  onSend,
  disabled,
  resetToken,
  deepSearchEnabled,
  deepThinkingEnabled,
  onToggleDeepSearch,
  onToggleDeepThinking,
  suggestions,
  initialValue,
}) => {
  const [input, setInput] = useState('');
  const displaySuggestions = suggestions && suggestions.length > 0 ? suggestions : defaultSuggestions;

  useEffect(() => {
    setInput('');
  }, [resetToken]);

  useEffect(() => {
    const next = (initialValue ?? '').trim();
    if (!next) return;
    setInput((prev) => (prev.trim() ? prev : next));
  }, [initialValue]);

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

  return (
    <div className="w-full px-4 pb-6 sm:px-6">
      <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {displaySuggestions.map((text, index) => (
          <button
            key={`${text}-${index}`}
            onClick={() => handleSuggestionClick(text)}
            className="whitespace-nowrap rounded-full border border-default bg-[hsl(var(--sb-bg)/0.55)] px-3 py-1.5 text-xs text-foreground-light transition-colors hover:bg-[hsl(var(--sb-fg)/0.06)] hover:text-foreground"
          >
            {text}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border border-default bg-[hsl(var(--sb-bg)/0.55)] p-4 transition-colors focus-within:border-[hsl(var(--sb-brand))]"
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleDeepSearch}
            className={[
              'rounded-full border px-3 py-1 text-[11px] font-medium transition-colors',
              deepSearchEnabled
                ? 'border-[hsl(var(--sb-brand)/0.35)] bg-[hsl(var(--sb-brand)/0.12)] text-foreground'
                : 'border-default bg-transparent text-foreground-light hover:text-foreground hover:bg-[hsl(var(--sb-fg)/0.06)]',
            ].join(' ')}
          >
            Deep Search
          </button>
          <button
            type="button"
            onClick={onToggleDeepThinking}
            className={[
              'rounded-full border px-3 py-1 text-[11px] font-medium transition-colors',
              deepThinkingEnabled
                ? 'border-[hsl(var(--sb-border-2))] bg-[hsl(var(--sb-fg)/0.06)] text-foreground'
                : 'border-default bg-transparent text-foreground-light hover:text-foreground hover:bg-[hsl(var(--sb-fg)/0.06)]',
            ].join(' ')}
          >
            Deep Thinking
          </button>
          <span className="text-[11px] text-foreground-light">
            Toggle to widen retrieval or add deeper reasoning.
          </span>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the bug or paste the error message..."
          rows={2}
          name="demoChatMessage"
          id="demo-chat-message"
          className="w-full resize-none border-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-foreground-light"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <div
          className="mt-2 flex items-center justify-between border-t border-default pt-2"
        >
          <div className="text-xs text-foreground-light">
            Enter to send • Shift+Enter for newline
          </div>
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="sb-btn-primary h-10 px-4 text-xs disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
