import React, { useState } from 'react';
import { Eye, Trash2, Calendar, Key, Lock, Unlock } from 'lucide-react';
import { Solution } from '../../types';
import { Button } from '../Common/Button';
import { Toggle } from '../Common/Toggle';

export interface SolutionCardProps {
  solution: Solution;
  onView: (solution: Solution) => void;
  onDelete: (id: string) => void;
  onTogglePublic?: (id: string, isPublic: boolean) => void;
  theme: 'light' | 'dark';
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  solution,
  onView,
  onDelete,
  onTogglePublic,
  theme,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
      className={`
        p-4 rounded-lg border transition-shadow duration-300
        ${theme === 'dark'
          ? 'bg-slate-900 border-slate-700 hover:shadow-xl'
          : 'bg-white border-gray-200 hover:shadow-xl'
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>
          {truncateText(solution.title || 'Untitled', 60)}
        </h3>
        {solution.isPublic !== undefined && (
          <div className="flex-shrink-0 ml-2">
            {solution.isPublic ? (
              <Unlock size={14} className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} />
            ) : (
              <Lock size={14} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} />
            )}
          </div>
        )}
      </div>

      <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
        {truncateText(solution.errorMessage || 'No description', 100)}
      </p>

      {solution.tags && solution.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {solution.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 text-xs rounded ${
                theme === 'dark'
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tag}
            </span>
          ))}
          {solution.tags.length > 3 && (
            <span className={`px-2 py-1 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              +{solution.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView(solution)}
        >
          <Eye size={14} />
          <span className="ml-1">View</span>
        </Button>
        <Button
          variant={showConfirmDelete ? 'danger' : 'ghost'}
          size="sm"
          onClick={handleDelete}
        >
          <Trash2 size={14} />
          <span className="ml-1">{showConfirmDelete ? 'Confirm?' : 'Delete'}</span>
        </Button>
      </div>

      <div className={`text-xs pt-3 border-t ${
        theme === 'dark' ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-gray-500'
      }`}>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{solution.createdAt ? new Date(solution.createdAt).toLocaleDateString() : 'Unknown'}</span>
          </div>
          {solution.apiKeyName && (
            <div className="flex items-center gap-1">
              <Key size={12} />
              <span className="truncate">{solution.apiKeyName}</span>
            </div>
          )}
        </div>
        {onTogglePublic && solution.isPublic !== undefined && (
          <div className="flex items-center justify-between">
            <span>{solution.isPublic ? 'Public' : 'Private'}</span>
            <Toggle
              checked={solution.isPublic}
              onChange={handleTogglePublic}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};
