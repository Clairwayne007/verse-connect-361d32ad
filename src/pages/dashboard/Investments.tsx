import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestments } from "@/hooks/useInvestments";
import { useToast } from "@/hooks/use-toast";
import { investmentPlans, InvestmentPlan } from "@/components/landing/InvestmentPlans";
import { Check, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getDailyEarning,
  getDailyRoiPercent,
  getElapsedInvestmentDays,
  getRemainingInvestmentDays,
} from "@/lib/investmentMath";

const Investments = () => {
  const { user, refreshProfile } = useAuth();
  const { activeInvestments, isLoading, createInvestment, refetch } = useInvestments();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isInvesting, setIsInvesting] = useState(false);

  const availableBalance = Number(user?.balance || 0);

  const handleInvest = async () => {
    if (!selectedPlan || !user) return;

    const amount = parseFloat(investmentAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount",
        variant: "destructive",
      });
      return;
    }

    if (amount < selectedPlan.amount) {
      toast({
        title: "Below Minimum",
        description: `Minimum investment for ${selectedPlan.name} is $${selectedPlan.amount.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit funds to your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsInvesting(true);

    const result = await createInvestment(
      selectedPlan.id,
      selectedPlan.name,
      amount,
      selectedPlan.roi,
      selectedPlan.durationDays
    );

    if (result.success) {
      toast({
        title: "Investment Successful!",
        description: `You've invested $${amount.toLocaleString()} in ${selectedPlan.name}`,
      });
      setSelectedPlan(null);
      setInvestmentAmount("");
      refreshProfile();
      refetch();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to process investment",
        variant: "destructive",
      });
    }

    setIsInvesting(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Your Active Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : activeInvestments.length > 0 ? (
              <div className="space-y-4">
                {activeInvestments.map((inv) => {
                  const startDate = new Date(inv.start_date);
                  const now = new Date();
                  const daysActive = getElapsedInvestmentDays(inv.start_date, inv.duration_days, now);
                  const daysLeft = getRemainingInvestmentDays(inv.start_date, inv.duration_days, now);
                  const dailyEarning = getDailyEarning(inv.amount_usd, inv.roi_percent, inv.duration_days);

                  return (
                    <div
                      key={inv.id}
                      className="p-4 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{inv.plan_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Started: {startDate.toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                          Active
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Invested</p>
                          <p className="font-medium">${Number(inv.amount_usd).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Daily Earning</p>
                          <p className="font-medium text-success">
                            +${dailyEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Earned</p>
                          <p className="font-medium text-success">
                            +${Number(inv.earned_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Days Active</p>
                          <p className="font-medium">{daysActive}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Days Left</p>
                          <p className="font-medium">{daysLeft}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Start</p>
                          <p className="font-medium">{startDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active investments</p>
                <p className="text-sm text-muted-foreground">
                  {availableBalance > 0
                    ? "Choose a plan below to start earning!"
                    : "Deposit funds first, then choose an investment plan to start earning!"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h3 className="text-lg font-semibold mb-4">Available Investment Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {investmentPlans.map((plan) => (
              <Card key={plan.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                    {plan.roi}% ROI in {plan.durationDays} Days
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Min. ${plan.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mb-4">Duration: {plan.duration}</p>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {availableBalance <= 0 ? (
                    <Button
                      className="w-full"
                      onClick={() => {
                        window.location.href = "/dashboard/wallet";
                      }}
                    >
                      Deposit First
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => setSelectedPlan(plan)}>
                      Invest Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Dialog
          open={!!selectedPlan}
          onOpenChange={() => {
            setSelectedPlan(null);
            setInvestmentAmount("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invest in {selectedPlan?.name}</DialogTitle>
              <DialogDescription>Enter the amount you want to invest</DialogDescription>
            </DialogHeader>

            {selectedPlan && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium">{selectedPlan.name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Total ROI</span>
                    <span className="font-medium text-primary">{selectedPlan.roi}%</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Daily ROI</span>
                    <span className="font-medium text-primary">
                      {getDailyRoiPercent(selectedPlan.roi, selectedPlan.durationDays).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{selectedPlan.duration}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Investment Amount (USD)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    min="1"
                    max={availableBalance}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span>Available Balance</span>
                  <span className="font-bold">
                    ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {investmentAmount && parseFloat(investmentAmount) > 0 && (
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-success">
                      Estimated daily earnings: ${getDailyEarning(parseFloat(investmentAmount), selectedPlan.roi, selectedPlan.durationDays).toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedPlan(null);
                      setInvestmentAmount("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleInvest}
                    disabled={
                      isInvesting ||
                      !investmentAmount ||
                      parseFloat(investmentAmount) <= 0 ||
                      parseFloat(investmentAmount) > availableBalance
                    }
                  >
                    {isInvesting ? <TrendingUp className="h-4 w-4 animate-pulse" /> : "Confirm Investment"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Investments;
