import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { PromptItem, CategoryItem } from '../../types';
import { getPrompts, deletePrompt } from '../../supabase/promptService';
import { getCategories } from '../../supabase/categoryService';
import { useRouter, Link } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { 
  Sparkles, 
  Copy, 
  Heart, 
  Layers, 
  PlusCircle, 
  BarChart3, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Eye, 
  ArrowUpRight 
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        getPrompts(true),
        getCategories()
      ]);
      setPrompts(p);
      setCategories(c);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCopies = prompts.reduce((sum, p) => sum + (p.copies || 0), 0);
  const totalLikes = prompts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalViews = prompts.reduce((sum, p) => sum + (p.views || 0), 0);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete prompt "${title}"?`)) {
      try {
        await deletePrompt(id);
        showToast('Prompt removed successfully', 'success');
        setPrompts(prev => prev.filter(p => p.id !== id));
      } catch {
        showToast('Failed to delete prompt', 'error');
      }
    }
  };

  return (
    <AdminLayout activeSection="dashboard">
      <div className="space-y-8 max-w-6xl">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Overview
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Monitor catalog metrics, manage community prompts, and upload new AI generations.
            </p>
          </div>
          <Link
            to="/admin/prompts/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Prompt</span>
          </Link>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Prompts</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {prompts.length}
              </span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">
                {prompts.filter(p => p.isPremium).length} Premium Tier
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Copies</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Copy className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {totalCopies.toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-0.5 font-medium">
                <ArrowUpRight className="w-3 h-3" /> High engagement
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Likes</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {totalLikes.toLocaleString()}
              </span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">
                Across {prompts.length} prompts
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Categories</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {categories.length}
              </span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">
                Active taxonomies
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Strip */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2">
            Quick Actions:
          </span>
          <Link
            to="/admin/prompts/new"
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            Add New Prompt
          </Link>
          <Link
            to="/admin/categories"
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Manage Categories
          </Link>
          <Link
            to="/admin/analytics"
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            View Analytics
          </Link>
        </div>

        {/* Recent Prompts Management Table */}
        <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Prompts</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Latest prompt uploads and live performance stats
              </p>
            </div>
            <Link
              to="/admin/prompts"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View All Prompts →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950/60 text-neutral-500 uppercase font-semibold text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-3">Prompt</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Copies</th>
                  <th className="px-4 py-3">Likes</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {prompts.slice(0, 6).map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <img
                        src={prompt.imageUrl}
                        alt={prompt.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover bg-neutral-800 shrink-0"
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
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-white">
                      {prompt.copies || 0}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-white">
                      {prompt.likes || 0}
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
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/prompts/${prompt.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                          title="Edit prompt"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(prompt.id, prompt.title)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                          title="Delete prompt"
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
