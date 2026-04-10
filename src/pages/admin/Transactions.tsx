import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Check, X, Clock, Loader2, RefreshCw } from "lucide-react";

interface AdminTransaction {
  id: string;
  user_email: string;
  type: "deposit" | "withdrawal";
  amount: number;
  crypto: string;
  status: string;
  date: string;
  wallet_address?: string;
}

const AdminTransactions = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchTransactions();
  }, []);

  useRealtimeSubscription(
    [
      { table: "deposits", alertOnInsert: "💰 New Deposit Received" },
      { table: "withdrawals", alertOnInsert: "💸 New Withdrawal Request" },
    ],
    handleRefresh
  );

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fetch profiles for email mapping
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email");
      const emailMap = new Map(profiles?.map((p) => [p.id, p.email]) || []);

      const [depositsRes, withdrawalsRes] = await Promise.all([
        supabase.from("deposits").select("*").order("created_at", { ascending: false }),
        supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
      ]);

      const allTx: AdminTransaction[] = [
        ...(depositsRes.data || []).map((d) => ({
          id: d.id,
          user_email: emailMap.get(d.user_id) || d.user_id,
          type: "deposit" as const,
          amount: Number(d.amount_usd),
          crypto: d.crypto_currency,
          status: d.status || "waiting",
          date: d.created_at ? new Date(d.created_at).toLocaleDateString() : "N/A",
        })),
        ...(withdrawalsRes.data || []).map((w) => ({
          id: w.id,
          user_email: emailMap.get(w.user_id) || w.user_id,
          type: "withdrawal" as const,
          amount: Number(w.amount_usd),
          crypto: w.crypto_currency,
          status: w.status || "pending",
          date: w.created_at ? new Date(w.created_at).toLocaleDateString() : "N/A",
          wallet_address: w.wallet_address,
        })),
      ];

      allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(allTx);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({ title: "Error", description: "Failed to load transactions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tx: AdminTransaction, newStatus: string) => {
    setUpdatingId(tx.id);
    try {
      const table = tx.type === "deposit" ? "deposits" : "withdrawals";
      const statusField = tx.type === "deposit"
        ? (newStatus === "successful" ? "confirmed" : "failed")
        : (newStatus === "successful" ? "completed" : "failed");

      const { error } = await supabase
        .from(table)
        .update({ status: statusField, updated_at: new Date().toISOString() })
        .eq("id", tx.id);

      if (error) throw error;

      // Deposit balance crediting is handled automatically by NOWPayments webhook
      // Admin only manually processes withdrawals

      // Notify moderators of successful transactions
      if (statusField === "confirmed" || statusField === "completed") {
        try {
          await supabase.functions.invoke("notify-moderator", {
            body: {
              transaction_type: tx.type === "deposit" ? "Deposit" : "Withdrawal",
              amount: tx.amount,
              user_email: tx.user_email,
              transaction_id: tx.id,
            },
          });
        } catch (notifyErr) {
          console.error("Failed to notify moderator:", notifyErr);
        }
      }

      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, status: statusField } : t))
      );

      toast({ title: "Updated", description: `Transaction marked as ${statusField}` });
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({ title: "Error", description: "Failed to update transaction", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.includes(searchQuery)
  );

  const pendingTransactions = filteredTransactions.filter(
    (tx) => tx.status === "pending" || tx.status === "waiting" || tx.status === "confirming"
  );
  const completedTransactions = filteredTransactions.filter(
    (tx) => tx.status !== "pending" && tx.status !== "waiting" && tx.status !== "confirming"
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transaction Management</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchTransactions}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Pending ({pendingTransactions.length})
                  </TabsTrigger>
                  <TabsTrigger value="all">All Transactions</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  <TransactionTable
                    transactions={pendingTransactions}
                    onStatusUpdate={handleStatusUpdate}
                    updatingId={updatingId}
                    showActions
                  />
                </TabsContent>

                <TabsContent value="all">
                  <TransactionTable
                    transactions={filteredTransactions}
                    onStatusUpdate={handleStatusUpdate}
                    updatingId={updatingId}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

const TransactionTable = ({
  transactions,
  onStatusUpdate,
  updatingId,
  showActions = false,
}: {
  transactions: AdminTransaction[];
  onStatusUpdate: (tx: AdminTransaction, status: string) => void;
  updatingId: string | null;
  showActions?: boolean;
}) => {
  const isMobile = useIsMobile();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  const StatusBadge = ({ status }: { status: string }) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        status === "confirmed" || status === "completed"
          ? "bg-success/10 text-success"
          : status === "failed" || status === "expired"
          ? "bg-destructive/10 text-destructive"
          : "bg-warning/10 text-warning"
      }`}
    >
      {status}
    </span>
  );

  const ActionButtons = ({ tx }: { tx: AdminTransaction }) => {
    // Deposits are auto-confirmed by NOWPayments webhook - no manual actions
    if (tx.type === "deposit") return null;
    
    // Only show actions for pending withdrawals
    const isPending = tx.status === "pending";
    if (!isPending) return null;
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-success hover:text-success"
          onClick={() => onStatusUpdate(tx, "successful")}
          disabled={updatingId === tx.id}
        >
          {updatingId === tx.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => onStatusUpdate(tx, "failed")}
          disabled={updatingId === tx.id}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={`${tx.type}-${tx.id}`} className="p-4 rounded-lg border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">{tx.type}</span>
              <StatusBadge status={tx.status} />
            </div>
            <p className="text-xs text-muted-foreground truncate">{tx.user_email}</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold">${tx.amount.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{tx.crypto?.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{tx.date}</span>
              <ActionButtons tx={tx} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Crypto</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={`${tx.type}-${tx.id}`}>
            <TableCell className="text-sm">{tx.user_email}</TableCell>
            <TableCell className="capitalize">{tx.type}</TableCell>
            <TableCell>${tx.amount.toLocaleString()}</TableCell>
            <TableCell>{tx.crypto?.toUpperCase()}</TableCell>
            <TableCell><StatusBadge status={tx.status} /></TableCell>
            <TableCell>{tx.date}</TableCell>
            <TableCell className="text-right">
              <ActionButtons tx={tx} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminTransactions;
