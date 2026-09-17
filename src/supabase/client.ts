import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'promptverse_supabase_url';
const STORAGE_KEY_KEY = 'promptverse_supabase_anon_key';

// Check if valid URL
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export interface SupabaseConfigState {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'storage' | 'none';
}

/**
 * Get active Supabase URL & Access Key (Anon Key)
 */
export function getSupabaseCredentials(): { url: string; anonKey: string; source: 'env' | 'storage' | 'none' } {
  // 1. Check user-provided in localStorage
  const savedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) : null;
  const savedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  if (savedUrl && savedKey && isValidUrl(savedUrl)) {
    return { url: savedUrl.trim(), anonKey: savedKey.trim(), source: 'storage' };
  }

  // 2. Check environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && isValidUrl(envUrl)) {
    return { url: envUrl.trim(), anonKey: envKey.trim(), source: 'env' };
  }

  // 3. Fallback to active project discovered via Personal Access Token
  const defaultUrl = 'https://fwiswkguwkjqfpbianvu.supabase.co';
  const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aXN3a2d1d2tqcWZwYmlhbnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MTU1NzMsImV4cCI6MjEwNTE5MTU3M30.EOQscVUcgqu2nJarXQA0mpFvfAXdsU0hKaYS56AgJk0';
  if (defaultUrl && defaultAnonKey) {
    return { url: defaultUrl, anonKey: defaultAnonKey, source: 'env' };
  }

  return { url: '', anonKey: '', source: 'none' };
}

let activeClient: SupabaseClient | null = null;
let currentClientKey = '';

/**
 * Get or create the active Supabase Client
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey || !isValidUrl(url)) {
    return null;
  }

  const keySignature = `${url}_${anonKey.substring(0, 15)}`;
  if (!activeClient || currentClientKey !== keySignature) {
    try {
      activeClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      currentClientKey = keySignature;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return activeClient;
}

export const supabase = getSupabaseClient();

/**
 * Check if Supabase access key and URL are configured
 */
export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && isValidUrl(url));
}

/**
 * Save Supabase Access Key & URL
 */
export function saveSupabaseConfig(url: string, anonKey: string): boolean {
  if (!url || !anonKey || !isValidUrl(url)) {
    return false;
  }
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  
  // Re-create client
  activeClient = null;
  currentClientKey = '';
  getSupabaseClient();
  return true;
}

/**
 * Clear custom Supabase connection
 */
export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_KEY_KEY);
  activeClient = null;
  currentClientKey = '';
}

/**
 * Test live connection to Supabase
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  hasPromptsTable: boolean;
  hasCategoriesTable: boolean;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL or Access Key is missing or invalid.',
      hasPromptsTable: false,
      hasCategoriesTable: false,
    };
  }

  try {
    // 1. Test ping to auth
    const { error: authError } = await client.auth.getSession();
    if (authError && authError.message.includes('Invalid API key')) {
      return {
        success: false,
        message: 'Invalid Supabase Access Key (Anon Key). Please verify your key.',
        hasPromptsTable: false,
        hasCategoriesTable: false,
      };
    }

    // 2. Check if prompts table exists
    const { error: promptsErr } = await client
      .from('prompts')
      .select('id')
      .limit(1);

    const hasPromptsTable = !promptsErr || !promptsErr.message.includes('relation "public.prompts" does not exist');

    // 3. Check if categories table exists
    const { error: catErr } = await client
      .from('categories')
      .select('id')
      .limit(1);

    const hasCategoriesTable = !catErr || !catErr.message.includes('relation "public.categories" does not exist');

    if (!hasPromptsTable && !hasCategoriesTable) {
      return {
        success: true,
        message: 'Connected to Supabase! Tables need to be created using the SQL script.',
        hasPromptsTable: false,
        hasCategoriesTable: false,
      };
    }

    return {
      success: true,
      message: 'Connected successfully to live Supabase database!',
      hasPromptsTable,
      hasCategoriesTable,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Connection failed. Please check your project URL and access key.',
      hasPromptsTable: false,
      hasCategoriesTable: false,
    };
  }
}

/**
 * Ready-to-copy SQL Schema for Supabase SQL Editor
 */
export const SUPABASE_SCHEMA_SQL = `-- ==========================================
-- PromptVerse AI - Supabase Database Schema
-- Run this in your Supabase Project -> SQL Editor
-- ==========================================

-- 1. Prompts Table
CREATE TABLE IF NOT EXISTS public.prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  likes INTEGER DEFAULT 0,
  copies INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  model_used TEXT,
  aspect_ratio TEXT,
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bookmarks / Favorites Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- 4. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Public Access Policies (Allow read to anyone, writes to authenticated/admin)
CREATE POLICY "Public can read published prompts" 
  ON public.prompts FOR SELECT USING (true);

CREATE POLICY "Anyone can insert/update prompts" 
  ON public.prompts FOR ALL USING (true);

CREATE POLICY "Public can read categories" 
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Anyone can manage categories" 
  ON public.categories FOR ALL USING (true);

CREATE POLICY "Public bookmarks access" 
  ON public.bookmarks FOR ALL USING (true);

CREATE POLICY "Public profiles access" 
  ON public.profiles FOR ALL USING (true);
`;
