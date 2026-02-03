import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Key,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Terminal,
} from 'lucide-react';

export const LEARN_NAV_ITEMS = [
  { id: 'getting-started', title: 'Getting started' },
  { id: 'configure-mcp', title: 'Configure MCP' },
  { id: 'cli-reference', title: 'CLI reference' },
  { id: 'next-steps', title: 'Next steps' },
] as const;

type TabId = 'cursor' | 'codex' | 'claude-code';

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

const tabs: Array<{ id: TabId; label: string; config: string; language: string; path?: string }> = [
  { id: 'cursor', label: 'Cursor', config: cursorConfig, language: 'json', path: '~/.cursor/mcp.json' },
  { id: 'codex', label: 'Codex CLI', config: codexConfig, language: 'bash' },
  { id: 'claude-code', label: 'Claude Code', config: claudeCodeConfig, language: 'bash' },
];

const cliCommands = [
  { command: 'context8-mcp --version', description: 'Check installed version' },
  { command: 'context8-mcp diagnose', description: 'Diagnose connection status' },
  { command: 'context8-mcp search \"keyword\"', description: 'Search for solutions' },
  { command: 'context8-mcp list --limit 20', description: 'List recent solutions' },
  { command: 'context8-mcp push-remote', description: 'Sync local solutions to cloud' },
] as const;

function CodeBlock({ code, language, path }: { code: string; language: string; path?: string }) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-default bg-[hsl(var(--sb-bg)/0.55)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-default bg-[hsl(var(--sb-bg)/0.6)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-foreground-light">{language}</span>
          {path ? (
            <span className="text-xs text-foreground-light">
              File: <code>{path}</code>
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-md border border-default bg-[hsl(var(--sb-bg)/0.65)] px-2 py-1 text-xs text-foreground hover:bg-[hsl(var(--sb-bg)/0.8)]"
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="custom-scrollbar overflow-x-auto p-4 text-sm">
        <code className="whitespace-pre font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
}

function PillButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-3 py-1.5 text-xs transition-colors',
        active
          ? 'border-strong bg-[hsl(var(--sb-bg)/0.6)] text-foreground'
          : 'border-default bg-transparent text-foreground-light hover:text-foreground hover:bg-[hsl(var(--sb-fg)/0.06)]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function Learn() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<TabId>('cursor');

  return (
    <>
      <h1>Learn</h1>
      <p>
        Configure Context8 for your coding assistant, then use the CLI to search and save solutions.
      </p>

      <section id="getting-started">
        <h2>Getting started</h2>
        <p>Three steps: get an API key, configure your assistant, and start searching.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-default bg-[hsl(var(--sb-bg)/0.55)] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.6)]">
                <Key className="h-5 w-5 text-brand" aria-hidden="true" />
              </div>
              <div className="text-foreground font-semibold">Step 1</div>
            </div>
            <p className="mt-3 text-sm text-foreground-light">
              Create an API key so the assistant can search your solutions.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-sm text-brand-link hover:underline"
              onClick={() => navigate({ to: '/dashboard/apikeys' })}
            >
              Go to API keys <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="rounded-xl border border-default bg-[hsl(var(--sb-bg)/0.55)] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.6)]">
                <Settings className="h-5 w-5 text-brand" aria-hidden="true" />
              </div>
              <div className="text-foreground font-semibold">Step 2</div>
            </div>
            <p className="mt-3 text-sm text-foreground-light">
              Add the Context8 MCP server to your assistant (Cursor, Codex, Claude Code, or any MCP client).
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-sm text-brand-link hover:underline"
              onClick={() => {
                const el = document.getElementById('configure-mcp');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', '#configure-mcp');
              }}
            >
              See configs <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="rounded-xl border border-default bg-[hsl(var(--sb-bg)/0.55)] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.6)]">
                <Terminal className="h-5 w-5 text-brand" aria-hidden="true" />
              </div>
              <div className="text-foreground font-semibold">Step 3</div>
            </div>
            <p className="mt-3 text-sm text-foreground-light">
              Use the CLI to search solutions and sync to the cloud.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-sm text-brand-link hover:underline"
              onClick={() => {
                const el = document.getElementById('cli-reference');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', '#cli-reference');
              }}
            >
              CLI commands <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section id="configure-mcp">
        <h2>Configure MCP</h2>
        <p>Pick your client and add the Context8 MCP server.</p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <PillButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </PillButton>
          ))}
        </div>

        <div className="mt-6">
          {tabs.map((tab) =>
            tab.id === activeTab ? (
              <CodeBlock key={tab.id} code={tab.config} language={tab.language} path={tab.path} />
            ) : null
          )}
        </div>

        <p className="mt-4 text-sm text-foreground-light">
          Replace <code>YOUR_API_KEY</code> with a key from your dashboard.
        </p>
      </section>

      <section id="cli-reference">
        <h2>CLI reference</h2>
        <p>These commands cover the most common workflows.</p>

        <div className="mt-6 rounded-xl border border-default overflow-hidden bg-[hsl(var(--sb-bg)/0.55)]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-default bg-[hsl(var(--sb-bg)/0.6)]">
            <Terminal className="h-4 w-4 text-brand" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">Available commands</span>
          </div>
          <div>
            {cliCommands.map((cmd, idx) => (
              <div
                key={cmd.command}
                className={[
                  'flex flex-col gap-2 px-4 py-4 md:flex-row md:items-center md:justify-between',
                  idx !== cliCommands.length - 1 ? 'border-b border-default' : '',
                ].join(' ')}
              >
                <code className="text-sm font-mono text-foreground">{cmd.command}</code>
                <span className="text-sm text-foreground-light">{cmd.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="next-steps">
        <h2>Next steps</h2>
        <p>Explore the product and try the demo experience.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-default bg-[hsl(var(--sb-bg)/0.55)] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.6)]">
                <LayoutDashboard className="h-5 w-5 text-brand" aria-hidden="true" />
              </div>
              <div className="text-foreground font-semibold">Dashboard</div>
            </div>
            <p className="mt-3 text-sm text-foreground-light">Manage API keys and saved solutions.</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-sm text-brand-link hover:underline"
              onClick={() => navigate({ to: '/dashboard/solutions', search: {} })}
            >
              Open dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="rounded-xl border border-default bg-[hsl(var(--sb-bg)/0.55)] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-default bg-[hsl(var(--sb-bg)/0.6)]">
                <MessageSquare className="h-5 w-5 text-brand" aria-hidden="true" />
              </div>
              <div className="text-foreground font-semibold">Demo</div>
            </div>
            <p className="mt-3 text-sm text-foreground-light">Describe a bug and watch the assistant retrieve solutions.</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-sm text-brand-link hover:underline"
              onClick={() => navigate({ to: '/demo' })}
            >
              Try demo <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-default bg-[hsl(var(--sb-bg)/0.55)] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-foreground font-semibold">Join the community</div>
              <p className="mt-1 text-sm text-foreground-light">Get help, share feedback, and follow updates.</p>
            </div>
            <a
              className="sb-btn-secondary"
              href="https://discord.gg/BDGVMmws"
              target="_blank"
              rel="noreferrer"
            >
              Discord <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
