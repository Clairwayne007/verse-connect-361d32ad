import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Activity, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface Stats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeInvestments: number;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  amount: number;
  date: string;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalDeposits: 0, totalWithdrawals: 0, activeInvestments: 0 });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, []);

  useRealtimeSubscription(
    [
      { table: "profiles", alertOnInsert: "🆕 New User Registered" },
      { table: "deposits", alertOnInsert: "💰 New Deposit" },
      { table: "withdrawals", alertOnInsert: "💸 New Withdrawal" },
      { table: "investments", alertOnInsert: "📈 New Investment" },
    ],
    handleRefresh
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, rolesRes, depositsRes, withdrawalsRes, investmentsRes] = await Promise.all([
        supabase.from("profiles").select("id, email, created_at"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("deposits").select("id, amount_usd, status, user_id, created_at"),
        supabase.from("withdrawals").select("id, amount_usd, status, user_id, created_at"),
        supabase.from("investments").select("id, amount_usd, status, user_id, created_at, plan_name"),
      ]);

      const profiles = profilesRes.data || [];
      const roles = rolesRes.data || [];
      const deposits = depositsRes.data || [];
      const withdrawals = withdrawalsRes.data || [];
      const investments = investmentsRes.data || [];

      // Build set of moderator user IDs to exclude from count
      const moderatorIds = new Set(
        roles.filter((r) => r.role === "moderator").map((r) => r.user_id)
      );

      // Filter out moderators from profiles for user count
      const nonModeratorProfiles = profiles.filter((p) => !moderatorIds.has(p.id));

      const emailMap = new Map(profiles.map((p) => [p.id, p.email]));

      const confirmedDeposits = deposits.filter((d) => d.status === "confirmed");
      const completedWithdrawals = withdrawals.filter((w) => w.status === "completed");
      const activeInvs = investments.filter((i) => i.status === "active");

      setStats({
        totalUsers: nonModeratorProfiles.length,
        totalDeposits: confirmedDeposits.reduce((sum, d) => sum + Number(d.amount_usd), 0),
        totalWithdrawals: completedWithdrawals.reduce((sum, w) => sum + Number(w.amount_usd), 0),
        activeInvestments: activeInvs.length,
      });

      const activities: RecentActivity[] = [
        ...deposits.map((d) => ({
          id: `dep-${d.id}`,
          user: emailMap.get(d.user_id) || d.user_id,
          action: "Deposit",
          amount: Number(d.amount_usd),
          date: d.created_at || "",
        })),
        ...withdrawals.map((w) => ({
          id: `wd-${w.id}`,
          user: emailMap.get(w.user_id) || w.user_id,
          action: "Withdrawal",
          amount: Number(w.amount_usd),
          date: w.created_at || "",
        })),
        ...investments.map((inv) => ({
          id: `inv-${inv.id}`,
          user: emailMap.get(inv.user_id) || inv.user_id,
          action: `Investment (${inv.plan_name})`,
          amount: Number(inv.amount_usd),
          date: inv.created_at || "",
        })),
      ];

      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error("Error fetching admin overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} color="primary" />
          <StatCard title="Total Deposits" value={`$${stats.totalDeposits.toLocaleString()}`} icon={DollarSign} color="success" />
          <StatCard title="Total Withdrawals" value={`$${stats.totalWithdrawals.toLocaleString()}`} icon={TrendingUp} color="warning" />
          <StatCard title="Active Investments" value={stats.activeInvestments.toString()} icon={Activity} color="primary" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      {activity.amount > 0 && <p className="font-medium">${activity.amount.toLocaleString()}</p>}
                      <p className="text-sm text-muted-foreground">
                        {activity.date ? new Date(activity.date).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

const StatCard = ({
  title, value, icon: Icon, color,
}: {
  title: string; value: string; icon: React.ComponentType<{ className?: string }>; color: "primary" | "success" | "warning";
}) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminOverview;