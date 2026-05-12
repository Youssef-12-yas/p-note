import { useState, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OnboardingScreen } from './components/Onboarding/OnboardingScreen';
import { AuthPage } from './components/Auth/AuthPage';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { GroupsPage } from './components/Groups/GroupsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './lib/i18n';
import NotFound from "./pages/NotFound";

// Lazy-load heavier routes
const GroupDetail = lazy(() => import('./components/Groups/GroupDetail').then(m => ({ default: m.GroupDetail })));
const NoteEditor = lazy(() => import('./components/Notes/NoteEditor').then(m => ({ default: m.NoteEditor })));
const AIReviewPage = lazy(() => import('./components/AIReview/AIReviewPage').then(m => ({ default: m.AIReviewPage })));
const SettingsPage = lazy(() => import('./components/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('./pages/Profile'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem('ynote-onboarding') === 'complete';
  });
  const { signOut } = useAuth();

  const handleOnboardingComplete = () => {
    localStorage.setItem('ynote-onboarding', 'complete');
    setHasSeenOnboarding(true);
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (!hasSeenOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  const wrap = (el: React.ReactNode) => (
    <ProtectedRoute>
      <MainLayout onLogout={handleLogout}>
        <Suspense fallback={<Spinner />}>{el}</Suspense>
      </MainLayout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />

      <Route path="/dashboard" element={wrap(<Dashboard />)} />
      <Route path="/groups" element={wrap(<GroupsPage />)} />
      <Route path="/groups/:groupId" element={wrap(<GroupDetail />)} />
      <Route path="/notes/:noteId" element={wrap(<NoteEditor />)} />
      <Route path="/ai-review" element={wrap(<AIReviewPage />)} />
      <Route path="/profile" element={wrap(<ProfilePage />)} />
      <Route path="/settings" element={wrap(<SettingsPage />)} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
