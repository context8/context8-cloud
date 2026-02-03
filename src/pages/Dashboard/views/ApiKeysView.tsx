import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Key } from 'lucide-react';
import { ApiKeyCard, ApiKeyStats } from '../../../components/Dashboard/ApiKeyCard';
import { Toggle } from '../../../components/Common/Toggle';
import { useApiKeys } from '../../../hooks/useApiKeys';
import { useToast } from '../../../hooks/useToast';
import { ToastContainer } from '../../../components/Common/Toast';
import { apiKeysService } from '../../../services/api/apiKeys';
import { DashButton } from '@/components/dashboard-ui/DashButton';
import { DashModal } from '@/components/dashboard-ui/DashModal';

export interface ApiKeysViewProps {
  token: string | null;
}

export const ApiKeysView: React.FC<ApiKeysViewProps> = ({
  token,
}) => {
  const { apiKeys, isLoading, createApiKey, deleteApiKey, togglePublic } = useApiKeys(token);
  const [keyStats, setKeyStats] = useState<Record<string, ApiKeyStats>>({});

  // Fetch stats for all API keys
  useEffect(() => {
    if (!token || apiKeys.length === 0) return;

    const fetchStats = async () => {
      try {
        const stats = await apiKeysService.getStats(token);
        setKeyStats(stats);
      } catch (err) {
        console.error('Failed to fetch API key stats:', err);
      }
    };

    fetchStats();
  }, [token, apiKeys]);
  const { toasts, success, error, dismiss } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [createdKeyValue, setCreatedKeyValue] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyIsPublic, setNewKeyIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteTarget = useMemo(
    () => apiKeys.find((key) => key.id === deleteKeyId) || null,
    [apiKeys, deleteKeyId],
  );
  const deletePrompt = deleteTarget ? `I CONFIRM DELETE ${deleteTarget.name}` : '';
  const isDeleteConfirmValid = deleteConfirmText.trim() === deletePrompt;

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      error('Please enter a name for the API key');
      return;
    }

    setIsCreating(true);
    try {
      const created = await createApiKey(newKeyName.trim(), newKeyIsPublic);
      success('API key created successfully!');
      setShowCreateModal(false);
      setNewKeyName('');
      setNewKeyIsPublic(false);
      setCreatedKeyValue(created.apiKey);
      setShowKeyModal(true);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteKeyId(id);
    setDeleteConfirmText('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (!isDeleteConfirmValid) {
      error('Please type the confirmation phrase exactly to continue');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteApiKey(deleteTarget.id);
      success('API key deleted successfully');
      setDeleteKeyId(null);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to delete API key');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublic = async (id: string, isPublic: boolean) => {
    try {
      await togglePublic(id, isPublic);
      success(`API key is now ${isPublic ? 'public' : 'private'}`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to update API key');
    }
  };

  const inputClass = 'dash-input h-10';

  return (
    <div className="space-y-6">
      <ToastContainer
        toasts={toasts}
        onClose={dismiss}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">API keys</h2>
          <p className="text-sm mt-1 text-foreground-light">Manage keys for accessing solutions.</p>
        </div>
        <DashButton
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          <span>New API key</span>
        </DashButton>
      </div>

      {isLoading && apiKeys.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-foreground-light">Loading API keys...</p>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="rounded-xl border border-default bg-surface py-12 text-center">
          <Key size={48} className="mx-auto mb-4 text-foreground-light" />
          <h3 className="text-lg font-medium mb-2 text-foreground">No API keys yet</h3>
          <p className="mb-4 text-foreground-light">Create your first API key to get started.</p>
          <DashButton variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>Create API key</span>
          </DashButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apiKeys.map((apiKey) => (
            <ApiKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              onRequestDelete={handleDeleteRequest}
              onTogglePublic={handleTogglePublic}
              onCopy={() => success('API Key ID copied to clipboard')}
              stats={keyStats[apiKey.id]}
            />
          ))}
        </div>
      )}

      <DashModal
        isOpen={showCreateModal}
        onClose={() => !isCreating && setShowCreateModal(false)}
        title="Create new API key"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-foreground-light">
              API key name
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Production, Development"
              className={inputClass}
              disabled={isCreating}
            />
          </div>
          <div>
            <Toggle
              checked={newKeyIsPublic}
              onChange={setNewKeyIsPublic}
              label="Make this API key public"
              disabled={isCreating}
            />
            <p className="text-xs mt-1 text-foreground-light">
              Public API keys allow anyone to view solutions created with this key
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <DashButton
              variant="primary"
              onClick={handleCreate}
              disabled={isCreating}
            >
              Create
            </DashButton>
            <DashButton
              variant="default"
              onClick={() => setShowCreateModal(false)}
              disabled={isCreating}
            >
              Cancel
            </DashButton>
          </div>
        </div>
      </DashModal>

      <DashModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        title="API key created"
      >
        <div className="space-y-4">
          <p className="text-foreground-light">
            This key is shown only once. Copy it now and store it securely.
          </p>
          <div className="flex items-center gap-2 rounded-md border border-default bg-alternative px-3 py-2 font-mono text-sm text-foreground">
            <span className="truncate">{createdKeyValue}</span>
            <button
              className="ml-auto text-xs text-[hsl(var(--dash-brand))] hover:underline underline-offset-4"
              onClick={() => {
                if (createdKeyValue) {
                  navigator.clipboard.writeText(createdKeyValue);
                  success('API Key copied to clipboard');
                }
              }}
            >
              Copy
            </button>
          </div>
          <div className="flex justify-end">
            <DashButton variant="primary" onClick={() => setShowKeyModal(false)}>
              Done
            </DashButton>
          </div>
        </div>
      </DashModal>

      <DashModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteKeyId(null)}
        title="Delete API key"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-foreground-light">
              Deleting an API key is irreversible.
            </p>
            <div className="rounded-md border border-default bg-alternative px-3 py-2 text-sm text-foreground-light">
              <p className="font-medium text-foreground">Public solutions are not deleted.</p>
              <p className="mt-1">
                If you want public solutions removed, first switch the key to private, then delete it.
              </p>
            </div>
            <div>
              <p className="text-xs mb-2 text-foreground-light">
                API key name to confirm: <span className="font-mono select-all">{deleteTarget.name}</span>
              </p>
              <label className="block text-xs font-mono uppercase tracking-widest text-foreground-light">
                Type the phrase below
              </label>
              <div className="mb-2 mt-2 rounded-md border border-default bg-alternative px-3 py-2 font-mono text-xs text-foreground">
                {deletePrompt}
              </div>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type the confirmation phrase"
                className={inputClass}
                disabled={isDeleting}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <DashButton
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={!isDeleteConfirmValid || isDeleting}
              >
                Confirm Delete
              </DashButton>
              <DashButton
                variant="default"
                onClick={() => setDeleteKeyId(null)}
                disabled={isDeleting}
              >
                Cancel
              </DashButton>
            </div>
          </div>
        )}
      </DashModal>
    </div>
  );
};
