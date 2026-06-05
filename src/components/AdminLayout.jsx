import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, LogOut, Shield, Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../stores/useAuthStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/groups', icon: MessageSquare, label: 'Quản lý Nhóm' },
  { to: '/users', icon: Users, label: 'Quản lý User' },
];

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [theme, setTheme] = useState(localStorage.getItem('dvn_admin_theme') || 'system');

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('dvn_admin_theme', newTheme);
    window.dispatchEvent(new Event('theme_changed'));
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'w-64' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/50 flex flex-col h-full transition-colors`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">DVN Chat</p>
            <p className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 pb-2 mt-auto">
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 flex items-center justify-between transition-colors">
          <button
            onClick={() => changeTheme('light')}
            className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-colors ${theme === 'light' ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            title="Giao diện sáng"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => changeTheme('system')}
            className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-colors ${theme === 'system' ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            title="Theo hệ thống"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => changeTheme('dark')}
            className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            title="Giao diện tối"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 mb-2 transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-indigo-600 dark:text-indigo-400 text-xs">System Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 transition-colors">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-slate-900 dark:text-white text-sm">DVN Chat Admin</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
