import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../constants';
import { Solution, ThemeMode, View } from '../types';
import { Star, TrendingUp, Clock, FileText, Loader2 } from 'lucide-react';

type Props = {
  onViewChange?: (view: View) => void;
  theme: ThemeMode;
};

export const Home: React.FC<Props> = ({ onViewChange, theme }) => {
  const isDark = theme === 'dark';
  // State
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // API fetch - single source of truth
  const fetchPublicSolutions = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      // Explicitly request publicOnly=true to avoid future breaking changes
      const res = await fetch(`${API_BASE}/solutions?limit=50&publicOnly=true`, { signal });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSolutions(Array.isArray(data) ? data : []);
    } catch (e: any) {
      if (e.name === 'AbortError') return; // Ignore aborted requests
      console.error('[fetchPublicSolutions]', e);
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPublicSolutions(controller.signal);
    return () => controller.abort(); // Cleanup: cancel pending requests
  }, [fetchPublicSolutions]);

  // Retry helper
  const retry = () => fetchPublicSolutions();

  // Safe date parsing
  const safeParseDate = (dateStr: string | undefined): number => {
    if (!dateStr) return 0;
    const time = new Date(dateStr).getTime();
    return isNaN(time) ? 0 : time;
  };

  // Client-side filtering
  const filteredSolutions = useMemo(() => {
    let filtered = [...solutions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(sol =>
        sol.title?.toLowerCase().includes(query) ||
        sol.errorMessage?.toLowerCase().includes(query) ||
        sol.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tab sorting - fallback to createdAt
    if (activeTab === 'recent') {
      filtered.sort((a, b) => safeParseDate(b.createdAt) - safeParseDate(a.createdAt));
    } else if (activeTab === 'popular') {
      // Views first, fallback to createdAt
      filtered.sort((a, b) => {
        const viewsDiff = (b.views || 0) - (a.views || 0);
        return viewsDiff !== 0 ? viewsDiff : safeParseDate(b.createdAt) - safeParseDate(a.createdAt);
      });
    } else if (activeTab === 'trending') {
      // Upvotes first, fallback to createdAt
      filtered.sort((a, b) => {
        const upvotesDiff = (b.upvotes || 0) - (a.upvotes || 0);
        return upvotesDiff !== 0 ? upvotesDiff : safeParseDate(b.createdAt) - safeParseDate(a.createdAt);
      });
    }

    return filtered;
  }, [solutions, searchQuery, activeTab]);

  // UI hint
  const sortLabel = useMemo(() => {
    const hasViews = solutions.some(s => (s.views || 0) > 0);
    const hasUpvotes = solutions.some(s => (s.upvotes || 0) > 0);

    if (activeTab === 'popular' && !hasViews) return 'sorted by latest';
    if (activeTab === 'trending' && !hasUpvotes) return 'sorted by latest';
    return '';
  }, [activeTab, solutions]);

  return (
    <div className={`flex flex-col items-start gap-8 w-full ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
      {/* Hero Section */}
      <div className="w-full pt-8 pb-4">
        <h1 className={`text-3xl md:text-4xl font-bold mb-3 tracking-tight ${isDark ? 'text-slate-100' : 'text-emerald-900'}`}>
          Context8: Community Error Solutions
          <br />
          <span className={isDark ? 'text-emerald-300/80 font-medium' : 'text-emerald-700/80 font-medium'}>
            learn from others' debugging experiences
          </span>
        </h1>
        <p className={`text-lg max-w-2xl ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Browse thousands of real-world error fixes shared by developers. Search by error message, tags, or technology.
        </p>
      </div>

      {/* Search Section */}
      <div className="w-full flex flex-col gap-3 max-w-3xl">
        <div className="flex gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search error solutions (e.g., React hooks, TypeScript error)"
              id="public-search"
              name="publicSearch"
              className={`w-full pl-4 pr-4 py-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
            />
          </div>
          <div className={`flex items-center justify-center font-medium px-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>or</div>
          <button
            onClick={() => onViewChange?.('dashboard')}
            className={`px-6 py-3 rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap ${isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
          >
            Sign in to Save Solutions
          </button>
          <button
            onClick={() => onViewChange?.('demo')}
            className={`border px-6 py-3 rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap ${isDark ? 'border-slate-700 text-emerald-300 hover:bg-slate-900' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
          >
            Try Demo Chat
          </button>
        </div>
        {/* Search hint */}
        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          Client-side search (limited to first 50 public solutions)
          {sortLabel && <span className="ml-2">• {sortLabel}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full mt-4">
        <div className="flex items-center gap-6 border-b border-gray-100 pb-px mb-6">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'recent' ? (isDark ? 'text-slate-100' : 'text-gray-900') : (isDark ? 'text-slate-500 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700')}`}
          >
            <Clock size={14} />
            Recent
            {activeTab === 'recent' && <span className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full ${isDark ? 'bg-emerald-400' : 'bg-black'}`}></span>}
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'popular' ? (isDark ? 'text-slate-100' : 'text-gray-900') : (isDark ? 'text-slate-500 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700')}`}
          >
            <Star size={14} />
            Popular
            {activeTab === 'popular' && <span className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full ${isDark ? 'bg-emerald-400' : 'bg-black'}`}></span>}
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'trending' ? (isDark ? 'text-slate-100' : 'text-gray-900') : (isDark ? 'text-slate-500 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700')}`}
          >
            <TrendingUp size={14} />
            Trending
            {activeTab === 'trending' && <span className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full ${isDark ? 'bg-emerald-400' : 'bg-black'}`}></span>}
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className={`border rounded-lg p-6 text-center ${isDark ? 'bg-red-950/40 border-red-900' : 'bg-red-50 border-red-200'}`}>
            <p className={`mb-3 ${isDark ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
            <button
              onClick={retry}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-red-500 hover:bg-red-400 text-black' : 'bg-red-600 hover:bg-red-700 text-white'}`}
            >
              Retry
            </button>
          </div>
        )}

        {/* Solutions grid */}
        {!loading && !error && filteredSolutions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSolutions.map(sol => (
              <div
                key={sol.id}
                className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${isDark ? 'border border-slate-800 bg-slate-900/60' : 'border border-gray-100 bg-white'}`}
                onClick={() => setExpandedId(expandedId === sol.id ? null : sol.id)}
              >
                {/* Title + date */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-semibold line-clamp-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                    {sol.title || 'Untitled Solution'}
                  </h3>
                  <span className={`text-xs flex-shrink-0 ml-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                    {safeParseDate(sol.createdAt) > 0 ? new Date(sol.createdAt!).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>

                {/* Error type */}
                <div className={`text-xs font-medium mb-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>
                  {sol.errorType || 'Unknown type'}
                </div>

                {/* Error preview */}
                <p className={`text-sm line-clamp-2 mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {sol.errorMessage || 'No description available'}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {sol.tags && sol.tags.length > 0 ? (
                    <>
                      {sol.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-1 rounded-md border ${isDark ? 'bg-slate-950 text-emerald-200 border-slate-800' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                        >
                          {tag}
                        </span>
                      ))}
                      {sol.tags.length > 3 && <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>+{sol.tags.length - 3}</span>}
                    </>
                  ) : (
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>No tags</span>
                  )}
                </div>

                {/* Expanded details */}
                {expandedId === sol.id && (
                  <div className={`mt-3 pt-3 border-t animate-in fade-in duration-200 ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
                    <div className={`text-sm mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      <strong className={isDark ? 'text-slate-100' : 'text-gray-900'}>Root Cause:</strong>{' '}
                      {sol.rootCause || 'Not provided'}
                    </div>
                    <div className={`text-sm mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      <strong className={isDark ? 'text-slate-100' : 'text-gray-900'}>Solution:</strong>{' '}
                      {sol.solution || 'Not provided'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewChange?.('dashboard');
                      }}
                      className={`hover:underline text-sm font-medium transition-colors ${isDark ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-600 hover:text-emerald-700'}`}
                    >
                      Sign in to save this solution →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredSolutions.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            <FileText size={48} className={`mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-gray-300'}`} />
            {searchQuery ? (
              <>
                <p className="mb-2">No solutions match "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className={`hover:underline text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}
                >
                  Clear search
                </button>
              </>
            ) : (
              <p>No public solutions available yet. Be the first to share!</p>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className={`mt-6 rounded-xl py-3 px-6 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-50/30 border-gray-100'}`}>
          <div className={`text-xs flex items-center justify-between ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            <span>{solutions.length} PUBLIC SOLUTIONS</span>
            <a href="#" className={`flex items-center gap-1 ${isDark ? 'hover:text-emerald-300' : 'hover:text-emerald-600'}`}>
              SEE ALL CATEGORIES →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
