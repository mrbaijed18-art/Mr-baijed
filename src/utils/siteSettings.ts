import { useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { siteConfig } from '../config/siteConfig';

const SETTINGS_STORAGE_KEY = 'promptverse_site_settings';
const SETTINGS_CHANGED_EVENT = 'promptverse_settings_changed';

// Elegant default AI badge (SVG encoded as data URI) for the 2026 copyright notice
export const DEFAULT_FOOTER_BADGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%236366f1"/><stop offset="50%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(%23g)"/><path d="M24 10l3.8 8.4L36 22.2l-6 6.8 1.4 9-7.4-4.5-7.4 4.5 1.4-9-6-6.8 8.2-3.8z" fill="%23ffffff"/><circle cx="24" cy="24" r="3" fill="%23ffd700"/></svg>';

export const FOOTER_BADGE_PRESETS = [
  {
    id: 'ai-star',
    name: 'AI Nebula Star (Default)',
    dataUri: DEFAULT_FOOTER_BADGE,
    alt: 'PromptVerse Verified 2026'
  },
  {
    id: 'emerald-shield',
    name: 'Verified Shield (Emerald)',
    dataUri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><defs><linearGradient id="es" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23059669"/><stop offset="100%" stop-color="%2310b981"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(%23es)"/><path d="M24 11s-9 3-9 12c0 9 9 14 9 14s9-5 9-14c0-9-9-12-9-12z" fill="%23ffffff" opacity="0.3"/><path d="M20 23.5l3 3 6-6" fill="none" stroke="%23ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    alt: 'Verified 2026 Security'
  },
  {
    id: 'gold-crown',
    name: 'VIP Creator Crown (Gold)',
    dataUri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><defs><linearGradient id="gc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23fbbf24"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(%23gc)"/><path d="M14 31l2-13 5 6 3-9 3 9 5-6 2 13z" fill="%23ffffff"/><circle cx="16" cy="17" r="1.5" fill="%23ffffff"/><circle cx="24" cy="14" r="1.5" fill="%23ffffff"/><circle cx="32" cy="17" r="1.5" fill="%23ffffff"/></svg>',
    alt: 'VIP Official 2026'
  },
  {
    id: 'cyan-cyber',
    name: 'Cyber Core (Electric Cyan)',
    dataUri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><defs><linearGradient id="cc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(%23cc)"/><polygon points="24,12 34,18 34,30 24,36 14,30 14,18" fill="none" stroke="%23ffffff" stroke-width="2.5"/><circle cx="24" cy="24" r="4" fill="%23ffffff"/></svg>',
    alt: 'Cyber 2026 Engine'
  }
];

export const defaultSettings: SiteSettings = {
  siteName: siteConfig.SITE_NAME,
  siteDescription: siteConfig.SITE_DESCRIPTION,
  enableConfetti: true,
  showFooterBadge: true,
  footerBadgeImage: DEFAULT_FOOTER_BADGE,
  footerBadgeAlt: 'PromptVerse Verified 2026',
  footerBadgeLink: '',
};

export function getSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return {
      ...defaultSettings,
      ...parsed,
    };
  } catch {
    return defaultSettings;
  }
}

export function updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...settings,
  };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT, { detail: updated }));
  } catch (err) {
    console.error('Failed to save site settings:', err);
  }
  return updated;
}

export function resetSiteSettings(): SiteSettings {
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT, { detail: defaultSettings }));
  } catch (err) {
    console.error('Failed to reset site settings:', err);
  }
  return defaultSettings;
}

export function useSiteSettings(): [SiteSettings, (newSettings: Partial<SiteSettings>) => void] {
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getSiteSettings());
    };
    window.addEventListener(SETTINGS_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(SETTINGS_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return [settings, updateSiteSettings];
}
