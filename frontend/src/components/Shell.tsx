import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { KeyRound, LayoutDashboard, LogOut, Menu, Moon, Package, Sun, Users, Wrench } from 'lucide-react';
import { useAuth } from '../auth';
import { labelize } from '../format';
import { useTheme } from '../theme';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/assets', label: 'Assets', icon: Package, end: false },
  { to: '/assignments', label: 'Assignments', icon: Users, end: false },
  { to: '/software', label: 'Software', icon: KeyRound, end: false },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, end: false },
];

export function Shell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="flex min-h-screen">
        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-stone-950/40 md:hidden"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
        ) : null}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform dark:border-stone-800 dark:bg-stone-900 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center gap-3 px-4 py-5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-800 text-sm font-bold text-white">AT</span>
            <div>
              <p className="text-sm font-semibold leading-tight">AssetTrack</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">IT asset operations</p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Primary">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                      isActive
                        ? 'bg-teal-800 text-white'
                        : 'text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800'
                    }`
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="border-t border-stone-200 p-4 text-sm dark:border-stone-800">
            <p className="font-semibold">{user?.full_name}</p>
            <p className="text-stone-500 dark:text-stone-400">{labelize(user?.role)}</p>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
            <button type="button" className="btn-ghost md:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}>
              <Menu size={18} />
            </button>
            <p className="hidden text-sm text-stone-500 dark:text-stone-400 sm:block">{user?.email}</p>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" className="btn-ghost" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
              <button type="button" className="btn-ghost" onClick={logout}>
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
