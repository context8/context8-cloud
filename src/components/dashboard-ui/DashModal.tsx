import * as React from 'react';
import { X } from 'lucide-react';

export interface DashModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses: Record<NonNullable<DashModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function DashModal({ isOpen, onClose, title, children, size = 'md' }: DashModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="fixed inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        className={[
          'relative w-full overflow-hidden rounded-xl border border-default bg-surface shadow-xl',
          'max-h-[90vh] overflow-y-auto',
          sizeClasses[size],
        ].join(' ')}
      >
        {title ? (
          <div className="flex items-center justify-between gap-4 border-b border-default px-4 py-3">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground-light hover:bg-[hsl(var(--dash-fg)/0.04)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--dash-ring))]"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

