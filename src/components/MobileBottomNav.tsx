import React from 'react';
import { Compass, Layers, Flame, Heart, User } from 'lucide-react';
import { useRouter, Link } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export const MobileBottomNav: React.FC = () => {
  const { currentPath } = useRouter();
  const { profile } = useAuth();
  const { favorites } = useFavorites();

  // Highlight rules
  const isExplore = currentPath === '/' || currentPath === '/explore';
  const isCategories = currentPath === '/categories';
  const isPopular = currentPath === '/popular';
  const isFavorites = currentPath === '/favorites';
  const isProfile = currentPath === '/profile' || currentPath === '/login';

  const items = [
    { label: 'Explore', path: '/explore', icon: Compass, active: isExplore },
    { label: 'Categories', path: '/categories', icon: Layers, active: isCategories },
    { label: 'Popular', path: '/popular', icon: Flame, active: isPopular },
    { 
      label: 'Favorites', 
      path: '/favorites', 
      icon: Heart, 
      active: isFavorites,
      badge: favorites.length > 0 ? favorites.length : undefined
    },
    { 
      label: profile ? 'Profile' : 'Sign In', 
      path: profile ? '/profile' : '/login', 
      icon: User, 
      active: isProfile 
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800/80 pb-safe">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-14 h-full py-1 transition-all active:scale-90 select-none ${
                item.active ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {/* Active glow effect */}
              {item.active && (
                <span className="absolute top-1 w-6 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm shadow-indigo-500" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${item.active ? 'scale-110 text-indigo-400' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-1 font-medium ${item.active ? 'font-bold text-neutral-100' : 'text-neutral-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
