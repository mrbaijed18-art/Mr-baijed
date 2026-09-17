import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Copy, 
  Check, 
  Heart, 
  Sparkles, 
  Calendar, 
  Cpu, 
  Maximize2, 
  Eye, 
  Share2,
  ExternalLink 
} from 'lucide-react';
import { PromptItem } from '../types';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import { copyPromptToClipboard } from '../utils/clipboard';
import { incrementPromptViews } from '../supabase/promptService';
import { useRouter } from '../context/RouterContext';

interface PromptDetailsModalProps {
  prompt: PromptItem | null;
  onClose: () => void;
  relatedPrompts?: PromptItem[];
  onSelectPrompt?: (p: PromptItem) => void;
}

export const PromptDetailsModal: React.FC<PromptDetailsModalProps> = ({
  prompt,
  onClose,
  relatedPrompts = [],
  onSelectPrompt
}) => {
  const [copied, setCopied] = useState(false);
  const { showCopyToast, showToast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { navigate } = useRouter();

  useEffect(() => {
    if (prompt?.id) {
      incrementPromptViews(prompt.id).catch(() => {});
    }
  }, [prompt?.id]);

  if (!prompt) return null;

  const favorited = isFavorite(prompt.id);

  const handleCopy = async () => {
    const success = await copyPromptToClipboard(prompt.prompt, {
      promptId: prompt.id,
      triggerConfetti: true,
      onSuccess: () => {
        setCopied(true);
        showCopyToast("Prompt copied!");
        setTimeout(() => setCopied(false), 2200);
      },
      onError: () => {
        showToast("Could not copy prompt. Please try again.", "error");
      }
    });

    if (!success) {
      showToast("Could not copy prompt. Please try again.", "error");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt.title,
          text: `Check out this AI prompt on PromptVerse: "${prompt.title}"`,
          url: window.location.href
        });
      } catch {
        // User cancelled
      }
    } else {
      await copyPromptToClipboard(window.location.href);
      showToast("Link copied to clipboard!", "success");
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-neutral-300 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Full-height High-Res Image Display */}
          <div className="md:w-1/2 bg-neutral-950 relative flex items-center justify-center min-h-[300px] md:min-h-full overflow-hidden">
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover max-h-[50vh] md:max-h-full"
            />
            
            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {prompt.isPremium && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-black shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  PREMIUM
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/70 text-white backdrop-blur-md border border-white/10">
                {prompt.category}
              </span>
            </div>

            {/* Image Stats Overlay at bottom */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-neutral-300 bg-black/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  {prompt.likes + (favorited ? 1 : 0)} Likes
                </span>
                <span className="flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  {prompt.copies} Copies
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  {prompt.views} Views
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Prompt Details & Action Hub */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[60vh] md:max-h-[90vh]">
            <div className="space-y-5">
              {/* Title & Category info */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
                    {prompt.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                      title="Share prompt"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(prompt.id, prompt.title)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold transition-transform active:scale-95"
                    >
                      <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}`} />
                      <span>{favorited ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                  {prompt.title}
                </h2>
              </div>

              {/* Prompt Text Container (The main value) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Full Prompt
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {prompt.prompt.length} chars
                  </span>
                </div>

                <div className="relative rounded-2xl bg-neutral-950 border border-neutral-800 p-4 font-mono text-xs sm:text-sm text-neutral-200 leading-relaxed shadow-inner max-h-48 overflow-y-auto selection:bg-indigo-500">
                  {prompt.prompt}
                </div>
              </div>

              {/* Large Primary Copy Prompt Button */}
              <button
                type="button"
                onClick={handleCopy}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all duration-200 active:scale-98 ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-white animate-bounce" />
                    <span>Prompt Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copy Full Prompt</span>
                  </>
                )}
              </button>

              {/* Prompt Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1 mb-0.5">
                    <Cpu className="w-3 h-3 text-indigo-400" /> AI Engine
                  </span>
                  <span className="text-xs font-semibold text-neutral-200">
                    {prompt.modelUsed || 'Midjourney / Flux'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1 mb-0.5">
                    <Calendar className="w-3 h-3 text-indigo-400" /> Date Added
                  </span>
                  <span className="text-xs font-semibold text-neutral-200">
                    {new Date(prompt.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {prompt.tags && prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-800/70 text-neutral-300 border border-neutral-750"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Related Prompts Preview */}
              {relatedPrompts.length > 0 && (
                <div className="pt-4 border-t border-neutral-800">
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2.5">
                    More in {prompt.category}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {relatedPrompts.slice(0, 3).map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => {
                          if (onSelectPrompt) onSelectPrompt(rel);
                        }}
                        className="group/rel cursor-pointer rounded-xl overflow-hidden aspect-square relative bg-neutral-950 border border-neutral-800 hover:border-indigo-500 transition-all"
                      >
                        <img
                          src={rel.imageUrl}
                          alt={rel.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/rel:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/rel:opacity-100 transition-opacity flex items-end p-1.5">
                          <span className="text-[10px] text-white font-medium truncate">
                            {rel.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
