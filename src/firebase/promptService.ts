import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { PromptItem, FilterState } from '../types';
import { SAMPLE_PROMPTS } from '../data/samplePrompts';
import { handleFirestoreError, OperationType } from './errorUtils';

const LOCAL_STORAGE_KEY = 'promptverse_prompts_data';

// Local storage helper for immediate functionality
function getLocalPrompts(): PromptItem[] {
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

function saveLocalPrompts(prompts: PromptItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prompts));
  } catch (err) {
    console.error('Failed to save to local storage', err);
  }
}

/**
 * Fetch all published prompts for public explore, or all prompts for admin
 */
export async function getPrompts(isAdminView = false): Promise<PromptItem[]> {
  if (!isFirebaseConfigured() || !db) {
    const local = getLocalPrompts();
    if (isAdminView) {
      return local;
    }
    return local.filter(p => p.status === 'published');
  }

  const path = 'prompts';
  try {
    const promptsRef = collection(db, path);
    const q = isAdminView 
      ? query(promptsRef, orderBy('createdAt', 'desc'))
      : query(promptsRef, where('status', '==', 'published'), orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    if (snapshot.empty && !isAdminView) {
      // Seed if Firestore collection is fresh
      return SAMPLE_PROMPTS;
    }
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as PromptItem));
  } catch (error) {
    console.warn('Firestore fetch failed, falling back to local dataset:', error);
    const local = getLocalPrompts();
    return isAdminView ? local : local.filter(p => p.status === 'published');
  }
}

/**
 * Get a single prompt by ID
 */
export async function getPromptById(id: string): Promise<PromptItem | null> {
  if (!isFirebaseConfigured() || !db) {
    const local = getLocalPrompts();
    return local.find(p => p.id === id) || null;
  }

  const path = `prompts/${id}`;
  try {
    const docRef = doc(db, 'prompts', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as PromptItem;
    }
    const fallback = getLocalPrompts().find(p => p.id === id);
    return fallback || null;
  } catch (error) {
    console.warn(`Firestore getDoc for ${id} failed:`, error);
    return getLocalPrompts().find(p => p.id === id) || null;
  }
}

/**
 * Create a new prompt (Admin only)
 */
export async function createPrompt(promptData: Omit<PromptItem, 'id' | 'likes' | 'copies' | 'views' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<PromptItem> {
  const newId = promptData.id || `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newPrompt: PromptItem = {
    ...promptData,
    id: newId,
    likes: 0,
    copies: 0,
    views: 0,
    createdAt: now,
    updatedAt: now
  };

  // Update local copy
  const local = getLocalPrompts();
  local.unshift(newPrompt);
  saveLocalPrompts(local);

  if (isFirebaseConfigured() && db) {
    const path = `prompts/${newId}`;
    try {
      await setDoc(doc(db, 'prompts', newId), {
        ...newPrompt,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  return newPrompt;
}

/**
 * Update an existing prompt (Admin only)
 */
export async function updatePrompt(id: string, updates: Partial<PromptItem>): Promise<PromptItem> {
  const now = new Date().toISOString();
  const local = getLocalPrompts();
  const index = local.findIndex(p => p.id === id);

  if (index !== -1) {
    local[index] = { ...local[index], ...updates, updatedAt: now };
    saveLocalPrompts(local);
  }

  if (isFirebaseConfigured() && db) {
    const path = `prompts/${id}`;
    try {
      await updateDoc(doc(db, 'prompts', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  const updated = local[index] || (await getPromptById(id));
  if (!updated) throw new Error(`Prompt ${id} not found`);
  return updated;
}

/**
 * Delete a prompt (Admin only)
 */
export async function deletePrompt(id: string): Promise<boolean> {
  const local = getLocalPrompts().filter(p => p.id !== id);
  saveLocalPrompts(local);

  if (isFirebaseConfigured() && db) {
    const path = `prompts/${id}`;
    try {
      await deleteDoc(doc(db, 'prompts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  return true;
}

/**
 * Increment copies count for prompt
 */
export async function incrementPromptCopies(id: string): Promise<void> {
  const local = getLocalPrompts();
  const target = local.find(p => p.id === id);
  if (target) {
    target.copies = (target.copies || 0) + 1;
    saveLocalPrompts(local);
  }

  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'prompts', id), {
        copies: increment(1)
      });
    } catch {
      // Non-blocking for analytics
    }
  }
}

/**
 * Increment views count for prompt
 */
export async function incrementPromptViews(id: string): Promise<void> {
  const local = getLocalPrompts();
  const target = local.find(p => p.id === id);
  if (target) {
    target.views = (target.views || 0) + 1;
    saveLocalPrompts(local);
  }

  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'prompts', id), {
        views: increment(1)
      });
    } catch {
      // Non-blocking
    }
  }
}

/**
 * Client-side filter and search utility
 */
export function filterPrompts(prompts: PromptItem[], filters: FilterState): PromptItem[] {
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
