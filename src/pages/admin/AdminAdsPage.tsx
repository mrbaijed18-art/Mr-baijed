import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useAdsterra, resetAdsterraConfig, DEFAULT_ADSTERRA_CONFIG } from '../../utils/adsterraManager';
import { useToast } from '../../context/ToastContext';
import { AdsterraConfig } from '../../types';
import { 
  Megaphone, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  Sparkles, 
  Globe, 
  Bell, 
  Layout, 
  Grid, 
  Maximize2, 
  Link as LinkIcon, 
  ExternalLink,
  Info,
  HelpCircle,
  Eye,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { AdsterraBanner } from '../../components/AdsterraBanner';

export const AdminAdsPage: React.FC = () => {
  const [config, updateConfig] = useAdsterra();
  const { showToast } = useToast();

  // Local working copy of config for editing
  const [form, setForm] = useState<AdsterraConfig>(config);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewUnit, setPreviewUnit] = useState<'topBanner' | 'inFeedBanner' | 'modalBanner' | 'footerBanner'>('topBanner');

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateConfig(form);
    showToast('Adsterra বিজ্ঞাপন সেটিংস সফলভাবে সেভ করা হয়েছে!', 'success');
  };

  const handleToggleMaster = () => {
    const updated = { ...form, enabled: !form.enabled };
    setForm(updated);
    updateConfig(updated);
    showToast(updated.enabled ? 'Adsterra বিজ্ঞাপন চালু করা হয়েছে' : 'Adsterra বিজ্ঞাপন বন্ধ করা হয়েছে', 'info');
  };

  const handleLoadDemo = () => {
    setForm(DEFAULT_ADSTERRA_CONFIG);
    updateConfig(DEFAULT_ADSTERRA_CONFIG);
    showToast('Adsterra ডেমো টেস্ট কোড লোড করা হয়েছে!', 'info');
  };

  const handleClearAll = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সমস্ত Adsterra কোড খালি করতে চান?')) {
      const cleared: AdsterraConfig = {
        enabled: false,
        popunder: { enabled: false, code: '' },
        socialBar: { enabled: false, code: '' },
        topBanner: { enabled: false, code: '' },
        inFeedBanner: { enabled: false, code: '', position: 4 },
        modalBanner: { enabled: false, code: '' },
        footerBanner: { enabled: false, code: '' },
        stickyBottom: { enabled: false, code: '' },
        directLink: { enabled: false, url: '', openOnCopyPrompt: false, showNavButton: false, navButtonText: 'Special Offers' },
      };
      setForm(cleared);
      updateConfig(cleared);
      showToast('সমস্ত Adsterra কোড মুছে দেওয়া হয়েছে', 'info');
    }
  };

  // Count active units
  const activeCount = [
    form.popunder.enabled && form.popunder.code.trim(),
    form.socialBar.enabled && form.socialBar.code.trim(),
    form.topBanner.enabled && form.topBanner.code.trim(),
    form.inFeedBanner.enabled && form.inFeedBanner.code.trim(),
    form.modalBanner.enabled && form.modalBanner.code.trim(),
    form.footerBanner.enabled && form.footerBanner.code.trim(),
    form.stickyBottom.enabled && form.stickyBottom.code.trim(),
    form.directLink.enabled && form.directLink.url.trim(),
  ].filter(Boolean).length;

  return (
    <AdminLayout activeSection="ads">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Title & Master Switch */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-black text-base shadow-xs">
                AS
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
                  Adsterra বিজ্ঞাপন নিয়ন্ত্রণ প্যানেল (Adsterra Ads Manager)
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Adsterra Popunder, Social Bar, 728x90, 300x250 ব্যানার এবং Direct Link কোড এখানে বসিয়ে সরাসরি ইনকাম শুরু করুন।
                </p>
              </div>
            </div>
          </div>

          {/* Master Global Switch */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-white dark:bg-neutral-900 p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="text-right">
              <span className="text-xs font-bold block text-neutral-900 dark:text-white">
                {form.enabled ? 'সব অ্যাড চালু (Ads Active)' : 'সব অ্যাড বন্ধ (Ads Off)'}
              </span>
              <span className="text-[10px] text-neutral-500">
                {activeCount} টি জোন সক্রিয়
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleMaster}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                form.enabled ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  form.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* How to use Adsterra Guide Box (in Bengali & English) */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-neutral-900/10 border border-amber-500/20 dark:border-amber-500/30 text-xs text-neutral-700 dark:text-neutral-300 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <HelpCircle className="w-4 h-4" />
            <span>Adsterra থেকে কীভাবে কোড এনে এখানে বসাবেন? (Easy 4-Step Guide)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px] leading-relaxed">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800/80">
              <strong className="block text-neutral-900 dark:text-white mb-1 font-bold">১. একাউন্টে যান</strong>
              <a href="https://adsterra.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline font-semibold inline-flex items-center gap-1">
                Adsterra.com <ExternalLink className="w-3 h-3" />
              </a>-এ Publisher হিসেবে লগইন করুন।
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800/80">
              <strong className="block text-neutral-900 dark:text-white mb-1 font-bold">২. ওয়েবসাইট যুক্ত করুন</strong>
              <span className="font-semibold">Websites</span> মেনুতে গিয়ে <span className="font-semibold">Add Website</span>-এ ক্লিক করে আপনার ডোমেনটি যুক্ত করুন।
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800/80">
              <strong className="block text-neutral-900 dark:text-white mb-1 font-bold">৩. Ad Unit সিলেক্ট করুন</strong>
              Popunder, Social Bar, 728x90 বা 300x250 সিলেক্ট করে <span className="font-semibold">Get Code</span> কপি করুন।
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800/80">
              <strong className="block text-neutral-900 dark:text-white mb-1 font-bold">৪. পেস্ট ও সেভ করুন</strong>
              নিচের নির্ধারিত ঘরে কোডটি পেস্ট করে Toggle অন করুন এবং <span className="font-semibold">Save Settings</span> চাপুন।
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-neutral-900/80 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-750'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>কোড এডিটর (Ad Codes Editor)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-750'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>বিজ্ঞাপন লাইভ প্রিভিউ (Live Preview)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-850 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="টেস্ট বা ডেমো কোড লোড করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ডেমো কোড লোড করুন</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="সমস্ত কোড মুছে দিন"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>সব মুছুন</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>সেটিংস সেভ করুন (Save)</span>
            </button>
          </div>
        </div>

        {activeTab === 'preview' ? (
          /* Live Preview Mode */
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-500" />
                  বিজ্ঞাপন প্রিভিউ উইন্ডো (Live Ad Sandbox Preview)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  নিচে সিলেক্ট করে দেখে নিন আপনার দেওয়া Adsterra কোড সাইটে কীভাবে প্রদর্শিত হবে।
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewUnit('topBanner')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    previewUnit === 'topBanner' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Top 728x90
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewUnit('inFeedBanner')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    previewUnit === 'inFeedBanner' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  In-Feed 300x250
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewUnit('modalBanner')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    previewUnit === 'modalBanner' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Modal Banner
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewUnit('footerBanner')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    previewUnit === 'footerBanner' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Footer 728x90
                </button>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 min-h-[220px] flex flex-col items-center justify-center">
              <AdsterraBanner unitKey={previewUnit} />
            </div>
          </div>
        ) : (
          /* Adsterra Code Editor Form */
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 1. Popunder & Social Bar (Global High-CPM Scripts) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <Globe className="w-4 h-4 text-indigo-500" />
                ১. গ্লোবাল হাই-সিপিএম স্ক্রিপ্ট (Popunder &amp; Social Bar)
              </div>

              {/* Popunder Unit */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">
                        Adsterra Popunder (OnClick Full Page Script)
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        ভিজিটর সাইটের যেকোনো জায়গায় প্রথম ক্লিক করলেই নতুন ট্যাবে উচ্চ-আয়ের বিজ্ঞাপন খুলবে।
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      {form.popunder.enabled ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                    </span>
                    <input
                      type="checkbox"
                      checked={form.popunder.enabled}
                      onChange={(e) => setForm({
                        ...form,
                        popunder: { ...form.popunder, enabled: e.target.checked }
                      })}
                      className="rounded text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                    />
                  </label>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={form.popunder.code}
                    onChange={(e) => setForm({
                      ...form,
                      popunder: { ...form.popunder, code: e.target.value }
                    })}
                    placeholder="Adsterra থেকে প্রাপ্ত Popunder <script> কোডটি এখানে পেস্ট করুন..."
                    className="w-full font-mono text-xs p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Social Bar Unit */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-purple-500" />
                        Adsterra Social Bar (In-Page Push Notifications)
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        মোবাইল এবং কম্পিউটারে চ্যাট বা পুশ নোটিফিকেশনের মতো ভেসে থাকবে (সর্বোচ্চ CTR ও ইনকাম)।
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      {form.socialBar.enabled ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                    </span>
                    <input
                      type="checkbox"
                      checked={form.socialBar.enabled}
                      onChange={(e) => setForm({
                        ...form,
                        socialBar: { ...form.socialBar, enabled: e.target.checked }
                      })}
                      className="rounded text-purple-600 focus:ring-purple-500/20 w-4 h-4"
                    />
                  </label>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={form.socialBar.code}
                    onChange={(e) => setForm({
                      ...form,
                      socialBar: { ...form.socialBar, code: e.target.value }
                    })}
                    placeholder="Adsterra থেকে প্রাপ্ত Social Bar <script> কোডটি এখানে পেস্ট করুন..."
                    className="w-full font-mono text-xs p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Banner Units (728x90, 300x250, Native) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <Layout className="w-4 h-4 text-amber-500" />
                ২. ব্যানার জোন (Banners: 728x90, 300x250, Native &amp; Modal)
              </div>

              {/* Top / Header 728x90 Banner */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-extrabold">728x90 / 468x60</span>
                      টপ হেডার ব্যানার (Top Header Leaderboard Banner)
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      ওয়েবসাইটের একদম উপরে ন্যাভবারের ঠিক উপরে প্রদর্শিত হবে।
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      {form.topBanner.enabled ? 'চালু (Active)' : 'বন্ধ (Inactive)'}
                    </span>
                    <input
                      type="checkbox"
                      checked={form.topBanner.enabled}
                      onChange={(e) => setForm({
                        ...form,
                        topBanner: { ...form.topBanner, enabled: e.target.checked }
                      })}
                      className="rounded text-amber-500 focus:ring-amber-500/20 w-4 h-4"
                    />
                  </label>
                </div>

                <textarea
                  rows={3}
                  value={form.topBanner.code}
                  onChange={(e) => setForm({
                    ...form,
                    topBanner: { ...form.topBanner, code: e.target.value }
                  })}
                  placeholder="Adsterra 728x90 invocation code পেস্ট করুন..."
                  className="w-full font-mono text-xs p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* In-Feed 300x250 / Native Grid Banner */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5 text-purple-500" />
                      ইন-ফিড ব্যানার (In-Feed 300x250 or Native Banner inside Prompts Grid)
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      প্রম্পট কার্ডগুলোর মাঝে স্বাভাবিক কার্ডের মতো মিশে থাকবে (Explore এবং Category পেজে)।
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="text-[11px]">পজিশন:</span>
                      <select
                        value={form.inFeedBanner.position || 4}
                        onChange={(e) => setForm({
                          ...form,
                          inFeedBanner: { ...form.inFeedBanner, position: Number(e.target.value) }
                        })}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold"
                      >
                        <option value={3}>৩য় কার্ডের পর</option>
                        <option value={4}>৪র্থ কার্ডের পর</option>
                        <option value={6}>৬ষ্ঠ কার্ডের পর</option>
                        <option value={8}>৮ম কার্ডের পর</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        {form.inFeedBanner.enabled ? 'চালু' : 'বন্ধ'}
                      </span>
                      <input
                        type="checkbox"
                        checked={form.inFeedBanner.enabled}
                        onChange={(e) => setForm({
                          ...form,
                          inFeedBanner: { ...form.inFeedBanner, enabled: e.target.checked }
                        })}
                        className="rounded text-purple-500 focus:ring-purple-500/20 w-4 h-4"
                      />
                    </label>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={form.inFeedBanner.code}
                  onChange={(e) => setForm({
                    ...form,
                    inFeedBanner: { ...form.inFeedBanner, code: e.target.value }
                  })}
                  placeholder="Adsterra 300x250 or Native Banner code পেস্ট করুন..."
                  className="w-full font-mono text-xs p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Prompt Modal Banner */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-emerald-500" />
                      প্রম্পট ডিটেইলস পপআপ ব্যানার (Prompt Modal Banner 300x250 / 468x60)
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      ব্যবহারকারী যখন কোনো প্রম্পটে ক্লিক করে পপআপ ওপেন করবে, তখন প্রম্পট বক্সের নিচে বিজ্ঞাপনটি দেখাবে।
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      {form.modalBanner.enabled ? 'চালু' : 'বন্ধ'}
                    </span>
                    <input
                      type="checkbox"
                      checked={form.modalBanner.enabled}
                      onChange={(e) => setForm({
                        ...form,
                        modalBanner: { ...form.modalBanner, enabled: e.target.checked }
                      })}
                      className="rounded text-emerald-500 focus:ring-emerald-500/20 w-4 h-4"
                    />
                  </label>
                </div>

                <textarea
                  rows={3}
                  value={form.modalBanner.code}
                  onChange={(e) => setForm({
                    ...form,
                    modalBanner: { ...form.modalBanner, code: e.target.value }
                  })}
                  placeholder="Adsterra Modal Banner code পেস্ট করুন..."
                  className="w-full font-mono text-xs p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Footer Banner */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-600 dark:text-pink-400 font-mono text-[10px] font-extrabold">728x90 / Native</span>
                      ফুটার ব্যানার (Footer Banner above 2026 Copyright)
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      পেজের সবার নিচে ফুটারের ঠিক উপরে প্রদর্শিত হবে।
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      {form.footerBanner.enabled ? 'চালু' : 'বন্ধ'}
                    </span>
                    <input
                      type="checkbox"
                      checked={form.footerBanner.enabled}
                      onChange={(e) => setForm({
                        ...form,
                        footerBanner: { ...form.footerBanner, enabled: e.target.checked }
                      })}
                      className="rounded text-pink-500 focus:ring-pink-500/20 w-4 h-4"
                    />
                  </label>
                </div>

                <textarea
                  rows={3}
                  value={form.footerBanner.code}
                  onChange={(e) => setForm({
                    ...form,
                    footerBanner: { ...form.footerBanner, code: e.target.value }
                  })}
                  placeholder="Adsterra 728x90 or Native Footer Banner code পেস্ট করুন..."
                  className="w-full font-mono text-xs p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Sticky Floating Bottom Bar */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">
                      স্টিকি ফ্লোটিং বটম ব্যানার (Sticky Bottom Bar 320x50 / 728x90)
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      ভিজিটর যখনই স্ক্রল করুক না কেন স্ক্রিনের নিচে ভেসে থাকবে (Dismiss 'X' বাটন সহ)।
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                      {form.stickyBottom.enabled ? 'চালু' : 'বন্ধ'}
                    </span>
                    <input
                      type="checkbox"
                      checked={form.stickyBottom.enabled}
                      onChange={(e) => setForm({
                        ...form,
                        stickyBottom: { ...form.stickyBottom, enabled: e.target.checked }
                      })}
                      className="rounded text-indigo-500 focus:ring-indigo-500/20 w-4 h-4"
                    />
                  </label>
                </div>

                <textarea
                  rows={2}
                  value={form.stickyBottom.code}
                  onChange={(e) => setForm({
                    ...form,
                    stickyBottom: { ...form.stickyBottom, code: e.target.value }
                  })}
                  placeholder="Sticky Bottom Adsterra code পেস্ট করুন..."
                  className="w-full font-mono text-xs p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 3. Direct Link (Smartlink) System */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  <LinkIcon className="w-4 h-4 text-emerald-500" />
                  ৩. ডিরেক্ট লিংক / স্মার্টলিংক (Adsterra Direct Link Monetization)
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    {form.directLink.enabled ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={form.directLink.enabled}
                    onChange={(e) => setForm({
                      ...form,
                      directLink: { ...form.directLink, enabled: e.target.checked }
                    })}
                    className="rounded text-emerald-500 focus:ring-emerald-500/20 w-4 h-4"
                  />
                </label>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Adsterra ডিরেক্ট লিংক (Direct Link) এমন একটি বিশেষ লিংক যেখানে ভিজিটর ক্লিক করলেই স্বয়ংক্রিয়ভাবে সর্বোচ্চ কনভার্টিং অফারে নিয়ে যায়।
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Adsterra Direct Link URL
                  </label>
                  <input
                    type="url"
                    value={form.directLink.url}
                    onChange={(e) => setForm({
                      ...form,
                      directLink: { ...form.directLink, url: e.target.value }
                    })}
                    placeholder="https://www.profitablecpmrate.com/xxxxxxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Adsterra ড্যাশবোর্ড থেকে "Direct Links" &gt; "Create Direct Link" এ ক্লিক করে পাওয়া লিংকটি এখানে দিন।
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.directLink.openOnCopyPrompt}
                      onChange={(e) => setForm({
                        ...form,
                        directLink: { ...form.directLink, openOnCopyPrompt: e.target.checked }
                      })}
                      className="rounded text-emerald-500 focus:ring-emerald-500/20 mt-0.5"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-neutral-900 dark:text-white block">
                        প্রম্পট কপি করার সময় লিংক খুলুন (Trigger on Copy)
                      </span>
                      <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">
                        ভিজিটর কোনো প্রম্পট কপি করলে ক্লিপবোর্ডে কপি হয়ে নতুন ট্যাবে স্মার্টলিংক ওপেন হবে।
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.directLink.showNavButton}
                      onChange={(e) => setForm({
                        ...form,
                        directLink: { ...form.directLink, showNavButton: e.target.checked }
                      })}
                      className="rounded text-emerald-500 focus:ring-emerald-500/20 mt-0.5"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-neutral-900 dark:text-white block">
                        টপ বারে স্পন্সর বাটন দেখান (Sponsored Nav Button)
                      </span>
                      <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">
                        ন্যাভবারে আকর্ষণীয় স্পেশাল অফার বাটন যুক্ত করবে যাতে ব্যবহারকারীরা ক্লিক করতে উৎসাহিত হয়।
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="pt-2 flex items-center justify-between bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <span className="text-xs text-neutral-500">
                পরিবর্তন করার পর অবশ্যই নিচের বাটনে ক্লিক করে সেভ করুন।
              </span>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Adsterra Settings (সেভ করুন)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};
