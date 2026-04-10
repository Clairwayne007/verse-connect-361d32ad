import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "investment";
  amount: number;
  crypto?: string;
  plan?: string;
  status: string;
  date: string;
}

const Transactions = () => {
  const { session } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!session) return;
    setIsLoading(true);

    const [depositsRes, withdrawalsRes, investmentsRes] = await Promise.all([
      supabase.from("deposits").select("*").order("created_at", { ascending: false }),
      supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
      supabase.from("investments").select("*").order("created_at", { ascending: false }),
    ]);

    const allTx: Transaction[] = [
      ...(depositsRes.data || []).map((d) => ({
        id: d.id,
        type: "deposit" as const,
        amount: Number(d.amount_usd),
        crypto: d.crypto_currency,
        status: d.status === "confirmed" ? "successful" : d.status === "failed" || d.status === "expired" ? "failed" : "pending",
        date: new Date(d.created_at!).toLocaleString(),
      })),
      ...(withdrawalsRes.data || []).map((w) => ({
        id: w.id,
        type: "withdrawal" as const,
        amount: Number(w.amount_usd),
        crypto: w.crypto_currency,
        status: w.status === "completed" ? "successful" : w.status === "failed" ? "failed" : "pending",
        date: new Date(w.created_at!).toLocaleString(),
      })),
      ...(investmentsRes.data || []).map((inv) => ({
        id: inv.id,
        type: "investment" as const,
        amount: Number(inv.amount_usd),
        plan: inv.plan_name,
        status: inv.status === "active" ? "successful" : inv.status === "cancelled" ? "failed" : "successful",
        date: new Date(inv.created_at!).toLocaleString(),
      })),
    ];

    // Sort by date descending
    allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(allTx);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [session]);

  const deposits = transactions.filter((tx) => tx.type === "deposit");
  const withdrawals = transactions.filter((tx) => tx.type === "withdrawal");
  const investments = transactions.filter((tx) => tx.type === "investment");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchTransactions}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="deposits">Deposits</TabsTrigger>
                  <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                  <TabsTrigger value="investments">Investments</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <TransactionList transactions={transactions} />
                </TabsContent>
                <TabsContent value="deposits">
                  <TransactionList transactions={deposits} />
                </TabsContent>
                <TabsContent value="withdrawals">
                  <TransactionList transactions={withdrawals} />
                </TabsContent>
                <TabsContent value="investments">
                  <TransactionList transactions={investments} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                tx.type === "deposit"
                  ? "bg-success/10 text-success"
                  : tx.type === "withdrawal"
                  ? "bg-warning/10 text-warning"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {tx.type === "deposit" ? (
                <ArrowDownRight className="h-5 w-5" />
              ) : tx.type === "withdrawal" ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <TrendingUp className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-medium capitalize">{tx.type}</p>
              <p className="text-sm text-muted-foreground">
                {tx.crypto?.toUpperCase() || tx.plan || "Investment"} • {tx.date}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`font-semibold ${
                tx.type === "deposit"
                  ? "text-success"
                  : tx.type === "withdrawal"
                  ? "text-foreground"
                  : "text-primary"
              }`}
            >
              {tx.type === "deposit" ? "+" : "-"}${tx.amount.toLocaleString()}
            </p>
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full ${
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
  );
};

export default Transactions;
