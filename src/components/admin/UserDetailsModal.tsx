import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  History,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Loader2,
} from "lucide-react";
import type { AppRole } from "@/contexts/AuthContext";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: AppRole;
  createdAt: string;
  avatar_url?: string;
}

interface Investment {
  id: string;
  plan_name: string;
  amount_usd: number;
  roi_percent: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: string;
  earned_amount: number;
}

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount_usd: number;
  crypto_currency: string;
  status: string;
  created_at: string;
}

interface UserDetailsModalProps {
  user: UserWithRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsModal = ({ user, open, onOpenChange }: UserDetailsModalProps) => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [deletingAvatar, setDeletingAvatar] = useState(false);

  useEffect(() => {
    if (user && open) {
      fetchUserDetails();
    }
  }, [user, open]);

  const fetchUserDetails = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [investmentsResult, depositsResult, withdrawalsResult, profileResult] = await Promise.all([
        supabase.from("investments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("deposits").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("avatar_url").eq("id", user.id).single(),
      ]);

      if (investmentsResult.data) {
        setInvestments(investmentsResult.data as Investment[]);
      }

      const allTransactions: Transaction[] = [
        ...(depositsResult.data || []).map((d) => ({
          id: d.id,
          type: "deposit" as const,
          amount_usd: Number(d.amount_usd),
          crypto_currency: d.crypto_currency,
          status: d.status || "pending",
          created_at: d.created_at || "",
        })),
        ...(withdrawalsResult.data || []).map((w) => ({
          id: w.id,
          type: "withdrawal" as const,
          amount_usd: Number(w.amount_usd),
          crypto_currency: w.crypto_currency,
          status: w.status || "pending",
          created_at: w.created_at || "",
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(allTransactions);
      setAvatarUrl(profileResult.data?.avatar_url || null);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user || !avatarUrl) return;

    setDeletingAvatar(true);
    try {
      // Extract file path from the URL
      const urlParts = avatarUrl.split("/avatars/");
      const filePath = urlParts.length > 1 ? urlParts[1] : null;

      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("avatars")
          .remove([filePath]);

        if (storageError) {
          console.error("Storage delete error:", storageError);
        }
      }

      // Clear avatar_url in profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (profileError) throw profileError;

      setAvatarUrl(null);
      toast({ title: "Avatar Deleted", description: `${user.name}'s avatar has been removed.` });
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast({ title: "Error", description: "Failed to delete avatar", variant: "destructive" });
    } finally {
      setDeletingAvatar(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      completed: "secondary",
      confirmed: "default",
      pending: "outline",
      waiting: "outline",
      failed: "destructive",
      cancelled: "destructive",
      expired: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount_usd), 0);
  const totalEarned = investments.reduce((sum, inv) => sum + Number(inv.earned_amount || 0), 0);
  const totalDeposited = transactions
    .filter((t) => t.type === "deposit" && t.status === "confirmed")
    .reduce((sum, t) => sum + t.amount_usd, 0);
  const totalWithdrawn = transactions
    .filter((t) => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount_usd, 0);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl || undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {avatarUrl && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                  onClick={handleDeleteAvatar}
                  disabled={deletingAvatar}
                  title="Delete avatar"
                >
                  {deletingAvatar ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground font-normal">{user.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Balance</span>
                  </div>
                  <p className="text-lg font-bold">${user.balance.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Invested</span>
                  </div>
                  <p className="text-lg font-bold">${totalInvested.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-success" />
                    <span className="text-xs text-muted-foreground">Deposited</span>
                  </div>
                  <p className="text-lg font-bold text-success">${totalDeposited.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-warning" />
                    <span className="text-xs text-muted-foreground">Withdrawn</span>
                  </div>
                  <p className="text-lg font-bold text-warning">${totalWithdrawn.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="investments" className="mt-4">
              <TabsList className="w-full">
                <TabsTrigger value="investments" className="flex-1 gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Investments ({investments.length})
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex-1 gap-2">
                  <History className="h-4 w-4" />
                  Transactions ({transactions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="investments" className="mt-4">
                {investments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No investments found</div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {investments.map((inv) => {
                      const dailyEarning = (Number(inv.amount_usd) * Number(inv.roi_percent) / 100) / Number(inv.duration_days);
                      const startDate = inv.start_date ? new Date(inv.start_date) : new Date();
                      const now = new Date();
                      const daysElapsed = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
                      const daysLeft = inv.end_date
                        ? Math.max(0, Math.ceil((new Date(inv.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                        : inv.duration_days - daysElapsed;

                      return (
                        <Card key={inv.id}>
                          <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{inv.plan_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  ${Number(inv.amount_usd).toLocaleString()} • {inv.roi_percent}% ROI / {inv.duration_days} Days
                                </p>
                              </div>
                              <div className="text-right">
                                {getStatusBadge(inv.status)}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                              <div>
                                <p className="text-muted-foreground">Daily Earning</p>
                                <p className="font-medium text-success">+${dailyEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Total Earned</p>
                                <p className="font-medium text-success">+${Number(inv.earned_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Days Active</p>
                                <p className="font-medium">{daysElapsed}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Days Left</p>
                                <p className="font-medium">{Math.max(0, daysLeft)}</p>
                              </div>
                            </div>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Start: {inv.start_date ? new Date(inv.start_date).toLocaleDateString() : "N/A"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                End: {inv.end_date ? new Date(inv.end_date).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="transactions" className="mt-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No transactions found</div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {transactions.map((tx) => (
                      <Card key={tx.id}>
                        <CardContent className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${tx.type === "deposit" ? "bg-success/10" : "bg-warning/10"}`}>
                                {tx.type === "deposit" ? (
                                  <ArrowUpRight className="h-4 w-4 text-success" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 text-warning" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium capitalize">{tx.type}</p>
                                <p className="text-sm text-muted-foreground">{tx.crypto_currency}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${tx.type === "deposit" ? "text-success" : "text-warning"}`}>
                                {tx.type === "deposit" ? "+" : "-"}${tx.amount_usd.toLocaleString()}
                              </p>
                              <div className="flex items-center gap-2 justify-end mt-1">
                                {getStatusBadge(tx.status)}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {tx.created_at ? new Date(tx.created_at).toLocaleString() : "N/A"}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
