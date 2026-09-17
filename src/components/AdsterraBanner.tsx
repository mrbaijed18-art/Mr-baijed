import React, { useEffect, useRef, useState } from 'react';
import { useAdsterraUnit } from '../utils/adsterraManager';
import { AdsterraConfig } from '../types';

interface AdsterraBannerProps {
  unitKey: keyof Omit<AdsterraConfig, 'enabled' | 'directLink'>;
  className?: string;
  minHeight?: number | string;
  badge?: string;
}

export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({
  unitKey,
  className = '',
  minHeight = '90px',
  badge = 'ADVERTISEMENT',
}) => {
  const { isActive, code } = useAdsterraUnit(unitKey);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeId] = useState(() => `adsterra-frame-${unitKey}-${Math.random().toString(36).substring(2, 7)}`);

  useEffect(() => {
    if (!isActive || !code || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // Create an isolated iframe to execute Adsterra's script tags safely without clashing atOptions
    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.title = `Adsterra Ad ${unitKey}`;
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.background = 'transparent';
    iframe.scrolling = 'no';
    iframe.setAttribute('frameBorder', '0');

    // Dynamic height based on unit type
    if (unitKey === 'topBanner' || unitKey === 'footerBanner') {
      iframe.style.height = '100px';
    } else if (unitKey === 'inFeedBanner') {
      iframe.style.height = '280px';
    } else if (unitKey === 'modalBanner') {
      iframe.style.height = '140px';
    } else if (unitKey === 'stickyBottom') {
      iframe.style.height = '70px';
    } else {
      iframe.style.height = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
    }

    container.appendChild(iframe);

    // Write content into iframe
    try {
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <base target="_blank">
              <style>
                *, *:before, *:after { box-sizing: border-box; }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: transparent;
                  overflow: hidden;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
              </style>
            </head>
            <body>
              ${code}
            </body>
          </html>
        `);
        doc.close();

        // Auto-adjust iframe height to content if needed
        iframe.onload = () => {
          try {
            const body = iframe.contentWindow?.document.body;
            if (body && body.scrollHeight > 30) {
              iframe.style.height = `${Math.min(body.scrollHeight + 10, 400)}px`;
            }
          } catch {
            // cross-origin restriction safeguard
          }
        };
      }
    } catch (err) {
      console.error(`Failed to inject Adsterra code for ${unitKey}:`, err);
    }
  }, [isActive, code, unitKey, iframeId, minHeight]);

  if (!isActive || !code) {
    return null;
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center my-3 relative overflow-hidden ${className}`}>
      {badge && (
        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1 select-none">
          {badge}
        </span>
      )}
      <div
        ref={containerRef}
        className="w-full flex items-center justify-center overflow-hidden transition-all duration-300"
      />
    </div>
  );
};
