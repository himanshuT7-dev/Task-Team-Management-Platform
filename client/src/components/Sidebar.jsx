import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, CheckSquare, Users, X, ShieldCheck } from 'lucide-react';
import { setSidebarOpen } from '../store/uiSlice';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);
  const { isAdmin } = useAuth();

  const navigationItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    ...(isAdmin ? [{ to: '/team', label: 'Team Admin', icon: Users, badge: 'Admin' }] : [])
  ];

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <aside
        className={`fixed lg:static top-14 bottom-0 left-0 z-40 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-200 flex flex-col ${
          isSidebarOpen
            ? 'w-60 translate-x-0'
            : '-translate-x-full lg:translate-x-0 lg:w-16'
        }`}
      >
        <div className="flex items-center justify-between p-3 lg:hidden border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Navigation
          </span>
          <button
            onClick={() => dispatch(setSidebarOpen(false))}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span
                    className={`transition-opacity duration-150 whitespace-nowrap ${
                      !isSidebarOpen ? 'lg:hidden' : 'block'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {item.badge && isSidebarOpen && (
                  <span className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    <ShieldCheck className="w-3 h-3" />
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-600">
          <div className={!isSidebarOpen ? 'lg:hidden' : 'block'}>
            TaskFlow Platform
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
