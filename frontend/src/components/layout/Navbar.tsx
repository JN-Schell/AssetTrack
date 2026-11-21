import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, NotificationItem } from '../../types';
import { api } from '../../services/api';
import {
  Bell,
  Sun,
  Moon,
  Shield,
  FileDown,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface NavbarProps {
  onSearchGlobal?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, role, loginAs, theme, toggleTheme } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [role]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // Fallback demo notifications
      setNotifications([
        {
          id: '1',
          title: 'Equipment Maintenance Due',
          message: 'Dell UltraSharp 32" Monitor is scheduled for firmware review.',
          severity: 'WARNING',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Pending Asset Approval',
          message: 'Priya Nair requested temporary assignment for Cisco 9300 Switch.',
          severity: 'INFO',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
    } catch (_) {}
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const rolesList: { role: UserRole; label: string; badge: string }[] = [
    { role: 'ADMIN', label: 'Administrator', badge: 'Full System Control' },
    { role: 'ASSET_MANAGER', label: 'Asset Manager', badge: 'Procurement & Approvals' },
    { role: 'TECHNICIAN', label: 'Technician', badge: 'Maintenance & Diagnostics' },
    { role: 'READ_ONLY', label: 'Read-Only Auditor', badge: 'Compliance View' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      {/* Brand & Workspace title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20 text-white font-bold text-lg">
          AT
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">AssetTrack</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              ENTERPRISE ITAM
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Hardware, Licenses & Equipment Lifecycle</span>
        </div>
      </div>

      {/* Center Actions / Global Fast Downloads */}
      <div className="hidden lg:flex items-center gap-2">
        <a
          href={api.getFleetReportPdfUrl()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title="Download complete enterprise fleet PDF report"
        >
          <FileDown className="h-3.5 w-3.5 text-blue-500" />
          <span>Fleet PDF Spec</span>
        </a>

        <a
          href={api.getExportCsvUrl()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title="Export asset catalog to standard CSV"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
          <span>CSV Export</span>
        </a>
      </div>

      {/* Right Controls: Role Switcher, Notifications, Theme, User */}
      <div className="flex items-center gap-3">
        {/* RBAC Persona Switcher (Crucial for showcasing enterprise roles!) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
          >
            <Shield className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400">Role:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {role.replace('_', ' ')}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50">
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Switch Role (Live RBAC Demo)
              </div>
              {rolesList.map(item => (
                <button
                  key={item.role}
                  onClick={() => {
                    loginAs(item.role);
                    setShowRoleMenu(false);
                  }}
                  className={`flex w-full flex-col items-start rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    role === item.role
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{item.label}</span>
                    {role === item.role && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.badge}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Notifications</span>
                <span className="text-[11px] text-slate-400">{notifications.length} pending</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-750">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">All caught up! No notifications.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {n.severity === 'WARNING' ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          )}
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{n.title}</span>
                        </div>
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="text-[10px] text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Dismiss
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* User Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="text-left">
            <div className="text-xs font-medium text-slate-900 dark:text-white leading-tight">
              {user?.full_name?.split(' ')[0] || 'User'}
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              {role.toLowerCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
