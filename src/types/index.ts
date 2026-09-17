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

export interface AdsterraUnit {
  enabled: boolean;
  code: string;
}

export interface AdsterraDirectLinkConfig {
  enabled: boolean;
  url: string;
  openOnCopyPrompt: boolean;
  showNavButton: boolean;
  navButtonText: string;
}

export interface AdsterraConfig {
  enabled: boolean; // Master switch
  popunder: AdsterraUnit; // Popunder OnClick script
  socialBar: AdsterraUnit; // Social Bar / Push Notification script
  topBanner: AdsterraUnit; // 728x90 Header / Top banner
  inFeedBanner: AdsterraUnit & { position: number }; // 300x250 or Native Banner inside Prompt Grid
  modalBanner: AdsterraUnit; // 300x250 Banner inside Prompt Modal
  footerBanner: AdsterraUnit; // 728x90 or Native Banner above Footer
  stickyBottom: AdsterraUnit; // Floating sticky bottom banner
  directLink: AdsterraDirectLinkConfig; // Smartlink / Direct Link
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  enableConfetti: boolean;
  // 2026 footer badge customization
  showFooterBadge: boolean;
  footerBadgeImage: string; // URL or base64 data URI
  footerBadgeAlt: string;
  footerBadgeLink?: string;
}

