import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { PromptItem } from '../../types';
import { getPrompts } from '../../supabase/promptService';
import { Link } from '../../context/RouterContext';
import { 
  BarChart3, 
  TrendingUp, 
  Copy, 
  Eye, 
  Heart, 
  Award,
  Flame,
  ArrowUpRight,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const p = await getPrompts(true);
        setPrompts(p);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalCopies = prompts.reduce((s, p) => s + (p.copies || 0), 0);
  const totalViews = prompts.reduce((s, p) => s + (p.views || 0), 0);
  const totalLikes = prompts.reduce((s, p) => s + (p.likes || 0), 0);
  const copyRate = totalViews > 0 ? ((totalCopies / totalViews) * 100).toFixed(1) : '0.0';

  // Sort by copies
  const topCopied = [...prompts].sort((a, b) => (b.copies || 0) - (a.copies || 0)).slice(0, 5);

  // Category distribution
  const catDistribution: Record<string, number> = {};
  prompts.forEach(p => {
    catDistribution[p.category] = (catDistribution[p.category] || 0) + (p.copies || 0);
  });
  const sortedCategories = Object.entries(catDistribution).sort((a, b) => b[1] - a[1]);

  return (
    <AdminLayout activeSection="analytics">
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                AUDIENCE INTELLIGENCE
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500">Live Metric Aggregation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Analytics &amp; Engagement
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Track prompt replication velocity, impressions, bookmark favorites, and style popularity.
            </p>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Copies</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Copy className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              {totalCopies.toLocaleString()}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Prompt text extractions
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Views</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              {totalViews.toLocaleString()}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Live prompt impressions
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Copy Conversion</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              {copyRate}%
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              High intent user action
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Likes</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              {totalLikes.toLocaleString()}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              User favorites saved
            </p>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Copied Leaderboard */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    Most Copied Prompts
                  </h2>
                  <p className="text-[11px] text-neutral-400">Ranked by actual user copy events</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {topCopied.map((p, idx) => {
                const share = totalCopies > 0 ? Math.round(((p.copies || 0) / totalCopies) * 100) : 0;
                return (
                  <Link
                    key={p.id}
                    to={`/prompt/${p.id}`}
                    className="p-2.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-950/50 border border-neutral-200/60 dark:border-neutral-800/60 hover:border-emerald-500/40 flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-neutral-200/80 dark:bg-neutral-800 flex items-center justify-center font-bold text-[11px] text-neutral-700 dark:text-neutral-300 shrink-0">
                      #{idx + 1}
                    </div>
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {p.title}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {p.category} • {p.modelUsed || 'Midjourney'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-end gap-1">
                        <Copy className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                        {p.copies || 0}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {share}% of total
                      </span>
                    </div>
                  </Link>
                );
              })}

              {topCopied.length === 0 && (
                <div className="p-6 text-center text-xs text-neutral-400">
                  No prompts available yet.
                </div>
              )}
            </div>
          </div>

          {/* Category Demand Breakdown */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    Category Copy Share
                  </h2>
                  <p className="text-[11px] text-neutral-400">Demand distribution across prompt categories</p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              {sortedCategories.slice(0, 6).map(([catName, copies]) => {
                const pct = totalCopies > 0 ? Math.round((copies / totalCopies) * 100) : 0;
                return (
                  <div key={catName} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">{catName}</span>
                      <span className="text-neutral-500 font-medium">
                        {copies} copies <span className="text-neutral-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {sortedCategories.length === 0 && (
                <div className="p-6 text-center text-xs text-neutral-400">
                  No category data recorded yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

