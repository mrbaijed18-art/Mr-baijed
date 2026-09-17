import { useState, useEffect } from 'react';
import { AdsterraConfig } from '../types';

const ADSTERRA_STORAGE_KEY = 'promptverse_adsterra_config';
const ADSTERRA_CHANGED_EVENT = 'promptverse_adsterra_changed';

export const DEFAULT_ADSTERRA_CONFIG: AdsterraConfig = {
  enabled: true,
  popunder: {
    enabled: false,
    code: '',
  },
  socialBar: {
    enabled: false,
    code: '',
  },
  topBanner: {
    enabled: true,
    code: `<!-- Adsterra 728x90 Top Leaderboard -->
<div style="text-align:center; padding: 10px 16px; background: rgba(99,102,241,0.06); border: 1px dashed rgba(99,102,241,0.35); border-radius: 12px; max-width: 728px; margin: 0 auto;">
  <div style="font-size: 11px; font-weight: 700; color: #6366f1; letter-spacing: 0.05em; text-transform: uppercase;">ADSTERRA 728x90 BANNER ZONE</div>
  <div style="font-size: 11px; color: #71717a; margin-top: 2px;">এডমিন প্যানেল &gt; Adsterra Ads থেকে আপনার Adsterra 728x90 কোডটি এখানে পেস্ট করুন।</div>
</div>`,
  },
  inFeedBanner: {
    enabled: true,
    code: `<!-- Adsterra 300x250 In-Feed Native Banner -->
<div style="height: 100%; min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; background: rgba(168,85,247,0.05); border: 1px dashed rgba(168,85,247,0.35); border-radius: 16px;">
  <span style="display:inline-block; padding: 3px 8px; border-radius: 6px; background: rgba(168,85,247,0.15); color: #a855f7; font-size: 10px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px;">ADSTERRA 300x250 / NATIVE</span>
  <p style="font-size: 12px; font-weight: 600; color: #52525b; margin: 0;">In-Feed Adsterra Grid Slot</p>
  <p style="font-size: 10px; color: #a1a1aa; margin-top: 4px;">Paste Adsterra 300x250 code in Admin Panel</p>
</div>`,
    position: 4,
  },
  modalBanner: {
    enabled: true,
    code: `<!-- Adsterra 300x250 / 468x60 Modal Banner -->
<div style="text-align: center; padding: 12px; background: rgba(16,185,129,0.06); border: 1px dashed rgba(16,185,129,0.35); border-radius: 12px; margin: 8px 0;">
  <span style="font-size: 10px; font-weight: 700; color: #10b981; text-transform: uppercase;">ADSTERRA MODAL BANNER</span>
  <p style="font-size: 11px; color: #71717a; margin: 4px 0 0;">Paste Adsterra Modal / Prompt Details Ad Code Here</p>
</div>`,
  },
  footerBanner: {
    enabled: true,
    code: `<!-- Adsterra 728x90 Footer Banner -->
<div style="text-align:center; padding: 10px 16px; background: rgba(236,72,153,0.06); border: 1px dashed rgba(236,72,153,0.35); border-radius: 12px; max-width: 728px; margin: 0 auto;">
  <div style="font-size: 11px; font-weight: 700; color: #ec4899; text-transform: uppercase;">ADSTERRA FOOTER BANNER</div>
  <div style="font-size: 11px; color: #71717a; margin-top: 2px;">Paste your Adsterra Footer Banner Code Here</div>
</div>`,
  },
  stickyBottom: {
    enabled: false,
    code: '',
  },
  directLink: {
    enabled: false,
    url: '',
    openOnCopyPrompt: false,
    showNavButton: false,
    navButtonText: 'Special Offers',
  },
};

export function getAdsterraConfig(): AdsterraConfig {
  if (typeof window === 'undefined') return DEFAULT_ADSTERRA_CONFIG;
  try {
    const raw = localStorage.getItem(ADSTERRA_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADSTERRA_STORAGE_KEY, JSON.stringify(DEFAULT_ADSTERRA_CONFIG));
      return DEFAULT_ADSTERRA_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ADSTERRA_CONFIG,
      ...parsed,
      popunder: { ...DEFAULT_ADSTERRA_CONFIG.popunder, ...(parsed.popunder || {}) },
      socialBar: { ...DEFAULT_ADSTERRA_CONFIG.socialBar, ...(parsed.socialBar || {}) },
      topBanner: { ...DEFAULT_ADSTERRA_CONFIG.topBanner, ...(parsed.topBanner || {}) },
      inFeedBanner: { ...DEFAULT_ADSTERRA_CONFIG.inFeedBanner, ...(parsed.inFeedBanner || {}) },
      modalBanner: { ...DEFAULT_ADSTERRA_CONFIG.modalBanner, ...(parsed.modalBanner || {}) },
      footerBanner: { ...DEFAULT_ADSTERRA_CONFIG.footerBanner, ...(parsed.footerBanner || {}) },
      stickyBottom: { ...DEFAULT_ADSTERRA_CONFIG.stickyBottom, ...(parsed.stickyBottom || {}) },
      directLink: { ...DEFAULT_ADSTERRA_CONFIG.directLink, ...(parsed.directLink || {}) },
    };
  } catch {
    return DEFAULT_ADSTERRA_CONFIG;
  }
}

export function saveAdsterraConfig(config: AdsterraConfig): void {
  try {
    localStorage.setItem(ADSTERRA_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(ADSTERRA_CHANGED_EVENT, { detail: config }));
  } catch (err) {
    console.error('Failed to save Adsterra configuration:', err);
  }
}

export function resetAdsterraConfig(): AdsterraConfig {
  saveAdsterraConfig(DEFAULT_ADSTERRA_CONFIG);
  return DEFAULT_ADSTERRA_CONFIG;
}

export function useAdsterra(): [AdsterraConfig, (newConfig: AdsterraConfig) => void] {
  const [config, setConfig] = useState<AdsterraConfig>(getAdsterraConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getAdsterraConfig());
    };

    window.addEventListener(ADSTERRA_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(ADSTERRA_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updateConfig = (newConfig: AdsterraConfig) => {
    saveAdsterraConfig(newConfig);
    setConfig(newConfig);
  };

  return [config, updateConfig];
}

/**
 * Hook to check if a specific Adsterra unit is active and get its code
 */
export function useAdsterraUnit(unitKey: keyof Omit<AdsterraConfig, 'enabled' | 'directLink'>) {
  const [config] = useAdsterra();
  
  if (!config.enabled) {
    return { isActive: false, code: '' };
  }

  const unit = config[unitKey];
  if (!unit || !unit.enabled || !unit.code || !unit.code.trim()) {
    return { isActive: false, code: '' };
  }

  return {
    isActive: true,
    code: unit.code,
    ...(unitKey === 'inFeedBanner' ? { position: (unit as any).position || 4 } : {}),
  };
}

/**
 * Trigger Adsterra Direct Link if enabled for copy action
 */
export function handleDirectLinkOnCopy(): void {
  try {
    const config = getAdsterraConfig();
    if (config.enabled && config.directLink.enabled && config.directLink.openOnCopyPrompt && config.directLink.url) {
      window.open(config.directLink.url, '_blank');
    }
  } catch (e) {
    // Non-blocking
  }
}
