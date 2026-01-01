import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../constants';
import { Copy, Plus, Search, FileText, Mail, KeyRound, Loader2, RefreshCcw, Trash2 } from 'lucide-react';
import { ApiKey, SearchResult, Solution, SolutionInput, ThemeMode } from '../types';

type SessionState = {
  session: { token: string; email: string } | null;
  setSession: (s: { token: string; email: string }) => void;
  apiKey: string | null;
  setApiKey: (k: string | null) => void;
};

type Props = {
  sessionState: SessionState;
  theme: ThemeMode;
};

type Status = { kind: 'idle' | 'ok' | 'error' | 'loading'; message?: string };

const authHeaders = (token?: string | null, apiKey?: string | null) => {
  if (apiKey) return { 'X-API-Key': apiKey };
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
};

export const Dashboard: React.FC<Props> = ({ sessionState, theme }) => {
  const { session, setSession, apiKey, setApiKey } = sessionState;
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'overview' | 'solutions' | 'search'>('overview');
  const [email, setEmail] = useState(session?.email ?? '');
  const [code, setCode] = useState('');
  const [sendStatus, setSendStatus] = useState<Status>({ kind: 'idle' });
  const [verifyStatus, setVerifyStatus] = useState<Status>({ kind: 'idle' });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiKeyName, setApiKeyName] = useState('default');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [solutionInput, setSolutionInput] = useState<SolutionInput>({
    title: '',
    errorMessage: '',
    errorType: 'runtime',
    context: '',
    rootCause: '',
    solution: '',
    tags: '',
  });
  const [solutionStatus, setSolutionStatus] = useState<Status>({ kind: 'idle' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<Status>({ kind: 'idle' });

  const token = session?.token;

  useEffect(() => {
    if (session?.token) {
      void fetchApiKeys();
      void fetchSolutions();
    }
  }, [session?.token]);

  const fetchApiKeys = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/apikeys`, {
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setApiKeys(data || []);
    } catch (e: any) {
      console.error('list apikeys', e);
    }
  };

  const fetchSolutions = async () => {
    if (!token && !apiKey) return;
    try {
      const res = await fetch(`${API_BASE}/solutions?limit=50`, {
        headers: { ...authHeaders(token, apiKey) },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSolutions(data || []);
    } catch (e) {
      console.error('list solutions', e);
    }
  };

  const sendCode = async () => {
    if (!email) return;
    setSendStatus({ kind: 'loading' });
    try {
      const res = await fetch(`${API_BASE}/auth/email/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSendStatus({ kind: 'ok', message: 'Verification code sent' });
    } catch (e: any) {
      setSendStatus({ kind: 'error', message: e?.message || 'Failed to send' });
    }
  };

  const verifyCode = async () => {
    if (!email || !code) return;
    setVerifyStatus({ kind: 'loading' });
    try {
      const res = await fetch(`${API_BASE}/auth/email/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSession({ token: data.token, email: data.user.email });
      localStorage.setItem('ctx8_token', data.token);
      localStorage.setItem('ctx8_email', data.user.email);
      setVerifyStatus({ kind: 'ok', message: 'Login successful' });
      setCode('');
      void fetchApiKeys();
      void fetchSolutions();
    } catch (e: any) {
      setVerifyStatus({ kind: 'error', message: e?.message || 'Verification failed' });
    }
  };

  const createApiKey = async () => {
    if (!token) return;
    setVerifyStatus({ kind: 'loading', message: 'Creating API Key...' });
    try {
      const res = await fetch(`${API_BASE}/apikeys?name=${encodeURIComponent(apiKeyName || 'default')}`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setApiKey(data.apiKey);
      localStorage.setItem('ctx8_apikey', data.apiKey);
      setVerifyStatus({ kind: 'ok', message: 'API Key created' });
      setApiKeyName('default');
      await fetchApiKeys();
    } catch (e: any) {
      setVerifyStatus({ kind: 'error', message: e?.message || 'Failed to create' });
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!token || !confirm('Are you sure you want to delete this API key?')) return;
    try {
      const res = await fetch(`${API_BASE}/apikeys/${keyId}`, {
        method: 'DELETE',
        headers: { ...authHeaders(token) },
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchApiKeys();
      if (apiKey && apiKeys.find(k => k.id === keyId)) {
        setApiKey(null);
        localStorage.removeItem('ctx8_apikey');
      }
    } catch (e: any) {
      console.error('delete apikey', e);
      alert('Failed to delete API key: ' + (e?.message || 'Unknown error'));
    }
  };

  const saveSolution = async () => {
    if (!token && !apiKey) {
      setSolutionStatus({ kind: 'error', message: 'Please login or set API Key first' });
      return;
    }
    if (!solutionInput.title || !solutionInput.errorMessage || !solutionInput.context || !solutionInput.rootCause || !solutionInput.solution) {
      setSolutionStatus({ kind: 'error', message: 'Please fill in required fields' });
      return;
    }
    setSolutionStatus({ kind: 'loading' });
    try {
      const payload = {
        title: solutionInput.title,
        errorMessage: solutionInput.errorMessage,
        errorType: solutionInput.errorType || 'runtime',
        context: solutionInput.context,
        rootCause: solutionInput.rootCause,
        solution: solutionInput.solution,
        tags: solutionInput.tags ? solutionInput.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const res = await fetch(`${API_BASE}/solutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token, apiKey) },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setSolutionStatus({ kind: 'ok', message: 'Saved' });
      setSolutionInput({ title: '', errorMessage: '', errorType: 'runtime', context: '', rootCause: '', solution: '', tags: '' });
      await fetchSolutions();
    } catch (e: any) {
      setSolutionStatus({ kind: 'error', message: e?.message || 'Failed to save' });
    }
  };

  const runSearch = async () => {
    if (!token && !apiKey) {
      setSearchStatus({ kind: 'error', message: 'Please login or set API Key first' });
      return;
    }
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    setSearchStatus({ kind: 'loading' });
    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token, apiKey) },
        body: JSON.stringify({ query: searchQuery, limit: 10, offset: 0 }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSearchResults(data.results || []);
      setSearchStatus({ kind: 'ok', message: `${data.total} results` });
    } catch (e: any) {
      setSearchStatus({ kind: 'error', message: e?.message || 'Search failed' });
    }
  };

  const currentAuth = useMemo(() => {
    if (apiKey) return `X-API-Key ${apiKey.slice(0, 8)}...`;
    if (token) return 'Bearer (JWT saved)';
    return 'Not logged in';
  }, [apiKey, token]);

  const stats = useMemo(() => [
    { label: 'TOTAL SOLUTIONS', value: solutions.length.toString() },
    { label: 'SEARCH QUERIES', value: searchResults.length.toString() },
    { label: 'API KEYS', value: apiKeys.length.toString() },
    { label: 'STATUS', value: token ? 'ACTIVE' : 'OFFLINE' },
  ], [solutions.length, searchResults.length, apiKeys.length, token]);

  return (
    <div className={`w-full flex flex-col gap-8 pb-20 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
      {/* Dashboard Tabs */}
      <div className={`w-full flex justify-center border-b ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
        <div className="flex gap-1 md:gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 font-medium text-sm ${activeTab === 'overview' ? (isDark ? 'text-emerald-300 border-b-2 border-emerald-400' : 'text-black border-b-2 border-black') : (isDark ? 'text-slate-500 hover:text-slate-200' : 'text-gray-500 hover:text-gray-900')} transition-colors`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('solutions')}
            className={`pb-3 px-2 font-medium text-sm ${activeTab === 'solutions' ? (isDark ? 'text-emerald-300 border-b-2 border-emerald-400' : 'text-black border-b-2 border-black') : (isDark ? 'text-slate-500 hover:text-slate-200' : 'text-gray-500 hover:text-gray-900')} transition-colors`}
          >
            Solutions
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-3 px-2 font-medium text-sm ${activeTab === 'search' ? (isDark ? 'text-emerald-300 border-b-2 border-emerald-400' : 'text-black border-b-2 border-black') : (isDark ? 'text-slate-500 hover:text-slate-200' : 'text-gray-500 hover:text-gray-900')} transition-colors`}
          >
            Search
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className={`rounded-3xl p-6 border shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-2 h-32 justify-center ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-100'}`}>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{stat.label}</span>
                <span className={`text-3xl font-medium ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Auth section */}
          {!token && (
            <div className={`rounded-3xl border shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-8 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-6">
                <Mail size={16} className={isDark ? 'text-emerald-300' : 'text-gray-700'} />
                <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Email Verification Login</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-medium block mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Email</label>
                    <input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && sendCode()}
                      id="login-email"
                      name="loginEmail"
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder="you@example.com"
                    />
                  </div>
                  <button
                    onClick={sendCode}
                    className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors shadow-sm ${isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-black hover:bg-gray-800 text-white'}`}
                  >
                    {sendStatus.kind === 'loading' && <Loader2 className="animate-spin" size={14} />}
                    Send Code
                  </button>
                  {sendStatus.message && <p className={`text-sm ${sendStatus.kind === 'error' ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-slate-300' : 'text-gray-700')}`}>{sendStatus.message}</p>}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-medium block mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Verification Code</label>
                    <input
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && verifyCode()}
                      id="login-code"
                      name="loginCode"
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}
                      placeholder="6 digits"
                    />
                  </div>
                  <button
                    onClick={verifyCode}
                    className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors shadow-sm ${isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-gray-900 hover:bg-black text-white'}`}
                  >
                    {verifyStatus.kind === 'loading' && <Loader2 className="animate-spin" size={14} />}
                    Verify and Login
                  </button>
                  {verifyStatus.message && <p className={`text-sm ${verifyStatus.kind === 'error' ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-slate-300' : 'text-gray-700')}`}>{verifyStatus.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* API Keys Section */}
          {token && (
            <div className={`rounded-3xl border shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-8 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-100'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>API Keys</h2>
                  <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Manage your API keys to authenticate your requests</p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={apiKeyName}
                    onChange={e => setApiKeyName(e.target.value)}
                    id="apikey-name"
                    name="apiKeyName"
                    className={`border rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder="key name"
                  />
                  <button
                    onClick={createApiKey}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm ${isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-black hover:bg-gray-800 text-white'}`}
                  >
                    <Plus size={18} />
                    Create
                  </button>
                </div>
              </div>

              {apiKeys.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`text-xs font-semibold uppercase tracking-wider border-b ${isDark ? 'text-slate-500 border-slate-800' : 'text-gray-400 border-gray-100'}`}>
                        <th className="py-4 px-2 w-1/4">Name</th>
                        <th className="py-4 px-2 w-1/4">Key</th>
                        <th className="py-4 px-2 w-1/4">Created</th>
                        <th className="py-4 px-2 w-1/4">Last Used</th>
                        <th className="py-4 px-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((key, idx) => (
                        <tr key={idx} className={`border-b last:border-0 transition-colors group ${isDark ? 'border-slate-800 hover:bg-slate-900/60' : 'border-gray-50 hover:bg-gray-50/50'}`}>
                          <td className={`py-5 px-2 font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{key.name}</td>
                          <td className="py-5 px-2">
                            <div className="flex items-center gap-2">
                              <code className={`px-2.5 py-1 rounded-md text-xs font-mono border ${isDark ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {apiKey?.slice(0, 12)}...
                              </code>
                              <button
                                onClick={() => {
                                  if (apiKey) {
                                    navigator.clipboard.writeText(apiKey);
                                    alert('API Key copied to clipboard!');
                                  }
                                }}
                                className={`transition-colors opacity-0 group-hover:opacity-100 ${isDark ? 'text-slate-500 hover:text-emerald-300' : 'text-gray-400 hover:text-gray-900'}`}
                                title="Copy API Key"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </td>
                          <td className={`py-5 px-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className={`py-5 px-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Never</td>
                          <td className="py-5 px-2 text-center">
                            <button
                              onClick={() => deleteApiKey(key.id)}
                              className={`transition-colors opacity-0 group-hover:opacity-100 ${isDark ? 'text-slate-600 hover:text-red-400' : 'text-gray-300 hover:text-red-500'}`}
                              title="Delete API Key"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={`text-sm text-center py-8 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>No API Keys yet. Create one to get started.</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Solutions Tab */}
      {activeTab === 'solutions' && (
        <>
          <div className={`rounded-3xl border shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-8 space-y-6 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className={isDark ? 'text-emerald-300' : 'text-gray-700'} />
                <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Save Solution</h2>
              </div>
              <button
                className={`text-sm inline-flex items-center gap-1 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-800'}`}
                onClick={fetchSolutions}
              >
                <RefreshCcw size={14} />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className={`border rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}
                placeholder="Title"
                value={solutionInput.title}
                id="solution-title"
                name="solutionTitle"
                onChange={e => setSolutionInput(prev => ({ ...prev, title: e.target.value }))}
              />
              <input
                className={`border rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}
                placeholder="Error type (runtime/build/...)"
                value={solutionInput.errorType}
                id="solution-error-type"
                name="solutionErrorType"
                onChange={e => setSolutionInput(prev => ({ ...prev, errorType: e.target.value }))}
              />
              <textarea
                className={`border rounded-lg px-3 py-2 text-sm md:col-span-2 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}
                rows={2}
                placeholder="Error message"
                value={solutionInput.errorMessage}
                id="solution-error-message"
                name="solutionErrorMessage"
                onChange={e => setSolutionInput(prev => ({ ...prev, errorMessage: e.target.value }))}
              />
              <textarea
                className={`border rounded-lg px-3 py-2 text-sm md:col-span-2 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}
                rows={2}
                placeholder="Context"
                value={solutionInput.context}
                id="solution-context"
                name="solutionContext"
                onChange={e => setSolutionInput(prev => ({ ...prev, context: e.target.value }))}
              />
              <textarea
                className={`border rounded-lg px-3 py-2 text-sm md:col-span-2 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}
                rows={2}
                placeholder="Root cause"
                value={solutionInput.rootCause}
                id="solution-root-cause"
                name="solutionRootCause"
                onChange={e => setSolutionInput(prev => ({ ...prev, rootCause: e.target.value }))}
              />
              <textarea
                className={`border rounded-lg px-3 py-2 text-sm md:col-span-2 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}
                rows={3}
                placeholder="Solution"
                value={solutionInput.solution}
                id="solution-solution"
                name="solutionSolution"
                onChange={e => setSolutionInput(prev => ({ ...prev, solution: e.target.value }))}
              />
              <input
                className={`border rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}
                placeholder="Tags (comma separated)"
                value={solutionInput.tags}
                id="solution-tags"
                name="solutionTags"
                onChange={e => setSolutionInput(prev => ({ ...prev, tags: e.target.value }))}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={saveSolution}
                  className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors shadow-sm ${isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-black hover:bg-gray-800 text-white'}`}
                >
                  {solutionStatus.kind === 'loading' && <Loader2 className="animate-spin" size={14} />}
                  Save Solution
                </button>
                {solutionStatus.message && <span className={`text-sm ${solutionStatus.kind === 'error' ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-slate-300' : 'text-gray-700')}`}>{solutionStatus.message}</span>}
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-8 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-xl font-semibold tracking-tight mb-6 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>All Solutions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solutions.length === 0 && <p className={`text-sm col-span-2 text-center py-8 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>No solutions yet. Create one to get started.</p>}
              {solutions.map(sol => (
                <div key={sol.id} className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${isDark ? 'border border-slate-800 bg-slate-900/60' : 'border border-gray-100 bg-white'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{sol.title}</h3>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{new Date(sol.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={`text-xs font-medium mb-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{sol.errorType}</div>
                  <div className={`text-sm line-clamp-3 mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{sol.errorMessage}</div>
                  <div className="flex flex-wrap gap-2">
                    {sol.tags?.map(tag => (
                      <span key={tag} className={`text-xs px-2 py-1 rounded-md border ${isDark ? 'bg-slate-950 text-emerald-200 border-slate-800' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className={`rounded-3xl border shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-8 space-y-6 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <Search size={16} className={isDark ? 'text-emerald-300' : 'text-gray-700'} />
            <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Search Solutions</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              className={`flex-1 border rounded-lg px-4 py-2 text-sm ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}
              placeholder="Enter keywords to search for solutions..."
              value={searchQuery}
              id="search-query"
              name="searchQuery"
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && runSearch()}
            />
            <button
              onClick={runSearch}
              className={`px-6 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors shadow-sm ${isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-gray-900 hover:bg-black text-white'}`}
            >
              {searchStatus.kind === 'loading' && <Loader2 className="animate-spin" size={14} />}
              Search
            </button>
          </div>

          {searchStatus.message && (
            <p className={`text-sm ${searchStatus.kind === 'error' ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-slate-300' : 'text-gray-700')}`}>
              {searchStatus.message}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map(r => (
              <div key={r.id} className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${isDark ? 'border border-slate-800 bg-slate-900/60' : 'border border-gray-100 bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{r.title || 'Untitled'}</h3>
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
                <div className={`text-xs font-medium mb-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{r.errorType || 'Unknown type'}</div>
                <p className={`text-sm mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{r.preview || 'No preview available'}</p>
                <div className="flex flex-wrap gap-2">
                  {r.tags && r.tags.length > 0 ? (
                    r.tags.map(tag => (
                      <span key={tag} className={`text-xs px-2 py-1 rounded-md border ${isDark ? 'bg-slate-950 text-emerald-200 border-slate-800' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>No tags</span>
                  )}
                </div>
              </div>
            ))}
            {searchResults.length === 0 && searchStatus.kind !== 'loading' && searchQuery && (
              <p className={`text-sm col-span-2 text-center py-8 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>No results found. Try a different search term.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
