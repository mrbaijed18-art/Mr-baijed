import React from 'react';
import { PromptItem } from '../types';
import { PromptCard } from './PromptCard';
import { SearchX, Sparkles } from 'lucide-react';

interface PromptGridProps {
  prompts: PromptItem[];
  loading?: boolean;
  onOpenDetails?: (prompt: PromptItem) => void;
  onResetFilters?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
}

export const PromptGrid: React.FC<PromptGridProps> = ({
  prompts,
  loading = false,
  onOpenDetails,
  onResetFilters,
  emptyTitle = "No prompts found",
  emptyMessage = "Try refining your search terms or clearing selected category filters."
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 w-full">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="rounded-2xl md:rounded-3xl bg-neutral-900/60 border border-neutral-800/60 overflow-hidden flex flex-col animate-pulse"
          >
            <div className="aspect-[4/5] sm:aspect-[3/4] bg-neutral-800/70 relative">
              <div className="absolute top-3 left-3 w-16 h-5 bg-neutral-700/60 rounded-full" />
              <div className="absolute bottom-3 right-3 w-20 h-7 bg-neutral-700/60 rounded-xl" />
            </div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-neutral-800 rounded w-3/4" />
              <div className="h-3 bg-neutral-800/60 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-center text-neutral-400 mb-4 shadow-xl">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-neutral-100 mb-2">{emptyTitle}</h3>
        <p className="text-sm text-neutral-400 mb-6">{emptyMessage}</p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-95 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 w-full">
      {prompts.map((prompt, index) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          priority={index < 4}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
};
