import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { PromptItem } from '../../types';
import { getPrompts, deletePrompt } from '../../supabase/promptService';
import { useRouter, Link } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Eye, 
  Copy, 
  Heart,
  Filter,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

export const AdminPromptsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState<'all' | 'free' | 'pro'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'copies' | 'likes'>('newest');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPrompts(true);
      setPrompts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete prompt "${title}"? This cannot be undone.`)) {
      try {
        await deletePrompt(id);
        setPrompts(prev => prev.filter(p => p.id !== id));
        showToast('Prompt deleted successfully', 'success');
      } catch {
        showToast('Failed to delete prompt', 'error');
      }
    }
  };

  const categories = useMemo(() => {
    return Array.from(new Set(prompts.map(p => p.category))).filter(Boolean);
  }, [prompts]);

  const filtered = useMemo(() => {
    let result = prompts.filter(p => {
      const matchesSearch = !search.trim() || 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.prompt.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchesTier = 
        selectedTier === 'all' ||
        (selectedTier === 'pro' && p.isPremium) ||
        (selectedTier === 'free' && !p.isPremium);

      return matchesSearch && matchesCat && matchesTier;
    });

    // Sorting
    if (sortBy === 'copies') {
      result.sort((a, b) => (b.copies || 0) - (a.copies || 0));
    } else if (sortBy === 'likes') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      // newest by created_at or id
      result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }

    return result;
  }, [prompts, search, selectedCategory, selectedTier, sortBy]);

  const proCount = prompts.filter(p => p.isPremium).length;
  const freeCount = prompts.length - proCount;

  return (
    <AdminLayout activeSection="prompts">
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                CONTENT INVENTORY
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500">{prompts.length} Prompts Published</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Prompt Catalog Manager
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Moderate prompt recipes, manage tags, update parameters, or create new AI visual cards.
            </p>
          </div>

          <Link
            to="/admin/prompts/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Prompt</span>
          </Link>
        </div>

        {/* Filters and Search Strip */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts by title, prompt keywords, or tags..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-44 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full md:w-36 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="copies">Sort: Most Copies</option>
                <option value="likes">Sort: Most Likes</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center justify-between pt-1 text-xs border-t border-neutral-100 dark:border-neutral-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
                Tier:
              </span>
              <button
                type="button"
                onClick={() => setSelectedTier('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTier === 'all'
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                All ({prompts.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('free')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTier === 'free'
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                Free ({freeCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('pro')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTier === 'pro'
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                Pro Tier ({proCount})
              </button>
            </div>

            <span className="text-neutral-500 text-xs hidden sm:inline">
              Showing <strong className="text-neutral-900 dark:text-white">{filtered.length}</strong> items
            </span>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
              <thead className="bg-neutral-50/80 dark:bg-neutral-950/60 text-neutral-400 dark:text-neutral-500 uppercase font-bold text-[10px] tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5">Prompt Details</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">AI Engine</th>
                  <th className="px-4 py-3.5 text-center">Copies</th>
                  <th className="px-4 py-3.5 text-center">Likes</th>
                  <th className="px-4 py-3.5 text-center">Tier</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filtered.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-850/50 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3.5">
                      <img
                        src={prompt.imageUrl}
                        alt={prompt.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 dark:text-white truncate max-w-xs sm:max-w-md">
                          {prompt.title}
                        </p>
                        <p className="text-[11px] text-neutral-400 font-mono truncate max-w-xs mt-0.5">
                          {prompt.prompt}
                        </p>
                        {prompt.tags && prompt.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 overflow-hidden">
                            {prompt.tags.slice(0, 3).map(t => (
                              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold">
                        {prompt.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-neutral-600 dark:text-neutral-400 font-medium">
                      {prompt.modelUsed || 'Midjourney v6'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center font-bold text-neutral-900 dark:text-white">
                      {prompt.copies || 0}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center font-bold text-neutral-900 dark:text-white">
                      {prompt.likes || 0}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      {prompt.isPremium ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          PRO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/prompt/${prompt.id}`}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="View on site"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/admin/prompts/${prompt.id}/edit`}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(prompt.id, prompt.title)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-neutral-400 text-xs">
                      No prompts found matching the current search and filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-neutral-50/50 dark:bg-neutral-950/40 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span>Showing {filtered.length} of {prompts.length} total prompts</span>
            <Link
              to="/admin/prompts/new"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Another Prompt</span>
            </Link>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

