/**
 * PromptVerse Site Configuration
 * Centralized settings for branding, admin access, defaults, and navigation.
 */

export const siteConfig = {
  // Brand & Meta
  SITE_NAME: "PromptVerse",
  SITE_TAGLINE: "Discover & Copy Premium AI Prompts",
  SITE_DESCRIPTION: "Browse a curated gallery of high-performing AI image prompts for Midjourney, DALL-E 3, Flux, and Stable Diffusion. Copy full prompts with a single click.",
  SITE_URL: "https://promptverse.ai",

  // Admin Access Configuration
  // Add any email addresses here that should automatically have full Admin privileges.
  // In Firebase, admins can also be designated via the 'admins/{uid}' collection or Firestore security rules.
  ADMIN_CONFIGURATION: {
    adminEmails: [
      "mrbaijed18@gmail.com"
    ],
    roles: {
      ADMIN: "admin",
      USER: "user"
    },
    adminBasePath: "/admin",
  },
  get ADMIN_CONFIG() {
    return this.ADMIN_CONFIGURATION;
  },

  // Social & External Links
  SOCIAL_LINKS: {
    twitter: "https://twitter.com/promptverse",
    discord: "https://discord.gg/promptverse",
    github: "https://github.com/promptverse",
    email: "support@promptverse.ai",
  },

  // Default Categories with Icons and Slugs
  DEFAULT_CATEGORIES: [
    { name: "Portrait", slug: "portrait", icon: "User", description: "Studio portraits, character faces, lighting & emotional depth" },
    { name: "Cinematic", slug: "cinematic", icon: "Film", description: "Movie stills, anamorphic aspect, cinematic grading & dramatic atmosphere" },
    { name: "Fashion", slug: "fashion", icon: "Sparkles", description: "Haute couture, editorial styling, runway photography & streetwear" },
    { name: "Product", slug: "product", icon: "Package", description: "Clean e-commerce product staging, studio lighting & commercial ads" },
    { name: "Photography", slug: "photography", icon: "Camera", description: "National Geographic realism, street shots, golden hour & macro" },
    { name: "Fantasy", slug: "fantasy", icon: "Wand2", description: "Ethereal landscapes, mythical beasts, celestial realms & magic" },
    { name: "3D", slug: "3d", icon: "Box", description: "Claymation, Octane 3D renders, isometric scenes & stylized icons" },
    { name: "Anime", slug: "anime", icon: "Tv", description: "Makoto Shinkai aesthetics, retro 90s cel-shading & modern manga art" },
    { name: "Architecture", slug: "architecture", icon: "Building2", description: "Brutalist, biophilic, modern glass villas & conceptual interiors" },
    { name: "Nature", slug: "nature", icon: "Trees", description: "Lush forests, alpine mountains, bioluminescent seas & wildlife" },
    { name: "Wallpaper", slug: "wallpaper", icon: "Layers", description: "Ultra-wide abstract wallpapers, OLED dark visuals & geometric art" },
    { name: "Social Media", slug: "social-media", icon: "Share2", description: "Thumbnail backdrops, viral visual hooks & banner graphics" },
    { name: "Other", slug: "other", icon: "Compass", description: "Experimental prompts, surrealism & novel generative styles" }
  ],

  // AI Engines Supported
  SUPPORTED_MODELS: [
    { id: "midjourney-v6", name: "Midjourney v6.1" },
    { id: "flux-1-dev", name: "Flux.1 Dev" },
    { id: "dalle-3", name: "DALL-E 3" },
    { id: "sdxl", name: "Stable Diffusion XL" },
    { id: "ideogram", name: "Ideogram v2" }
  ],

  // Theme defaults
  THEME_SETTINGS: {
    defaultTheme: "dark" as "light" | "dark" | "system",
    storageKey: "promptverse_theme_preference",
  },

  // Pagination & Layout
  GALLERY: {
    defaultPageSize: 24,
    mobileColumns: 2,
    tabletColumns: 3,
    desktopColumns: 4,
  }
};
