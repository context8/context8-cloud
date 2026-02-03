import React from 'react';
import { Calendar, Eye, ThumbsUp, ThumbsDown, Key } from 'lucide-react';

interface SolutionStatsProps {
  createdAt?: string;
  views?: number;
  upvotes?: number;
  downvotes?: number;
  apiKeyName?: string;
  compact?: boolean;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const SolutionStats: React.FC<SolutionStatsProps> = ({
  createdAt,
  views,
  upvotes,
  downvotes,
  apiKeyName,
  compact = false,
}) => {
  const statItems = [
    { icon: Calendar, value: formatDate(createdAt), show: true },
    { icon: Eye, value: views?.toString(), show: views !== undefined },
    { icon: ThumbsUp, value: upvotes?.toString(), show: upvotes !== undefined },
    { icon: ThumbsDown, value: downvotes?.toString(), show: downvotes !== undefined },
    { icon: Key, value: apiKeyName, show: !!apiKeyName },
  ].filter(item => item.show);

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs text-foreground-light">
        {statItems.map((item, index) => (
          <span key={index} className="flex items-center gap-1">
            <item.icon size={12} />
            <span className="truncate max-w-[80px]">{item.value}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 border-t border-default pt-3 mt-3 text-xs text-foreground-light">
      {statItems.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <item.icon size={12} />
          <span className="truncate max-w-[100px]">{item.value}</span>
        </div>
      ))}
    </div>
  );
};
