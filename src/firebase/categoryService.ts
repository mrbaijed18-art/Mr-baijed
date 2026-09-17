import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { CategoryItem } from '../types';
import { INITIAL_CATEGORIES } from '../data/samplePrompts';
import { handleFirestoreError, OperationType } from './errorUtils';

const LOCAL_CATEGORIES_KEY = 'promptverse_categories_data';

function getLocalCategories(): CategoryItem[] {
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

function saveLocalCategories(categories: CategoryItem[]): void {
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories locally', err);
  }
}

export async function getCategories(): Promise<CategoryItem[]> {
  if (!isFirebaseConfigured() || !db) {
    return getLocalCategories();
  }

  const path = 'categories';
  try {
    const collRef = collection(db, path);
    const q = query(collRef, orderBy('name', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      return getLocalCategories();
    }
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as CategoryItem));
  } catch {
    return getLocalCategories();
  }
}

export async function addCategory(categoryData: Omit<CategoryItem, 'id' | 'createdAt'>): Promise<CategoryItem> {
  const newId = `cat_${categoryData.slug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const newCat: CategoryItem = {
    ...categoryData,
    id: newId,
    createdAt: new Date().toISOString()
  };

  const local = getLocalCategories();
  local.push(newCat);
  saveLocalCategories(local);

  if (isFirebaseConfigured() && db) {
    const path = `categories/${newId}`;
    try {
      await setDoc(doc(db, 'categories', newId), newCat);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  return newCat;
}

export const createCategory = addCategory;

export async function updateCategory(id: string, updates: Partial<CategoryItem>): Promise<CategoryItem> {
  const local = getLocalCategories();
  const index = local.findIndex(c => c.id === id);
  if (index !== -1) {
    local[index] = { ...local[index], ...updates };
    saveLocalCategories(local);
  }

  if (isFirebaseConfigured() && db) {
    const path = `categories/${id}`;
    try {
      await updateDoc(doc(db, 'categories', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  return local[index] || { id, name: '', slug: '', description: '', icon: 'Tag', createdAt: '' };
}

export async function deleteCategory(id: string): Promise<boolean> {
  const local = getLocalCategories().filter(c => c.id !== id);
  saveLocalCategories(local);

  if (isFirebaseConfigured() && db) {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  return true;
}
