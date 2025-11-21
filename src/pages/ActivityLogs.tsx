import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity as ActivityIcon,
  LogIn,
  LogOut,
  Eye,
  Edit,
  UserPlus,
  Settings,
  Palette,
} from 'lucide-react';
 
const ActivityLogs = () => {
  const { logs } = useSelector((state: RootState) => state.logs);
  const { users } = useSelector((state: RootState) => state.users);
  const { user } = useSelector((state: RootState) => state.auth);
 
  const filteredLogs = logs.filter(log => {
    if (user?.role === 'Admin') return true;
    if (user?.role === 'HR') {
      const logUser = users.find(u => String(u.id) === String(log.user));
      return logUser?.role === 'HR' || logUser?.role === 'User';
    }
    return String(log.user) === String(user?.id);
  });
 
  const getIcon = (action: string) => {
    switch (action) {
      case 'login': return LogIn;
      case 'logout': return LogOut;
      case 'view_contact': return Eye;
      case 'create_contact': return UserPlus;
      case 'edit_contact': return Edit;
      case 'manage_permissions': return Settings;
      case 'theme_change': return Palette;
      default: return ActivityIcon;
    }
  };
 
  const getActionLabel = (action: string) => {
    return action.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
 
  return (
    <AppLayout>
      <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/30 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-2xl blur-3xl -z-10" />
          <div className="relative border-2 border-border/50 rounded-2xl p-6 bg-card/50 backdrop-blur-sm shadow-lg">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Activity Logs
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Track all system activities and changes
            </p>
          </div>
        </motion.div>
 
        <div className="relative">
          <div className="absolute left-8 top-0 h-full w-1 bg-gradient-to-b from-primary via-secondary to-transparent opacity-30" />
          <div className="space-y-6">
            {filteredLogs.map((log, index) => {
              const Icon = getIcon(log.action);
              const logUser = users.find(u => u.id === log.user);
 
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="relative"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <Card className="flex-1 border-2 border-border/50 hover:border-primary/50 shadow-xl hover:shadow-2xl bg-card/80 backdrop-blur-sm transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                                {getActionLabel(log.action)}
                              </h3>
                              <Badge
                                variant="outline"
                                className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 text-primary font-semibold"
                              >
                                {logUser?.role}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">
                              {logUser?.username || logUser?.name || 'Unknown User'}
                            </p>
                            {log.meta && Object.keys(log.meta).length > 0 && (
                              <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2">
                                {Object.entries(log.meta).map(([key, value]) => (
                                  <p key={key} className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">{key}:</span> {String(value)}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
 
        {filteredLogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl" />
              <div className="relative border-2 border-border/50 rounded-2xl p-12 bg-card/50 backdrop-blur-sm">
                <ActivityIcon className="mb-4 h-16 w-16 text-primary mx-auto" />
                <p className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  No activity logs found
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};
 
export default ActivityLogs;
 