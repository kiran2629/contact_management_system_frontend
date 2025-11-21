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
      value: user?.role === 'Admin' ? users.length : logs.filter(l => l.user === user?.id).length,
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
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your CRM today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    {stat.title}
                    <div className={`rounded-lg bg-gradient-to-br ${stat.color} p-2`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-success">
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Contacts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10">
                      <span className="text-lg font-semibold text-primary">
                        {contact.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">{contact.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{contact.position}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
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
