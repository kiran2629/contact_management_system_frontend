import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { toggleTheme } from '@/store/slices/themeSlice';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Shield,
  Activity,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export const FloatingNav = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
    { icon: Activity, label: 'Activity', path: '/activity-logs' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    ...(user?.role === 'Admin' ? [
      { icon: Shield, label: 'Admin', path: '/admin/users' },
    ] : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Ultra Premium Menu Bar - Fixed Top Right */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 100, 
          damping: 20,
          delay: 0.1 
        }}
        className="fixed top-4 right-4 z-50"
      >
        {/* Animated Background Glow */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[24px] blur-2xl"
        />

        <div className="relative glass-card rounded-[24px] border border-border/30 shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl overflow-hidden">
          {/* Animated Gradient Overlay */}
          <motion.div 
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 pointer-events-none"
            style={{ backgroundSize: '200% 200%' }}
          />

          {/* Top Accent Line */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2,
            }}
            className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
          />

          <div className="relative flex items-center gap-2 px-4 py-3">
            
            {/* Navigation Menu - Unique Floating Style */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navItems.map((item, index) => {
                const active = isActive(item.path);
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.08,
                      type: 'spring',
                      stiffness: 200,
                      damping: 20
                    }}
                  >
                    <Link
                      to={item.path}
                      className="relative group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className="relative"
                      >
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-[16px] font-semibold transition-all duration-500 text-sm whitespace-nowrap relative ${
                          active
                            ? 'bg-gradient-to-br from-primary via-primary to-secondary text-white shadow-xl'
                            : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}>
                          <motion.div
                            animate={active ? {
                              rotate: [0, 5, -5, 0],
                            } : {}}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <item.icon className="w-4 h-4" />
                          </motion.div>
                          
                          <motion.span
                            animate={active ? {
                              scale: [1, 1.02, 1],
                            } : {}}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            {item.label}
                          </motion.span>

                          {/* Unique Active Indicator - Sparkles Only */}
                          <AnimatePresence>
                            {active && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                className="ml-1"
                              >
                                <motion.div
                                  animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.2, 1],
                                  }}
                                  transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear"
                                  }}
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-white" />
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Premium Glow Effect */}
                        {active && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                              opacity: [0.4, 0.7, 0.4],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-[16px] blur-lg -z-10 opacity-50"
                          />
                        )}
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Actions - Ultra Premium */}
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-border/30">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: navItems.length * 0.08 + 0.1,
                  type: 'spring',
                  stiffness: 200
                }}
              >
                <motion.div whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleThemeToggle}
                    className="rounded-[14px] w-10 h-10 hover:bg-muted/50 transition-all"
                  >
                    <motion.div
                      animate={{
                        rotate: mode === 'light' ? 0 : 360,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {mode === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </motion.div>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: navItems.length * 0.08 + 0.2,
                  type: 'spring',
                  stiffness: 200
                }}
              >
                <motion.div 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="rounded-[14px] w-10 h-10 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all relative group"
                  >
                    <LogOut className="h-4 w-4" />
                    
                    {/* Hover Glow */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-red-500/20 rounded-[14px] blur-lg -z-10"
                    />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Mobile menu toggle */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: navItems.length * 0.08 + 0.3,
                  type: 'spring',
                  stiffness: 200
                }}
                className="lg:hidden"
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="rounded-[14px] w-10 h-10 hover:bg-muted/50"
                  >
                    <motion.div
                      animate={{ rotate: isMenuOpen ? 90 : 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                      {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </motion.div>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ultra Premium Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Premium Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-lg z-40 lg:hidden"
            />
            
            {/* Mobile Menu Card */}
            <motion.div
              initial={{ y: -100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -100, opacity: 0, scale: 0.9 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300 
              }}
              className="fixed top-20 right-4 z-40 w-[90%] max-w-sm lg:hidden"
            >
              {/* Animated Glow */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-[24px] blur-3xl"
              />

              <div className="relative glass-card rounded-[24px] border border-border/20 shadow-[0_25px_80px_rgba(0,0,0,0.4)] p-4 overflow-hidden">
                {/* Animated Background */}
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5"
                  style={{ backgroundSize: '200% 200%' }}
                />

                <div className="relative space-y-2">
                  {navItems.map((item, index) => {
                    const active = isActive(item.path);
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: index * 0.08,
                          type: 'spring',
                          stiffness: 200
                        }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-[16px] font-semibold transition-all ${
                              active
                                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                                : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <div className={`p-2 rounded-xl ${active ? 'bg-white/20' : 'bg-primary/10'}`}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            <span className="flex-1">{item.label}</span>

                            {active && (
                              <motion.div
                                animate={{
                                  rotate: [0, 360],
                                  scale: [1, 1.2, 1],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "linear"
                                }}
                              >
                                <Sparkles className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: navItems.length * 0.08 + 0.1 }}
                    className="border-t border-border/30 pt-2 mt-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-xl shadow-red-500/40"
                    >
                      <div className="p-2 rounded-xl bg-white/20">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <span>Logout</span>
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Mobile Nav - Ultra Premium */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 100, 
          damping: 20, 
          delay: 0.3 
        }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden w-[92%] max-w-md"
      >
        {/* Animated Glow */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[28px] blur-2xl"
        />

        <div className="relative glass-card rounded-[28px] border border-border/30 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl overflow-hidden px-4 py-3">
          {/* Animated Background */}
          <motion.div 
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 pointer-events-none"
            style={{ backgroundSize: '200% 200%' }}
          />

          <div className="relative flex items-center justify-around">
            {navItems.slice(0, 4).map((item, index) => {
              const active = isActive(item.path);
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 200
                  }}
                >
                  <Link
                    to={item.path}
                    className="relative p-2"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <div className={`p-3 rounded-[18px] transition-all ${
                        active
                          ? 'bg-gradient-to-br from-primary to-secondary shadow-lg'
                          : 'bg-muted/30'
                      }`}>
                        <motion.div
                          animate={active ? {
                            rotate: [0, 5, -5, 0],
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <item.icon className={`w-6 h-6 ${active ? 'text-white' : 'text-muted-foreground'}`} />
                        </motion.div>

                        {/* Glow Effect */}
                        {active && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: [0.4, 0.7, 0.4],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-[18px] blur-lg -z-10"
                          />
                        )}
                      </div>
                    </motion.div>
                    
                    {/* Active Sparkle Indicator */}
                    {active && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.3, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkles className="w-3 h-3 text-primary" />
                      </motion.div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
};
