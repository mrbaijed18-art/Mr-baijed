import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useRouter, Link } from '../context/RouterContext';
import { 
  User, 
  Mail, 
  Heart, 
  ShieldCheck, 
  LogOut, 
  Compass, 
  Calendar, 
  Award,
  Sparkles
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, isAdmin, logout } = useAuth();
  const { favorites } = useFavorites();
  const { navigate } = useRouter();

  if (!profile) {
    navigate('/login');
    return null;
  }

  const handleSignOut = async () => {
    await logout();
    navigate('/explore');
  };

  return (
    <div className="w-full min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Profile Header Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-xl dark:shadow-2xl backdrop-blur-xl mb-8 overflow-hidden transition-colors">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-600/10 dark:bg-indigo-600/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          {/* Avatar */}
          {profile.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.displayName || 'Profile'}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-indigo-500/40 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-xl border-2 border-white/20">
              {(profile.displayName || profile.email || 'U')[0].toUpperCase()}
            </div>
          )}

          {/* User Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {profile.displayName || 'Creator'}
              </h1>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Site Administrator
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Community Member
                </span>
              )}
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              {profile.email}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                {favorites.length} saved prompts
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4 text-neutral-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Quick Actions & Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Saved Prompts Quick Card */}
        <Link
          to="/favorites"
          className="group p-6 rounded-3xl bg-white dark:bg-neutral-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-rose-500/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 fill-rose-500/20" />
            </div>
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">
              {favorites.length}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-base group-hover:text-rose-500 dark:group-hover:text-rose-300 transition-colors">
              Saved Prompts
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              View and copy prompts you have bookmarked during your sessions.
            </p>
          </div>
        </Link>

        {/* Explore Prompts Card */}
        <Link
          to="/explore"
          className="group p-6 rounded-3xl bg-white dark:bg-neutral-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
              Prompt Library
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Discover newly added AI image prompts curated across diverse genres.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};
