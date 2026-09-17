import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { PromptItem } from '../../types';
import { getPrompts } from '../../supabase/promptService';
import { 
  BarChart3, 
  TrendingUp, 
  Copy, 
  Eye, 
  Heart, 
  Cpu, 
  Award,
  Flame
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
      <div className="space-y-8 max-w-5xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Analytics & Engagement
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Analyze prompt copying frequency, popular visual styles, and user conversion rates.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Copy className="w-4 h-4 text-indigo-400" /> Total Copies
            </span>
            <span className="text-3xl font-extrabold text-white block">
              {totalCopies.toLocaleString()}
            </span>
            <span className="text-[11px] text-neutral-500 mt-1 block">Full prompt extractions</span>
          </div>

          <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Eye className="w-4 h-4 text-emerald-400" /> Total Views
            </span>
            <span className="text-3xl font-extrabold text-white block">
              {totalViews.toLocaleString()}
            </span>
            <span className="text-[11px] text-neutral-500 mt-1 block">Card impressions</span>
          </div>

          <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" /> Copy Rate
            </span>
            <span className="text-3xl font-extrabold text-white block">
              {copyRate}%
            </span>
            <span className="text-[11px] text-emerald-400 font-medium mt-1 block">Copies per view</span>
          </div>

          <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Heart className="w-4 h-4 text-rose-400" /> Total Likes
            </span>
            <span className="text-3xl font-extrabold text-white block">
              {totalLikes.toLocaleString()}
            </span>
            <span className="text-[11px] text-neutral-500 mt-1 block">Heart bookmarks</span>
          </div>
        </div>

        {/* Top Copied Prompts Leaderboard */}
        <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Most Copied Prompts Leaderboard
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">Top performing generation recipes</p>
            </div>
            <span className="text-xs text-neutral-500 font-mono">Ranked by copy count</span>
          </div>

          <div className="space-y-3">
            {topCopied.map((p, idx) => {
              const share = totalCopies > 0 ? Math.round(((p.copies || 0) / totalCopies) * 100) : 0;
              return (
                <div key={p.id} className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex items-center gap-4">
                  <div className="w-7 h-7 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300">
                    #{idx + 1}
                  </div>
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.title}</p>
                    <p className="text-[11px] text-neutral-500">{p.category} • {p.modelUsed || 'Midjourney'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-white flex items-center justify-end gap-1">
                      <Copy className="w-3.5 h-3.5 text-indigo-400" />
                      {p.copies || 0}
                    </span>
                    <span className="text-[10px] text-neutral-500">{share}% of total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Demand Breakdown */}
        <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl p-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Category Copy Demand
          </h2>
          <div className="space-y-3">
            {sortedCategories.slice(0, 6).map(([catName, copies]) => {
              const pct = totalCopies > 0 ? Math.round((copies / totalCopies) * 100) : 0;
              return (
                <div key={catName} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-200">{catName}</span>
                    <span className="text-neutral-400">{copies} copies ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
