import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

// Pages
import { ExplorePage } from './pages/ExplorePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { PromptDetailsPage } from './pages/PromptDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPromptsPage } from './pages/admin/AdminPromptsPage';
import { PromptEditorPage } from './pages/admin/PromptEditorPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminAdsPage } from './pages/admin/AdminAdsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdSlot } from './components/AdSlot';
import { AdsterraGlobalScripts } from './components/AdsterraGlobalScripts';

const AppContent: React.FC = () => {
  const { currentPath, navigate } = useRouter();

  // Determine which page component to render
  const renderRoute = () => {
    // 1. Home / Explore
    if (currentPath === '/' || currentPath === '/explore') {
      return <ExplorePage />;
    }

    // 2. Categories
    if (currentPath === '/categories') {
      return <CategoriesPage />;
    }

    // 3. Popular
    if (currentPath === '/popular') {
      return (
        <ExplorePage
          initialSort="popular"
          pageTitle="Popular AI Prompts"
          pageSubtitle="Highest rated and most bookmarked prompt recipes"
        />
      );
    }

    // 4. Latest
    if (currentPath === '/latest') {
      return (
        <ExplorePage
          initialSort="latest"
          pageTitle="Latest AI Prompts"
          pageSubtitle="Freshly uploaded visual prompts and creative concepts"
        />
      );
    }

    // 5. Favorites
    if (currentPath === '/favorites') {
      return <FavoritesPage />;
    }

    // 6. Prompt Details: /prompt/:id
    if (currentPath.startsWith('/prompt/')) {
      const id = currentPath.replace('/prompt/', '');
      return <PromptDetailsPage promptId={id} />;
    }

    // 7. Login / Admin Login
    if (currentPath === '/login') {
      return <LoginPage />;
    }
    if (currentPath === '/admin/login') {
      return <LoginPage isAdminLogin={true} />;
    }

    // 8. Profile
    if (currentPath === '/profile') {
      return <ProfilePage />;
    }

    // 9. Admin Dashboard
    if (currentPath === '/admin' || currentPath === '/admin/dashboard') {
      return <AdminDashboardPage />;
    }

    // 10. Admin Prompts List
    if (currentPath === '/admin/prompts') {
      return <AdminPromptsPage />;
    }

    // 11. Admin New Prompt
    if (currentPath === '/admin/prompts/new') {
      return <PromptEditorPage />;
    }

    // 12. Admin Edit Prompt: /admin/prompts/:id/edit
    if (currentPath.startsWith('/admin/prompts/') && currentPath.endsWith('/edit')) {
      const id = currentPath.replace('/admin/prompts/', '').replace('/edit', '');
      return <PromptEditorPage editPromptId={id} />;
    }

    // 13. Admin Categories
    if (currentPath === '/admin/categories') {
      return <AdminCategoriesPage />;
    }

    // 14. Admin Users
    if (currentPath === '/admin/users') {
      return <AdminUsersPage />;
    }

    // 15. Admin Analytics
    if (currentPath === '/admin/analytics') {
      return <AdminAnalyticsPage />;
    }

    // 16. Admin Ad Manager
    if (currentPath === '/admin/ads') {
      return <AdminAdsPage />;
    }

    // 17. Admin Settings
    if (currentPath === '/admin/settings') {
      return <AdminSettingsPage />;
    }

    // 404 Fallback
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-2">404 - Page Not Found</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          The prompt or page you are looking for does not exist.
        </p>
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-md"
        >
          Return to Explore
        </button>
      </div>
    );
  };

  const isAdminRoute = currentPath.startsWith('/admin') && currentPath !== '/admin/login';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#0c0d12] text-neutral-900 dark:text-neutral-100 transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      {/* Global Adsterra Scripts (Popunder, Social Bar - safely handled) */}
      {!isAdminRoute && <AdsterraGlobalScripts />}

      {/* Top Header Banner Ad (hidden on admin dashboard) */}
      {!isAdminRoute && <AdSlot placement="header_top" />}

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1">
        {renderRoute()}
      </div>

      {/* Footer Banner Ad (hidden on admin dashboard) */}
      {!isAdminRoute && <AdSlot placement="footer_banner" />}

      {/* Footer (hidden on admin management layout to preserve dashboard focus) */}
      {!isAdminRoute && <Footer />}

      {/* Sticky Bottom Floating Bar Ad (hidden on admin dashboard) */}
      {!isAdminRoute && <AdSlot placement="sticky_bottom" />}

      {/* Mobile Safe Bottom Navigation (hidden on admin dashboard) */}
      {!isAdminRoute && <MobileBottomNav />}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <RouterProvider>
              <AppContent />
            </RouterProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
