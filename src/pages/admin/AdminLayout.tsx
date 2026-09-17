import React, { ReactNode } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Sparkles, 
  Layers, 
  Users, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  ArrowLeft, 
  LogOut,
  Lock,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, Link } from '../../context/RouterContext';
import { siteConfig } from '../../config/siteConfig';

interface AdminLayoutProps {
  children: ReactNode;
  activeSection: 'dashboard' | 'prompts' | 'new-prompt' | 'categories' | 'users' | 'analytics' | 'settings';
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeSection }) => {
  const { profile, isAdmin, logout } = useAuth();
  const { currentPath, navigate } = useRouter();

  // If not admin, show clear access control barrier
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl text-center backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
            This management console is strictly restricted to verified administrators. Normal users cannot upload prompts or access moderation controls.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/admin/login"
              className="w-full py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold text-xs transition-colors text-center border border-neutral-700/60"
            >
              Sign In with Authorized Credentials
            </Link>
            <Link
              to="/explore"
              className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors mt-2"
            >
              ← Return to public gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { id: 'prompts', label: 'All Prompts', path: '/admin/prompts', icon: Sparkles },
    { id: 'new-prompt', label: 'Add Prompt', path: '/admin/prompts/new', icon: PlusCircle },
    { id: 'categories', label: 'Categories', path: '/admin/categories', icon: Layers },
    { id: 'users', label: 'Users', path: '/admin/users', icon: Users },
    { id: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row">
      {/* Sidebar on Desktop */}
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-neutral-800/80 bg-neutral-900/60 backdrop-blur-xl flex flex-col justify-between">
        <div className="p-4 sm:p-5">
          {/* Admin Header Branding */}
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-tight">Admin Console</h2>
                <span className="text-[10px] text-emerald-400 font-mono">PROMPTER_ROOT</span>
              </div>
            </div>

            <Link
              to="/explore"
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              title="View Public Site"
            >
              <Compass className="w-4 h-4" />
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer & Signout */}
        <div className="p-4 border-t border-neutral-800 hidden md:block">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <p className="text-white font-medium truncate">{profile?.displayName || 'Admin'}</p>
              <p className="text-[10px] text-neutral-500 truncate">{profile?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
