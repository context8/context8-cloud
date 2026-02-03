import * as React from 'react';
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Key, FileText, Search } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useTheme } from '@/state/theme';
import { useSession } from '@/state/session';

export const Route = createFileRoute('/dashboard')({
  ssr: false,
  component: DashboardRoute,
});

type Tab = {
  to: '/dashboard/apikeys' | '/dashboard/solutions' | '/dashboard/search';
  label: string;
  icon: React.ReactNode;
};

function DashboardRoute() {
  const { theme } = useTheme();
  const { session } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  React.useEffect(() => {
    if (!session?.token) {
      navigate({ to: '/login' });
      return;
    }
    if (pathname === '/dashboard') {
      navigate({ to: '/dashboard/solutions', replace: true });
    }
  }, [navigate, pathname, session?.token]);

  const tabs: Tab[] = [
    { to: '/dashboard/apikeys', label: 'API Keys', icon: <Key size={18} /> },
    { to: '/dashboard/solutions', label: 'Solutions', icon: <FileText size={18} /> },
    { to: '/dashboard/search', label: 'Search', icon: <Search size={18} /> },
  ];

  const tabButtonClass = (isActive: boolean) => `
    flex items-center gap-2 px-4 py-2 font-medium transition-all duration-200
    ${isActive
      ? theme === 'dark'
        ? 'text-emerald-400 border-b-2 border-emerald-400'
        : 'text-emerald-600 border-b-2 border-emerald-600'
      : theme === 'dark'
        ? 'text-slate-400 hover:text-slate-200'
        : 'text-gray-600 hover:text-gray-900'
    }
  `;

  return (
    <AppShell>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className={`border-b mb-6 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
            <nav className="flex gap-1 -mb-px">
              {tabs.map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={tabButtonClass(pathname.startsWith(tab.to))}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>

          <Outlet />
        </div>
      </div>
    </AppShell>
  );
}

