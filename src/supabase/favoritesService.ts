import { getSupabaseClient, isSupabaseConfigured } from './client';
import { PromptItem } from '../types';
import { getPrompts } from './promptService';

const LOCAL_FAVORITES_PREFIX = 'promptverse_favs_';

function getLocalFavs(userId: string): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_FAVORITES_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFavs(userId: string, favs: string[]): void {
  try {
    localStorage.setItem(LOCAL_FAVORITES_PREFIX + userId, JSON.stringify(favs));
  } catch (err) {
    console.error('Failed to save favorites locally', err);
  }
}

/**
 * Get user bookmarked prompt IDs from Supabase
 */
export async function getUserFavorites(userId: string): Promise<string[]> {
  if (!userId) return [];

  const client = getSupabaseClient();
  if (!isSupabaseConfigured() || !client) {
    return getLocalFavs(userId);
  }

  try {
    const { data, error } = await client
      .from('bookmarks')
      .select('prompt_id')
      .eq('user_id', userId);

    if (error || !data) {
      return getLocalFavs(userId);
    }

    return data.map((d: any) => d.prompt_id);
  } catch {
    return getLocalFavs(userId);
  }
}

/**
 * Toggle bookmark/favorite for user
 */
export async function toggleFavorite(userId: string, promptId: string): Promise<boolean> {
  if (!userId) throw new Error('User must be signed in to save favorites');

  const currentLocal = getLocalFavs(userId);
  const isCurrentlyFav = currentLocal.includes(promptId);
  const nextFavs = isCurrentlyFav
    ? currentLocal.filter(id => id !== promptId)
    : [...currentLocal, promptId];

  saveLocalFavs(userId, nextFavs);

  const client = getSupabaseClient();
  if (isSupabaseConfigured() && client) {
    try {
      if (isCurrentlyFav) {
        await client
          .from('bookmarks')
          .delete()
          .match({ user_id: userId, prompt_id: promptId });
      } else {
        await client
          .from('bookmarks')
          .upsert({
            user_id: userId,
            prompt_id: promptId,
            created_at: new Date().toISOString(),
          }, { onConflict: 'user_id,prompt_id' });
      }
    } catch (err) {
      console.warn('Supabase toggleFavorite error:', err);
    }
  }

  return !isCurrentlyFav;
}

/**
 * Get full prompt items that user bookmarked
 */
export async function getFavoritePrompts(userId: string): Promise<PromptItem[]> {
  const favIds = await getUserFavorites(userId);
  if (!favIds.length) return [];

  const allPrompts = await getPrompts(true);
  return allPrompts.filter(p => favIds.includes(p.id));
}
