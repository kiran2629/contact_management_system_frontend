import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RootState } from "@/store/store";
import { LayoutRouter } from "@/components/layout/LayoutRouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ContactRound,
  Activity,
  TrendingUp,
  Sparkles,
  Plus,
  ArrowRight,
  Clock,
  Building2,
  Mail,
  Phone,
  Loader2,
  PieChart,
  Tag,
} from "lucide-react";
import {
  useGetDashboardQuery,
  useGetCategoryPercentageQuery,
} from "@/store/services/dashboardApi";
import { usePermissions } from "@/hooks/usePermissions";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/ai-features/localization/useTranslation";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { contacts } = useSelector((state: RootState) => state.contacts);
  const { users } = useSelector((state: RootState) => state.users);
  const { logs } = useSelector((state: RootState) => state.logs);
  const { canView, canCreate } = usePermissions();

  // Fetch dashboard data from API
  const { data: dashboardData, isLoading, isError } = useGetDashboardQuery();
  const { data: categoryData, isLoading: isLoadingCategories } =
    useGetCategoryPercentageQuery();

  // Fallback calculations from Redux state (used if API data is not available)
  const allowedContacts = contacts.filter((contact) =>
    contact.categories.some((cat) => user?.allowed_categories.includes(cat))
  );

  const recentContacts = allowedContacts.filter((c) => {
    const created = new Date(c.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo;
  });

  // Use API data if available, otherwise fallback to Redux state
  const totalContacts = dashboardData?.totalContacts ?? allowedContacts.length;
  const totalUsers =
    dashboardData?.totalUsers ??
    (user?.role === "Admin"
      ? users.length
      : logs.filter((l) => l.user === user?.id).length);
  const recentActivities =
    dashboardData?.recentActivities ?? logs.slice(0, 10).length;
  const weekActivities = dashboardData?.weekActivities ?? recentContacts.length;
  const recentContactsList =
    dashboardData?.recentContacts?.slice(0, 5) ?? allowedContacts.slice(0, 5);

  const stats = [
    {
      title: t("total_contacts"),
      value: totalContacts,
      icon: ContactRound,
      change: "+12%",
      changeType: "positive",
      color: "from-primary to-blue-600",
      bgColor: "from-primary/10 to-blue-600/10",
    },
    {
      title: user?.role === "Admin" ? t("total_users") : t("recent_activities"),
      value: totalUsers,
      icon: Users,
      change: "+5%",
      changeType: "positive",
      color: "from-secondary to-teal-600",
      bgColor: "from-secondary/10 to-teal-600/10",
    },
    {
      title: t("recent_activities"),
      value: recentActivities,
      icon: Activity,
      change: "+8%",
      changeType: "positive",
      color: "from-accent to-yellow-600",
      bgColor: "from-accent/10 to-yellow-600/10",
    },
    {
      title: t("this_week"),
      value: weekActivities,
      icon: TrendingUp,
      change: "+24%",
      changeType: "positive",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10",
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <LayoutRouter>
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </LayoutRouter>
    );
  }

  // Note: We don't show error state here because we have fallback to Redux state
  // The component will continue to work with Redux data if API fails

  return (
    <LayoutRouter>
      <div className="space-y-6 w-full">
        {/* 📊 Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Card className="border border-border/20 hover:border-primary/30 transition-all rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                    <span className="text-muted-foreground">{stat.title}</span>
                    <div
                      className={`rounded-lg bg-gradient-to-br ${stat.color} p-2`}
                    >
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-600 text-xs border-green-500/20"
                  >
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 📊 Category Statistics */}
        {categoryData && categoryData.status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border border-border/20 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-border/10 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  {t("category")}
                  <Badge variant="secondary" className="ml-auto">
                    {categoryData.total_contacts} {t("contacts")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...categoryData.categories]
                      .sort((a, b) => b.percentage - a.percentage)
                      .slice(0, 10)
                      .map((category, index) => (
                        <motion.div
                          key={`${category.category}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium capitalize">
                                {category.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">
                                {category.count} {t("contacts")}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-xs font-semibold min-w-[60px] text-right"
                              >
                                {category.percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                          <Progress
                            value={category.percentage}
                            className="h-2"
                          />
                        </motion.div>
                      ))}
                    {categoryData.categories.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        Showing top 10 categories out of{" "}
                        {categoryData.categories.length}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 📋 Recent Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border border-border/20 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-border/10 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ContactRound className="h-5 w-5" />
                  {t("recent_contacts")}
                </CardTitle>
                {canView("contact") && (
                  <Link to="/contacts">
                    <Button
                      size="sm"
                      className="rounded-lg bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      {t("view_all")}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {recentContactsList.map((contact, idx) =>
                  canView("contact") ? (
                    <Link
                      key={contact.id}
                      to={`/contacts/${contact.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/20 hover:border-primary/30 hover:bg-muted/30 transition-all"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-gradient-primary">
                          {contact.name.charAt(0)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-0.5 truncate">
                          {contact.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{contact.company}</span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="text-xs text-muted-foreground text-right">
                        {new Date(contact.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/20 opacity-60"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-gradient-primary">
                          {contact.name.charAt(0)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-0.5 truncate">
                          {contact.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{contact.company}</span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="text-xs text-muted-foreground text-right">
                        {new Date(contact.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {recentContactsList.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-3">
                    <ContactRound className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">
                    No contacts yet
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Start building your network
                  </p>
                  {canCreate("contact") && (
                    <Link to="/contacts/new">
                      <Button
                        size="sm"
                        className="rounded-lg bg-gradient-to-r from-primary to-secondary"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Contact
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </LayoutRouter>
  );
};

export default Dashboard;
