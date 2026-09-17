import React, { useState } from 'react';
import { useAdsterraUnit } from '../utils/adsterraManager';
import { AdsterraBanner } from './AdsterraBanner';
import { X } from 'lucide-react';

export const AdsterraStickyBar: React.FC = () => {
  const { isActive } = useAdsterraUnit('stickyBottom');
  const [closed, setClosed] = useState(false);

  if (!isActive || closed) {
    return null;
  }

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 shadow-2xl transition-all">
      <div className="max-w-4xl mx-auto px-4 py-1 relative flex items-center justify-center">
        <button
          onClick={() => setClosed(true)}
          className="absolute right-2 top-2 p-1 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          title="Close ad"
          aria-label="Close ad"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <AdsterraBanner unitKey="stickyBottom" minHeight={60} badge="" className="my-0" />
      </div>
    </div>
  );
};
