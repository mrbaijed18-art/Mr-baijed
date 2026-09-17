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
  Filter
} from 'lucide-react';

export const AdminPromptsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const filtered = useMemo(() => {
    return prompts.filter(p => {
      const matchesSearch = !search || 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.prompt.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [prompts, search, selectedCategory]);

  return (
    <AdminLayout activeSection="prompts">
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Prompt Catalog ({prompts.length})
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Search, moderate, edit, and organize all AI image prompts across categories.
            </p>
          </div>

          <Link
            to="/admin/prompts/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Prompt</span>
          </Link>
        </div>

        {/* Filters and Search Strip */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog prompts by title or keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {Array.from(new Set(prompts.map(p => p.category))).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950/60 text-neutral-500 uppercase font-semibold text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5">Prompt Details</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Engine</th>
                  <th className="px-4 py-3.5">Stats</th>
                  <th className="px-4 py-3.5">Tier</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filtered.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <img
                        src={prompt.imageUrl}
                        alt={prompt.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover bg-neutral-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                          {prompt.title}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono truncate max-w-xs">
                          {prompt.prompt}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 font-medium">
                        {prompt.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-neutral-400">
                      {prompt.modelUsed || 'Midjourney'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-0.5">
                          <Copy className="w-3 h-3 text-indigo-400" />
                          {prompt.copies || 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart className="w-3 h-3 text-rose-400" />
                          {prompt.likes || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {prompt.isPremium ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          PRO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-400">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/prompt/${prompt.id}`}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                          title="View live prompt"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/admin/prompts/${prompt.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(prompt.id, prompt.title)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
