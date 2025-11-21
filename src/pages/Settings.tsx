import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { toggleTheme } from '@/store/slices/themeSlice';
import { setLayout, LayoutType } from '@/store/slices/layoutSlice';
import { LayoutRouter } from '@/components/layout/LayoutRouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Moon, Sun, Layout, Check, Sparkles } from 'lucide-react';
 
const Settings = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);
  const { currentLayout } = useSelector((state: RootState) => state.layout);

  const layouts: { type: LayoutType; name: string; desc: string; preview: string; icon: string }[] = [
    {
      type: 'floating',
      name: 'Floating Navigation',
      desc: 'Modern floating nav bar at top with bottom mobile navigation. Clean and minimal.',
      preview: '🎯 Top floating nav + Bottom mobile nav',
      icon: '✨'
    },
    {
      type: 'sidebar',
      name: 'Sidebar Classic',
      desc: 'Traditional sidebar layout with collapsible menu. Familiar and productive.',
      preview: '📋 Left sidebar + Top header',
      icon: '📋'
    },
    {
      type: 'minimal',
      name: 'Minimal Slide-In',
      desc: 'Ultra-minimal design with slide-in navigation. Content-first approach.',
      preview: '✨ Hidden nav, slides in on hover',
      icon: '🎨'
    },
    {
      type: 'bottom',
      name: 'Bottom Bar Only',
      desc: 'Mobile-first design with only bottom navigation. Perfect for one-handed use.',
      preview: '📱 Bottom bar navigation',
      icon: '📱'
    },
    {
      type: 'command',
      name: 'Command Palette',
      desc: 'Keyboard-focused design with Cmd+K palette. Minimal UI, maximum efficiency.',
      preview: '⌨️ Cmd+K to navigate',
      icon: '⌨️'
    }
  ];

  const handleLayoutChange = (layout: LayoutType) => {
    dispatch(setLayout(layout));
    toast.success(`Layout changed to ${layouts.find(l => l.type === layout)?.name}!`);
  };
 
  return (
    <LayoutRouter>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl border border-border/20 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gradient-shine">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Customize your application preferences
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border border-border/20 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {mode === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/20 hover:bg-muted/50 transition-all">
                  <div>
                    <Label className="font-semibold">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <Switch
                    checked={mode === 'dark'}
                    onCheckedChange={() => dispatch(toggleTheme())}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Layout Customization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Layout Style
                </CardTitle>
                <CardDescription>
                  Choose your preferred navigation layout - All 5 premium layouts are now available!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {layouts.map((layout, index) => (
                    <motion.div
                      key={layout.type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.08 }}
                    >
                      <button
                        onClick={() => handleLayoutChange(layout.type)}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                          currentLayout === layout.type
                            ? 'border-primary bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg scale-[1.02]'
                            : 'border-border/20 hover:border-primary/30 hover:bg-muted/30 hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{layout.icon}</span>
                            <div>
                              <h3 className="font-bold text-base mb-0.5">{layout.name}</h3>
                              {currentLayout === layout.type && (
                                <span className="text-xs text-primary font-semibold">Active</span>
                              )}
                            </div>
                          </div>
                          {currentLayout === layout.type && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                          {layout.desc}
                        </p>

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-xs font-medium">
                          {layout.preview}
                        </div>

                        {/* Preview Visualization */}
                        <div className="mt-4 p-3 rounded-lg bg-background/50 border border-border/10">
                          {layout.type === 'floating' && (
                            <div className="space-y-2">
                              <div className="h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full w-3/4 mx-auto" />
                              <div className="h-16 bg-muted/30 rounded" />
                              <div className="h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full w-1/2 mx-auto" />
                            </div>
                          )}
                          {layout.type === 'sidebar' && (
                            <div className="flex gap-2 h-20">
                              <div className="w-1/4 bg-gradient-to-b from-primary to-secondary rounded" />
                              <div className="flex-1 space-y-2">
                                <div className="h-1.5 bg-muted/30 rounded" />
                                <div className="flex-1 bg-muted/30 rounded" />
                              </div>
                            </div>
                          )}
                          {layout.type === 'minimal' && (
                            <div className="flex gap-2 h-20">
                              <div className="w-1 bg-gradient-to-b from-primary to-secondary rounded" />
                              <div className="flex-1 bg-muted/30 rounded flex items-center justify-center text-xs text-muted-foreground">
                                Hover left edge
                              </div>
                            </div>
                          )}
                          {layout.type === 'bottom' && (
                            <div className="space-y-2 h-20">
                              <div className="flex-1 bg-muted/30 rounded" />
                              <div className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full w-full" />
                            </div>
                          )}
                          {layout.type === 'command' && (
                            <div className="space-y-2 h-20">
                              <div className="h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full w-2/3 mx-auto" />
                              <div className="flex-1 bg-muted/30 rounded flex items-center justify-center text-xs text-muted-foreground">
                                Press Cmd+K
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">All layouts are now live!</p>
                      <p className="text-xs text-muted-foreground">
                        Click any layout card to switch instantly. Your preference will be saved automatically. 
                        Currently using: <span className="font-semibold text-primary">{layouts.find(l => l.type === currentLayout)?.name}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* More Settings Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border border-border/20">
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
              <CardDescription>More customization options coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {['Notifications', 'Privacy', 'Language', 'Shortcuts', 'Integrations', 'Advanced'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    className="p-4 rounded-lg border border-border/20 hover:bg-muted/30 transition-all"
                  >
                    <p className="font-semibold mb-1">{item}</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </LayoutRouter>
  );
};

export default Settings;
