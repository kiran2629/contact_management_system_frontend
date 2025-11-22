import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { RootState } from "@/store/store";
import {
  LayoutDashboard,
  Users,
  ContactRound,
  Shield,
  Activity,
  UserCircle,
  Settings,
  Building2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

export const Sidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { state } = useSidebar();
  const location = useLocation();

  const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Contacts", url: "/contacts", icon: ContactRound },
    { title: "Activity Logs", url: "/activity-logs", icon: Activity },
    { title: "Profile", url: "/profile", icon: UserCircle },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const adminItems =
    user?.role === "Admin"
      ? [{ title: "User Management", url: "/admin/users", icon: Users }]
      : [];

  const isCollapsed = state === "collapsed";

  return (
    <SidebarUI collapsible="icon" className={isCollapsed ? "w-16" : "w-64"}>
      <SidebarContent>
        {/* Logo */}
        <motion.div
          className="border-b-2 border-sidebar-border/50 px-4 py-6 bg-gradient-to-r from-primary/5 to-secondary/5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg border-2 border-white/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Building2 className="h-6 w-6 text-white" />
            </motion.div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  CRM System
                </h1>
                <p className="text-xs text-muted-foreground font-medium bg-primary/10 px-2 py-1 rounded-full inline-block mt-1">
                  {user?.role}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {mainItems.map((item, index) => {
                const isActive = location.pathname === item.url;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="p-0">
                        <NavLink
                          to={item.url}
                          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive
                              ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-semibold border-l-4 border-primary shadow-lg"
                              : "hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-r-full"
                              layoutId="activeIndicator"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}

                          {/* Icon with animation */}
                          <motion.div
                            className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-300 ${
                              isActive
                                ? "bg-gradient-to-br from-primary to-secondary text-white shadow-md"
                                : "bg-sidebar-accent/30 group-hover:bg-primary/10"
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <item.icon className="h-4 w-4" />
                          </motion.div>

                          {!isCollapsed && (
                            <motion.span
                              className="flex-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              {item.title}
                            </motion.span>
                          )}

                          {/* Hover gradient effect */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2">
                {adminItems.map((item, index) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (mainItems.length + index) * 0.05 }}
                    >
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className="p-0">
                          <NavLink
                            to={item.url}
                            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                              isActive
                                ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-semibold border-l-4 border-primary shadow-lg"
                                : "hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {/* Active indicator */}
                            {isActive && (
                              <motion.div
                                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-r-full"
                                layoutId="activeIndicatorAdmin"
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30,
                                }}
                              />
                            )}

                            {/* Icon with animation */}
                            <motion.div
                              className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-300 ${
                                isActive
                                  ? "bg-gradient-to-br from-primary to-secondary text-white shadow-md"
                                  : "bg-sidebar-accent/30 group-hover:bg-primary/10"
                              }`}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <item.icon className="h-4 w-4" />
                            </motion.div>

                            {!isCollapsed && (
                              <motion.span
                                className="flex-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                {item.title}
                              </motion.span>
                            )}

                            {/* Hover gradient effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </motion.div>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </SidebarUI>
  );
};
