import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, FileX, Search, X, LayoutGrid, List, Sparkles, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { SolutionCard } from '@/components/Dashboard/SolutionCard';
import { SolutionListItem } from '@/components/Dashboard/SolutionListItem';
import { SolutionCardSkeleton } from '@/components/Dashboard/SolutionCardSkeleton';
import { SolutionForm, SolutionFormData } from '@/components/Dashboard/SolutionForm';
import { getErrorTypeOptions, normalizeErrorType } from '@/components/Common/ErrorTypeBadge';
import { useSolutions } from '@/hooks/useSolutions';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Common/Toast';
import { DashButton } from '@/components/dashboard-ui/DashButton';
import { DashModal } from '@/components/dashboard-ui/DashModal';
import type { SearchResult, Solution } from '@/types';

export interface SolutionsViewProps {
  token: string | null;
  apiKey: string | null;
  autoOpenCreate?: boolean;
  onAutoOpenCreateHandled?: () => void;
}

export const SolutionsView: React.FC<SolutionsViewProps> = ({
  token,
  apiKey,
  autoOpenCreate,
  onAutoOpenCreateHandled,
}) => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [publicFilter, setPublicFilter] = useState<'all' | 'public' | 'private'>('all');
  const [errorTypeFilter, setErrorTypeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    if (!autoOpenCreate) return;
    setShowCreateModal(true);
    onAutoOpenCreateHandled?.();
  }, [autoOpenCreate, onAutoOpenCreateHandled]);

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
      navigate({ to: '/dashboard/solutions/$solutionId', params: { solutionId: solution.id }, search: {} });
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
  const canUseVisibilityFilter = !(isSearchMode && !searchHasVisibility);
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Solutions</h2>
          <p className="mt-1 text-sm text-foreground-light">Save, search, and manage your fixes.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-foreground-light">
            <span className="rounded-full border border-default bg-surface px-2 py-1">
              {stats.total} total
            </span>
            <span className="rounded-full border border-default bg-surface px-2 py-1">
              {stats.publicCount} public
            </span>
            <span className="rounded-full border border-default bg-surface px-2 py-1">
              {stats.privateCount} private
            </span>
          </div>
        </div>
        <DashButton variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          <span>New solution</span>
        </DashButton>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-light" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search solutions..."
          className="dash-input h-10 w-full pl-10 pr-10 text-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-foreground-light hover:bg-[hsl(var(--dash-fg)/0.04)] hover:text-foreground"
            aria-label="Clear search"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[hsl(var(--dash-brand))]">
            <Sparkles size={16} className="animate-pulse" />
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={[
            'inline-flex items-center rounded-full border border-default bg-surface p-1',
            canUseVisibilityFilter ? '' : 'opacity-60',
          ].join(' ')}
          aria-disabled={!canUseVisibilityFilter}
        >
          {(['all', 'public', 'private'] as const).map((value) => {
            const active = publicFilter === value;
            return (
              <button
                key={value}
                type="button"
                disabled={!canUseVisibilityFilter}
                onClick={() => setPublicFilter(value)}
                className={[
                  'h-8 rounded-full px-3 text-xs transition-colors',
                  active ? 'bg-alternative text-foreground' : 'text-foreground-light hover:text-foreground',
                ].join(' ')}
              >
                {value === 'all' ? 'All' : value === 'public' ? 'Public' : 'Private'}
              </button>
            );
          })}
        </div>

        <select
          value={errorTypeFilter ?? ''}
          onChange={(e) => setErrorTypeFilter(e.target.value || null)}
          className="dash-input h-8 w-auto text-xs"
        >
          <option value="">All error types</option>
          {errorTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="dash-input h-8 w-auto text-xs"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <div className="inline-flex items-center rounded-lg border border-default bg-surface p-1">
          <button
            type="button"
            onClick={() => setLayout('grid')}
            className={[
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              layout === 'grid'
                ? 'bg-alternative text-foreground'
                : 'text-foreground-light hover:bg-[hsl(var(--dash-fg)/0.04)] hover:text-foreground',
            ].join(' ')}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setLayout('list')}
            className={[
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              layout === 'list'
                ? 'bg-alternative text-foreground'
                : 'text-foreground-light hover:bg-[hsl(var(--dash-fg)/0.04)] hover:text-foreground',
            ].join(' ')}
            aria-label="List view"
          >
            <List size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading && displaySolutions.length === 0 ? (
        // Loading skeletons
        <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-0'}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SolutionCardSkeleton key={i} layout={layout} />
          ))}
        </div>
      ) : displaySolutions.length === 0 ? (
        // Empty state
        <div className="text-center py-16 rounded-xl border border-default bg-surface">
          <FileX size={56} className="mx-auto mb-4 text-foreground-light" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {searchQuery ? 'No matching solutions' : 'No solutions found'}
          </h3>
          <p className="mb-6 max-w-md mx-auto text-foreground-light">
            {searchQuery
              ? 'Try adjusting your search query or filters'
              : hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Create your first solution to start building your knowledge base'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <DashButton variant="default" onClick={handleClearFilters}>
                Clear Filters
              </DashButton>
            )}
            <DashButton variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              <span>Create solution</span>
            </DashButton>
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
            />
          ))}
        </div>
      ) : (
        // List view
        <div className="rounded-xl border border-default overflow-hidden bg-surface">
          {displaySolutions.map((solution) => (
            <SolutionListItem
              key={solution.id}
              solution={solution}
              onView={handleView}
              onDelete={handleDelete}
              onTogglePublic={searchResults ? undefined : handleTogglePublic}
            />
          ))}
        </div>
      )}

      {/* Search results indicator */}
      {searchResults && (
        <div className="text-center text-sm text-foreground-light">
          Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{debouncedQuery}"
        </div>
      )}

      {/* Pagination - only show when not in search mode */}
      {!searchResults && pagination.total > 0 && (
        <div className="flex flex-col gap-3 border-t border-default pt-4 sm:flex-row sm:items-center sm:justify-between text-sm text-foreground-light">
          <div>
            Showing <span className="text-foreground">{startItem}</span>–<span className="text-foreground">{endItem}</span> of{' '}
            <span className="text-foreground">{pagination.total.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pagination.pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="dash-input h-8 w-auto text-xs"
            >
              {[25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <DashButton
                size="sm"
                variant="ghost"
                disabled={pagination.page <= 1}
                onClick={() => setPage(1)}
                aria-label="First page"
              >
                <ChevronsLeft size={14} />
              </DashButton>
              <DashButton
                size="sm"
                variant="ghost"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </DashButton>
              <span className="px-2 text-xs">
                {pagination.page} / {totalPages}
              </span>
              <DashButton
                size="sm"
                variant="ghost"
                disabled={pagination.page >= totalPages}
                onClick={() => setPage(pagination.page + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </DashButton>
              <DashButton
                size="sm"
                variant="ghost"
                disabled={pagination.page >= totalPages}
                onClick={() => setPage(totalPages)}
                aria-label="Last page"
              >
                <ChevronsRight size={14} />
              </DashButton>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <DashModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create new solution" size="xl">
        <SolutionForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </DashModal>
    </div>
  );
};
