import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Film, 
  Sparkles, 
  Package, 
  Camera, 
  Wand2, 
  Box, 
  Tv, 
  Building2, 
  Trees, 
  Layers, 
  Share2, 
  Compass,
  ArrowRight,
  Tag
} from 'lucide-react';
import { CategoryItem } from '../types';
import { getCategories } from '../supabase/categoryService';
import { getPrompts } from '../supabase/promptService';
import { useRouter } from '../context/RouterContext';

// Map icon names to Lucide components
const iconMap: Record<string, React.ElementType> = {
  User,
  Film,
  Sparkles,
  Package,
  Camera,
  Wand2,
  Box,
  Tv,
  Building2,
  Trees,
  Layers,
  Share2,
  Compass,
  Tag
};

export const CategoriesPage: React.FC = () => {
  const { navigate } = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [promptCounts, setPromptCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [cats, prompts] = await Promise.all([
          getCategories(),
          getPrompts(false)
        ]);
        
        // Count prompts per category
        const counts: Record<string, number> = {};
        prompts.forEach(p => {
          const key = p.category.toLowerCase();
          counts[key] = (counts[key] || 0) + 1;
        });

        setCategories(cats);
        setPromptCounts(counts);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCategoryClick = (slug: string) => {
    navigate(`/explore?category=${slug}`);
  };

  return (
    <div className="w-full min-h-screen max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Curated Disciplines</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Browse Categories
        </h1>
        <p className="text-sm text-neutral-400 mt-1 max-w-xl">
          Explore specialized AI styles, from cinematic anamorphic frames to 3D isometric diorama prompts.
        </p>
      </div>

      {/* Grid of 3D Glass Category Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-3xl bg-neutral-900/60 border border-neutral-800 animate-pulse p-5 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-2xl bg-neutral-800" />
              <div className="space-y-2">
                <div className="h-5 bg-neutral-800 rounded w-1/2" />
                <div className="h-3 bg-neutral-800/60 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {categories.map((cat, idx) => {
            const IconComponent = iconMap[cat.icon] || Tag;
            const count = promptCounts[cat.name.toLowerCase()] || promptCounts[cat.slug.toLowerCase()] || 0;

            return (
              <motion.div
                key={cat.id || cat.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                whileHover={{ y: -5, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(cat.slug)}
                className="group relative cursor-pointer rounded-3xl p-6 bg-gradient-to-br from-neutral-900/90 via-neutral-900/60 to-neutral-950/80 border border-neutral-800/80 hover:border-indigo-500/50 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Ambient Background Light */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 rounded-full bg-indigo-600/10 blur-2xl group-hover:bg-indigo-600/25 transition-colors pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Icon container */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:border-indigo-400 transition-all shadow-md">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {/* Prompt Count Pill */}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800/90 text-neutral-300 border border-neutral-700/60 group-hover:border-neutral-600">
                      {count} {count === 1 ? 'Prompt' : 'Prompts'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description || `Browse high-definition ${cat.name} image generation prompts.`}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-neutral-400 group-hover:text-white transition-colors">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-indigo-400" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
