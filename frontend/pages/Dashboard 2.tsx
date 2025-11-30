import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Plus, AlertCircle, Check } from 'lucide-react';

interface ApiKey {
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

export const Dashboard: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

  useEffect(() => {
    // For now, use mock data since API key management endpoints may not be implemented yet
    // TODO: Replace with actual API call when backend is ready
    setApiKeys([
      { name: 'Production', key: 'ctx8sk-****f272', created: 'Nov 19, 2025', lastUsed: 'Never' },
      { name: 'Development', key: 'ctx8sk-****9d44', created: 'Nov 14, 2025', lastUsed: 'Never' },
    ]);
    setLoading(false);
  }, []);

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const CURL_SNIPPET = `curl -X POST "${API_BASE}/search" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{"query": "TypeError cannot read property", "limit": 5}'`;

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Dashboard Tabs */}
      <div className="w-full flex justify-center border-b border-gray-200">
        <div className="flex gap-8">
          <button className="pb-3 text-emerald-600 font-medium border-b-2 border-emerald-600 text-sm">Overview</button>
          <button className="pb-3 text-gray-500 font-medium hover:text-gray-800 transition-colors text-sm">Solutions</button>
          <button className="pb-3 text-gray-500 font-medium hover:text-gray-800 transition-colors text-sm">Settings</button>
          <button className="pb-3 text-gray-500 font-medium hover:text-gray-800 transition-colors text-sm">Export</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL SOLUTIONS', value: '0' },
          { label: 'SEARCH REQUESTS', value: '0' },
          { label: 'SOLUTIONS SAVED', value: '0' },
          { label: 'SOLUTIONS RETRIEVED', value: '0' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">{stat.label}</span>
            <span className="text-3xl font-medium text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Connect Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Connect</h2>
          <p className="text-sm text-gray-500 mt-1">
            <a href="#" className="underline decoration-gray-300 hover:text-gray-900">Check the docs</a> for installation
          </p>
        </div>

        <div className="space-y-4 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
          <div className="grid grid-cols-12 items-center gap-4">
            <label className="col-span-12 md:col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">MCP URL</label>
            <div className="col-span-1 flex items-center justify-center text-gray-300">:</div>
            <div className="col-span-11 md:col-span-9 flex items-center justify-between group">
              <code className="text-sm text-gray-800 font-mono bg-transparent">mcp.context8.com/mcp</code>
              <button
                onClick={() => handleCopyToClipboard('mcp.context8.com/mcp', 'mcp')}
                className="text-gray-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                {copiedKey === 'mcp' ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <div className="h-px bg-gray-200 w-full" />
           <div className="grid grid-cols-12 items-center gap-4">
            <label className="col-span-12 md:col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">API URL</label>
            <div className="col-span-1 flex items-center justify-center text-gray-300">:</div>
            <div className="col-span-11 md:col-span-9 flex items-center justify-between group">
              <code className="text-sm text-gray-800 font-mono bg-transparent">context8.com/api/v1</code>
              <button
                onClick={() => handleCopyToClipboard('context8.com/api/v1', 'api')}
                className="text-gray-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                {copiedKey === 'api' ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your API keys to authenticate your requests</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-emerald-200">
            <Plus size={16} />
            Create API Key
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-2 font-semibold w-1/4">Name</th>
                <th className="py-3 px-2 font-semibold w-1/4">Key</th>
                <th className="py-3 px-2 font-semibold w-1/4">Created</th>
                <th className="py-3 px-2 font-semibold w-1/4">Last Used</th>
                <th className="py-3 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key, idx) => (
                <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-2 text-gray-800 font-medium">{key.name}</td>
                  <td className="py-4 px-2">
                     <code className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono border border-gray-200">{key.key}</code>
                  </td>
                  <td className="py-4 px-2 text-gray-600 text-sm">{key.created}</td>
                  <td className="py-4 px-2 text-gray-600 text-sm">{key.lastUsed}</td>
                  <td className="py-4 px-2 text-center">
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* API Documentation Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
         <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">API</h2>
          <p className="text-sm text-gray-500 mt-1">
             Use the Context8 API to search and save error solutions programmatically
          </p>
        </div>

        <div className="flex gap-2 mb-4">
            <button className="bg-gray-800 text-white px-4 py-1.5 rounded text-xs font-medium flex items-center gap-2 shadow-sm">
                Search
            </button>
             <button className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded text-xs font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
                Save Solution
            </button>
        </div>

        <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-4 font-mono text-sm overflow-x-auto custom-scrollbar group">
            <pre className="text-gray-700 whitespace-pre-wrap break-all">{CURL_SNIPPET}</pre>
            <button
              onClick={() => handleCopyToClipboard(CURL_SNIPPET, 'curl')}
              className="absolute top-3 right-3 text-gray-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all"
            >
              {copiedKey === 'curl' ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            </button>
        </div>

        <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Authentication</h3>
            <div className="flex items-start gap-2 text-sm mb-3">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600 text-xs">Authorization: Bearer TOKEN</code>
                <span className="text-gray-500">- Use your session token from login</span>
            </div>

            <h3 className="text-sm font-medium text-gray-700 mb-2">Parameters</h3>
            <div className="flex items-start gap-2 text-sm">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600 text-xs">query</code>
                <span className="text-gray-500">- Search term for finding error solutions</span>
            </div>
        </div>

         <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Response</h3>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 font-mono text-xs text-gray-700">
              <pre>{`{
  "total": 5,
  "results": [
    {
      "id": "abc123",
      "title": "TypeError: Cannot read property",
      "errorType": "TypeError",
      "tags": ["react", "hooks"],
      "createdAt": "2025-11-25T10:30:00Z",
      "preview": "Error occurs when accessing undefined..."
    }
  ]
}`}</pre>
            </div>
        </div>
      </div>
    </div>
  );
};
