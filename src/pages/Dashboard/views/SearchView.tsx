import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, FileX } from 'lucide-react';
import { useSearch } from '../../../hooks/useSearch';
import { DashButton } from '@/components/dashboard-ui/DashButton';
import type { SearchResult } from '../../../types';

export interface SearchViewProps {
  token?: string | null;
  apiKey?: string | null;
  initialQuery?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({
  token,
  apiKey,
  initialQuery,
}) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const authOptions = token || apiKey ? { token: token || undefined, apiKey: apiKey || undefined } : undefined;
  const { results, total, isLoading, query, search, clearSearch } = useSearch(authOptions);

  useEffect(() => {
    const next = (initialQuery ?? '').trim();
    if (!next) return;
    setSearchInput(next);
    if (query !== next) search(next);
  }, [initialQuery, query, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    search(q);
    navigate({ to: '/dashboard/search', search: { q }, replace: true });
  };

  const handleClear = () => {
    setSearchInput('');
    clearSearch();
    navigate({ to: '/dashboard/search', search: {}, replace: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Search</h2>
        <p className="mt-1 text-sm text-foreground-light">Find solutions by message, tags, or fix notes.</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-0">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by error message, tags, or solution..."
          className="dash-input h-10 flex-1 rounded-r-none px-4"
        />
        <DashButton
          type="submit"
          variant="primary"
          disabled={isLoading || !searchInput.trim()}
          className="rounded-l-none rounded-r-full h-10 px-4"
        >
          <Search size={18} />
          <span>Search</span>
        </DashButton>
        {query && (
          <DashButton
            type="button"
            variant="default"
            onClick={handleClear}
            className="ml-2 h-10 px-4"
          >
            Clear
          </DashButton>
        )}
      </form>

      {/* Search Results */}
      {query && (
        <div>
          <p className="text-sm mb-4 text-foreground-light">
            {isLoading ? (
              'Searching...'
            ) : (
              <>Found {total} result{total !== 1 ? 's' : ''} for "{query}"</>
            )}
          </p>

          {results.length === 0 && !isLoading ? (
            <div className="rounded-xl border border-default bg-surface py-12 text-center">
              <FileX size={48} className="mx-auto mb-4 text-foreground-light" />
              <h3 className="text-lg font-medium mb-2 text-foreground">No results found</h3>
              <p className="text-foreground-light">Try a different search query.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!query && (
        <div className="rounded-xl border border-default bg-surface py-12 text-center">
          <Search size={48} className="mx-auto mb-4 text-foreground-light" />
          <h3 className="text-lg font-medium mb-2 text-foreground">Start searching</h3>
          <p className="text-foreground-light">Enter a query to find solutions.</p>
        </div>
      )}
    </div>
  );
};

interface SearchResultCardProps {
  result: SearchResult;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
  return (
    <div
      className="p-4 rounded-lg border border-default bg-surface transition-colors hover:bg-[hsl(var(--dash-fg)/0.02)]"
    >
      <h3 className="font-semibold mb-2 text-foreground">
        {result.title || 'Untitled'}
      </h3>
      {result.preview && (
        <p className="text-sm mb-3 text-foreground-light">
          {result.preview}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {result.errorType && (
          <span className="px-2 py-1 rounded border border-default bg-alternative text-foreground-light">
            {result.errorType}
          </span>
        )}
        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded border border-default bg-alternative text-foreground-light"
              >
                {tag}
              </span>
            ))}
            {result.tags.length > 3 && (
              <span className="text-foreground-light">
                +{result.tags.length - 3}
              </span>
            )}
          </div>
        )}
        {result.createdAt && (
          <span className="text-foreground-light">
            {new Date(result.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};
