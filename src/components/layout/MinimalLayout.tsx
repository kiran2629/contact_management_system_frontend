import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { toggleTheme } from "@/store/slices/themeSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  Shield,
  LogOut,
  Moon,
  Sun,
  Command,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/ai-features/localization/useTranslation";

export const MinimalLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  // Helper function to get profile photo URL
  const getProfilePhotoUrl = () => {
    if (!user?.profile_photo) return null;
    if (user.profile_photo.startsWith("http")) return user.profile_photo;
    if (user.profile_photo.startsWith("/"))
      return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${
        user.profile_photo
      }`;
    return user.profile_photo;
  };

  const navItems = [
    { icon: LayoutDashboard, label: t("dashboard"), path: "/dashboard" },
    { icon: Users, label: t("contacts"), path: "/contacts" },
    { icon: Activity, label: t("activity_logs"), path: "/activity-logs" },
    { icon: Settings, label: t("settings"), path: "/settings" },
    ...(user?.role === "Admin"
      ? [{ icon: Users, label: t("admin_users"), path: "/admin/users" }]
      : []),
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "\\" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Trigger Area (Left Edge) */}
      <div
        className="fixed left-0 top-0 bottom-0 w-4 z-40 cursor-pointer"
        onMouseEnter={() => setIsNavVisible(true)}
      />

      {/* Slide-in Navigation */}
      <AnimatePresence>
        {isNavVisible && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavVisible(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            {/* Nav Panel */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              onMouseLeave={() => setIsNavVisible(false)}
              className="fixed top-0 left-0 bottom-0 w-72 bg-card/95 backdrop-blur-xl border-r border-border/30 z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-border/20">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/30">
                    <AvatarImage
                      src={getProfilePhotoUrl() || undefined}
                      alt={user?.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsNavVisible(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-primary to-secondary text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-border/20 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleThemeToggle}
                  className="w-full justify-start"
                >
                  {mode === "light" ? (
                    <Moon className="w-4 h-4 mr-2" />
                  ) : (
                    <Sun className="w-4 h-4 mr-2" />
                  )}
                  Toggle Theme
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Command Palette Button (Floating) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCommandOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg flex items-center justify-center"
      >
        <Command className="w-6 h-6" />
      </motion.button>

      {/* Command Palette */}
      <AnimatePresence>
        {commandOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-card rounded-2xl border border-border/30 shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border/20">
                <input
                  type="text"
                  placeholder="Search or jump to..."
                  autoFocus
                  className="w-full bg-transparent text-lg outline-none"
                />
              </div>
              <div className="p-2 max-h-96 overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setCommandOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-all"
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{item.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.path}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="p-3 border-t border-border/20 text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  Press <kbd className="px-2 py-1 bg-muted rounded">Ctrl+K</kbd>{" "}
                  to open
                </span>
                <span>
                  Press <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> to
                  close
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-[1920px] mx-auto">{children}</div>
      </main>
    </div>
  );
};
