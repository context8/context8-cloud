import React, { useState } from 'react';
import { ThemeMode, View } from '../types';
import {
  Copy,
  Check,
  Key,
  Settings,
  Terminal,
  ArrowRight,
  ExternalLink,
  BookOpen,
  LayoutDashboard,
  MessageSquare
} from 'lucide-react';

type Props = {
  onViewChange?: (view: View) => void;
  theme: ThemeMode;
};

type TabId = 'cursor' | 'codex' | 'claude-code';

interface CodeBlockProps {
  code: string;
  language?: string;
  theme: ThemeMode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'json', theme }) => {
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative rounded-lg overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-900'}`}>
      <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-700'}`}>
        <span className="text-xs text-slate-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {copied ? (
            <>
              <Check size={12} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-slate-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
};

export const Learn: React.FC<Props> = ({ onViewChange, theme }) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<TabId>('cursor');

  const cursorConfig = `{
  "mcpServers": {
    "context8": {
      "command": "npx",
      "args": ["-y", "context8-mcp"],
      "env": {
        "CONTEXT8_REMOTE_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}`;

  const codexConfig = `# Add Context8 MCP server
codex mcp add context8 -- npx -y context8-mcp

# Set your API key as environment variable
export CONTEXT8_REMOTE_API_KEY=<your-api-key>`;

  const claudeCodeConfig = `# Add Context8 MCP server with API key
claude mcp add -e CONTEXT8_REMOTE_API_KEY=<your-api-key> context8 -- npx -y context8-mcp`;

  const tabs: { id: TabId; label: string; config: string; language: string; path?: string }[] = [
    { id: 'cursor', label: 'Cursor', config: cursorConfig, language: 'json', path: '~/.cursor/mcp.json' },
    { id: 'codex', label: 'Codex CLI', config: codexConfig, language: 'bash' },
    { id: 'claude-code', label: 'Claude Code', config: claudeCodeConfig, language: 'bash' },
  ];

  const cliCommands = [
    { command: 'context8-mcp --version', description: 'Check installed version' },
    { command: 'context8-mcp diagnose', description: 'Diagnose connection status' },
    { command: 'context8-mcp search "keyword"', description: 'Search for solutions' },
    { command: 'context8-mcp list --limit 20', description: 'List recent solutions' },
    { command: 'context8-mcp push-remote', description: 'Sync local solutions to cloud' },
  ];

  const nextSteps = [
    {
      title: 'Dashboard',
      description: 'Manage your API keys and view your saved solutions',
      icon: LayoutDashboard,
      action: () => onViewChange?.('dashboard'),
      buttonText: 'Go to Dashboard',
    },
    {
      title: 'Try Demo',
      description: 'Experience Context8 in action with our interactive demo',
      icon: MessageSquare,
      action: () => onViewChange?.('demo'),
      buttonText: 'Try Live Demo',
    },
    {
      title: 'Join Community',
      description: 'Get help, share feedback, and connect with other developers',
      icon: BookOpen,
      href: 'https://discord.gg/BDGVMmws',
      buttonText: 'Join Discord',
    },
  ];

  return (
    <div className={`flex flex-col items-start gap-12 w-full ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
      {/* Hero Section */}
      <div className="w-full pt-8 pb-4">
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 tracking-tight ${isDark ? 'text-slate-100' : 'text-emerald-900'}`}>
          Get Started with Context8
        </h1>
        <p className={`text-lg max-w-2xl mb-6 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Set up Context8 MCP server in your favorite coding assistant and start leveraging community error solutions in minutes.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => onViewChange?.('dashboard')}
            className={`px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 ${isDark ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
          >
            <Key size={16} />
            Get API Key
          </button>
          <button
            onClick={() => onViewChange?.('demo')}
            className={`border px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 ${isDark ? 'border-slate-700 text-emerald-300 hover:bg-slate-900' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
          >
            Try Demo
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="w-full">
        <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
            1
          </div>
          Quick Start
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div className={`rounded-xl p-6 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                <Key size={20} className={isDark ? 'text-emerald-300' : 'text-emerald-600'} />
              </div>
              <h3 className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Step 1: Get Your API Key
              </h3>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Sign up for a free account and generate your API key from the dashboard. This key enables cloud sync and community features.
            </p>
            <button
              onClick={() => onViewChange?.('login')}
              className={`text-sm font-medium transition-colors ${isDark ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-600 hover:text-emerald-700'}`}
            >
              Sign up now <ArrowRight size={14} className="inline ml-1" />
            </button>
          </div>

          {/* Step 2 */}
          <div className={`rounded-xl p-6 border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                <Settings size={20} className={isDark ? 'text-emerald-300' : 'text-emerald-600'} />
              </div>
              <h3 className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Step 2: Configure Your Assistant
              </h3>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Add the Context8 MCP server to your coding assistant. We support Cursor, Codex CLI, Claude Code, and any MCP-compatible client.
            </p>
            <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              See configuration below
            </span>
          </div>
        </div>
      </div>

      {/* MCP Configuration Section */}
      <div className="w-full">
        <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
            2
          </div>
          MCP Client Configuration
        </h2>

        {/* Tabs */}
        <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
          <div className={`flex border-b ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-gray-200 bg-gray-50'}`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? isDark
                      ? 'text-emerald-300 bg-slate-900'
                      : 'text-emerald-700 bg-white'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`} />
                )}
              </button>
            ))}
          </div>

          <div className={`p-6 ${isDark ? 'bg-slate-900/40' : 'bg-white'}`}>
            {tabs.map((tab) =>
              activeTab === tab.id ? (
                <div key={tab.id}>
                  {tab.path && (
                    <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Configuration file: <code className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-slate-800 text-emerald-300' : 'bg-gray-100 text-emerald-700'}`}>{tab.path}</code>
                    </p>
                  )}
                  <CodeBlock code={tab.config} language={tab.language} theme={theme} />
                  <p className={`text-sm mt-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    Replace <code className={`px-1.5 py-0.5 rounded text-xs ${isDark ? 'bg-slate-800 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>YOUR_API_KEY</code> with your actual API key from the dashboard.
                  </p>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* CLI Reference Section */}
      <div className="w-full">
        <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
            3
          </div>
          CLI Reference
        </h2>

        <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
          <div className={`px-6 py-3 border-b flex items-center gap-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
            <Terminal size={16} className={isDark ? 'text-emerald-300' : 'text-emerald-600'} />
            <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Available Commands</span>
          </div>
          <div className={isDark ? 'bg-slate-900/40' : 'bg-white'}>
            {cliCommands.map((cmd, index) => (
              <div
                key={cmd.command}
                className={`flex items-center justify-between px-6 py-4 ${
                  index !== cliCommands.length - 1 ? (isDark ? 'border-b border-slate-800' : 'border-b border-gray-100') : ''
                }`}
              >
                <code className={`text-sm font-mono ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  {cmd.command}
                </code>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {cmd.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Steps Section */}
      <div className="w-full pb-8">
        <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          Next Steps
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {nextSteps.map((step) => (
            <div
              key={step.title}
              className={`rounded-xl p-6 border transition-shadow hover:shadow-md ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100'}`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                <step.icon size={24} className={isDark ? 'text-emerald-300' : 'text-emerald-600'} />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {step.title}
              </h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {step.description}
              </p>
              {step.href ? (
                <a
                  href={step.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${isDark ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-600 hover:text-emerald-700'}`}
                >
                  {step.buttonText}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <button
                  onClick={step.action}
                  className={`text-sm font-medium transition-colors ${isDark ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-600 hover:text-emerald-700'}`}
                >
                  {step.buttonText} <ArrowRight size={14} className="inline ml-1" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
