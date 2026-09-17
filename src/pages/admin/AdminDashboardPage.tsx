import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { PromptItem, CategoryItem } from '../../types';
import { getPrompts, deletePrompt } from '../../supabase/promptService';
import { getCategories } from '../../supabase/categoryService';
import { useRouter, Link } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useAdsterra } from '../../utils/adsterraManager';
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
  ArrowUpRight,
  Database,
  Megaphone,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  FolderTree,
  Zap,
  TrendingUp,
  ShieldCheck,
  Sliders
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [adsterraConfig] = useAdsterra();

  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableSearch, setTableSearch] = useState('');

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
  const premiumCount = prompts.filter(p => p.isPremium).length;
  const freeCount = prompts.length - premiumCount;

  // Category counts
  const categoryPromptCounts: Record<string, number> = {};
  prompts.forEach(p => {
    categoryPromptCounts[p.category] = (categoryPromptCounts[p.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryPromptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

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

  const filteredRecent = prompts.filter(p => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.prompt.toLowerCase().includes(q);
  });

  return (
    <AdminLayout activeSection="dashboard">
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Welcome & Quick Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                CONTROL ROOM
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> All systems nominal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Welcome back, {profile?.displayName?.split(' ')[0] || 'Administrator'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Live snapshot of catalog activity, prompt extractions, community interaction, and Adsterra monetization.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
              title="Refresh statistics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/admin/ads"
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-500" />
              <span>Adsterra Ads</span>
            </Link>
            <Link
              to="/admin/prompts/new"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Prompt</span>
            </Link>
          </div>
        </div>

        {/* 4 Professional KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Total Prompts */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Catalog Prompts
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {prompts.length}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-400">
                {premiumCount} Pro / {freeCount} Free
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Published AI prompts</span>
              <Link to="/admin/prompts" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                Manage →
              </Link>
            </div>
          </div>

          {/* 2. Total Copies / Extractions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Total Copies
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Copy className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {totalCopies.toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> High ROI
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Direct prompt usage</span>
              <Link to="/admin/analytics" className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                Analytics →
              </Link>
            </div>
          </div>

          {/* 3. Community Likes */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Community Likes
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {totalLikes.toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-400">
                {(totalLikes / (prompts.length || 1)).toFixed(1)} avg/prompt
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
              <span>User bookmarked items</span>
              <span className="text-neutral-400 text-[10px]">Realtime sync</span>
            </div>
          </div>

          {/* 4. Active Categories */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Categories
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FolderTree className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {categories.length}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                Active Taxonomies
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Organized navigation</span>
              <Link to="/admin/categories" className="text-amber-600 dark:text-amber-400 hover:underline font-semibold">
                Manage →
              </Link>
            </div>
          </div>
        </div>

        {/* System Health & Adsterra Quick Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-neutral-900 dark:text-white block truncate">
                Supabase Database
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected &amp; Synced
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-neutral-900 dark:text-white block truncate">
                  Adsterra Monetization
                </span>
                <span className={`text-[11px] flex items-center gap-1 font-medium ${
                  adsterraConfig.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${adsterraConfig.enabled ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                  {adsterraConfig.enabled ? 'Ads Live & Running' : 'Currently Paused'}
                </span>
              </div>
            </div>
            <Link
              to="/admin/ads"
              className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline shrink-0"
            >
              Config →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-neutral-900 dark:text-white block truncate">
                Storage &amp; CDN
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> High-Speed Edge Active
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Recent Prompts (Left 2/3) + Top Categories Breakdown (Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Table (Recent Prompts) */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              {/* Table Header & Search Filter */}
              <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                    Recent Prompts Catalog
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Live prompts uploaded to the gallery
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      placeholder="Quick filter..."
                      className="w-40 sm:w-48 pl-8 pr-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <Link
                    to="/admin/prompts"
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors whitespace-nowrap"
                  >
                    View All →
                  </Link>
                </div>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
                  <thead className="bg-neutral-50/70 dark:bg-neutral-950/60 text-neutral-400 dark:text-neutral-500 uppercase font-bold text-[10px] tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                    <tr>
                      <th className="px-5 py-3">Prompt Title &amp; Visual</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-center">Copies</th>
                      <th className="px-4 py-3 text-center">Likes</th>
                      <th className="px-4 py-3 text-center">Tier</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {filteredRecent.slice(0, 6).map((prompt) => (
                      <tr key={prompt.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-850/50 transition-colors">
                        <td className="px-5 py-3 flex items-center gap-3">
                          <img
                            src={prompt.imageUrl}
                            alt={prompt.title}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200/60 dark:border-neutral-800"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-neutral-900 dark:text-white truncate max-w-xs sm:max-w-sm">
                              {prompt.title}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-mono truncate max-w-xs">
                              {prompt.prompt}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold">
                            {prompt.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center font-bold text-neutral-900 dark:text-white">
                          {prompt.copies || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center font-bold text-neutral-900 dark:text-white">
                          {prompt.likes || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
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
                        <td className="px-5 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/prompt/${prompt.id}`}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                              title="Preview on site"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              to={`/admin/prompts/${prompt.id}/edit`}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                              title="Edit prompt"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(prompt.id, prompt.title)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                              title="Delete prompt"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRecent.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-neutral-400 text-xs">
                          No prompts found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 sm:px-5 bg-neutral-50/50 dark:bg-neutral-950/40 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Showing up to 6 of {prompts.length} catalog items</span>
              <Link to="/admin/prompts" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Manage all {prompts.length} prompts →
              </Link>
            </div>
          </div>

          {/* Right Column: Category Distribution & Quick Links */}
          <div className="space-y-6">
            
            {/* Category Performance Bar */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Top Categories
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Prompt volume distribution
                  </p>
                </div>
                <Link to="/admin/categories" className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                  All ({categories.length})
                </Link>
              </div>

              <div className="space-y-3 pt-1">
                {topCategories.map(([catName, count]) => {
                  const percentage = Math.round((count / (prompts.length || 1)) * 100);
                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {catName}
                        </span>
                        <span className="text-neutral-500 text-[11px]">
                          {count} prompts ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Shortcuts Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Quick Shortcuts
              </h3>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <Link
                  to="/admin/prompts/new"
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-emerald-500" /> Upload New Prompt
                  </span>
                  <span className="text-neutral-400">→</span>
                </Link>
                <Link
                  to="/admin/categories"
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-amber-500" /> Manage Categories
                  </span>
                  <span className="text-neutral-400">→</span>
                </Link>
                <Link
                  to="/admin/ads"
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-purple-500" /> Adsterra Monetization
                  </span>
                  <span className="text-neutral-400">→</span>
                </Link>
                <Link
                  to="/admin/settings"
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-500" /> Site Configuration
                  </span>
                  <span className="text-neutral-400">→</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

