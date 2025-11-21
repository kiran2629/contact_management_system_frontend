import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { toggleTheme } from '@/store/slices/themeSlice';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  Shield,
  LogOut,
  Moon,
  Sun,
  MoreHorizontal,
  UserCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const BottomBarLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme);
  const [menuOpen, setMenuOpen] = useState(false);

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
    { icon: Activity, label: 'Activity', path: '/activity-logs' },
  ];

  const moreItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
    ...(user?.role === 'Admin' ? [
      { icon: Shield, label: 'Admin', path: '/admin/users' },
    ] : []),
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    setMenuOpen(false);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div className="relative min-h-screen pb-24 bg-background">
      {/* Main Content */}
      <main className="p-4 md:p-6">
        <div className="max-w-[1920px] mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 pb-safe">
          <div className="glass-card rounded-t-3xl border-t border-x border-border/20 shadow-2xl">
            <div className="flex items-center justify-around px-4 py-3">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center gap-1 min-w-[64px] group"
                >
                  <div
                    className={`relative p-3 rounded-2xl transition-all ${
                      isActive(item.path)
                        ? 'bg-gradient-to-br from-primary to-secondary shadow-lg scale-110'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <item.icon
                      className={`w-6 h-6 ${
                        isActive(item.path) ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive(item.path) ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}

              {/* More Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex flex-col items-center gap-1 min-w-[64px]"
              >
                <div
                  className={`p-3 rounded-2xl transition-all ${
                    menuOpen ? 'bg-gradient-to-br from-primary to-secondary' : 'hover:bg-muted/50'
                  }`}
                >
                  <MoreHorizontal
                    className={`w-6 h-6 ${
                      menuOpen ? 'text-white' : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium ${menuOpen ? 'text-foreground' : 'text-muted-foreground'}`}>
                  More
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* More Menu Popup */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md"
            >
              <div className="glass-card rounded-2xl border border-border/20 shadow-2xl overflow-hidden">
                {/* User Profile */}
                <div className="p-4 border-b border-border/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-bold">{user?.username}</p>
                      <p className="text-sm text-muted-foreground">{user?.role}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleThemeToggle}
                      className="shrink-0"
                    >
                      {mode === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {moreItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-primary to-secondary text-white'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

