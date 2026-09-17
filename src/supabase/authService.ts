import { getSupabaseClient, isSupabaseConfigured } from './client';
import { UserProfile } from '../types';
import { siteConfig } from '../config/siteConfig';

const LOCAL_USER_KEY = 'promptverse_current_user';

export function isEmailConfiguredAdmin(email?: string | null): boolean {
  if (!email) return false;
  const adminEmails = siteConfig.ADMIN_CONFIGURATION.adminEmails || [];
  return adminEmails.some(e => e.toLowerCase().trim() === email.toLowerCase().trim());
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

  if (isSupabaseConfigured() && client) {
    const { data, error } = await client.auth.signInWithPassword({
      email: trimmedEmail,
      password: pass,
    });

    if (error) {
      throw new Error(error.message);
    }

    const user = data.user;
    let role: 'admin' | 'user' = (user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin') ? 'admin' : 'user';
    let displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Creator';
    let photoURL = user.user_metadata?.avatar_url || null;

    try {
      const { data: pData } = await client.from('profiles').select('role, display_name, photo_url').eq('id', user.id).maybeSingle();
      if (pData?.role === 'admin') role = 'admin';
      if (pData?.display_name) displayName = pData.display_name;
      if (pData?.photo_url) photoURL = pData.photo_url;
    } catch {
      // Continue with session data
    }

    if (isEmailConfiguredAdmin(user.email)) {
      role = 'admin';
    }

    const profile: UserProfile = {
      uid: user.id,
      email: user.email || trimmedEmail,
      displayName,
      photoURL,
      role,
      createdAt: user.created_at || new Date().toISOString(),
    };

    setLocalStoredUser(profile);
    return profile;
  }

  throw new Error('Database authentication service is currently not connected.');
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

  throw new Error('Database authentication service is currently not connected.');
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
        let role: 'admin' | 'user' = (u.user_metadata?.role === 'admin' || u.app_metadata?.role === 'admin') ? 'admin' : 'user';
        let displayName = u.user_metadata?.display_name || u.email?.split('@')[0] || 'Creator';
        let photoURL = u.user_metadata?.avatar_url || null;

        try {
          const { data: pData } = await client.from('profiles').select('role, display_name, photo_url').eq('id', u.id).maybeSingle();
          if (pData?.role === 'admin') role = 'admin';
          if (pData?.display_name) displayName = pData.display_name;
          if (pData?.photo_url) photoURL = pData.photo_url;
        } catch {
          // ignore
        }

        if (isEmailConfiguredAdmin(u.email)) {
          role = 'admin';
        }

        const prof: UserProfile = {
          uid: u.id,
          email: u.email || null,
          displayName,
          photoURL,
          role,
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
