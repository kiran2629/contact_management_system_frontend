import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  LayoutDashboard,
  Users,
  ContactRound,
  Shield,
  Activity,
  UserCircle,
  Settings,
  Building2,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
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
} from '@/components/ui/sidebar';

export const Sidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { state } = useSidebar();
  const location = useLocation();

  const mainItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Contacts', url: '/contacts', icon: ContactRound },
    { title: 'Activity Logs', url: '/activity-logs', icon: Activity },
    { title: 'Profile', url: '/profile', icon: UserCircle },
    { title: 'Settings', url: '/settings', icon: Settings },
  ];

  const adminItems = user?.role === 'Admin' ? [
    { title: 'User Management', url: '/admin/users', icon: Users },
    { title: 'Permissions', url: '/admin/permissions', icon: Shield },
  ] : [];

  const isCollapsed = state === 'collapsed';

  return (
    <SidebarUI collapsible="icon"  className={isCollapsed ? 'w-16' : 'w-64'}>
      <SidebarContent>
        {/* Logo */}
        <div className="border-b border-sidebar-border px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold">CRM System</h1>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent font-medium text-sidebar-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent font-medium text-sidebar-primary"
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </SidebarUI>
  );
};
