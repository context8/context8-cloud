import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../constants';
import { Solution, View } from '../types';
import { Search, Star, TrendingUp, Clock, FileText, Loader2 } from 'lucide-react';

type Props = {
  onViewChange?: (view: View) => void;
};

export const Home: React.FC<Props> = ({ onViewChange }) => {
  // 状态管理
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // API 调用
  useEffect(() => {
    const fetchPublicSolutions = async () => {
      setLoading(true);
      setError(null);
      try {
        // 显式声明 publicOnly=true，避免未来后端破坏用户空间
        const res = await fetch(`${API_BASE}/solutions?limit=50&publicOnly=true`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setSolutions(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error('[fetchPublicSolutions]', e);
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicSolutions();
  }, []);

  // 重试函数
  const retry = () => {
    setLoading(true);
    setError(null);
    const fetchPublicSolutions = async () => {
      try {
        const res = await fetch(`${API_BASE}/solutions?limit=50&publicOnly=true`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setSolutions(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error('[fetchPublicSolutions]', e);
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicSolutions();
  };

  // 安全的日期解析
  const safeParseDate = (dateStr: string | undefined): number => {
    if (!dateStr) return 0;
    const time = new Date(dateStr).getTime();
    return isNaN(time) ? 0 : time;
  };

  // 客户端过滤逻辑
  const filteredSolutions = useMemo(() => {
    let filtered = [...solutions];

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(sol =>
        sol.title?.toLowerCase().includes(query) ||
        sol.errorMessage?.toLowerCase().includes(query) ||
        sol.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tab 排序 - 统一降级到 createdAt
    if (activeTab === 'recent') {
      filtered.sort((a, b) => safeParseDate(b.createdAt) - safeParseDate(a.createdAt));
    } else if (activeTab === 'popular') {
      // views 优先，缺失时降级到 createdAt
      filtered.sort((a, b) => {
        const viewsDiff = (b.views || 0) - (a.views || 0);
        return viewsDiff !== 0 ? viewsDiff : safeParseDate(b.createdAt) - safeParseDate(a.createdAt);
      });
    } else if (activeTab === 'trending') {
      // upvotes 优先，缺失时降级到 createdAt
      filtered.sort((a, b) => {
        const upvotesDiff = (b.upvotes || 0) - (a.upvotes || 0);
        return upvotesDiff !== 0 ? upvotesDiff : safeParseDate(b.createdAt) - safeParseDate(a.createdAt);
      });
    }

    return filtered;
  }, [solutions, searchQuery, activeTab]);

  // UI 文案提示
  const sortLabel = useMemo(() => {
    const hasViews = solutions.some(s => (s.views || 0) > 0);
    const hasUpvotes = solutions.some(s => (s.upvotes || 0) > 0);

    if (activeTab === 'popular' && !hasViews) return 'sorted by latest';
    if (activeTab === 'trending' && !hasUpvotes) return 'sorted by latest';
    return '';
  }, [activeTab, solutions]);

  return (
    <div className="flex flex-col items-start gap-8 w-full">
      {/* Hero Section */}
      <div className="w-full pt-8 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-3 tracking-tight">
          Context8: Community Error Solutions
          <br />
          <span className="text-emerald-700/80 font-medium">learn from others' debugging experiences</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl">
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
              className="w-full pl-4 pr-4 py-3 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center justify-center text-gray-400 font-medium px-2">or</div>
          <button
            onClick={() => onViewChange?.('dashboard')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap"
          >
            Sign in to Save Solutions
          </button>
        </div>
        {/* 搜索提示 */}
        <div className="text-xs text-gray-400">
          Client-side search (limited to {solutions.length} results)
          {sortLabel && <span className="ml-2">• {sortLabel}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full mt-4">
        <div className="flex items-center gap-6 border-b border-gray-100 pb-px mb-6">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'recent' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Clock size={14} />
            Recent
            {activeTab === 'recent' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></span>}
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'popular' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Star size={14} />
            Popular
            {activeTab === 'popular' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></span>}
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'trending' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <TrendingUp size={14} />
            Trending
            {activeTab === 'trending' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></span>}
          </button>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 mb-3">{error}</p>
            <button
              onClick={retry}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Solutions 网格 */}
        {!loading && !error && filteredSolutions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSolutions.map(sol => (
              <div
                key={sol.id}
                className="border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  // 未来：导航到 /solutions/:id 详情页
                  // 当前：引导登录
                  if (onViewChange) {
                    onViewChange('dashboard');
                  } else {
                    console.log('View solution:', sol.id);
                  }
                }}
              >
                {/* 标题 + 日期 */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {sol.title || 'Untitled Solution'}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {safeParseDate(sol.createdAt) > 0 ? new Date(sol.createdAt!).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>

                {/* 错误类型 */}
                <div className="text-xs text-gray-700 font-medium mb-2">
                  {sol.errorType || 'Unknown type'}
                </div>

                {/* 错误信息预览 */}
                <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                  {sol.errorMessage || 'No description available'}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {sol.tags && sol.tags.length > 0 ? (
                    <>
                      {sol.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {sol.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{sol.tags.length - 3}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">No tags</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && filteredSolutions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            {searchQuery ? (
              <>
                <p className="mb-2">No solutions match "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-emerald-600 hover:underline text-sm"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p>No public solutions available yet. Be the first to share!</p>
            )}
          </div>
        )}

        {/* Footer 统计 */}
        <div className="mt-6 bg-gray-50/30 rounded-xl py-3 px-6 border border-gray-100">
          <div className="text-xs text-gray-400 flex items-center justify-between">
            <span>{solutions.length} PUBLIC SOLUTIONS</span>
            <a href="#" className="hover:text-emerald-600 flex items-center gap-1">
              SEE ALL CATEGORIES →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
