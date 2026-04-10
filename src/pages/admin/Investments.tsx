import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { investmentPlans } from "@/components/landing/InvestmentPlans";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pause, Play } from "lucide-react";
import {
  getDailyEarning,
  getElapsedInvestmentDays,
  getRemainingInvestmentDays,
} from "@/lib/investmentMath";

interface InvestmentRow {
  id: string;
  user_id: string;
  plan_name: string;
  amount_usd: number;
  roi_percent: number;
  duration_days: number;
  start_date: string | null;
  end_date: string | null;
  earned_amount: number | null;
  status: string | null;
  created_at: string | null;
  user_email?: string;
}

const AdminInvestments = () => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState<InvestmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentRow | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchInvestments();
  }, []);

  useRealtimeSubscription(
    [{ table: "investments", alertOnInsert: "📈 New Investment" }],
    handleRefresh
  );

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const [investmentsRes, profilesRes] = await Promise.all([
        supabase.from("investments").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, email"),
      ]);

      const emailMap = new Map((profilesRes.data || []).map((p) => [p.id, p.email]));

      const rows: InvestmentRow[] = (investmentsRes.data || []).map((inv) => ({
        ...inv,
        earned_amount: inv.earned_amount ?? 0,
        user_email: emailMap.get(inv.user_id) || inv.user_id,
      }));

      setInvestments(rows);
    } catch (error) {
      console.error("Error fetching investments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async () => {
    if (!selectedInvestment) return;
    setUpdating(true);

    const newStatus = selectedInvestment.status === "paused" ? "active" : "paused";

    try {
      const { error } = await supabase
        .from("investments")
        .update({ status: newStatus })
        .eq("id", selectedInvestment.id);

      if (error) throw error;

      setInvestments((prev) =>
        prev.map((inv) => inv.id === selectedInvestment.id ? { ...inv, status: newStatus } : inv)
      );

      toast({
        title: newStatus === "paused" ? "Investment Paused" : "Investment Resumed",
        description: `${selectedInvestment.user_email}'s ${selectedInvestment.plan_name} investment has been ${newStatus === "paused" ? "paused" : "resumed"}.`,
      });
      setPauseDialogOpen(false);
    } catch (error) {
      console.error("Error updating investment:", error);
      toast({ title: "Error", description: "Failed to update investment", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      completed: "secondary",
      paused: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status || ""] || "outline"}>{status || "unknown"}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {investmentPlans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="pt-6">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-2xl font-bold mt-1">${plan.amount.toLocaleString()}</p>
                <p className="text-sm text-primary mt-1">{plan.roi}% ROI in {plan.durationDays}d</p>
                <p className="text-xs text-muted-foreground">Min. ${plan.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Duration: {plan.duration}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Investments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : investments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No investments yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Daily Earning</TableHead>
                    <TableHead>Total Earned</TableHead>
                    <TableHead>Days Elapsed</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((inv) => {
                    const startDate = inv.start_date || inv.created_at;
                    const now = new Date();
                    const daysElapsed = getElapsedInvestmentDays(startDate, inv.duration_days, now);
                    const daysLeft = getRemainingInvestmentDays(startDate, inv.duration_days, now);
                    const dailyEarning = getDailyEarning(inv.amount_usd, inv.roi_percent, inv.duration_days);

                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="text-sm">{inv.user_email}</TableCell>
                        <TableCell className="font-medium">{inv.plan_name}</TableCell>
                        <TableCell>${Number(inv.amount_usd).toLocaleString()}</TableCell>
                        <TableCell>{inv.roi_percent}%</TableCell>
                        <TableCell className="text-success font-medium">
                          +${dailyEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-success font-medium">
                          +${Number(inv.earned_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{daysElapsed}</TableCell>
                        <TableCell>{daysLeft}</TableCell>
                        <TableCell>{getStatusBadge(inv.status)}</TableCell>
                        <TableCell className="text-right">
                          {(inv.status === "active" || inv.status === "paused") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                setSelectedInvestment(inv);
                                setPauseDialogOpen(true);
                              }}
                            >
                              {inv.status === "paused" ? (
                                <><Play className="h-4 w-4 text-success" /> Resume</>
                              ) : (
                                <><Pause className="h-4 w-4 text-warning" /> Pause</>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedInvestment?.status === "paused" ? "Resume Investment" : "Pause Investment"}
            </DialogTitle>
            <DialogDescription>
              {selectedInvestment?.status === "paused" ? (
                <>Are you sure you want to resume <strong>{selectedInvestment?.user_email}</strong>'s <strong>{selectedInvestment?.plan_name}</strong> investment? It will start growing again.</>
              ) : (
                <>Are you sure you want to pause <strong>{selectedInvestment?.user_email}</strong>'s <strong>{selectedInvestment?.plan_name}</strong> investment?
                  <span className="block mt-2 text-warning font-medium">The investment will stop earning ROI until resumed.</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleTogglePause} disabled={updating} variant={selectedInvestment?.status === "paused" ? "default" : "secondary"}>
              {updating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Updating...</>
              ) : selectedInvestment?.status === "paused" ? "Resume" : "Pause"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminInvestments;