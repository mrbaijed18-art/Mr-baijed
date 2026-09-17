import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from './config';
import { UserProfile } from '../types';
import { siteConfig } from '../config/siteConfig';

const LOCAL_USER_KEY = 'promptverse_current_user';

export function isEmailConfiguredAdmin(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return siteConfig.ADMIN_CONFIGURATION.adminEmails.some(
    adminEmail => adminEmail.toLowerCase().trim() === lower
  );
}

/**
 * Determine if a given UID or email holds admin privileges
 */
export async function verifyAdminStatus(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;
  
  if (isEmailConfiguredAdmin(user.email)) {
    return true;
  }

  if (isFirebaseConfigured() && db) {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (adminDoc.exists()) return true;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') return true;
    } catch {
      // Fallback
    }
  }

  return false;
}

/**
 * Create or sync user profile in Firestore
 */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const isAdmin = isEmailConfiguredAdmin(user.email);
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Prompt Creator',
    photoURL: user.photoURL,
    role: isAdmin ? 'admin' : 'user',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, profile);
      } else {
        const data = snap.data();
        profile.role = (data.role === 'admin' || isAdmin) ? 'admin' : 'user';
      }
    } catch (e) {
      console.warn('Could not sync user profile in Firestore', e);
    }
  }

  return profile;
}

/**
 * Subscribe to Auth state changes
 */
export function onAuthChanged(callback: (user: User | null, profile: UserProfile | null) => void): () => void {
  if (!isFirebaseConfigured() || !auth) {
    // Check local session
    try {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        callback(stored as unknown as User, stored as UserProfile);
      } else {
        callback(null, null);
      }
    } catch {
      callback(null, null);
    }
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await syncUserProfile(user);
      callback(user, profile);
    } else {
      callback(null, null);
    }
  });
}

/**
 * Sign in with Email and Password
 */
export async function signInEmail(email: string, pass: string): Promise<UserProfile> {
  if (!isFirebaseConfigured() || !auth) {
    // Local demo login
    const isAdmin = isEmailConfiguredAdmin(email);
    const profile: UserProfile = {
      uid: `user_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      photoURL: null,
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    return profile;
  }

  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return syncUserProfile(credential.user);
}

/**
 * Sign up with Email and Password
 */
export async function signUpEmail(email: string, pass: string, displayName?: string): Promise<UserProfile> {
  if (!isFirebaseConfigured() || !auth) {
    const isAdmin = isEmailConfiguredAdmin(email);
    const profile: UserProfile = {
      uid: `user_${Date.now()}`,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: null,
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    return profile;
  }

  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const profile = await syncUserProfile(credential.user);
  if (displayName) {
    profile.displayName = displayName;
  }
  return profile;
}

/**
 * Sign in with Google (Popup)
 */
export async function signInGoogle(): Promise<UserProfile> {
  if (!isFirebaseConfigured() || !auth || !googleProvider) {
    // Fallback demo Google user
    const profile: UserProfile = {
      uid: 'google_demo_user',
      email: 'creator@promptverse.ai',
      displayName: 'Alex Rivers',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'user',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    return profile;
  }

  const credential = await signInWithPopup(auth, googleProvider);
  return syncUserProfile(credential.user);
}

/**
 * Sign Out
 */
export async function signOutUser(): Promise<void> {
  localStorage.removeItem(LOCAL_USER_KEY);
  if (isFirebaseConfigured() && auth) {
    await fbSignOut(auth);
  }
}
