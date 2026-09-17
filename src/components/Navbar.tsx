import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  Layers, 
  Flame, 
  Clock, 
  Heart, 
  User, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { useRouter, Link } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { siteConfig } from '../config/siteConfig';
import { useAdsterra } from '../utils/adsterraManager';
import { Zap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const { profile, isAdmin, logout } = useAuth();
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [adsterraConfig] = useAdsterra();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Categories', path: '/categories', icon: Layers },
    { label: 'Popular', path: '/popular', icon: Flame },
    { label: 'Latest', path: '/latest', icon: Clock },
    { label: 'Favorites', path: '/favorites', icon: Heart },
  ];

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('dark');
  };

  const isActive = (path: string) => {
    if (path === '/explore' && (currentPath === '/' || currentPath === '/explore')) return true;
    return currentPath === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/85 dark:bg-[#0c0d12]/85 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link 
          to="/explore" 
          className="flex items-center gap-2.5 group transition-transform active:scale-95 shrink-0"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/15 group-hover:shadow-indigo-500/30 transition-shadow">
            <div className="w-full h-full bg-white dark:bg-neutral-950 rounded-[14px] flex items-center justify-center transition-colors">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5 transition-colors">
              {siteConfig.SITE_NAME}
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30">
                PRO
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  active
                    ? 'bg-neutral-900 text-white dark:bg-neutral-800 dark:text-white font-semibold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-850'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-400' : 'text-neutral-400 dark:text-neutral-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions (Theme toggle pill, User auth, Mobile menu) */}
        <div className="flex items-center gap-2.5">
          {/* Adsterra Direct Link Sponsored Button (if enabled in Admin) */}
          {adsterraConfig.enabled && adsterraConfig.directLink.enabled && adsterraConfig.directLink.showNavButton && adsterraConfig.directLink.url && (
            <a
              href={adsterraConfig.directLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-extrabold text-xs shadow-sm hover:shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{adsterraConfig.directLink.navButtonText || 'Special Deals'}</span>
            </a>
          )}

          {/* Sleek Compact Light / Dark Mode Toggle Pill */}
          <div className="flex items-center p-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 border border-neutral-300/70 dark:border-neutral-700/60 shadow-inner transition-colors">
            <button
              type="button"
              onClick={() => setTheme('light')}
              aria-label="Light mode"
              title="Switch to Light mode"
              className={`p-1.5 rounded-full transition-all duration-200 ${
                resolvedTheme === 'light'
                  ? 'bg-white text-amber-500 shadow-xs scale-105'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              aria-label="Dark mode"
              title="Switch to Dark mode"
              className={`p-1.5 rounded-full transition-all duration-200 ${
                resolvedTheme === 'dark'
                  ? 'bg-neutral-900 text-indigo-400 shadow-xs scale-105'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Auth Section */}
          {profile ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 transition-all active:scale-95"
              >
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName || 'User'}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/10 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30">
                    {(profile.displayName || profile.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-medium text-neutral-800 dark:text-neutral-200 max-w-[100px] truncate">
                  {profile.displayName || profile.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl dark:shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                      {profile.displayName || 'Creator'}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {profile.email}
                    </p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        Admin Access
                      </span>
                    )}
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/favorites"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Saved Prompts</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors font-semibold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />

                  <button
                    type="button"
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm shadow-indigo-500/20 active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-3 space-y-1 backdrop-blur-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                  active 
                    ? 'bg-indigo-600 text-white font-semibold' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
