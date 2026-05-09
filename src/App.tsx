import { useState, useEffect } from 'react';
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
import { GroupDetail } from './components/Groups/GroupDetail';
import { NoteEditor } from './components/Notes/NoteEditor';
import { AIReviewPage } from './components/AIReview/AIReviewPage';
import { SettingsPage } from './components/Settings/SettingsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

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

  // Show onboarding first
  if (!hasSeenOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route 
        path="/auth" 
        element={
          <AuthRoute>
            <AuthPage />
          </AuthRoute>
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MainLayout onLogout={handleLogout}><Dashboard /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/groups" 
        element={
          <ProtectedRoute>
            <MainLayout onLogout={handleLogout}><GroupsPage /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/groups/:groupId" 
        element={
          <ProtectedRoute>
            <MainLayout onLogout={handleLogout}><GroupDetail /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notes/:noteId" 
        element={
          <ProtectedRoute>
            <MainLayout onLogout={handleLogout}><NoteEditor /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ai-review" 
        element={
          <ProtectedRoute>
            <MainLayout onLogout={handleLogout}><AIReviewPage /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <MainLayout onLogout={handleLogout}><SettingsPage /></MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Index redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
