import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Command,
  Search,
  UserCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export const CommandBarLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", shortcut: "D", desc: "Overview of your CRM" },
    { icon: Users, label: "Contacts", path: "/contacts", shortcut: "C", desc: "Manage your contacts" },
    { icon: Activity, label: "Activity", path: "/activity-logs", shortcut: "A", desc: "View system activity" },
    { icon: Settings, label: "Settings", path: "/settings", shortcut: "S", desc: "Customize preferences" },
    { icon: UserCircle, label: "Profile", path: "/profile", shortcut: "P", desc: "Your account details" },
    ...(user?.role === "Admin"
      ? [
          { icon: Shield, label: "Admin", path: "/admin/users", shortcut: "X", desc: "System administration" },
        ]
      : []),
  ];

  const actions = [
    {
      icon: Moon,
      label: "Toggle Theme",
      action: () => dispatch(toggleTheme()),
      shortcut: "T",
    },
    {
      icon: LogOut,
      label: "Logout",
      action: handleLogout,
      shortcut: "L",
      destructive: true,
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  function handleLogout() {
    dispatch(logout());
    toast.success("Logged out successfully");
    setCommandOpen(false);
  }

  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActions = actions.filter((action) =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current page info
  const currentPage = navItems.find((item) => isActive(item.path)) || navItems[0];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }

      // Escape to close
      if (e.key === "Escape") {
        setCommandOpen(false);
      }

      // Quick navigation shortcuts (when command palette is closed)
      if (!commandOpen && (e.metaKey || e.ctrlKey)) {
        const item = navItems.find((i) => i.shortcut === e.key.toUpperCase());
        if (item) {
          e.preventDefault();
          navigate(item.path);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandOpen, navigate]);

  // Clear search when opening
  useEffect(() => {
    if (commandOpen) {
      setSearchQuery("");
    }
  }, [commandOpen]);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Unique Command Bar Top with User/Page Details */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-4 left-4 right-4 z-40"
      >
        <div className="max-w-[1800px] mx-auto">
          <div className="glass-card rounded-[24px] border border-border/30 shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl overflow-hidden">
            {/* Animated Background */}
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

            <div className="relative px-6 py-3">
              <div className="flex items-center gap-4">
                {/* LEFT: User Details Card - Unique Style */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  <Link to="/profile" className="group">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <div className="relative">
                        <Avatar className="h-11 w-11 border-2 border-primary/40 shadow-lg ring-4 ring-primary/10 transition-all group-hover:ring-primary/20">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-secondary text-white font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online Indicator */}
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
                        />
                      </div>
                    </motion.div>
                  </Link>

                  <div className="hidden md:flex flex-col min-w-0">
                    <Link to="/profile" className="group">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                          {user?.name || user?.username}
                        </p>
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Zap className="w-3 h-3 text-yellow-500" />
                        </motion.div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 text-[10px] px-1.5 py-0 h-4 shadow-md">
                        {user?.role}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Separator */}
                <div className="hidden lg:block h-10 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

                {/* Page Info Badge - Unique Style */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
                >
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-secondary">
                    <currentPage.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-none">{currentPage.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                      {currentPage.desc}
                    </span>
                  </div>
                </motion.div>

                {/* CENTER-LEFT: Command Search Button */}
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCommandOpen(true)}
                  className="flex-1 max-w-md mx-auto flex items-center gap-3 px-4 py-2.5 rounded-[16px] border border-border/30 bg-muted/30 hover:border-primary/50 hover:bg-muted/50 transition-all group"
                >
                  <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors hidden md:inline">
                    Search or jump to...
                  </span>
                  <div className="hidden sm:flex items-center gap-1 ml-auto">
                    <kbd className="px-2 py-1 text-xs bg-background/50 rounded border border-border/30 shadow-sm">
                      {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
                    </kbd>
                    <kbd className="px-2 py-1 text-xs bg-background/50 rounded border border-border/30 shadow-sm">
                      K
                    </kbd>
                  </div>
                </motion.button>

                {/* RIGHT: Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    <motion.div whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dispatch(toggleTheme())}
                        className="rounded-[14px] h-10 w-10 hover:bg-muted/50"
                      >
                        {mode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      </Button>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="rounded-[14px] h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Command Palette - Premium Style */}
      <AnimatePresence>
        {commandOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-start justify-center pt-32"
            />

            <motion.div
              initial={{ scale: 0.9, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-32 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
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
                className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-[28px] blur-3xl"
              />

              <div
                className="relative glass-card rounded-[28px] border border-border/30 shadow-[0_30px_90px_rgba(0,0,0,0.5)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Animated Background */}
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5"
                  style={{ backgroundSize: "200% 200%" }}
                />

                {/* Search Input */}
                <div className="relative p-5 border-b border-border/20">
                  <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <input
                    type="text"
                    placeholder="Type a command or search..."
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground"
                  />
                </div>

                {/* Results */}
                <div className="relative p-3 max-h-[60vh] overflow-y-auto">
                  {/* Navigation Items */}
                  {filteredItems.length > 0 && (
                    <div className="mb-3">
                      <p className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Navigation
                      </p>
                      <div className="space-y-1">
                        {filteredItems.map((item, index) => (
                          <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link to={item.path} onClick={() => setCommandOpen(false)}>
                              <motion.div
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] transition-all group ${
                                  isActive(item.path)
                                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                                    : "hover:bg-muted/50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-2 rounded-lg ${
                                      isActive(item.path) ? "bg-white/20" : "bg-primary/10"
                                    }`}
                                  >
                                    <item.icon className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold">{item.label}</span>
                                </div>
                                <kbd
                                  className={`px-2 py-1 text-xs rounded border ${
                                    isActive(item.path)
                                      ? "bg-white/20 border-white/30"
                                      : "bg-muted border-border/30"
                                  }`}
                                >
                                  {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} {item.shortcut}
                                </kbd>
                              </motion.div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {filteredActions.length > 0 && (
                    <div>
                      <p className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Actions
                      </p>
                      <div className="space-y-1">
                        {filteredActions.map((action, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (filteredItems.length + idx) * 0.05 }}
                          >
                            <motion.button
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                action.action();
                                if (!action.destructive) setCommandOpen(false);
                              }}
                              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] transition-all ${
                                action.destructive
                                  ? "hover:bg-destructive/10 text-destructive"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    action.destructive ? "bg-destructive/10" : "bg-primary/10"
                                  }`}
                                >
                                  <action.icon className="w-4 h-4" />
                                </div>
                                <span className="font-semibold">{action.label}</span>
                              </div>
                              {action.shortcut && (
                                <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border/30">
                                  {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"} {action.shortcut}
                                </kbd>
                              )}
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredItems.length === 0 && filteredActions.length === 0 && (
                    <div className="text-center py-16">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <Search className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground font-medium">No results found</p>
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="relative p-3 border-t border-border/20 text-xs text-muted-foreground flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-background rounded border border-border/30">↑</kbd>
                      <kbd className="px-2 py-1 bg-background rounded border border-border/30">↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-background rounded border border-border/30">Enter</kbd>
                      Select
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-background rounded border border-border/30">Esc</kbd>
                    Close
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-24 pb-8 px-4 md:px-6">
        <div className="max-w-[1800px] mx-auto">{children}</div>
      </main>

      {/* Floating Action Button (Mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCommandOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-xl flex items-center justify-center md:hidden"
      >
        <Command className="w-6 h-6" />
      </motion.button>
    </div>
  );
};
