import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { 
  onAuthChanged, 
  signInEmail, 
  signUpEmail, 
  signInGoogle, 
  signOutUser,
  isEmailConfiguredAdmin 
} from '../supabase/authService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthChanged((currentUser, userProfile) => {
      setUser(currentUser);
      setProfile(userProfile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = Boolean(
    profile?.role === 'admin' ||
    (profile?.email && isEmailConfiguredAdmin(profile.email))
  );

  const loginWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
    try {
      const prof = await signInEmail(email, pass);
      setProfile(prof);
      showToast(`Welcome back, ${prof.displayName || 'Creator'}!`, 'success');
      return prof;
    } catch (err: any) {
      showToast(err?.message || 'Login failed. Please check your credentials.', 'error');
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string): Promise<UserProfile> => {
    try {
      const prof = await signUpEmail(email, pass, name);
      setProfile(prof);
      showToast('Account created successfully!', 'success');
      return prof;
    } catch (err: any) {
      showToast(err?.message || 'Registration failed.', 'error');
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const prof = await signInGoogle();
      setProfile(prof);
      showToast(`Signed in as ${prof.displayName}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Google sign-in was cancelled or failed.', 'error');
      throw err;
    }
  };

  const logout = async () => {
    await signOutUser();
    setUser(null);
    setProfile(null);
    showToast('Signed out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
