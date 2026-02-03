import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SolutionPreviewProps {
  content?: string;
  maxLines?: number;
  expandable?: boolean;
}

export const SolutionPreview: React.FC<SolutionPreviewProps> = ({
  content,
  maxLines = 3,
  expandable = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) {
    return null;
  }

  const lines = content.split('\n');
  const needsExpansion = lines.length > maxLines || content.length > 200;
  const displayContent = isExpanded ? content : content.slice(0, 200);

  return (
    <div className="relative">
      <div
        className="relative rounded-lg border border-default bg-alternative p-3 text-sm font-mono text-foreground-light"
      >
        <pre
          className={[
            'whitespace-pre-wrap break-words overflow-hidden',
            !isExpanded && needsExpansion ? 'line-clamp-3' : '',
          ].join(' ')}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'unset' : maxLines,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {displayContent}
        </pre>

        {!isExpanded && needsExpansion && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[hsl(var(--dash-surface-2))] to-transparent"
          />
        )}
      </div>

      {expandable && needsExpansion && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--dash-brand))] hover:underline underline-offset-4"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} />
              Show less
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Show more
            </>
          )}
        </button>
      )}
    </div>
  );
};
