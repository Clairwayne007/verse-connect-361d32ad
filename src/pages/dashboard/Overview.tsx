import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useInvestments } from "@/hooks/useInvestments";
import { useDeposits } from "@/hooks/useDeposits";
import { TrendingUp, TrendingDown, Wallet, Clock, DollarSign, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDailyEarning,
  getElapsedInvestmentDays,
  getRemainingInvestmentDays,
} from "@/lib/investmentMath";

const Dashboard = () => {
  const { user } = useAuth();
  const { activeInvestments, totalInvested, totalEarned, isLoading: investmentsLoading } = useInvestments();
  const { deposits, isLoading: depositsLoading } = useDeposits();

  const isLoading = investmentsLoading || depositsLoading;

  const recentTransactions = deposits.slice(0, 5).map((deposit) => ({
    id: deposit.id,
    type: "deposit" as const,
    amount: deposit.amount_usd,
    cryptoAmount: deposit.crypto_amount,
    cryptoCurrency: deposit.crypto_currency,
    status:
      deposit.status === "confirmed"
        ? "successful"
        : deposit.status === "failed" || deposit.status === "expired"
          ? "failed"
          : "pending",
    date: new Date(deposit.created_at).toLocaleDateString(),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0] || "Investor"}!</h2>
          <p className="text-muted-foreground">Here's your portfolio overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Invested"
                value={totalInvested > 0 ? `$${totalInvested.toLocaleString()}` : "$0.00"}
                icon={DollarSign}
                empty={totalInvested === 0}
              />
              <StatCard
                title="Total Earnings"
                value={totalEarned > 0 ? `$${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
                icon={TrendingUp}
                empty={totalEarned === 0}
              />
              <StatCard
                title="Active Investments"
                value={activeInvestments.length.toString()}
                icon={BarChart3}
                empty={activeInvestments.length === 0}
              />
              <StatCard
                title="Available Balance"
                value={`$${Number(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={Wallet}
                empty={Number(user?.balance || 0) === 0}
              />
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Active Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : activeInvestments.length > 0 ? (
              <div className="space-y-4">
                {activeInvestments.map((inv) => {
                  const now = new Date();
                  const daysActive = getElapsedInvestmentDays(inv.start_date, inv.duration_days, now);
                  const daysLeft = getRemainingInvestmentDays(inv.start_date, inv.duration_days, now);
                  const dailyEarning = getDailyEarning(inv.amount_usd, inv.roi_percent, inv.duration_days);

                  return (
                    <div
                      key={inv.id}
                      className="p-4 rounded-lg bg-muted/50 border border-border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{inv.plan_name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${Number(inv.amount_usd).toLocaleString()} invested
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {inv.roi_percent}% in {inv.duration_days}d
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Daily Earning</p>
                          <p className="font-medium text-success">
                            +${dailyEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Total Earned</p>
                          <p className="font-medium text-success">
                            +${Number(inv.earned_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Days Active</p>
                          <p className="font-medium">{daysActive}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Days Left</p>
                          <p className="font-medium">{daysLeft}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No active investments yet.</p>
                <p className="text-sm">Deposit funds and choose an investment plan to start earning.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          tx.status === "successful"
                            ? "bg-success/10 text-success"
                            : tx.status === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {tx.status === "successful" ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${tx.status === "successful" ? "text-success" : ""}`}>
                        ${Number(tx.amount).toLocaleString()} USD
                      </p>
                      {tx.cryptoAmount && (
                        <p className="text-xs text-muted-foreground">
                          {tx.cryptoAmount} {tx.cryptoCurrency.toUpperCase()}
                        </p>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          tx.status === "successful"
                            ? "bg-success/10 text-success"
                            : tx.status === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet.</p>
                <p className="text-sm">Make your first deposit to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  empty?: boolean;
}

const StatCard = ({ title, value, icon: Icon, empty }: StatCardProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${empty ? "text-muted-foreground" : ""}`}>{value}</p>
          {empty && <p className="text-xs text-muted-foreground mt-1">No data yet</p>}
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${empty ? "bg-muted" : "bg-primary/10"}`}>
          <Icon className={`h-6 w-6 ${empty ? "text-muted-foreground" : "text-primary"}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Dashboard;
