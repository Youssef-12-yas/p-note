import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FolderOpen, 
  Settings, 
  Search, 
  Plus, 
  LogOut,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  User
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useT } from '@/lib/i18n';
import logo from '@/assets/logo.png';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, user } = useAuth();
  const isMobile = useIsMobile();
  const { t } = useT();

  const navItems = [
    { icon: Home, label: t('nav.dashboard'), path: '/dashboard' },
    { icon: FolderOpen, label: t('nav.groups'), path: '/groups' },
    { icon: Sparkles, label: t('nav.aiReview'), path: '/ai-review' },
    { icon: User, label: t('nav.profile'), path: '/profile' },
    { icon: Settings, label: t('nav.settings'), path: '/settings' },
  ];

  const goNewGroup = () => {
    navigate('/groups?new=1');
    setMobileOpen(false);
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const closeMobile = () => setMobileOpen(false);

  // Mobile: hamburger button + drawer overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile top bar */}
        <header className="fixed top-0 inset-x-0 h-14 z-40 glass border-b border-border/50 flex items-center justify-between px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-secondary/60 transition-colors"
            aria-label={t('nav.openMenu')}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={logo} alt="P-Note" className="w-7 h-7 rounded-lg object-contain" />
            <span className="text-base font-bold gradient-text">P-Note</span>
          </Link>
          <Link to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center overflow-hidden ring-1 ring-border/40">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="User profile photo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold">{initials}</span>
            )}
          </Link>
        </header>

        {/* Mobile bottom tab bar */}
        <nav className="fixed bottom-0 inset-x-0 z-40 glass border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
          <ul className="flex items-stretch justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
                || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <li key={item.path} className="flex-1">
                  <Link
                    to={item.path}
                    className={`flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium leading-none">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
                onClick={closeMobile}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 h-full w-72 glass border-r border-border/50 z-50 flex flex-col"
              >
                {/* Close */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="P-Note" className="w-10 h-10 rounded-xl object-contain shrink-0" />
                    <span className="text-xl font-bold gradient-text">P-Note</span>
                  </div>
                  <button onClick={closeMobile} className="p-2 rounded-lg hover:bg-secondary">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* New button */}
                <div className="px-4 mb-4">
                  <button
                    onClick={goNewGroup}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{t('nav.newGroup')}</span>
                  </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3">
                  <ul className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={closeMobile}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                            }`}
                          >
                            <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* User */}
                <div className="p-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop: original fixed sidebar
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed left-0 top-0 h-full glass border-r border-border/50 z-40 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <img src={logo} alt="P-Note" className="w-10 h-10 rounded-xl object-contain shrink-0" />
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold gradient-text"
          >
            P-Note
          </motion.span>
        )}
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('common.search')}
              className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm 
                         focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      )}

      {/* New button */}
      <div className="px-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goNewGroup}
          className={`btn-primary w-full flex items-center justify-center gap-2 ${isCollapsed ? 'px-3' : ''}`}
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span>{t('nav.newGroup')}</span>}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border/50">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Link to="/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-border/40 hover:ring-primary/60 transition-all">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="User profile photo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold">{initials}</span>
            )}
          </Link>
          {!isCollapsed && (
            <Link to="/profile" className="flex-1 min-w-0 hover:text-primary transition-colors">
              <p className="font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </Link>
          )}
          {!isCollapsed && (
            <button 
              onClick={onLogout}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary border border-border 
                   flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-90'}`} />
      </button>
    </motion.aside>
  );
}
