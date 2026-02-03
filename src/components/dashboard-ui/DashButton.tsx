import * as React from 'react';

export type DashButtonVariant = 'default' | 'primary' | 'danger' | 'ghost';
export type DashButtonSize = 'sm' | 'md';

export interface DashButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DashButtonVariant;
  size?: DashButtonSize;
}

const variantClasses: Record<DashButtonVariant, string> = {
  default: 'dash-btn bg-alternative text-foreground border-strong hover:bg-[hsl(var(--dash-fg)/0.04)]',
  primary:
    'dash-btn bg-[hsl(var(--dash-brand-bg))] text-white border-[hsl(var(--dash-brand)/0.35)] hover:bg-[hsl(var(--dash-brand-bg)/0.92)]',
  danger:
    'dash-btn bg-[hsl(0_84%_60%/0.12)] text-[hsl(0_84%_60%)] border-[hsl(0_84%_60%/0.35)] hover:bg-[hsl(0_84%_60%/0.18)]',
  ghost: 'dash-btn bg-transparent text-foreground-light border-transparent hover:bg-[hsl(var(--dash-fg)/0.04)]',
};

const sizeClasses: Record<DashButtonSize, string> = {
  sm: 'h-[26px] px-2.5 text-xs gap-2',
  md: 'h-[30px] px-3 text-sm gap-2',
};

export function DashButton({
  variant = 'default',
  size = 'md',
  className,
  ...props
}: DashButtonProps) {
  return (
    <button
      {...props}
      className={[variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(' ')}
    />
  );
}

