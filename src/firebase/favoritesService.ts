import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { PromptItem } from '../types';
import { getPrompts } from './promptService';
import { handleFirestoreError, OperationType } from './errorUtils';

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

export async function getUserFavorites(userId: string): Promise<string[]> {
  if (!userId) return [];

  if (!isFirebaseConfigured() || !db) {
    return getLocalFavs(userId);
  }

  const path = 'favorites';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().promptId as string);
  } catch (err) {
    console.warn('Could not fetch favorites from Firestore, using local cache', err);
    return getLocalFavs(userId);
  }
}

export async function toggleFavorite(userId: string, promptId: string): Promise<boolean> {
  if (!userId) throw new Error('User must be signed in to save favorites');

  const currentLocal = getLocalFavs(userId);
  const isCurrentlyFav = currentLocal.includes(promptId);
  const nextFavs = isCurrentlyFav
    ? currentLocal.filter(id => id !== promptId)
    : [...currentLocal, promptId];

  saveLocalFavs(userId, nextFavs);

  if (isFirebaseConfigured() && db) {
    const favoriteDocId = `${userId}_${promptId}`;
    const path = `favorites/${favoriteDocId}`;
    try {
      if (isCurrentlyFav) {
        await deleteDoc(doc(db, 'favorites', favoriteDocId));
      } else {
        await setDoc(doc(db, 'favorites', favoriteDocId), {
          userId,
          promptId,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, isCurrentlyFav ? OperationType.DELETE : OperationType.CREATE, path);
    }
  }

  return !isCurrentlyFav;
}

export async function getFavoritePrompts(userId: string): Promise<PromptItem[]> {
  const favIds = await getUserFavorites(userId);
  if (!favIds.length) return [];

  const allPrompts = await getPrompts(true);
  return allPrompts.filter(p => favIds.includes(p.id));
}
