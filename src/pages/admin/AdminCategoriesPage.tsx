import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { CategoryItem } from '../../types';
import { getCategories, createCategory, deleteCategory } from '../../supabase/categoryService';
import { getPrompts } from '../../supabase/promptService';
import { useToast } from '../../context/ToastContext';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Tag, 
  ArrowRight, 
  Search, 
  Sparkles, 
  Film, 
  User, 
  Camera, 
  Box, 
  Tv, 
  Building2, 
  Trees, 
  CheckCircle2,
  FolderTree
} from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'Sparkles', label: 'Sparkles / AI Art' },
  { value: 'Film', label: 'Film / Cinematic' },
  { value: 'User', label: 'User / Portrait' },
  { value: 'Camera', label: 'Camera / Photography' },
  { value: 'Box', label: 'Box / 3D & Isometric' },
  { value: 'Tv', label: 'TV / Anime & Toon' },
  { value: 'Building2', label: 'Architecture & Cities' },
  { value: 'Trees', label: 'Nature & Landscape' },
  { value: 'Tag', label: 'General / Abstract' },
];

export const AdminCategoriesPage: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // New Category Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [cats, prompts] = await Promise.all([
        getCategories(),
        getPrompts(true).catch(() => [])
      ]);
      setCategories(cats);
      
      const counts: Record<string, number> = {};
      prompts.forEach(p => {
        counts[p.category] = (counts[p.category] || 0) + 1;
      });
      setCategoryCounts(counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    try {
      const newCat = await createCategory({
        name: name.trim(),
        slug: (slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
        description: description.trim(),
        icon: icon || 'Tag'
      });
      setCategories(prev => [...prev, newCat]);
      setName('');
      setSlug('');
      setDescription('');
      showToast(`Category "${newCat.name}" added successfully!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to create category', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    const count = categoryCounts[catName] || 0;
    const warning = count > 0 
      ? `Delete category "${catName}"? Notice: There are ${count} prompts currently tagged with this category.`
      : `Delete category "${catName}"? This action cannot be undone.`;
      
    if (window.confirm(warning)) {
      try {
        await deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
        showToast(`Category "${catName}" deleted`, 'info');
      } catch {
        showToast('Failed to delete category', 'error');
      }
    }
  };

  const filtered = categories.filter(c => 
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout activeSection="categories">
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                TAXONOMY ENGINE
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500">{categories.length} Active Categories</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Categories &amp; Genres
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Organize visual disciplines and genres for browsing on the public discovery hub.
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Form: Add New Category */}
          <div className="lg:col-span-1">
            <form 
              onSubmit={handleCreate} 
              className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs space-y-4 sticky top-20"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                  Add New Category
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Cyberpunk Noir"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="cyberpunk-noir"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Icon Representation
                </label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of prompts under this style..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Live Preview Tag */}
              {name.trim() && (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                    Live Preview Badge:
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20">
                    <Tag className="w-3 h-3" />
                    <span>{name}</span>
                    <span className="text-[10px] opacity-70 font-mono">/{slug}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={adding}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{adding ? 'Adding...' : 'Create Category'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Existing Categories Grid */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Search Filter Strip */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter categories by name or slug..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <span className="text-xs text-neutral-500 font-semibold whitespace-nowrap">
                {filtered.length} of {categories.length}
              </span>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((cat) => {
                const promptCount = categoryCounts[cat.name] || 0;
                return (
                  <div
                    key={cat.id || cat.slug}
                    className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xs shrink-0">
                            <Tag className="w-3.5 h-3.5" />
                          </div>
                          <h3 className="font-bold text-neutral-900 dark:text-white text-xs truncate">
                            {cat.name}
                          </h3>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-500 shrink-0">
                          {promptCount} prompts
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 font-mono mb-1.5">
                        /{cat.slug}
                      </p>

                      {cat.description ? (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-400 italic">
                          No description provided
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400">
                        ID: {cat.id ? cat.id.slice(0, 8) : 'sys'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="col-span-full p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 text-center text-neutral-400 text-xs">
                  No categories match your search.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

