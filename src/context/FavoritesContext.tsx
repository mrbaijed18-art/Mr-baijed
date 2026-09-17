import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getUserFavorites, toggleFavorite as toggleFavoriteDb } from '../supabase/favoritesService';

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (promptId: string) => boolean;
  toggleFavorite: (promptId: string, promptTitle?: string) => Promise<boolean>;
  loading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshFavorites = useCallback(async () => {
    if (!profile?.uid) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const favs = await getUserFavorites(profile.uid);
      setFavorites(favs);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [profile?.uid]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback((promptId: string) => {
    return favorites.includes(promptId);
  }, [favorites]);

  const toggleFavorite = async (promptId: string, promptTitle?: string): Promise<boolean> => {
    if (!profile?.uid) {
      showToast("Please sign in to save prompts.", "warning", "Sign In Required");
      return false;
    }

    const wasFav = favorites.includes(promptId);
    // Optimistic UI update
    setFavorites(prev => wasFav ? prev.filter(id => id !== promptId) : [...prev, promptId]);

    try {
      const isNowFav = await toggleFavoriteDb(profile.uid, promptId);
      if (isNowFav) {
        showToast(promptTitle ? `Saved "${promptTitle}" to favorites` : "Added to favorites", "success");
      } else {
        showToast("Removed from favorites", "info");
      }
      return isNowFav;
    } catch {
      // Revert optimistic update on failure
      setFavorites(prev => wasFav ? [...prev, promptId] : prev.filter(id => id !== promptId));
      showToast("Could not update favorites. Please try again.", "error");
      return wasFav;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        loading,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
