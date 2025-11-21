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
      const logUser = users.find(u => u.id === log.user);
      return logUser?.role === 'HR' || logUser?.role === 'User';
    }
    return log.user === user?.id;
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">
            Track all system activities and changes
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 h-full w-0.5 bg-border" />
          <div className="space-y-6">
            {filteredLogs.map((log, index) => {
              const Icon = getIcon(log.action);
              const logUser = users.find(u => u.id === log.user);

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 shadow-md">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Card className="flex-1">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{getActionLabel(log.action)}</h3>
                              <Badge variant="outline">{logUser?.role}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {logUser?.name}
                            </p>
                            {log.meta && Object.keys(log.meta).length > 0 && (
                              <div className="mt-2 space-y-1 text-sm">
                                {Object.entries(log.meta).map(([key, value]) => (
                                  <p key={key} className="text-muted-foreground">
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
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
          <div className="flex flex-col items-center justify-center py-12">
            <ActivityIcon className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">No activity logs found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ActivityLogs;
