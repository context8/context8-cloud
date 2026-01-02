import React, { useState } from 'react';
import { Plus, Key } from 'lucide-react';
import { ApiKeyCard } from '../../../components/Dashboard/ApiKeyCard';
import { Button } from '../../../components/Common/Button';
import { Modal } from '../../../components/Common/Modal';
import { Toggle } from '../../../components/Common/Toggle';
import { useApiKeys } from '../../../hooks/useApiKeys';
import { useToast } from '../../../hooks/useToast';
import { ToastContainer } from '../../../components/Common/Toast';
import { ThemeMode } from '../../../types';

export interface ApiKeysViewProps {
  token: string | null;
  theme: ThemeMode;
  solutionCounts?: Record<string, number>;
}

export const ApiKeysView: React.FC<ApiKeysViewProps> = ({
  token,
  theme,
  solutionCounts = {},
}) => {
  const { apiKeys, isLoading, createApiKey, deleteApiKey, togglePublic } = useApiKeys(token);
  const { toasts, success, error, dismiss } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [createdKeyValue, setCreatedKeyValue] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyIsPublic, setNewKeyIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleDelete = async (id: string) => {
    try {
      await deleteApiKey(id);
      success('API key deleted successfully');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to delete API key');
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

  const inputClass = `w-full px-3 py-2 rounded-md border ${
    theme === 'dark'
      ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  } focus:outline-none focus:ring-2 focus:ring-emerald-500`;

  return (
    <div className="space-y-6">
      <ToastContainer
        toasts={toasts}
        onClose={dismiss}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>
            API Keys
          </h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Manage your API keys for accessing solutions
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          <span className="ml-2">New API Key</span>
        </Button>
      </div>

      {isLoading && apiKeys.length === 0 ? (
        <div className="text-center py-12">
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
            Loading API keys...
          </p>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-12">
          <Key size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
            No API keys yet
          </h3>
          <p className={`mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Create your first API key to get started
          </p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span className="ml-2">Create API Key</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apiKeys.map((apiKey) => (
            <ApiKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              onDelete={handleDelete}
              onTogglePublic={handleTogglePublic}
              theme={theme}
              solutionCount={solutionCounts[apiKey.id]}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => !isCreating && setShowCreateModal(false)}
        title="Create New API Key"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
            }`}>
              API Key Name
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
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              Public API keys allow anyone to view solutions created with this key
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleCreate}
              isLoading={isCreating}
              disabled={isCreating}
            >
              Create
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        title="API Key Created"
      >
        <div className="space-y-4">
          <p className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>
            This key is shown only once. Copy it now and store it securely.
          </p>
          <div className={`flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-sm ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-600 text-slate-100'
              : 'bg-gray-50 border-gray-200 text-gray-900'
          }`}>
            <span className="truncate">{createdKeyValue}</span>
            <button
              className={`ml-auto text-xs ${
                theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'
              }`}
              onClick={() => {
                if (createdKeyValue) {
                  navigator.clipboard.writeText(createdKeyValue);
                }
              }}
            >
              Copy
            </button>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShowKeyModal(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
