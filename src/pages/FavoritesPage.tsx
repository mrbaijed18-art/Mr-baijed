import React, { useState, useEffect } from 'react';
import { PromptItem } from '../types';
import { getPrompts } from '../supabase/promptService';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { PromptGrid } from '../components/PromptGrid';
import { PromptDetailsModal } from '../components/PromptDetailsModal';
import { Heart, Sparkles, LogIn, Compass } from 'lucide-react';
import { useRouter, Link } from '../context/RouterContext';

export const FavoritesPage: React.FC = () => {
  const { profile } = useAuth();
  const { favorites } = useFavorites();
  const { navigate } = useRouter();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);

  useEffect(() => {
    async function loadFavPrompts() {
      setLoading(true);
      try {
        const allPrompts = await getPrompts(true);
        const userSaved = allPrompts.filter(p => favorites.includes(p.id));
        setPrompts(userSaved);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFavPrompts();
  }, [favorites]);

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-xl dark:shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 fill-rose-500/20" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Sign In to Save Prompts</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            Create a free account or sign in to build your personal library of saved AI image prompts across devices.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In to PromptVerse
            </Link>
            <Link
              to="/explore"
              className="w-full py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen max-w-7xl mx-auto px-3 sm:px-6 py-4 md:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500 dark:fill-rose-400" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Saved Favorites
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            All prompts you have bookmarked for quick copying and reference.
          </p>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          {prompts.length} {prompts.length === 1 ? 'prompt saved' : 'prompts saved'}
        </div>
      </div>

      {/* Grid */}
      <PromptGrid
        prompts={prompts}
        loading={loading}
        onOpenDetails={(p) => setSelectedPrompt(p)}
        emptyTitle="No saved prompts yet"
        emptyMessage="Explore the prompt gallery and tap the heart button to bookmark prompts you want to copy later."
        onResetFilters={() => navigate('/explore')}
      />

      {/* Details Modal */}
      {selectedPrompt && (
        <PromptDetailsModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          relatedPrompts={prompts.filter(p => p.id !== selectedPrompt.id)}
          onSelectPrompt={(p) => setSelectedPrompt(p)}
        />
      )}
    </div>
  );
};
