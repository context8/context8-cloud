import React, { useState, useMemo } from 'react';
import { Plus, FileX } from 'lucide-react';
import { SolutionCard } from '../../../components/Dashboard/SolutionCard';
import { SolutionForm, SolutionFormData } from '../../../components/Dashboard/SolutionForm';
import { Button } from '../../../components/Common/Button';
import { Modal } from '../../../components/Common/Modal';
import { useSolutions } from '../../../hooks/useSolutions';
import { useToast } from '../../../hooks/useToast';
import { ToastContainer } from '../../../components/Common/Toast';
import { Solution, ThemeMode } from '../../../types';

export interface SolutionsViewProps {
  token: string | null;
  apiKey: string | null;
  theme: ThemeMode;
}

export const SolutionsView: React.FC<SolutionsViewProps> = ({
  token,
  apiKey,
  theme,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [publicFilter, setPublicFilter] = useState<'all' | 'public' | 'private'>('all');
  const [extraApiKeys, setExtraApiKeys] = useState('');

  const extraKeyList = useMemo(
    () => extraApiKeys.split(',').map((key) => key.trim()).filter(Boolean),
    [extraApiKeys]
  );
  const authOptions = useMemo(() => {
    if (extraKeyList.length > 0) {
      return { apiKeys: apiKey ? [apiKey, ...extraKeyList] : extraKeyList, token: token || undefined };
    }
    return { token, apiKey };
  }, [token, apiKey, extraKeyList]);

  const { solutions, isLoading, createSolution, deleteSolution, togglePublic, getSolution } = useSolutions(authOptions);
  const { toasts, success, error, dismiss } = useToast();
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const filteredSolutions = useMemo(() => {
    let filtered = solutions;

    if (publicFilter === 'public') {
      filtered = filtered.filter(s => s.isPublic);
    } else if (publicFilter === 'private') {
      filtered = filtered.filter(s => !s.isPublic);
    }

    return filtered;
  }, [solutions, publicFilter]);

  const handleCreate = async (data: SolutionFormData) => {
    try {
      await createSolution(data);
      success('Solution created successfully!');
      setShowCreateModal(false);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to create solution');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSolution(id);
      success('Solution deleted successfully');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to delete solution');
    }
  };

  const handleTogglePublic = async (id: string, isPublic: boolean) => {
    try {
      await togglePublic(id, isPublic);
      success(`Solution is now ${isPublic ? 'public' : 'private'}`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to update solution');
    }
  };

  const handleView = async (solution: Solution) => {
    setSelectedSolution(solution);
    setIsDetailLoading(true);
    try {
      const detail = await getSolution(solution.id);
      setSelectedSolution(detail);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to load solution details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer
        toasts={toasts}
        onClose={dismiss}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>
            Solutions
          </h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Manage your error solutions
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          <span className="ml-2">New Solution</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="min-w-[260px]">
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
          }`}>
            Additional API Keys
          </label>
          <input
            value={extraApiKeys}
            onChange={(event) => setExtraApiKeys(event.target.value)}
            placeholder="Comma-separated API keys"
            className={`w-full px-3 py-2 text-sm rounded-md border ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            Use real API keys (not IDs) to broaden search results.
          </p>
        </div>

        {/* Public/Private Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
          }`}>
            Visibility
          </label>
          <div className="flex gap-2">
            {['all', 'public', 'private'].map((filter) => (
              <button
                key={filter}
                onClick={() => setPublicFilter(filter as typeof publicFilter)}
                className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                  publicFilter === filter
                    ? theme === 'dark'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : theme === 'dark'
                      ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      {isLoading && filteredSolutions.length === 0 ? (
        <div className="text-center py-12">
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
            Loading solutions...
          </p>
        </div>
      ) : filteredSolutions.length === 0 ? (
        <div className="text-center py-12">
          <FileX size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
            No solutions found
          </h3>
          <p className={`mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            {extraKeyList.length > 0 || publicFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first solution to get started'}
          </p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span className="ml-2">Create Solution</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSolutions.map((solution) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              onView={handleView}
              onDelete={handleDelete}
              onTogglePublic={handleTogglePublic}
              theme={theme}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Solution"
        size="xl"
      >
        <SolutionForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          theme={theme}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!selectedSolution}
        onClose={() => setSelectedSolution(null)}
        title={selectedSolution?.title || 'Solution Details'}
        size="xl"
      >
        {selectedSolution && (
          <div className="space-y-4">
            {isDetailLoading && (
              <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                Loading solution details...
              </p>
            )}
            <div>
              <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                Error Message
              </h4>
              <p className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>
                {selectedSolution.errorMessage || (isDetailLoading ? 'Loading...' : 'No data')}
              </p>
            </div>
            <div>
              <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                Context
              </h4>
              <p className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>
                {selectedSolution.context || (isDetailLoading ? 'Loading...' : 'No data')}
              </p>
            </div>
            <div>
              <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                Root Cause
              </h4>
              <p className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>
                {selectedSolution.rootCause || (isDetailLoading ? 'Loading...' : 'No data')}
              </p>
            </div>
            <div>
              <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                Solution
              </h4>
              <p className={theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}>
                {selectedSolution.solution || (isDetailLoading ? 'Loading...' : 'No data')}
              </p>
            </div>
            {selectedSolution.tags && selectedSolution.tags.length > 0 && (
              <div>
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSolution.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 text-sm rounded ${
                        theme === 'dark'
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
