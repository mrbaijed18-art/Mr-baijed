import { getSupabaseClient, isSupabaseConfigured } from './client';
import { PromptItem } from '../types';
import { SAMPLE_PROMPTS } from '../data/samplePrompts';

const LOCAL_STORAGE_KEY = 'promptverse_prompts_data';

// Helper to get local prompts fallback
export function getLocalPrompts(): PromptItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_PROMPTS));
      return SAMPLE_PROMPTS;
    }
    return JSON.parse(raw);
  } catch {
    return SAMPLE_PROMPTS;
  }
}

export function saveLocalPrompts(prompts: PromptItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prompts));
  } catch (err) {
    console.error('Failed to save to local storage', err);
  }
}

// Convert Supabase DB row to client PromptItem
function mapRowToPrompt(row: any): PromptItem {
  return {
    id: row.id,
    title: row.title || 'Untitled Prompt',
    prompt: row.prompt || '',
    imageUrl: row.image_url || row.imageUrl || '',
    category: row.category || 'General',
    tags: Array.isArray(row.tags) ? row.tags : [],
    isPremium: Boolean(row.is_premium ?? row.isPremium),
    isFeatured: Boolean(row.is_featured ?? row.isFeatured),
    status: row.status || 'published',
    likes: Number(row.likes) || 0,
    copies: Number(row.copies) || 0,
    views: Number(row.views) || 0,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    modelUsed: row.model_used || row.modelUsed || 'Midjourney v6',
    aspectRatio: row.aspect_ratio || row.aspectRatio || '1:1',
    authorName: row.author_name || row.authorName || 'PromptVerse AI',
  };
}

// Convert client PromptItem to Supabase DB row
function mapPromptToRow(item: PromptItem): any {
  return {
    id: item.id,
    title: item.title,
    prompt: item.prompt,
    image_url: item.imageUrl,
    category: item.category,
    tags: item.tags || [],
    is_premium: item.isPremium ?? false,
    is_featured: item.isFeatured ?? false,
    status: item.status || 'published',
    likes: item.likes ?? 0,
    copies: item.copies ?? 0,
    views: item.views ?? 0,
    model_used: item.modelUsed,
    aspect_ratio: item.aspectRatio,
    author_name: item.authorName,
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetch all prompts from Supabase with fallback to local storage
 */
export async function getPrompts(isAdminView = false): Promise<PromptItem[]> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured() || !client) {
    const local = getLocalPrompts();
    return isAdminView ? local : local.filter(p => p.status === 'published');
  }

  try {
    let query = client.from('prompts').select('*').order('created_at', { ascending: false });

    if (!isAdminView) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase getPrompts query error, using local fallback:', error.message);
      const local = getLocalPrompts();
      return isAdminView ? local : local.filter(p => p.status === 'published');
    }

    if (!data || data.length === 0) {
      // If table is newly created and empty, return local prompts and offer auto-seed
      return getLocalPrompts();
    }

    return data.map(mapRowToPrompt);
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return getLocalPrompts();
  }
}

/**
 * Get prompt by ID
 */
export async function getPromptById(id: string): Promise<PromptItem | null> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured() || !client) {
    const local = getLocalPrompts();
    return local.find(p => p.id === id) || null;
  }

  try {
    const { data, error } = await client.from('prompts').select('*').eq('id', id).single();

    if (error || !data) {
      const local = getLocalPrompts();
      return local.find(p => p.id === id) || null;
    }

    return mapRowToPrompt(data);
  } catch {
    const local = getLocalPrompts();
    return local.find(p => p.id === id) || null;
  }
}

/**
 * Create a new prompt in Supabase
 */
export async function createPrompt(prompt: PromptItem): Promise<PromptItem> {
  // Always update local cache first
  const local = getLocalPrompts();
  const existingIdx = local.findIndex(p => p.id === prompt.id);
  const updatedLocal = existingIdx >= 0 
    ? local.map(p => p.id === prompt.id ? prompt : p)
    : [prompt, ...local];
  saveLocalPrompts(updatedLocal);

  const client = getSupabaseClient();
  if (!isSupabaseConfigured() || !client) {
    return prompt;
  }

  try {
    const row = mapPromptToRow(prompt);
    const { data, error } = await client.from('prompts').upsert(row).select().single();

    if (error) {
      console.error('Failed to create prompt in Supabase:', error.message);
      return prompt;
    }

    return data ? mapRowToPrompt(data) : prompt;
  } catch (err) {
    console.error('Supabase createPrompt error:', err);
    return prompt;
  }
}

/**
 * Update prompt in Supabase
 */
