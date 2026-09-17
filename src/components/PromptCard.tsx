import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Heart, Sparkles, Eye } from 'lucide-react';
import { PromptItem } from '../types';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import { copyPromptToClipboard } from '../utils/clipboard';
import { useRouter } from '../context/RouterContext';

interface PromptCardProps {
  prompt: PromptItem;
  onOpenDetails?: (prompt: PromptItem) => void;
  priority?: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onOpenDetails, priority = false }) => {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { showCopyToast, showToast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { navigate } = useRouter();

  const favorited = isFavorite(prompt.id);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyPromptToClipboard(prompt.prompt, {
      promptId: prompt.id,
      triggerConfetti: prompt.isFeatured || prompt.isPremium,
      onSuccess: () => {
        setCopied(true);
        showCopyToast("Prompt copied!");
        setTimeout(() => setCopied(false), 2000);
      },
      onError: () => {
        showToast("Could not copy prompt. Please try again.", "error");
      }
    });

    if (!success) {
      showToast("Could not copy prompt. Please try again.", "error");
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(prompt.id, prompt.title);
  };

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(prompt);
    } else {
      navigate(`/prompt/${prompt.id}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-2xl md:rounded-3xl overflow-hidden bg-white dark:bg-[#13141b] border border-neutral-200/90 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700/90 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/15 cursor-pointer transition-all duration-300 select-none"
    >
      {/* Aspect Ratio Image Container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-950">
        {/* Shimmer Placeholder while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-neutral-400 dark:text-neutral-600 animate-spin" />
          </div>
        )}

        <img
          src={prompt.imageUrl}
          alt={prompt.title}
          loading={priority ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Ambient Dark Gradient for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none opacity-75 group-hover:opacity-85 transition-opacity" />

        {/* Top Badges: Premium & Category */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {prompt.isPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold bg-amber-400 text-neutral-950 shadow-sm backdrop-blur-md">
                <Sparkles className="w-3 h-3 fill-neutral-950" />
                PRO
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-black/60 text-white backdrop-blur-md border border-white/15 shadow-xs">
              {prompt.category}
            </span>
          </div>

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={favorited ? "Remove favorite" : "Add to favorites"}
            className="pointer-events-auto p-1.5 md:p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-transform active:scale-90"
          >
            <Heart
              className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${
                favorited ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>
        </div>

        {/* Floating Quick Action Overlay (Copy Button) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 gap-2">
          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-200 pointer-events-none drop-shadow">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 fill-neutral-300 text-neutral-300" />
              {prompt.likes + (favorited ? 1 : 0)}
            </span>
            <span className="flex items-center gap-1 text-neutral-300">
              <Eye className="w-3 h-3" />
              {prompt.views}
            </span>
          </div>

          {/* Prompt Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy full prompt to clipboard"
            className={`pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl md:rounded-2xl text-xs font-semibold backdrop-blur-xl border transition-all duration-200 active:scale-95 shadow-md ${
              copied
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-white/95 hover:bg-white text-neutral-900 border-white/60 group-hover:scale-105'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-900" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card Footer: Title & Prompt Sneak Peek */}
      <div className="p-3 md:p-3.5 flex flex-col gap-1 transition-colors">
        <h3 className="font-semibold text-xs md:text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {prompt.title}
        </h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 italic font-light">
          "{prompt.prompt}"
        </p>
      </div>
    </motion.div>
  );
};
