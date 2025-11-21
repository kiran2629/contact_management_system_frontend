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
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      shortcut: "D",
    },
    { icon: Users, label: "Contacts", path: "/contacts", shortcut: "C" },
    {
      icon: Activity,
      label: "Activity",
      path: "/activity-logs",
      shortcut: "A",
    },
    { icon: Settings, label: "Settings", path: "/settings", shortcut: "S" },
    { icon: UserCircle, label: "Profile", path: "/profile", shortcut: "P" },
    ...(user?.role === "Admin"
      ? [
          {
            icon: Users,
            label: "User Management",
            path: "/admin/users",
            shortcut: "U",
          },
          {
            icon: Shield,
            label: "Permissions",
            path: "/admin/permissions",
            shortcut: "P",
          },
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
      {/* Minimal Top Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-[1800px]"
      >
        <div className="glass-card rounded-2xl border border-border/20 shadow-lg px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg text-gradient-shine hidden sm:inline">
                CRM
              </span>
            </Link>

            {/* Command Button */}
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-muted/30 transition-all group"
            >
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm text-muted-foreground hidden md:inline">
                Search or jump to...
              </span>
              <div className="hidden sm:flex items-center gap-1 ml-4">
                <kbd className="px-2 py-0.5 text-xs bg-muted rounded border border-border/30">
                  {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
                </kbd>
                <kbd className="px-2 py-0.5 text-xs bg-muted rounded border border-border/30">
                  K
                </kbd>
              </div>
            </button>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleTheme())}
                className="rounded-lg h-9 w-9 hidden md:flex"
              >
                {mode === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-lg h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>

              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {user?.username}
                  </span>
                  <Badge className="text-[10px] bg-primary/10 text-primary border-primary/30 px-1.5 py-0">
                    {user?.role}
                  </Badge>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/30 group-hover:border-primary transition-colors">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

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
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-card rounded-2xl border border-border/30 shadow-2xl overflow-hidden"
            >
              {/* Search Input */}
              <div className="relative p-4 border-b border-border/20">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-transparent text-lg outline-none"
                />
              </div>

              {/* Results */}
              <div className="p-2 max-h-[60vh] overflow-y-auto">
                {/* Navigation Items */}
                {filteredItems.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Navigation
                    </p>
                    {filteredItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setCommandOpen(false)}
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive(item.path)
                            ? "bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-primary" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border/30">
                          {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}{" "}
                          {item.shortcut}
                        </kbd>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {filteredActions.length > 0 && (
                  <div>
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </p>
                    {filteredActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          action.action();
                          if (!action.destructive) setCommandOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                          action.destructive
                            ? "hover:bg-destructive/10 text-destructive"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <action.icon className="w-5 h-5" />
                          <span className="font-medium">{action.label}</span>
                        </div>
                        {action.shortcut && (
                          <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border/30">
                            {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}{" "}
                            {action.shortcut}
                          </kbd>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {filteredItems.length === 0 && filteredActions.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No results found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border/20 text-xs text-muted-foreground flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-background rounded border border-border/30">
                      ↑
                    </kbd>
                    <kbd className="px-2 py-1 bg-background rounded border border-border/30">
                      ↓
                    </kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-background rounded border border-border/30">
                      Enter
                    </kbd>
                    Select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-background rounded border border-border/30">
                    Esc
                  </kbd>
                  Close
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-24 pb-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1920px] mx-auto">{children}</div>
      </main>

      {/* Floating Action Button (Mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCommandOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg flex items-center justify-center md:hidden"
      >
        <Command className="w-6 h-6" />
      </motion.button>
    </div>
  );
};
