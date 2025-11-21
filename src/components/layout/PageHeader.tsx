import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  Activity,
} from 'lucide-react';

export const PageHeader = () => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const pageInfo: Record<string, { title: string; description: string; icon: any }> = {
    '/dashboard': {
      title: 'Dashboard',
      description: 'Overview of your CRM',
      icon: LayoutDashboard,
    },
    '/contacts': {
      title: 'Contacts',
      description: 'Manage your contacts',
      icon: Users,
    },
    '/activity-logs': {
      title: 'Activity',
      description: 'View system activity',
      icon: Activity,
    },
    '/settings': {
      title: 'Settings',
      description: 'Customize your preferences',
      icon: Settings,
    },
    '/admin/users': {
      title: 'User Management',
      description: 'Manage system users',
      icon: Shield,
    },
    '/admin/permissions': {
      title: 'Permissions',
      description: 'Configure role permissions',
      icon: Shield,
    },
    '/profile': {
      title: 'Profile',
      description: 'Your account details',
      icon: Users,
    },
  };

  // Find current page info
  const currentPath = Object.keys(pageInfo).find(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  ) || '/dashboard';
  
  const current = pageInfo[currentPath];
  const PageIcon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 mb-6"
    >
      {/* User Profile */}
      <Link to="/profile" className="flex-shrink-0 hover:opacity-80 transition-opacity">
        <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-lg">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-secondary text-white">
            {user?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* User Details */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold">{user?.name || user?.username}</h3>
          <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
            {user?.role}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {/* Separator */}
      <div className="hidden md:block h-12 w-px bg-border/50 mx-2" />

      {/* Page Info */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
          <PageIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">{current.title}</h2>
          <p className="text-sm text-muted-foreground">{current.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

