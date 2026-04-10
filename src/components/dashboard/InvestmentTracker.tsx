import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, DollarSign, Percent } from "lucide-react";
import { Investment } from "@/hooks/useInvestments";

interface InvestmentTrackerProps {
  investments: Investment[];
  totalInvested: number;
  totalEarned: number;
}

export const InvestmentTracker = ({ investments, totalInvested, totalEarned }: InvestmentTrackerProps) => {
  const activeInvestments = investments.filter((inv) => inv.status === "active");

  const calculateProgress = (investment: Investment) => {
    const startDate = new Date(investment.start_date);
    const endDate = investment.end_date ? new Date(investment.end_date) : new Date();
    const now = new Date();
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const calculateDaysRemaining = (investment: Investment) => {
    if (!investment.end_date) return 0;
    const endDate = new Date(investment.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  const calculateProjectedEarnings = (investment: Investment) => {
    const totalEarnings = (Number(investment.amount_usd) * Number(investment.roi_percent)) / 100;
    const dailyEarnings = totalEarnings / investment.duration_days;
    return totalEarnings;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Investment Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Invested</span>
            </div>
            <p className="text-2xl font-bold">${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 rounded-lg bg-success/10">
            <div className="flex items-center gap-2 text-success mb-1">
              <Percent className="h-4 w-4" />
              <span className="text-sm">Total Earned</span>
            </div>
            <p className="text-2xl font-bold text-success">+${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Active investments list */}
        {activeInvestments.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm font-medium">Active Investments</p>
            {activeInvestments.map((investment) => {
              const progress = calculateProgress(investment);
              const daysRemaining = calculateDaysRemaining(investment);
              const projectedEarnings = calculateProjectedEarnings(investment);
              const currentEarnings = Number(investment.earned_amount) || 0;

              return (
                <div
                  key={investment.id}
                  className="p-4 rounded-lg border border-border space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{investment.plan_name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${Number(investment.amount_usd).toLocaleString()} invested
                      </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {investment.roi_percent}% Daily
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{daysRemaining} days remaining</span>
                    </div>
                    <div className="text-right">
                      <p className="text-success font-medium">
                        +${currentEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} earned
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Projected: ${projectedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active investments</p>
            <p className="text-xs">Start investing to track your returns</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
