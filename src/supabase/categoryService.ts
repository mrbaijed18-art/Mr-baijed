import { getSupabaseClient, isSupabaseConfigured } from './client';
import { CategoryItem } from '../types';
import { INITIAL_CATEGORIES } from '../data/samplePrompts';

const LOCAL_CATEGORIES_KEY = 'promptverse_categories_data';

export function getLocalCategories(): CategoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export function saveLocalCategories(categories: CategoryItem[]): void {
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories locally', err);
  }
}

function mapRowToCategory(row: any): CategoryItem {
  return {
    id: row.id,
    name: row.name || 'Category',
    slug: row.slug || '',
    description: row.description || '',
    icon: row.icon || 'Sparkles',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    count: Number(row.count) || 0,
  };
}

function mapCategoryToRow(item: CategoryItem): any {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    icon: item.icon,
    count: item.count || 0,
    created_at: item.createdAt || new Date().toISOString(),
  };
}

/**
 * Fetch all categories from Supabase
 */
export async function getCategories(): Promise<CategoryItem[]> {
  const client = getSupabaseClient();
  if (!isSupabaseConfigured() || !client) {
    return getLocalCategories();
  }

  try {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return getLocalCategories();
    }

    return data.map(mapRowToCategory);
  } catch {
    return getLocalCategories();
  }
}

/**
 * Add / Create Category
 */
export async function addCategory(category: Omit<CategoryItem, 'id' | 'createdAt'>): Promise<CategoryItem> {
  const local = getLocalCategories();
  const id = `cat_${Date.now()}`;
  const newCat: CategoryItem = {
    ...category,
    id,
    createdAt: new Date().toISOString(),
    count: 0,
  };

  saveLocalCategories([...local, newCat]);

  const client = getSupabaseClient();
  if (isSupabaseConfigured() && client) {
    try {
      const row = mapCategoryToRow(newCat);
      await client.from('categories').upsert(row);
    } catch (err) {
      console.error('Supabase addCategory error:', err);
    }
  }

  return newCat;
}

export const createCategory = addCategory;

/**
 * Update Category
 */
export async function updateCategory(id: string, updates: Partial<CategoryItem>): Promise<CategoryItem> {
  const local = getLocalCategories();
  const index = local.findIndex(c => c.id === id);
  let updatedCat: CategoryItem;

  if (index >= 0) {
    updatedCat = { ...local[index], ...updates };
    local[index] = updatedCat;
    saveLocalCategories(local);
  } else {
    updatedCat = { id, name: 'Updated', slug: 'updated', description: '', icon: 'Sparkles', createdAt: new Date().toISOString(), ...updates };
  }

  const client = getSupabaseClient();
  if (isSupabaseConfigured() && client) {
    try {
      const rowUpdates: any = {};
      if (updates.name !== undefined) rowUpdates.name = updates.name;
      if (updates.slug !== undefined) rowUpdates.slug = updates.slug;
      if (updates.description !== undefined) rowUpdates.description = updates.description;
      if (updates.icon !== undefined) rowUpdates.icon = updates.icon;
      if (updates.count !== undefined) rowUpdates.count = updates.count;

      await client.from('categories').update(rowUpdates).eq('id', id);
    } catch (err) {
      console.error('Supabase updateCategory error:', err);
    }
  }

  return updatedCat;
}

/**
 * Delete Category
 */
export async function deleteCategory(id: string): Promise<void> {
  const local = getLocalCategories().filter(c => c.id !== id);
  saveLocalCategories(local);

  const client = getSupabaseClient();
  if (isSupabaseConfigured() && client) {
    try {
      await client.from('categories').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase deleteCategory error:', err);
    }
  }
}

/**
 * Seed sample categories into Supabase
 */
export async function seedSupabaseCategories(): Promise<{ count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!isSupabaseConfigured() || !client) {
    return { count: 0, error: 'Supabase access key or URL is not configured.' };
  }

  try {
    const rows = INITIAL_CATEGORIES.map(mapCategoryToRow);
    const { error } = await client.from('categories').upsert(rows, { onConflict: 'id' });
    if (error) {
      return { count: 0, error: error.message };
    }
    return { count: rows.length };
  } catch (err: any) {
    return { count: 0, error: err?.message || 'Failed to seed categories' };
  }
}
