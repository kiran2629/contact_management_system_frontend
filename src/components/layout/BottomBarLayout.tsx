import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { toggleTheme } from "@/store/slices/themeSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Sparkles,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

export const BottomBarLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme);
  const [menuOpen, setMenuOpen] = useState(false);

  const mainNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", color: "from-blue-500 to-cyan-500" },
    { icon: Users, label: "Contacts", path: "/contacts", color: "from-purple-500 to-pink-500" },
    { icon: Activity, label: "Activity", path: "/activity-logs", color: "from-orange-500 to-yellow-500" },
    { icon: Settings, label: "Settings", path: "/settings", color: "from-green-500 to-emerald-500" },
  ];

  const moreItems = [
    { icon: UserCircle, label: "Profile", path: "/profile" },
    ...(user?.role === "Admin"
      ? [
          { icon: Shield, label: "Admin", path: "/admin/users" },
        ]
      : []),
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    setMenuOpen(false);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div className="relative min-h-screen pb-32 bg-background">
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        <div className="max-w-[1440px] mx-auto">{children}</div>
      </main>

      {/* Premium Bottom Navigation Bar - WIDER */}
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay: 0.2,
        }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl"
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
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[32px] blur-2xl"
        />

        <div className="relative glass-card rounded-[32px] border border-border/30 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl overflow-hidden">
          {/* Animated Gradient Overlay */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 pointer-events-none"
            style={{ backgroundSize: "200% 200%" }}
          />

          {/* Top Accent Line */}
          <motion.div
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2,
            }}
            className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
          />

          <div className="relative flex items-center justify-around px-6 py-4">
            {mainNavItems.map((item, index) => {
              const active = isActive(item.path);
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                >
                  <Link
                    to={item.path}
                    className="relative flex flex-col items-center gap-2 min-w-[90px] group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="relative"
                    >
                      <div
                        className={`relative p-4 rounded-[20px] transition-all duration-500 ${
                          active
                            ? `bg-gradient-to-br ${item.color} shadow-xl`
                            : "bg-muted/40 group-hover:bg-muted/60"
                        }`}
                      >
                        <motion.div
                          animate={
                            active
                              ? {
                                  rotate: [0, 5, -5, 0],
                                }
                              : {}
                          }
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <item.icon
                            className={`w-6 h-6 transition-all duration-300 ${
                              active ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                            }`}
                          />
                        </motion.div>

                        {/* Active Indicator - Floating Dot */}
                        <AnimatePresence>
                          {active && (
                            <motion.div
                              initial={{ y: -10, opacity: 0, scale: 0 }}
                              animate={{ y: -12, opacity: 1, scale: 1 }}
                              exit={{ y: -10, opacity: 0, scale: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              className="absolute -top-2 left-1/2 -translate-x-1/2"
                            >
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [1, 0.7, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                className="w-2 h-2 rounded-full bg-white shadow-lg shadow-white/50"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Glow Effect */}
                        {active && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                              opacity: [0.5, 0.8, 0.5],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-[20px] blur-xl -z-10 opacity-60`}
                          />
                        )}
                      </div>
                    </motion.div>

                    <motion.span
                      animate={
                        active
                          ? {
                              scale: [1, 1.05, 1],
                            }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={`text-xs font-bold transition-all duration-300 ${
                        active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                </motion.div>
              );
            })}

            {/* More Button - Ultra Premium */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative flex flex-col items-center gap-2 min-w-[90px] group"
              >
                <div
                  className={`relative p-4 rounded-[20px] transition-all duration-500 ${
                    menuOpen
                      ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-xl"
                      : "bg-muted/40 group-hover:bg-muted/60"
                  }`}
                >
                  <motion.div
                    animate={{
                      rotate: menuOpen ? 90 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <MoreHorizontal
                      className={`w-6 h-6 transition-all duration-300 ${
                        menuOpen ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                  </motion.div>

                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[20px] blur-xl -z-10 opacity-60"
                    />
                  )}
                </div>

                <span
                  className={`text-xs font-bold transition-all duration-300 ${
                    menuOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  More
                </span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Ultra Premium More Menu Popup */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Premium Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-lg z-40"
            />

            {/* Ultra Premium Menu Card */}
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="fixed bottom-44 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
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
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-violet-500/30 rounded-[32px] blur-3xl"
              />

              <div className="relative glass-card rounded-[32px] border border-border/30 shadow-[0_25px_80px_rgba(0,0,0,0.4)] overflow-hidden">
                {/* Premium Header with User Profile */}
                <div className="relative p-6 border-b border-border/20">
                  <motion.div
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"
                    style={{ backgroundSize: "200% 200%" }}
                  />

                  <div className="relative flex items-center gap-4">
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>
                      <motion.div whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                        <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-xl ring-4 ring-primary/10">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-xl">
                            {user?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    </Link>

                    <div className="flex-1">
                      <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="font-bold text-lg">
                        {user?.name || user?.username}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-2 mt-1.5"
                      >
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-lg">
                          {user?.role}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </motion.div>
                    </div>

                    <motion.div whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleThemeToggle}
                        className="shrink-0 rounded-2xl hover:bg-muted/50 h-12 w-12"
                      >
                        {mode === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Premium Menu Items */}
                <div className="p-4 space-y-2">
                  {moreItems.map((item, index) => {
                    const active = isActive(item.path);
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
                      >
                        <Link to={item.path} onClick={() => setMenuOpen(false)}>
                          <motion.div
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                              active ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg" : "hover:bg-muted/50"
                            }`}
                          >
                            <div className={`p-3 rounded-xl ${active ? "bg-white/20" : "bg-primary/10"}`}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-base">{item.label}</span>
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Ultra Premium Logout Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: moreItems.length * 0.08 + 0.1 }}
                    className="pt-3 mt-3 border-t border-border/20"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-xl shadow-red-500/40"
                    >
                      <div className="p-3 rounded-xl bg-white/20">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <span className="text-base">Logout</span>
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
