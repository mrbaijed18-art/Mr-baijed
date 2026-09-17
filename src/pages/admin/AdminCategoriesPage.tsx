import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { CategoryItem } from '../../types';
import { getCategories, createCategory, deleteCategory } from '../../supabase/categoryService';
import { useToast } from '../../context/ToastContext';
import { Layers, Plus, Trash2, Tag, ArrowRight } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
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
      showToast(`Category "${newCat.name}" added!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to create category', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (window.confirm(`Delete category "${catName}"?`)) {
      try {
        await deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
        showToast(`Category "${catName}" deleted`, 'info');
      } catch {
        showToast('Failed to delete category', 'error');
      }
    }
  };

  return (
    <AdminLayout activeSection="categories">
      <div className="space-y-8 max-w-5xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manage Categories
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Organize the prompt catalog into visual disciplines and taxonomy tags.
          </p>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleCreate} className="p-5 sm:p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Add New Category
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Cyberpunk"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="cyberpunk"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Icon Identifier
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Sparkles">Sparkles</option>
                <option value="Film">Film</option>
                <option value="User">User</option>
                <option value="Camera">Camera</option>
                <option value="Box">Box / 3D</option>
                <option value="Tv">TV / Anime</option>
                <option value="Building2">Architecture</option>
                <option value="Trees">Nature</option>
                <option value="Tag">Generic Tag</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this genre or visual style..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{adding ? 'Adding...' : 'Create Category'}</span>
          </button>
        </form>

        {/* Categories List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id || cat.slug}
              className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between gap-3 group hover:border-neutral-700 transition-all"
            >
              <div className="min-w-0">
                <h3 className="font-bold text-white text-sm truncate">{cat.name}</h3>
                <p className="text-[11px] text-neutral-500 font-mono">/{cat.slug}</p>
                {cat.description && (
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{cat.description}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-2 rounded-lg hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition-colors shrink-0"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
