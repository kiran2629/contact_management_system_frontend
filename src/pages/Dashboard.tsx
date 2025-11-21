import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ContactRound, Activity, TrendingUp } from 'lucide-react';
 
const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { contacts } = useSelector((state: RootState) => state.contacts);
  const { users } = useSelector((state: RootState) => state.users);
  const { logs } = useSelector((state: RootState) => state.logs);
 
  const allowedContacts = contacts.filter(contact =>
    contact.categories.some(cat => user?.allowed_categories.includes(cat))
  );
 
  const stats = [
    {
      title: 'Total Contacts',
      value: allowedContacts.length,
      icon: ContactRound,
      change: '+12%',
      color: 'from-primary to-blue-600',
    },
    {
      title: user?.role === 'Admin' ? 'Total Users' : 'My Activities',
      value: user?.role === 'Admin' ? users.length : logs.filter(l => String(l.user) === String(user?.id)).length,
      icon: Users,
      change: '+5%',
      color: 'from-secondary to-teal-600',
    },
    {
      title: 'Recent Activities',
      value: logs.slice(0, 10).length,
      icon: Activity,
      change: '+8%',
      color: 'from-accent to-yellow-600',
    },
    {
      title: 'Growth Rate',
      value: '24%',
      icon: TrendingUp,
      change: '+3%',
      color: 'from-success to-green-600',
    },
  ];
 
  const recentContacts = allowedContacts.slice(0, 5);
 
  return (
    <AppLayout>
      <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/30 min-h-screen">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-2xl blur-3xl -z-10" />
          <div className="relative border-2 border-border/50 rounded-2xl p-6 bg-card/50 backdrop-blur-sm shadow-lg">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Here's what's happening with your CRM today
            </p>
          </div>
        </motion.div>
 
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="overflow-hidden border-2 border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 bg-card/80 backdrop-blur-sm relative">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
               
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-muted-foreground">{stat.title}</span>
                    <motion.div
                      className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className="h-5 w-5 text-white" />
                    </motion.div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
 
        {/* Recent Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="border-2 border-border/50 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-border/30 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <ContactRound className="h-6 w-6 text-primary" />
                Recent Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {recentContacts.map((contact, index) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-4 rounded-xl border-2 border-border/30 p-4 transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 hover:border-primary/50 hover:shadow-lg group cursor-pointer"
                  >
                    <motion.div
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {contact.name.charAt(0)}
                      </span>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {contact.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{contact.company}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {contact.categories?.slice(0, 2).map((cat: string) => (
                          <span key={cat} className="text-xs font-medium bg-primary/10 px-2 py-1 rounded-full">
                            {cat}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};
 
export default Dashboard;