import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { siteConfig } from '../../config/siteConfig';
import { isSupabaseConfigured } from '../../supabase/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings, DEFAULT_FOOTER_BADGE, FOOTER_BADGE_PRESETS } from '../../utils/siteSettings';
import { 
  Settings, 
  Database, 
  CheckCircle2, 
  Image as ImageIcon, 
  Upload, 
  RotateCcw, 
  ExternalLink,
  Eye,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Link } from '../../context/RouterContext';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { profile } = useAuth();
  const [settings, updateSettings] = useSiteSettings();

  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteDesc, setSiteDesc] = useState(settings.siteDescription);
  const [enableConfetti, setEnableConfetti] = useState(settings.enableConfetti);

  // 2026 Footer Badge state
  const [showFooterBadge, setShowFooterBadge] = useState(settings.showFooterBadge);
  const [footerBadgeImage, setFooterBadgeImage] = useState(settings.footerBadgeImage);
  const [footerBadgeAlt, setFooterBadgeAlt] = useState(settings.footerBadgeAlt);
  const [footerBadgeLink, setFooterBadgeLink] = useState(settings.footerBadgeLink || '');

  const supabaseActive = isSupabaseConfigured();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image file should be under 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFooterBadgeImage(base64);
        showToast('Footer emblem image loaded! Click Save to apply.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (preset: typeof FOOTER_BADGE_PRESETS[0]) => {
    setFooterBadgeImage(preset.dataUri);
    setFooterBadgeAlt(preset.alt);
    setShowFooterBadge(true);
    showToast(`Applied preset: ${preset.name}`, 'info');
  };

  const handleResetBadge = () => {
    setFooterBadgeImage(DEFAULT_FOOTER_BADGE);
    setFooterBadgeAlt('PromptVerse Verified 2026');
    setFooterBadgeLink('');
    setShowFooterBadge(true);
    showToast('Reset footer picture to default AI emblem', 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      siteName,
      siteDescription: siteDesc,
      enableConfetti,
      showFooterBadge,
      footerBadgeImage,
      footerBadgeAlt,
      footerBadgeLink,
    });
    showToast('Platform settings and footer emblem saved successfully!', 'success');
  };

  return (
    <AdminLayout activeSection="settings">
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                CORE CONFIGURATION
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500">System &amp; UI Preferences</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Platform &amp; Footer Settings
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Customize the footer 2026 emblem picture, platform metadata, database connections, and micro-interactions.
            </p>
          </div>
        </div>

        {/* Adsterra Quick Action Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-neutral-900/40 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              AD
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-xs">Adsterra বিজ্ঞাপন নিয়ন্ত্রণ (Adsterra Ads Console)</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Popunder, Social Bar, 728x90, 300x250 গ্রিড ও ডিরেক্ট লিংক কোড পরিচালনা করতে বিজ্ঞাপন পেজে যান।
              </p>
            </div>
          </div>
          <Link
            to="/admin/ads"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <span>Adsterra সেটিংস</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Main Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* Footer 2026 Small Picture Customization Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    ২০২৬ এর বাম পাশে ছবি (Footer 2026 Copyright Picture &amp; Emblem)
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    ওয়েবসাইটের সবার নিচে ২০২৬ এর বাম পাশে প্রদর্শিত ছোট ছবি পরিবর্তন করুন
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetBadge}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Live Interactive Footer Preview Box */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/70 dark:border-neutral-800/70 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-center gap-1.5">
                <Eye className="w-3 h-3 text-indigo-500" />
                লাইভ ফুটার প্রিভিউ (Live Footer Preview)
              </span>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 shadow-2xs">
                {showFooterBadge && footerBadgeImage && (
                  <img
                    src={footerBadgeImage}
                    alt={footerBadgeAlt || "2026 Emblem"}
                    className="w-5 h-5 object-contain rounded-md shadow-2xs border border-neutral-200 dark:border-neutral-800"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="font-medium">
                  © 2026 {siteName || 'PromptVerse'}. All rights reserved.
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">
                ফুটারের ডানপাশে ২০২৬ লেখার সাথে ছবিটি এভাবেই দেখা যাবে
              </p>
            </div>

            {/* Presets Gallery */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                ১-ক্লিকে রেডিমেড ছবি নির্বাচন করুন (Ready-to-use Presets)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {FOOTER_BADGE_PRESETS.map((p) => {
                  const isSelected = footerBadgeImage === p.dataUri;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-2xs ring-1 ring-emerald-500/20'
                          : 'border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-950/40 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <img
                        src={p.dataUri}
                        alt={p.name}
                        className="w-6 h-6 rounded-md object-contain shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold truncate">{p.name}</p>
                        <p className="text-[9px] text-neutral-400">Click to apply</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 text-xs pt-1">
              {/* Show/Hide Toggle */}
              <div>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-950/50 border border-neutral-200/80 dark:border-neutral-800/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFooterBadge}
                    onChange={(e) => setShowFooterBadge(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500/20 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white block">
                      ২০২৬ এর বাম পাশে ছবি দেখান (Display Picture next to 2026)
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      ছবিটি বন্ধ করতে চাইলে আনচেক করুন
                    </span>
                  </div>
                </label>
              </div>

              {/* Upload & Image URL */}
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  কাস্টম ছবি আপলোড করুন বা লিংক দিন (Upload Custom Picture or Enter URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={footerBadgeImage}
                    onChange={(e) => setFooterBadgeImage(e.target.value)}
                    placeholder="https://... or data:image/..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ডিভাইস থেকে ছবি আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  PNG, JPG, SVG, WebP সমর্থিত (সর্বোচ্চ 2MB)
                </span>
              </div>

              {/* Alt Text & Click URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    ছবির নাম / Tooltip
                  </label>
                  <input
                    type="text"
                    value={footerBadgeAlt}
                    onChange={(e) => setFooterBadgeAlt(e.target.value)}
                    placeholder="e.g. PromptVerse Verified 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    ছবিতে ক্লিক করলে লিংক (ঐচ্ছিক / Optional Link)
                  </label>
                  <input
                    type="url"
                    value={footerBadgeLink}
                    onChange={(e) => setFooterBadgeLink(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* General Platform Branding */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                  General Branding &amp; Metadata
                </h2>
                <p className="text-[11px] text-neutral-400">Global site identity and interface micro-interactions</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Site Brand Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Public Description
                </label>
                <textarea
                  rows={2}
                  value={siteDesc}
                  onChange={(e) => setSiteDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Active Administrator Account
                </label>
                <input
                  type="text"
                  value={profile?.email || 'Secured Administrator Session'}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-xs text-emerald-700 dark:text-emerald-400 font-mono cursor-not-allowed opacity-90 shadow-2xs"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-950/50 border border-neutral-200/80 dark:border-neutral-800/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableConfetti}
                    onChange={(e) => setEnableConfetti(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500/20 w-4 h-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 dark:text-white block">Copy Micro-Interactions</span>
                    <span className="text-[11px] text-neutral-400">
                      Trigger celebratory confetti bursts when users copy featured or premium prompts.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save All Settings &amp; Footer Picture</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </AdminLayout>
  );
};


