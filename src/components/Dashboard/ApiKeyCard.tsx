import React, { useState } from 'react';
import { Copy, Trash2, Key, Check, Lock, Unlock, Globe, EyeOff } from 'lucide-react';
import { ApiKey } from '../../types';
import { Toggle } from '../Common/Toggle';
import { DashButton } from '@/components/dashboard-ui/DashButton';

export interface ApiKeyStats {
  publicCount: number;
  privateCount: number;
}

export interface ApiKeyCardProps {
  apiKey: ApiKey;
  onRequestDelete: (id: string) => void;
  onTogglePublic?: (id: string, isPublic: boolean) => void;
  onCopy?: () => void;
  stats?: ApiKeyStats;
}

export const ApiKeyCard: React.FC<ApiKeyCardProps> = ({
  apiKey,
  onRequestDelete,
  onTogglePublic,
  onCopy,
  stats,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const handleDelete = () => {
    onRequestDelete(apiKey.id);
  };

  const handleTogglePublic = () => {
    if (onTogglePublic) {
      onTogglePublic(apiKey.id, !apiKey.isPublic);
    }
  };

  return (
    <div
      className="p-4 rounded-xl border border-default bg-surface transition-colors hover:bg-[hsl(var(--dash-fg)/0.02)]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Key size={18} className="text-[hsl(var(--dash-brand))]" />
          <h3 className="font-semibold text-foreground">{apiKey.name}</h3>
        </div>
        {apiKey.isPublic !== undefined && (
          <div className="flex items-center gap-1">
            {apiKey.isPublic ? <Unlock size={14} className="text-foreground-light" /> : <Lock size={14} className="text-foreground-light" />}
          </div>
        )}
      </div>

      <div className="mb-1 rounded-lg border border-default bg-alternative p-2 font-mono text-sm break-all text-foreground-light">
        Key ID: {apiKey.id}
      </div>
      <p className="mb-3 text-xs text-foreground-light">
        API key values are shown only once at creation.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <DashButton variant="default" size="sm" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied ID!' : 'Copy ID'}</span>
        </DashButton>
        <DashButton variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 size={14} />
          <span>Delete</span>
        </DashButton>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex items-center gap-3 mb-3 rounded-lg border border-default bg-alternative py-2 px-3">
          <div className="flex items-center gap-1.5">
            <Globe size={14} className="text-[hsl(var(--dash-brand))]" />
            <span className="text-sm font-medium text-foreground">{stats.publicCount}</span>
            <span className="text-xs text-foreground-light">public</span>
          </div>
          <div className="w-px h-4 bg-[hsl(var(--dash-border))]" />
          <div className="flex items-center gap-1.5">
            <EyeOff size={14} className="text-foreground-light" />
            <span className="text-sm font-medium text-foreground">{stats.privateCount}</span>
            <span className="text-xs text-foreground-light">private</span>
          </div>
        </div>
      )}

      <div className="text-xs pt-3 border-t border-default text-foreground-light">
        <div className="flex justify-between items-center mb-2">
          <span>Created: {apiKey.createdAt ? new Date(apiKey.createdAt).toLocaleDateString() : 'Unknown'}</span>
        </div>
        {onTogglePublic && apiKey.isPublic !== undefined && (
          <div className="flex items-center justify-between">
            <span>{apiKey.isPublic ? 'Public' : 'Private'}</span>
            <Toggle
              checked={apiKey.isPublic}
              onChange={handleTogglePublic}
              size="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};
