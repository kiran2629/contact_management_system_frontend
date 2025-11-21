import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { toggleTheme } from '@/store/slices/themeSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Bell, Lock, Globe } from 'lucide-react';
 
const Settings = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);
 
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
              Settings
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage your application preferences
            </p>
          </div>
        </motion.div>
 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="border-b-2 border-border/30 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Appearance
              </CardTitle>
              <CardDescription className="text-base">Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/30 hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {mode === 'light' ? (
                      <Sun className="h-6 w-6 text-primary" />
                    ) : (
                      <Moon className="h-6 w-6 text-primary" />
                    )}
                  </motion.div>
                  <div>
                    <Label htmlFor="dark-mode" className="text-lg font-semibold cursor-pointer">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark theme
                    </p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={mode === 'dark'}
                  onCheckedChange={() => dispatch(toggleTheme())}
                  className="scale-125"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="border-2 border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="border-b-2 border-border/30 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Notifications
              </CardTitle>
              <CardDescription className="text-base">Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/30 hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Bell className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <Label htmlFor="email-notif" className="text-lg font-semibold cursor-pointer">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <Switch id="email-notif" defaultChecked className="scale-125" />
              </div>
              <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/30 hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Bell className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <Label htmlFor="push-notif" className="text-lg font-semibold cursor-pointer">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications
                    </p>
                  </div>
                </div>
                <Switch id="push-notif" className="scale-125" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border-2 border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="border-b-2 border-border/30 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Security
              </CardTitle>
              <CardDescription className="text-base">Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/30 hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Lock className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <Label htmlFor="2fa" className="text-lg font-semibold cursor-pointer">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                </div>
                <Switch id="2fa" className="scale-125" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};
 
export default Settings;