import React from 'react';
import { Library, ApiKey } from './types';
import { Box, Database, FileCode, Layers, Layout, Server, Zap, Globe, Cpu, Command } from 'lucide-react';

export const LIBRARIES: Library[] = [
  { name: 'TypeError: Cannot read property', source: 'React Hooks', tokens: '825', snippets: '12', update: '1 day', status: 'active', icon: <Zap size={16} /> },
  { name: 'Module not found', source: 'TypeScript', tokens: '326', snippets: '8', update: '2 days', status: 'active', icon: <Box size={16} /> },
  { name: 'ECONNREFUSED', source: 'Database', tokens: '458', snippets: '15', update: '3 days', status: 'active', icon: <Database size={16} /> },
  { name: 'Invalid hook call', source: 'React', tokens: '553', snippets: '9', update: '3 days', status: 'active', icon: <Layout size={16} /> },
  { name: 'API request failed', source: 'Next.js API', tokens: '684', snippets: '11', update: '1 day', status: 'active', icon: <Command size={16} /> },
  { name: 'CSS not loading', source: 'Tailwind', tokens: '252', snippets: '7', update: '5 days', status: 'active', icon: <FileCode size={16} /> },
  { name: 'Build failed', source: 'Vite', tokens: '233', snippets: '6', update: '4 days', status: 'active', icon: <Layers size={16} /> },
  { name: 'Null pointer exception', source: 'TypeScript', tokens: '697', snippets: '13', update: '2 days', status: 'active', icon: <Cpu size={16} /> },
  { name: 'CORS policy error', source: 'FastAPI', tokens: '236', snippets: '10', update: '1 day', status: 'active', icon: <Server size={16} /> },
  { name: 'Authentication failed', source: 'Supabase', tokens: '460', snippets: '14', update: '1 day', status: 'active', icon: <Globe size={16} /> },
];

export const API_KEYS: ApiKey[] = [
  { name: 'Production', key: 'ctx8sk-****f272', created: 'Nov 19, 2025', lastUsed: 'Never' },
  { name: 'Development', key: 'ctx8sk-****9d44', created: 'Nov 14, 2025', lastUsed: 'Never' },
];

export const CURL_SNIPPET = `curl -X POST "https://context8.com/api/v1/search" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: CONTEXT8_API_KEY" \\
  -d '{"query": "TypeError cannot read property", "limit": 5}'`;
