import React from 'react';
import { AdsterraBanner } from './AdsterraBanner';
import { AdsterraStickyBar } from './AdsterraStickyBar';

export type AdSlotPlacement = 'header_top' | 'in_feed_grid' | 'prompt_modal' | 'footer_banner' | 'sticky_bottom';

interface AdSlotProps {
  placement: AdSlotPlacement;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
  if (placement === 'header_top') {
    return (
      <aside aria-label="Top Advertisement" className={`w-full bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800/80 transition-all ${className}`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1">
          <AdsterraBanner unitKey="topBanner" minHeight={90} badge="SPONSORED ADSTERRA" className="my-1" />
        </div>
      </aside>
    );
  }

  if (placement === 'in_feed_grid') {
    return (
      <div className={`col-span-1 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm p-3 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-amber-500/30 ${className}`}>
        <AdsterraBanner unitKey="inFeedBanner" minHeight={260} badge="SPONSORED" className="my-1 w-full" />
      </div>
    );
  }

  if (placement === 'prompt_modal') {
    return (
      <div className={`w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2 sm:p-3 my-3 text-center ${className}`}>
        <AdsterraBanner unitKey="modalBanner" minHeight={120} badge="SPONSORED AD" className="my-1" />
      </div>
    );
  }

  if (placement === 'footer_banner') {
    return (
      <aside aria-label="Footer Advertisement" className={`w-full bg-neutral-50/50 dark:bg-neutral-950/50 border-t border-neutral-200 dark:border-neutral-800/80 py-2 transition-all ${className}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <AdsterraBanner unitKey="footerBanner" minHeight={90} badge="ADVERTISEMENT" className="my-1" />
        </div>
      </aside>
    );
  }

  if (placement === 'sticky_bottom') {
    return <AdsterraStickyBar />;
  }

  return null;
};
