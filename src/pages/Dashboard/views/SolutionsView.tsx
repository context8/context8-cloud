import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, FileX, Search, X, LayoutGrid, List, Sparkles } from 'lucide-react';
import { SolutionCard } from '@/components/Dashboard/SolutionCard';
import { SolutionListItem } from '@/components/Dashboard/SolutionListItem';
import { SolutionCardSkeleton } from '@/components/Dashboard/SolutionCardSkeleton';
import { SolutionForm, SolutionFormData } from '@/components/Dashboard/SolutionForm';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import { SegmentedControl } from '@/components/Common/SegmentedControl';
import { Dropdown } from '@/components/Common/Dropdown';
import { getErrorTypeOptions, normalizeErrorType } from '@/components/Common/ErrorTypeBadge';
import { Pagination } from '@/components/Common/Pagination';
import { useSolutions } from '@/hooks/useSolutions';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Common/Toast';
import type { SearchResult, Solution, ThemeMode } from '@/types';

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
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [publicFilter, setPublicFilter] = useState<'all' | 'public' | 'private'>('all');
  const [errorTypeFilter, setErrorTypeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const isDark = theme === 'dark';

  const authOptions = useMemo(() => {
    return { token: token ?? undefined, apiKey: apiKey ?? undefined };
  }, [token, apiKey]);

  const {
    solutions,
    searchResults,
    isLoading,
    isSearching,
    pagination,
    setPage,
    setPageSize,
    createSolution,
    deleteSolution,
    togglePublic,
    searchSolutions,
    clearSearch,
  } = useSolutions(authOptions);
  const { toasts, success, error, dismiss } = useToast();
  const isSearchMode = debouncedQuery.length > 0;
  const searchHasVisibility = searchResults
    ? searchResults.every((item) => typeof item.isPublic === 'boolean')
    : false;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      searchSolutions(debouncedQuery);
    } else {
      clearSearch();
    }
  }, [debouncedQuery, searchSolutions, clearSearch]);

  // Count stats - use pagination.total for accurate count
  const stats = useMemo(() => {
    const total = pagination.total;
    // Note: publicCount/privateCount are only for current page since we don't have totals from API
    const publicCount = solutions.filter(s => s.isPublic).length;
    const privateCount = solutions.filter(s => !s.isPublic).length;
    return { total, publicCount, privateCount };
  }, [solutions, pagination.total]);

  // Filter and sort solutions
  const displaySolutions = useMemo(() => {
    const mapSearchResultToSolution = (item: SearchResult): Solution => ({
      id: item.id,
      title: item.title || 'Untitled Solution',
      errorType: item.errorType,
      tags: item.tags || [],
      createdAt: item.createdAt,
      preview: item.preview,
      errorMessage: item.errorMessage,
      solution: item.solution,
      isPublic: item.isPublic,
      upvotes: item.upvotes,
      downvotes: item.downvotes,
      voteScore: item.voteScore,
    });

    let filtered = searchResults
      ? searchResults.map(mapSearchResultToSolution)
      : [...solutions];

    // Visibility filter
    if (!searchResults || searchHasVisibility) {
      if (publicFilter === 'public') {
        filtered = filtered.filter(s => s.isPublic === true);
      } else if (publicFilter === 'private') {
        filtered = filtered.filter(s => s.isPublic === false);
      }
    }

    // Error type filter
    if (errorTypeFilter) {
      filtered = filtered.filter(s =>
        normalizeErrorType(s.errorType) === normalizeErrorType(errorTypeFilter)
      );
    }

    // Sort (avoid reordering search relevance)
    if (!searchResults) {
      if (sortBy === 'recent') {
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      } else if (sortBy === 'title') {
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      } else if (sortBy === 'views') {
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      }
    }

    return filtered;
  }, [solutions, searchResults, publicFilter, errorTypeFilter, sortBy, searchHasVisibility]);

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

  const handleView = useCallback(
    (solution: Solution) => {
      navigate({ to: '/dashboard/solutions/$solutionId', params: { solutionId: solution.id } });
    },
    [navigate]
  );

  const handleClearFilters = useCallback(() => {
    setPublicFilter('all');
    setErrorTypeFilter(null);
    setSearchQuery('');
  }, []);

  const errorTypeOptions = getErrorTypeOptions();
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'views', label: 'Most Views' },
  ];

  const hasActiveFilters = publicFilter !== 'all' || errorTypeFilter || searchQuery;

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
            Solutions
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Manage your error solutions
          </p>
          {/* Stats */}
          <div className={`flex items-center gap-3 mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              {stats.total} Total
            </span>
            <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              {stats.publicCount} Public
            </span>
            <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              {stats.privateCount} Private
            </span>
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          <span className="ml-2">New Solution</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={18}
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search solutions..."
          className={`
            w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-colors
            ${isDark
              ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-400'
            }
            focus:outline-none focus:ring-2 focus:ring-emerald-500/20
          `}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <X size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
          </button>
        )}
        {isSearching && (
          <div className={`absolute right-10 top-1/2 -translate-y-1/2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            <Sparkles size={16} className="animate-pulse" />
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          options={[
            { value: 'all', label: 'All', count: stats.total },
            { value: 'public', label: 'Public', count: stats.publicCount },
            { value: 'private', label: 'Private', count: stats.privateCount },
          ]}
          value={publicFilter}
          onChange={(v) => setPublicFilter(v as typeof publicFilter)}
          disabled={isSearchMode && !searchHasVisibility}
          theme={theme}
        />

        <Dropdown
          value={errorTypeFilter}
          options={errorTypeOptions}
          onChange={setErrorTypeFilter}
          placeholder="Error Type"
          disabled={false}
          theme={theme}
        />

        <Dropdown
          value={sortBy}
          options={sortOptions}
          onChange={(v) => setSortBy(v || 'recent')}
          placeholder="Sort by"
          allowClear={false}
          disabled={false}
          theme={theme}
        />

        <div className="flex-1" />

        {/* Layout Toggle */}
        <div className={`flex rounded-lg p-1 ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
          <button
            type="button"
            onClick={() => setLayout('grid')}
            className={`
              p-2 rounded-md transition-colors
              ${layout === 'grid'
                ? isDark ? 'bg-slate-800 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm'
                : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }
            `}
            title="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setLayout('list')}
            className={`
              p-2 rounded-md transition-colors
              ${layout === 'list'
                ? isDark ? 'bg-slate-800 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm'
                : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }
            `}
            title="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading && displaySolutions.length === 0 ? (
        // Loading skeletons
        <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-0'}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SolutionCardSkeleton key={i} theme={theme} layout={layout} />
          ))}
        </div>
      ) : displaySolutions.length === 0 ? (
        // Empty state
        <div className={`text-center py-16 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
          <FileX size={56} className={`mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {searchQuery ? 'No matching solutions' : 'No solutions found'}
          </h3>
          <p className={`mb-6 max-w-md mx-auto ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {searchQuery
              ? 'Try adjusting your search query or filters'
              : hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Create your first solution to start building your knowledge base'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              <span className="ml-2">Create Solution</span>
            </Button>
          </div>
        </div>
      ) : layout === 'grid' ? (
        // Grid view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displaySolutions.map((solution) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              onView={handleView}
              onDelete={handleDelete}
              onTogglePublic={searchResults ? undefined : handleTogglePublic}
              showPreview
              theme={theme}
            />
          ))}
        </div>
      ) : (
        // List view
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          {displaySolutions.map((solution) => (
            <SolutionListItem
              key={solution.id}
              solution={solution}
              onView={handleView}
              onDelete={handleDelete}
              onTogglePublic={searchResults ? undefined : handleTogglePublic}
              theme={theme}
            />
          ))}
        </div>
      )}

      {/* Search results indicator */}
      {searchResults && (
        <div className={`text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{debouncedQuery}"
        </div>
      )}

      {/* Pagination - only show when not in search mode */}
      {!searchResults && pagination.total > 0 && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          theme={theme}
        />
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
    </div>
  );
};
