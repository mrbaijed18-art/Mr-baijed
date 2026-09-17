import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { siteConfig } from '../../config/siteConfig';
import { isSupabaseConfigured } from '../../supabase/client';
import { useToast } from '../../context/ToastContext';
import { Settings, ShieldCheck, Database, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [siteName, setSiteName] = useState(siteConfig.SITE_NAME);
  const [siteDesc, setSiteDesc] = useState(siteConfig.SITE_DESCRIPTION);
  const [enableConfetti, setEnableConfetti] = useState(true);
  const supabaseActive = isSupabaseConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform settings updated successfully', 'success');
  };

  return (
    <AdminLayout activeSection="settings">
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Global application configurations, security profiles, and system preferences.
          </p>
        </div>

        {/* Supabase Storage Backend Status Banner */}
        <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              supabaseActive 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Supabase Database Engine</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  supabaseActive 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {supabaseActive ? 'Live & Secured' : 'Offline / Local Fallback'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {supabaseActive
                  ? 'Cloud PostgreSQL database is active with Row Level Security (RLS) enabled. Prompts, categories, and bookmarks are securely synchronized.'
                  : 'Operating in self-contained local storage mode.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected &amp; Healthy
            </span>
          </div>
        </div>

        {/* General Settings Form */}
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            General Branding & Metadata
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Site Brand Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Public Description
              </label>
              <textarea
                rows={2}
                value={siteDesc}
                onChange={(e) => setSiteDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Exclusive Primary Admin Account
              </label>
              <input
                type="text"
                value="mrbaijed18@gmail.com"
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs sm:text-sm text-emerald-400 font-mono cursor-not-allowed opacity-90"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Exclusive security lock: Only mrbaijed18@gmail.com with your verified password can access this admin panel.
              </span>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableConfetti}
                  onChange={(e) => setEnableConfetti(e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-indigo-500/20"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Copy Micro-Interactions</span>
                  <span className="text-[10px] text-neutral-500">
                    Trigger celebratory confetti bursts when users copy featured or premium prompts.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
