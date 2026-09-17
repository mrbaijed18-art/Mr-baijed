import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Sparkles, 
  Flame, 
  Clock, 
  Crown,
  Check
} from 'lucide-react';
import { FilterState, FilterType, SortOption, CategoryItem } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  categories: CategoryItem[];
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  categories,
  totalCount
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full mb-6">
      {/* Top Row: Search Input & Action Buttons */}
      <div className="flex items-center gap-2 md:gap-3 w-full">
        {/* Search Field */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search prompts by keyword, subject, style..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200/90 dark:border-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button (Triggers Drawer or Dropdown) */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-semibold backdrop-blur-md transition-all active:scale-95 shrink-0 ${
            filters.type !== 'all' || filters.sort !== 'latest' || (filters.category && filters.category !== 'all')
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-neutral-900/90 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200/90 dark:border-neutral-800 shadow-xs'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {(filters.type !== 'all' || filters.sort !== 'latest') && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Categories Horizontal Scroll Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar select-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => onFilterChange({ category: 'all' })}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
            filters.category === 'all' || !filters.category
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold shadow-xs'
              : 'bg-white dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs'
          }`}
        >
          All Prompts
        </button>

        {categories.map(cat => {
          const isSelected = filters.category.toLowerCase() === cat.slug.toLowerCase();
          return (
            <button
              key={cat.id || cat.slug}
              type="button"
              onClick={() => onFilterChange({ category: isSelected ? 'all' : cat.slug })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20 border-indigo-500'
                  : 'bg-white dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Filter Bottom Sheet / Modal */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">Filter Prompts</h3>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">({totalCount} available)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sort Section */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Sort By
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'latest', label: 'Latest First', icon: Clock },
                    { id: 'popular', label: 'Most Popular', icon: Flame },
                    { id: 'featured', label: 'Featured Picks', icon: Sparkles },
                    { id: 'copies', label: 'Most Copied', icon: Crown }
                  ].map((s) => {
                    const Icon = s.icon;
                    const active = filters.sort === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onFilterChange({ sort: s.id as SortOption })}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          active
                            ? 'bg-indigo-600/10 dark:bg-indigo-600/20 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-semibold'
                            : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{s.label}</span>
                        {active && <Check className="w-3.5 h-3.5 ml-auto text-indigo-500 dark:text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Access Type: All / Free / Premium */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Prompt Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'free', label: 'Free' },
                    { id: 'premium', label: 'PRO' }
                  ].map((t) => {
                    const active = filters.type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onFilterChange({ type: t.id as FilterType })}
                        className={`p-2.5 rounded-xl border text-xs text-center font-medium transition-all ${
                          active
                            ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-xs'
                            : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Grid in Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ category: 'all' })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      filters.category === 'all'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white font-semibold'
                        : 'bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-750 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => {
                    const active = filters.category.toLowerCase() === c.slug.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onFilterChange({ category: c.slug })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-500 font-semibold shadow-xs'
                            : 'bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-750 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange({
                      search: '',
                      category: 'all',
                      type: 'all',
                      sort: 'latest'
                    });
                    setIsDrawerOpen(false);
                  }}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:opacity-95 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
