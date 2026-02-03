import React, { useState } from 'react';
import { Eye, Trash2, Lock, Unlock } from 'lucide-react';
import { Solution } from '../../types';
import { Toggle } from '../Common/Toggle';
import { normalizeErrorType } from '../Common/ErrorTypeBadge';
import { SolutionPreview } from './SolutionPreview';
import { SolutionStats } from './SolutionStats';
import { DashButton } from '@/components/dashboard-ui/DashButton';

export interface SolutionCardProps {
  solution: Solution;
  onView: (solution: Solution) => void;
  onDelete: (id: string) => void;
  onTogglePublic?: (id: string, isPublic: boolean) => void;
  showPreview?: boolean;
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

export const SolutionCard: React.FC<SolutionCardProps> = ({
  solution,
  onView,
  onDelete,
  onTogglePublic,
  showPreview = true,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const errorPreview = solution.errorMessage || solution.preview;

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete(solution.id);
    } else {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  const handleTogglePublic = () => {
    if (onTogglePublic && solution.isPublic !== undefined) {
      onTogglePublic(solution.id, !solution.isPublic);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      className={[
        'p-4 rounded-xl border border-default bg-surface transition-colors',
        'hover:bg-[hsl(var(--dash-fg)/0.02)]',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="inline-flex items-center rounded-full border border-default bg-alternative px-2 py-0.5 text-xs text-foreground-light">
          {formatErrorTypeLabel(solution.errorType)}
        </span>
        {solution.isPublic !== undefined ? (
          <span className="inline-flex items-center gap-1 text-foreground-light">
            {solution.isPublic ? <Unlock size={14} /> : <Lock size={14} />}
          </span>
        ) : null}
      </div>

      {/* Title */}
      <button
        type="button"
        className="text-left font-medium text-base text-foreground hover:text-[hsl(var(--dash-brand))] transition-colors"
        onClick={() => onView(solution)}
      >
        {truncateText(solution.title || 'Untitled Solution', 60)}
      </button>

      {/* Error Message Preview */}
      {errorPreview && (
        <p className="text-sm mb-3 line-clamp-2 text-foreground-light">
          {truncateText(errorPreview, 120)}
        </p>
      )}

      {/* Solution Preview */}
      {showPreview && solution.solution && (
        <div className="mb-3">
          <SolutionPreview
            content={solution.solution}
            maxLines={3}
            expandable={false}
          />
        </div>
      )}

      {/* Tags */}
      {solution.tags?.length ? (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {solution.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md border border-default bg-alternative px-2 py-0.5 text-xs text-foreground-light"
            >
              {tag}
            </span>
          ))}
          {solution.tags.length > 3 ? (
            <span className="text-xs text-foreground-light">+{solution.tags.length - 3}</span>
          ) : null}
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <DashButton variant="default" size="sm" onClick={() => onView(solution)}>
          <Eye size={14} />
          <span>View</span>
        </DashButton>
        <DashButton variant={showConfirmDelete ? 'danger' : 'ghost'} size="sm" onClick={handleDelete}>
          <Trash2 size={14} />
          <span>{showConfirmDelete ? 'Confirm?' : 'Delete'}</span>
        </DashButton>
      </div>

      {/* Stats */}
      <SolutionStats
        createdAt={solution.createdAt}
        views={solution.views}
        upvotes={solution.upvotes}
        downvotes={solution.downvotes}
        apiKeyName={solution.apiKeyName}
      />

      {/* Public/Private Toggle */}
      {onTogglePublic && solution.isPublic !== undefined && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-default text-xs text-foreground-light">
          <span className="text-foreground-light">{solution.isPublic ? 'Public' : 'Private'}</span>
          <Toggle
            checked={solution.isPublic}
            onChange={handleTogglePublic}
            size="sm"
          />
        </div>
      )}
    </div>
  );
};
