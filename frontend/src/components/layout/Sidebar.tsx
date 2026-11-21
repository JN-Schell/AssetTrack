import React from 'react';
import {
  LayoutDashboard,
  Laptop,
  Users,
  KeyRound,
  Wrench,
  ShieldCheck,
  History,
  Building2,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'assets' | 'assignments' | 'licenses' | 'maintenance' | 'warranties' | 'audit';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  approvalsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, approvalsCount = 0 }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'assets',
      label: 'Asset Inventory',
      icon: <Laptop className="h-4 w-4" />,
    },
    {
      id: 'assignments',
      label: 'Personnel & Assignments',
      icon: <Users className="h-4 w-4" />,
      badge: approvalsCount > 0 ? approvalsCount : undefined,
    },
    {
      id: 'licenses',
      label: 'Software & Licenses',
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      id: 'maintenance',
      label: 'Maintenance & Repairs',
      icon: <Wrench className="h-4 w-4" />,
    },
    {
      id: 'warranties',
      label: 'Warranties & Coverage',
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      id: 'audit',
      label: 'Audit & Compliance Log',
      icon: <History className="h-4 w-4" />,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 dark:bg-blue-600'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-blue-600'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Environment Information Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200 mb-1">
            <Building2 className="h-3.5 w-3.5 text-blue-500" />
            <span>Infrastructure Node</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            FastAPI 0.115 backend connected via PostgreSQL/SQLite with Alembic versioning.
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <span>Status: Operational</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center">
        AssetTrack v1.0.0 Enterprise
      </div>
    </aside>
  );
};
