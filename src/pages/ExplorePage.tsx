import React, { useState, useEffect, useMemo } from 'react';
import { PromptItem, CategoryItem, FilterState } from '../types';
import { getPrompts, filterPrompts } from '../supabase/promptService';
import { getCategories } from '../supabase/categoryService';
import { PromptGrid } from '../components/PromptGrid';
import { FilterBar } from '../components/FilterBar';
import { PromptDetailsModal } from '../components/PromptDetailsModal';
import { Sparkles, TrendingUp, Compass } from 'lucide-react';
import { useRouter } from '../context/RouterContext';

interface ExplorePageProps {
  initialSort?: FilterState['sort'];
  initialCategory?: string;
  initialType?: FilterState['type'];
  pageTitle?: string;
  pageSubtitle?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  initialSort = 'latest',
  initialCategory = 'all',
  initialType = 'all',
  pageTitle,
  pageSubtitle
}) => {
  const { queryParams } = useRouter();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);

  // Category or search param from URL if present
  const urlCategory = queryParams.get('category') || initialCategory;
  const urlSearch = queryParams.get('q') || '';

  const [filters, setFilters] = useState<FilterState>({
    search: urlSearch,
    category: urlCategory,
    type: initialType,
    sort: initialSort
  });

  // Sync state if props change (e.g. navigation from /popular to /latest)
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      sort: initialSort,
      category: urlCategory,
      type: initialType
    }));
  }, [initialSort, urlCategory, initialType]);

  // Load prompts & categories
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [promptsData, categoriesData] = await Promise.all([
          getPrompts(false),
          getCategories()
        ]);
        if (isMounted) {
          setPrompts(promptsData);
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error('Error fetching explore data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  // Filtered dataset
  const filteredPrompts = useMemo(() => {
    return filterPrompts(prompts, filters);
  }, [prompts, filters]);

  // Related prompts for detail modal
  const relatedPrompts = useMemo(() => {
    if (!selectedPrompt) return [];
    return prompts.filter(p => p.category === selectedPrompt.category && p.id !== selectedPrompt.id);
  }, [prompts, selectedPrompt]);

  return (
    <div className="w-full min-h-screen max-w-7xl mx-auto px-3 sm:px-6 py-4 md:py-8">
      {/* Hero / Page Headline if set */}
      {pageTitle ? (
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">{pageSubtitle}</p>
          )}
        </div>
      ) : (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Prompt Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Explore AI Prompts
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Copy complete high-performing prompts for Midjourney, Flux & DALL-E.
            </p>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Showing {filteredPrompts.length} prompts
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        totalCount={filteredPrompts.length}
      />

      {/* Responsive Grid */}
      <PromptGrid
        prompts={filteredPrompts}
        loading={loading}
        onOpenDetails={(p) => setSelectedPrompt(p)}
        onResetFilters={() => {
          setFilters({
            search: '',
            category: 'all',
            type: 'all',
            sort: 'latest'
          });
        }}
      />

      {/* Detail Modal */}
      {selectedPrompt && (
        <PromptDetailsModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          relatedPrompts={relatedPrompts}
          onSelectPrompt={(p) => setSelectedPrompt(p)}
        />
      )}
    </div>
  );
};
