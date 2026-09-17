export type PromptStatus = 'published' | 'draft' | 'archived';

export interface PromptItem {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  category: string;
  tags: string[];
  isPremium: boolean;
  isFeatured: boolean;
  status: PromptStatus;
  likes: number;
  copies: number;
  views: number;
  createdAt: string; // ISO date string or timestamp
  updatedAt: string;
  modelUsed?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5' | '3:2' | '2:3';
  authorName?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  createdAt: string;
  count?: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'user';
  createdAt: string;
  favoritesCount?: number;
}

export interface FavoriteRecord {
  id: string;
  userId: string;
  promptId: string;
  createdAt: string;
  promptSnapshot?: {
    title: string;
    imageUrl: string;
    category: string;
  };
}

export type FilterType = 'all' | 'free' | 'premium';
export type SortOption = 'latest' | 'popular' | 'featured' | 'copies';

export interface FilterState {
  search: string;
  category: string; // 'all' or specific slug
  type: FilterType;
  sort: SortOption;
}

export interface AnalyticsSummary {
  totalPrompts: number;
  totalUsers: number;
  totalLikes: number;
  totalCopies: number;
  premiumPrompts: number;
  totalCategories: number;
  viewsToday: number;
  popularCategories: { name: string; count: number; percentage: number }[];
  trendHistory: { date: string; views: number; copies: number; likes: number }[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}