export async function updatePrompt(id: string, updates: Partial<PromptItem>): Promise<PromptItem> {
  // Update local cache
  const local = getLocalPrompts();
  const index = local.findIndex(p => p.id === id);
  let updatedItem: PromptItem;

  if (index >= 0) {
    updatedItem = { ...local[index], ...updates, updatedAt: new Date().toISOString() };
    local[index] = updatedItem;
    saveLocalPrompts(local);
  } else {
    updatedItem = { ...(updates as any), id, updatedAt: new Date().toISOString() };
  }

  const client = getSupabaseClient();
  if (!isSupabaseConfigured() || !client) {
    return updatedItem;
  }

  try {
    const rowUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.prompt !== undefined) rowUpdates.prompt = updates.prompt;
    if (updates.imageUrl !== undefined) rowUpdates.image_url = updates.imageUrl;
    if (updates.category !== undefined) rowUpdates.category = updates.category;
    if (updates.tags !== undefined) rowUpdates.tags = updates.tags;
    if (updates.isPremium !== undefined) rowUpdates.is_premium = updates.isPremium;
    if (updates.isFeatured !== undefined) rowUpdates.is_featured = updates.isFeatured;
    if (updates.status !== undefined) rowUpdates.status = updates.status;
    if (updates.likes !== undefined) rowUpdates.likes = updates.likes;
    if (updates.copies !== undefined) rowUpdates.copies = updates.copies;
    if (updates.views !== undefined) rowUpdates.views = updates.views;
    if (updates.modelUsed !== undefined) rowUpdates.model_used = updates.modelUsed;
    if (updates.aspectRatio !== undefined) rowUpdates.aspect_ratio = updates.aspectRatio;
    if (updates.authorName !== undefined) rowUpdates.author_name = updates.authorName;

    const { data, error } = await client.from('prompts').update(rowUpdates).eq('id', id).select().single();
    if (error) {
      console.warn('Supabase updatePrompt error:', error.message);
      return updatedItem;
    }
    return data ? mapRowToPrompt(data) : updatedItem;
  } catch (err) {
    console.error('Supabase update error:', err);
    return updatedItem;
  }
}

/**
 * Delete prompt from Supabase
 */
export async function deletePrompt(id: string): Promise<void> {
  const local = getLocalPrompts().filter(p => p.id !== id);
  saveLocalPrompts(local);

  const client = getSupabaseClient();
  if (!isSupabaseConfigured() || !client) {
    return;
  }

  try {
    await client.from('prompts').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase delete error:', err);
  }
}

/**
 * Increment copy count
 */
export async function incrementPromptCopies(id: string): Promise<number> {
  const local = getLocalPrompts();
  const item = local.find(p => p.id === id);
  const newCopies = (item?.copies || 0) + 1;
  if (item) {
    item.copies = newCopies;
    saveLocalPrompts(local);
  }

  const client = getSupabaseClient();
  if (isSupabaseConfigured() && client) {
    try {
      await client.from('prompts').update({ copies: newCopies }).eq('id', id);
    } catch {
      // Ignored
    }
  }

  return newCopies;
}

/**
 * Toggle like for a prompt
 */
export async function togglePromptLike(id: string, isCurrentlyLiked: boolean): Promise<number> {
  const local = getLocalPrompts();
  const item = local.find(p => p.id === id);
  const diff = isCurrentlyLiked ? -1 : 1;
  const newLikes = Math.max(0, (item?.likes || 0) + diff);

  if (item) {
    item.likes = newLikes;
    saveLocalPrompts(local);
  }

  const client = getSupabaseClient();
  if (isSupabaseConfigured() && client) {
    try {
      await client.from('prompts').update({ likes: newLikes }).eq('id', id);
    } catch {
      // Ignored
    }
  }

  return newLikes;
}

/**
 * Increment views count for prompt
 */
export async function incrementPromptViews(id: string): Promise<number> {
  const local = getLocalPrompts();
  const target = local.find(p => p.id === id);
  const newViews = (target?.views || 0) + 1;
  if (target) {
    target.views = newViews;
    saveLocalPrompts(local);
  }

  const client = getSupabaseClient();
  if (isSupabaseConfigured() && client) {
    try {
      await client.from('prompts').update({ views: newViews }).eq('id', id);
    } catch {
      // Ignored
    }
  }

  return newViews;
}

/**
 * Client-side filter and search utility
 */
export function filterPrompts(prompts: PromptItem[], filters: import('../types').FilterState): PromptItem[] {
  let result = [...prompts];

  // Search filter across title, prompt text, category, and tags
  if (filters.search.trim()) {
    const queryTerm = filters.search.toLowerCase().trim();
    result = result.filter(p => 
      p.title.toLowerCase().includes(queryTerm) ||
      p.prompt.toLowerCase().includes(queryTerm) ||
      p.category.toLowerCase().includes(queryTerm) ||
      p.tags.some(t => t.toLowerCase().includes(queryTerm))
    );
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    result = result.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
  }

  // Type filter (Free vs Premium)
  if (filters.type === 'free') {
    result = result.filter(p => !p.isPremium);
  } else if (filters.type === 'premium') {
    result = result.filter(p => p.isPremium);
  }

  // Sort order
  if (filters.sort === 'popular') {
    result.sort((a, b) => (b.likes + b.copies) - (a.likes + a.copies));
  } else if (filters.sort === 'copies') {
    result.sort((a, b) => b.copies - a.copies);
  } else if (filters.sort === 'featured') {
    result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.likes - a.likes);
  } else {
    // latest
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return result;
}

/**
 * Seed Supabase table with sample prompt catalog
 */
export async function seedSupabasePrompts(): Promise<{ count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!isSupabaseConfigured() || !client) {
    return { count: 0, error: 'Supabase access key or URL is not configured.' };
  }

  try {
    const rows = SAMPLE_PROMPTS.map(mapPromptToRow);
    const { error } = await client.from('prompts').upsert(rows, { onConflict: 'id' });

    if (error) {
      return { count: 0, error: error.message };
    }

    return { count: rows.length };
  } catch (err: any) {
    return { count: 0, error: err?.message || 'Failed to seed sample prompts.' };
  }
}
