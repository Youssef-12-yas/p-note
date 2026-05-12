import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export function MainLayout({ children, onLogout }: MainLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={onLogout} />
      <main
        className={`transition-all duration-300 ${
          isMobile ? 'ps-0 pt-14 pb-20' : 'ps-64'
        }`}
      >
        <div className={`mx-auto max-w-6xl ${isMobile ? 'p-4' : 'p-8'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
