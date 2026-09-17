import React from 'react';
import { Sparkles, Shield, Heart } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { Link } from '../context/RouterContext';
import { useSiteSettings } from '../utils/siteSettings';

export const Footer: React.FC = () => {
  const [settings] = useSiteSettings();

  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-950/90 text-neutral-600 dark:text-neutral-400 text-xs py-10 pb-24 md:pb-10 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Brand */}
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/10 dark:bg-indigo-600/30 border border-indigo-500/30 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-neutral-900 dark:text-white text-sm tracking-tight">{siteConfig.SITE_NAME}</span>
          </div>
          <p className="text-neutral-500 max-w-sm">
            {siteConfig.SITE_DESCRIPTION}
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-neutral-600 dark:text-neutral-400 font-medium">
          <Link to="/explore" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Explore</Link>
          <Link to="/categories" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Categories</Link>
          <Link to="/popular" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Popular</Link>
          <Link to="/latest" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Latest</Link>
          <Link to="/favorites" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Favorites</Link>
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center md:items-end gap-1.5 text-neutral-500">
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for AI artists &amp; designers
          </p>
          <div className="flex items-center gap-1.5 flex-wrap justify-center md:justify-end">
            {/* Small picture to the left of 2026 - customizable from Admin Panel */}
            {settings.showFooterBadge && settings.footerBadgeImage && (
              <span className="inline-flex items-center shrink-0">
                {settings.footerBadgeLink ? (
                  <a
                    href={settings.footerBadgeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    title={settings.footerBadgeAlt || "Verified Emblem"}
                  >
                    <img
                      src={settings.footerBadgeImage}
                      alt={settings.footerBadgeAlt || "2026 Emblem"}
                      className="w-5 h-5 object-contain rounded-md shadow-xs border border-neutral-200 dark:border-neutral-800"
                      referrerPolicy="no-referrer"
                    />
                  </a>
                ) : (
                  <img
                    src={settings.footerBadgeImage}
                    alt={settings.footerBadgeAlt || "2026 Emblem"}
                    className="w-5 h-5 object-contain rounded-md shadow-xs border border-neutral-200 dark:border-neutral-800"
                    referrerPolicy="no-referrer"
                  />
                )}
              </span>
            )}
            <span>© {new Date().getFullYear()} {siteConfig.SITE_NAME}. All rights reserved.</span>
            {/* Subtle, unannounced admin doorway - looks like normal punctuation dot */}
            <Link
              to="/admin/login"
              className="text-neutral-400 dark:text-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-500 transition-colors text-[10px] select-none"
              title="Portal"
            >
              •
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

