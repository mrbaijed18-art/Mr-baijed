import { getSupabaseClient, isSupabaseConfigured } from './client';
import { UserProfile } from '../types';
import { siteConfig } from '../config/siteConfig';

const LOCAL_USER_KEY = 'promptverse_current_user';

export const EXCLUSIVE_ADMIN_EMAIL = 'mrbaijed18@gmail.com';

export function isEmailConfiguredAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === EXCLUSIVE_ADMIN_EMAIL;
}

function getLocalStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalStoredUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  } catch {
    // Ignored
  }
}

/**
 * Sign in with email and password
 */
export async function signInEmail(email: string, pass: string): Promise<UserProfile> {
  const client = getSupabaseClient();
  const trimmedEmail = email.trim().toLowerCase();
  const isAdminAttempt = trimmedEmail === EXCLUSIVE_ADMIN_EMAIL;

  if (isSupabaseConfigured() && client) {
    const { data, error } = await client.auth.signInWithPassword({
      email: trimmedEmail,
      password: pass,
    });

    if (error) {
      throw new Error(error.message);
    }

    const user = data.user;
    const isVerifiedAdmin = user.email?.toLowerCase().trim() === EXCLUSIVE_ADMIN_EMAIL;

    const profile: UserProfile = {
      uid: user.id,
      email: user.email || trimmedEmail,
      displayName: user.user_metadata?.display_name || (isVerifiedAdmin ? 'Admin Baijed' : user.email?.split('@')[0]) || 'Creator',
      photoURL: user.user_metadata?.avatar_url || null,
      role: isVerifiedAdmin ? 'admin' : 'user',
      createdAt: user.created_at || new Date().toISOString(),
    };

    setLocalStoredUser(profile);
    return profile;
  }

  // Local fallback if Supabase is offline - ONLY allows admin if exact password matches
  if (isAdminAttempt) {
    if (pass !== 'baijed@12345') {
      throw new Error('Invalid email or password.');
    }
    const adminUser: UserProfile = {
      uid: 'admin_baijed_id',
      email: EXCLUSIVE_ADMIN_EMAIL,
      displayName: 'Admin Baijed',
      photoURL: null,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    setLocalStoredUser(adminUser);
    return adminUser;
  }

  const fallbackUser: UserProfile = {
    uid: `user_${Date.now()}`,
    email: trimmedEmail,
    displayName: trimmedEmail.split('@')[0],
    photoURL: null,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  setLocalStoredUser(fallbackUser);
  return fallbackUser;
}

/**
 * Sign up with email and password
 */
export async function signUpEmail(email: string, pass: string, name?: string): Promise<UserProfile> {
  const client = getSupabaseClient();
  const isAdmin = isEmailConfiguredAdmin(email);

  if (isSupabaseConfigured() && client) {
    const { data, error } = await client.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          display_name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const user = data.user;
    const profile: UserProfile = {
      uid: user?.id || `user_${Date.now()}`,
      email: user?.email || email,
      displayName: name || user?.email?.split('@')[0] || 'New Creator',
      photoURL: null,
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };

    setLocalStoredUser(profile);
    return profile;
  }

  // Local fallback
  const fallbackUser: UserProfile = {
    uid: `user_${Date.now()}`,
    email,
    displayName: name || email.split('@')[0],
    photoURL: null,
    role: isAdmin ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };

  setLocalStoredUser(fallbackUser);
  return fallbackUser;
}

/**
 * Sign in with Google (OAuth)
 */
export async function signInGoogle(): Promise<UserProfile> {
  const client = getSupabaseClient();

  if (isSupabaseConfigured() && client) {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.url) {
      window.location.href = data.url;
      return {
        uid: 'pending_oauth',
        email: '',
        displayName: 'Connecting...',
        photoURL: null,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
    }
  }

  throw new Error('Google OAuth is not configured or unavailable.');
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  const client = getSupabaseClient();
  if (isSupabaseConfigured() && client) {
    try {
      await client.auth.signOut();
    } catch {
      // Ignored
    }
  }
  setLocalStoredUser(null);
}

/**
 * Listen to auth state changes
 */
export function onAuthChanged(
  callback: (user: any | null, profile: UserProfile | null) => void
): () => void {
  const client = getSupabaseClient();

  if (isSupabaseConfigured() && client) {
    const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const isAdmin = isEmailConfiguredAdmin(u.email);
        const prof: UserProfile = {
          uid: u.id,
          email: u.email || null,
          displayName: u.user_metadata?.display_name || u.email?.split('@')[0] || 'Creator',
          photoURL: u.user_metadata?.avatar_url || null,
          role: isAdmin ? 'admin' : 'user',
          createdAt: u.created_at || new Date().toISOString(),
        };
        setLocalStoredUser(prof);
        callback(u, prof);
      } else {
        const local = getLocalStoredUser();
        callback(local ? { id: local.uid, email: local.email } : null, local);
      }
    });

    // Initial check
    const local = getLocalStoredUser();
    callback(local ? { id: local.uid, email: local.email } : null, local);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }

  // Local fallback subscription
  const local = getLocalStoredUser();
  callback(local ? { id: local.uid, email: local.email } : null, local);
  return () => {};
}
