import React, { useState, useEffect } from 'react';
import { PromptItem } from '../types';
import { getPromptById, getPrompts, incrementPromptViews } from '../supabase/promptService';
import { useRouter, Link } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import { copyPromptToClipboard } from '../utils/clipboard';
import { PromptCard } from '../components/PromptCard';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Heart, 
  Sparkles, 
  Calendar, 
  Cpu, 
  Eye, 
  Share2,
  Tag
} from 'lucide-react';

interface PromptDetailsPageProps {
  promptId: string;
}

export const PromptDetailsPage: React.FC<PromptDetailsPageProps> = ({ promptId }) => {
  const { navigate } = useRouter();
  const { showCopyToast, showToast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [prompt, setPrompt] = useState<PromptItem | null>(null);
  const [relatedPrompts, setRelatedPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const item = await getPromptById(promptId);
        if (item) {
          setPrompt(item);
          incrementPromptViews(item.id).catch(() => {});
          
          const all = await getPrompts(false);
          const related = all.filter(p => p.category === item.category && p.id !== item.id);
          setRelatedPrompts(related);
        }
      } catch (err) {
        console.error('Failed to load prompt details', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [promptId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-neutral-800 rounded w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[3/4] bg-neutral-800 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-neutral-800 rounded w-3/4" />
            <div className="h-32 bg-neutral-800 rounded-2xl" />
            <div className="h-12 bg-neutral-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Prompt Not Found</h2>
        <p className="text-sm text-neutral-400 mb-6">This prompt may have been removed or unpublished.</p>
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="px-5 py-2.5 rounded-full bg-indigo-600 text-white font-medium text-sm"
        >
          Back to Explore
        </button>
      </div>
    );
  }

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
          text: `Check out "${prompt.title}" on PromptVerse`,
          url: window.location.href
        });
      } catch {}
    } else {
      await copyPromptToClipboard(window.location.href);
      showToast("Page link copied to clipboard!", "success");
    }
  };

  return (
    <div className="w-full min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      {/* Back Link */}
      <button
        type="button"
        onClick={() => navigate('/explore')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Explore</span>
      </button>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left Column: Image (5 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-[650px]"
            />
            {/* Overlay Badges */}
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
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <Heart className="w-4 h-4 text-rose-400" />
                {prompt.likes + (favorited ? 1 : 0)} Likes
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Copy className="w-4 h-4 text-indigo-400" />
                {prompt.copies} Copies
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Eye className="w-4 h-4 text-emerald-400" />
                {prompt.views} Views
              </span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Right Column: Prompt & Actions (7 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
                  {prompt.category}
                </span>
                <button
                  type="button"
                  onClick={() => toggleFavorite(prompt.id, prompt.title)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold transition-all active:scale-95"
                >
                  <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}`} />
                  <span>{favorited ? 'Favorited' : 'Add to Favorites'}</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {prompt.title}
              </h1>
            </div>

            {/* Full Prompt Container */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Prompt Text
                </label>
                <span className="text-xs text-neutral-500 font-mono">
                  {prompt.prompt.length} characters
                </span>
              </div>

              <div className="relative rounded-2xl bg-neutral-950 border border-neutral-800 p-5 font-mono text-sm text-neutral-200 leading-relaxed shadow-inner selection:bg-indigo-500">
                {prompt.prompt}
              </div>
            </div>

            {/* Large Copy Prompt CTA */}
            <button
              type="button"
              onClick={handleCopy}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-2xl transition-all duration-200 active:scale-98 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span>Prompt Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy Full Prompt</span>
                </>
              )}
            </button>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-[11px] text-neutral-500 flex items-center gap-1.5 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Recommended Generator
                </span>
                <span className="text-sm font-semibold text-neutral-200">
                  {prompt.modelUsed || 'Midjourney v6.1 / Flux'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-[11px] text-neutral-500 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Cataloged On
                </span>
                <span className="text-sm font-semibold text-neutral-200">
                  {new Date(prompt.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Tags */}
            {prompt.tags && (
              <div className="flex flex-wrap gap-2 pt-2">
                {prompt.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-neutral-500" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Prompts in Category */}
      {relatedPrompts.length > 0 && (
        <div className="pt-8 border-t border-neutral-800">
          <h3 className="text-xl font-bold text-white mb-6">
            Related in {prompt.category}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedPrompts.slice(0, 4).map(rel => (
              <PromptCard
                key={rel.id}
                prompt={rel}
                onOpenDetails={() => navigate(`/prompt/${rel.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
