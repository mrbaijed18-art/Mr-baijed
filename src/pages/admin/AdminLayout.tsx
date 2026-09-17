import React, { ReactNode, useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Sparkles, 
  Layers, 
  Users, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  LogOut,
  Lock,
  ExternalLink,
  Megaphone,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  Database,
  Sliders,
  FolderTree
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, Link } from '../../context/RouterContext';
import { useTheme } from '../../context/ThemeContext';
import { getPrompts } from '../../supabase/promptService';
import { getCategories } from '../../supabase/categoryService';
import { useAdsterra } from '../../utils/adsterraManager';

interface AdminLayoutProps {
  children: ReactNode;
  activeSection: 'dashboard' | 'prompts' | 'new-prompt' | 'categories' | 'users' | 'analytics' | 'ads' | 'settings';
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeSection }) => {
  const { profile, isAdmin, logout } = useAuth();
  const { currentPath, navigate } = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [adsterraConfig] = useAdsterra();
  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [promptCount, setPromptCount] = useState<number | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getPrompts(true).catch(() => []),
      getCategories().catch(() => [])
    ]).then(([p, c]) => {
      if (mounted) {
        setPromptCount(p.length);
        setCategoryCount(c.length);
      }
    });
    return () => { mounted = false; };
  }, [activeSection]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [currentPath]);

  // If not admin, show clear access control barrier
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Admin Authentication Required
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            This dashboard is strictly reserved for system administrators to manage AI prompts, categories, monetization, and system configurations.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/admin/login"
              className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              Sign In to Admin Portal
            </Link>
            <Link
              to="/explore"
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              ← Return to Public Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Section Groups
  const navigationGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'CATALOG & CONTENT',
      items: [
        { 
          id: 'prompts', 
          label: 'All Prompts', 
          path: '/admin/prompts', 
          icon: Sparkles,
          badge: promptCount !== null ? `${promptCount}` : undefined
        },
        { id: 'new-prompt', label: 'Add New Prompt', path: '/admin/prompts/new', icon: PlusCircle, isAccent: true },
        { 
          id: 'categories', 
          label: 'Categories', 
          path: '/admin/categories', 
          icon: FolderTree,
          badge: categoryCount !== null ? `${categoryCount}` : undefined
        },
      ]
    },
    {
      title: 'MONETIZATION',
      items: [
        { 
          id: 'ads', 
          label: 'Adsterra Ads', 
          path: '/admin/ads', 
          icon: Megaphone,
          statusDot: adsterraConfig.enabled ? 'bg-emerald-500' : 'bg-neutral-400'
        },
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'users', label: 'User Directory', path: '/admin/users', icon: Users },
        { id: 'settings', label: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  // Breadcrumb mapping
  const breadcrumbNames: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    prompts: 'Prompt Catalog',
    'new-prompt': 'Create Prompt',
    categories: 'Taxonomies & Categories',
    users: 'User Directory',
    analytics: 'Analytics & Insights',
    ads: 'Adsterra Ads Manager',
    settings: 'System Settings',
  };

  return (
    <div className="min-h-screen bg-neutral-50/70 dark:bg-[#0c0d12] flex flex-col md:flex-row transition-colors">
      
      {/* Mobile Top App Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Toggle admin navigation"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-neutral-900 dark:text-white">
              Admin Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/explore"
            className="px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Modern Desktop & Mobile Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 bottom-0 z-50 md:z-20
        w-72 md:w-64 lg:w-72 shrink-0 h-screen
        bg-white dark:bg-neutral-900/95 backdrop-blur-xl
        border-r border-neutral-200/90 dark:border-neutral-800/80
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top Header / Workspace Info */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  Prompter Hub
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
              </div>
              <p className="text-[10px] text-neutral-500 font-mono tracking-wider">
                ADMIN CONTROL v2.5
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase select-none">
                {group.title}
              </span>
              <div className="mt-1.5 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      {/* Active Indicator Bar */}
                      {active && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-500" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          active 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.statusDot && (
                          <span className={`w-2 h-2 rounded-full ${item.statusDot}`} />
                        )}
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            active
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Info & Quick Controls Footer */}
        <div className="p-3.5 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                {profile?.displayName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {profile?.displayName || 'Super Admin'}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block leading-none mt-0.5">
                  Verified Admin
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Clean Top Bar */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Top Bar (Clean, Minimal, Non-Intrusive) */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-3.5 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 sticky top-0 z-20 transition-colors">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400 dark:text-neutral-500 font-medium">Console</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
            <span className="font-bold text-neutral-900 dark:text-white">
              {breadcrumbNames[activeSection] || 'Overview'}
            </span>
          </div>

          {/* Right Header Utility Controls */}
          <div className="flex items-center gap-2.5">
            {/* Adsterra Status Indicator Pill */}
            <Link
              to="/admin/ads"
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                adsterraConfig.enabled
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200'
              }`}
              title="Click to manage Adsterra ads"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${adsterraConfig.enabled ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
              <span>Adsterra: {adsterraConfig.enabled ? 'Active' : 'Off'}</span>
            </Link>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-600" />
              )}
            </button>

            {/* Quick Link to Public Gallery */}
            <Link
              to="/explore"
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Main Canvas Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

