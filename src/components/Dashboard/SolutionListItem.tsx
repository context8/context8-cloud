import React, { useState } from 'react';
import { Eye, Trash2, Lock, Unlock, MoreVertical } from 'lucide-react';
import { Solution } from '../../types';
import { normalizeErrorType } from '../Common/ErrorTypeBadge';

interface SolutionListItemProps {
  solution: Solution;
  onView: (solution: Solution) => void;
  onDelete: (id: string) => void;
  onTogglePublic?: (id: string, isPublic: boolean) => void;
}

function formatErrorTypeLabel(type?: string) {
  const normalized = normalizeErrorType(type);
  if (normalized === 'ui_ux') return 'UI/UX';
  if (normalized === 'ops_infra') return 'Ops/Infra';
  if (normalized === 'build_ci') return 'Build/CI';
  if (normalized === 'install_setup') return 'Install/Setup';
  if (normalized === 'question_support') return 'Support';
  if (normalized === 'api_integration') return 'API';
  if (normalized === 'docs_request') return 'Docs';
  return normalized
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const SolutionListItem: React.FC<SolutionListItemProps> = ({
  solution,
  onView,
  onDelete,
  onTogglePublic,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const errorPreview = solution.errorMessage || solution.preview;

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(solution.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className="group flex items-center gap-4 border-b border-default px-4 py-3 transition-colors hover:bg-[hsl(var(--dash-fg)/0.02)]"
    >
      {/* Error Type */}
        <div className="flex-shrink-0 w-24">
        <span className="inline-flex items-center rounded-full border border-default bg-alternative px-2 py-0.5 text-xs text-foreground-light">
          {formatErrorTypeLabel(solution.errorType)}
        </span>
      </div>

      {/* Title & Description */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-medium truncate cursor-pointer text-foreground hover:text-[hsl(var(--dash-brand))] transition-colors"
          onClick={() => onView(solution)}
        >
          {solution.title || 'Untitled Solution'}
        </h3>
        {errorPreview && (
          <p className="text-xs truncate text-foreground-light">
            {errorPreview}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="hidden lg:flex flex-shrink-0 w-48 flex-wrap justify-end gap-1.5">
        {(solution.tags ?? []).slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-md border border-default bg-alternative px-2 py-0.5 text-xs text-foreground-light"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Date */}
      <div className="flex-shrink-0 w-20 text-xs text-foreground-light">
        {formatDate(solution.createdAt)}
      </div>

      {/* Public/Private */}
      <div className="flex-shrink-0 w-6">
        {solution.isPublic ? <Unlock size={14} className="text-foreground-light" /> : <Lock size={14} className="text-foreground-light" />}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onView(solution)}
          className="p-1.5 rounded-md transition-colors text-foreground-light hover:text-foreground hover:bg-[hsl(var(--dash-fg)/0.04)]"
          title="View details"
        >
          <Eye size={16} />
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className={[
            'p-1.5 rounded-md transition-colors',
            confirmDelete
              ? 'text-[hsl(0_84%_60%)] bg-[hsl(0_84%_60%/0.12)]'
              : 'text-foreground-light hover:text-[hsl(0_84%_60%)] hover:bg-[hsl(var(--dash-fg)/0.04)]',
          ].join(' ')}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
