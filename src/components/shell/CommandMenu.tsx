import * as React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Command, FileText, Key, Search, Home, BookOpen } from 'lucide-react';

type CommandItem = {
  id: string;
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const items: CommandItem[] = [
  { id: 'solutions', label: 'Solutions', to: '/dashboard/solutions', icon: FileText },
  { id: 'search', label: 'Search', to: '/dashboard/search', icon: Search },
  { id: 'apikeys', label: 'API keys', to: '/dashboard/apikeys', icon: Key },
  { id: 'learn', label: 'Learn', to: '/learn', icon: BookOpen },
  { id: 'home', label: 'Home', to: '/', icon: Home },
];

function isMetaOrCtrlK(e: KeyboardEvent) {
  const key = e.key.toLowerCase();
  return key === 'k' && (e.metaKey || e.ctrlKey);
}

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isMetaOrCtrlK(e)) {
        e.preventDefault();
        onOpenChange(true);
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const goSearch = React.useCallback(
    (query?: string) => {
      const q = (query ?? '').trim();
      if (q) {
        navigate({ to: `/dashboard/search?q=${encodeURIComponent(q)}` });
      } else {
        navigate({ to: '/dashboard/search' });
      }
      onOpenChange(false);
      setValue('');
    },
    [navigate, onOpenChange]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close command menu"
        onClick={() => onOpenChange(false)}
      />

      <div className="absolute left-1/2 top-24 w-[640px] max-w-[92vw] -translate-x-1/2 overflow-hidden rounded-xl border border-default bg-surface shadow-xl">
        <div className="flex items-center gap-3 border-b border-default px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-default bg-alternative">
            <Command className="h-4 w-4 text-foreground-light" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search…"
              className="dash-input h-[38px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  goSearch(value);
                }
              }}
            />
          </div>
          <div className="text-xs font-mono uppercase tracking-widest text-foreground-light">Esc</div>
        </div>

        <div className="p-2">
          <div className="mb-2 px-2 text-xs font-mono uppercase tracking-widest text-foreground-light">
            Navigate
          </div>
          <div className="grid gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isSearch = item.id === 'search';
              return isSearch ? (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-sm text-foreground hover:bg-[hsl(var(--dash-fg)/0.04)] hover:border-default"
                  onClick={() => goSearch(value)}
                >
                  <Icon className="h-4 w-4 text-foreground-light" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-xs text-foreground-light">↵</span>
                </button>
              ) : (
                <Link
                  key={item.id}
                  to={item.to}
                  className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-foreground hover:bg-[hsl(var(--dash-fg)/0.04)] hover:border-default"
                  onClick={() => {
                    onOpenChange(false);
                    setValue('');
                  }}
                >
                  <Icon className="h-4 w-4 text-foreground-light" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

