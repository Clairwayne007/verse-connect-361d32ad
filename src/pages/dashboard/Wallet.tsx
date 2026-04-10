import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useDeposits } from "@/hooks/useDeposits";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, ExternalLink, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Bitcoin, Phone, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const cryptoOptions = [
  { id: "btc", name: "Bitcoin (BTC)" },
  { id: "eth", name: "Ethereum (ETH)" },
  { id: "usdttrc20", name: "USDT (TRC20)" },
  { id: "ltc", name: "Litecoin (LTC)" },
  { id: "xrp", name: "Ripple (XRP)" },
  { id: "doge", name: "Dogecoin (DOGE)" },
];

type DepositMethod = "crypto" | "card";

const Wallet = () => {
  const { user, refreshProfile } = useAuth();
  const { deposits, createDeposit, checkDepositStatus, isLoading, refetch } = useDeposits();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("btc");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingInvoiceUrl, setPendingInvoiceUrl] = useState<string | null>(null);
  const [depositMethod, setDepositMethod] = useState<DepositMethod>("crypto");
  const [phoneVerified, setPhoneVerified] = useState<boolean | null>(null);
  
  // Card payment fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Handle payment return from NOWPayments
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      toast({
        title: "Payment Received",
        description: "Your deposit is being confirmed. Balance will be credited shortly.",
      });
      searchParams.delete("status");
      setSearchParams(searchParams, { replace: true });
      refetch();
      refreshProfile();
    } else if (status === "cancelled") {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "destructive",
      });
      searchParams.delete("status");
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  // Phone verification not yet implemented - default to true to allow withdrawals
  useEffect(() => {
    setPhoneVerified(true);
  }, [user?.id]);

  // Poll for pending deposit status updates
  useEffect(() => {
    const pendingDeposits = deposits.filter(
      (d) => d.status === "waiting" || d.status === "confirming"
    );

    if (pendingDeposits.length > 0) {
      const interval = setInterval(() => {
        pendingDeposits.forEach((d) => checkDepositStatus(d.id));
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [deposits, checkDepositStatus]);

  // Refresh profile when a deposit is confirmed
  useEffect(() => {
    const hasNewConfirmed = deposits.some((d) => d.status === "confirmed");
    if (hasNewConfirmed) {
      refreshProfile();
    }
  }, [deposits, refreshProfile]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!depositAmount || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (amount < 10) {
      toast({ title: "Error", description: "Minimum deposit is $10", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    
    const result = await createDeposit(amount, selectedCrypto);
    
    if (result.success && result.invoiceUrl) {
      setPendingInvoiceUrl(result.invoiceUrl);
      toast({
        title: "Invoice Created",
        description: "Complete your payment in the payment window",
      });
      // Open payment in new tab
      window.open(result.invoiceUrl, "_blank");
      setDepositAmount("");
    }
    
    setIsProcessing(false);
  };

  const handleCardDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!depositAmount || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (amount < 50) {
      toast({ title: "Error", description: "Minimum card deposit is $50", variant: "destructive" });
      return;
    }

    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      toast({ title: "Error", description: "Please fill in all card details", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    
    // Simulate card payment processing
    toast({
      title: "Processing Payment",
      description: "Please wait while we process your card payment...",
    });

    // TODO: Integrate with Stripe or payment gateway
    setTimeout(() => {
      toast({
        title: "Card Payment",
        description: "Card payments will be available soon. Please use cryptocurrency for now.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }, 2000);
  };


  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!withdrawAmount || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (amount < 10) {
      toast({ title: "Error", description: "Minimum withdrawal is $10", variant: "destructive" });
      return;
    }

    if (amount > (user?.balance || 0)) {
      toast({ title: "Error", description: "Insufficient balance", variant: "destructive" });
      return;
    }

    if (!withdrawAddress.trim()) {
      toast({ title: "Error", description: "Please enter your wallet address", variant: "destructive" });
      return;
    }

    // Basic wallet address validation
    if (withdrawAddress.trim().length < 20) {
      toast({ title: "Error", description: "Please enter a valid wallet address", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Insert withdrawal request into database
      const { error } = await supabase.from("withdrawals").insert({
        user_id: user?.id,
        amount_usd: amount,
        crypto_currency: selectedCrypto,
        wallet_address: withdrawAddress.trim(),
        status: "pending",
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Withdrawal Requested",
          description: "Your withdrawal request has been submitted and is pending approval.",
        });
        setWithdrawAmount("");
        setWithdrawAddress("");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit withdrawal request", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="h-3 w-3 mr-1" /> Confirmed
          </Badge>
        );
      case "confirming":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Clock className="h-3 w-3 mr-1" /> Confirming
          </Badge>
        );
      case "waiting":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Clock className="h-3 w-3 mr-1" /> Waiting
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-muted text-muted-foreground">
            <AlertCircle className="h-3 w-3 mr-1" /> Expired
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Balance card */}
        <Card className="bg-gradient-to-r from-primary to-cyan-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-primary-foreground">
              <div>
                <p className="text-sm opacity-90">Available Balance</p>
                <p className="text-4xl font-bold mt-1">${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-sm opacity-90 mt-2">USD</p>
              </div>
              <WalletIcon className="h-16 w-16 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Deposit/Withdraw tabs */}
        <Tabs defaultValue="deposit">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="gap-2">
              <ArrowDownRight className="h-4 w-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Funds</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment method selection */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={depositMethod === "crypto" ? "default" : "outline"}
                    className="flex flex-col h-auto py-4 gap-2"
                    onClick={() => setDepositMethod("crypto")}
                  >
                    <Bitcoin className="h-6 w-6" />
                    <span className="text-xs">Crypto</span>
                  </Button>
                  <Button
                    variant={depositMethod === "card" ? "default" : "outline"}
                    className="flex flex-col h-auto py-4 gap-2"
                    onClick={() => setDepositMethod("card")}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span className="text-xs">Card</span>
                  </Button>
                </div>

                {/* Crypto deposit form */}
                {depositMethod === "crypto" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Cryptocurrency</Label>
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crypto" />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptoOptions.map((crypto) => (
                            <SelectItem key={crypto.id} value={crypto.id}>
                              {crypto.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Amount (USD)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount (min $10)"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        min="10"
                      />
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-sm font-medium">How it works:</p>
                      <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                        <li>Enter the USD amount you want to deposit</li>
                        <li>Click "Generate Payment" to create an invoice</li>
                        <li>Pay the exact crypto amount shown</li>
                        <li>Your balance will be credited after confirmation</li>
                      </ol>
                    </div>

                    <Button className="w-full" onClick={handleDeposit} disabled={isProcessing}>
                      {isProcessing ? "Processing..." : "Generate Payment"}
                    </Button>
                  </div>
                )}

                {/* Card deposit form */}
                {depositMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Amount (USD)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount (min $50)"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        min="50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cardholder Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CVV</Label>
                        <Input
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={4}
                          type="password"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                      <p className="text-sm font-medium text-primary">Coming Soon</p>
                      <p className="text-sm text-muted-foreground">
                        Card payments are being integrated. Please use cryptocurrency for now.
                      </p>
                    </div>

                    <Button className="w-full" onClick={handleCardDeposit} disabled={isProcessing}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isProcessing ? "Processing..." : "Pay with Card"}
                    </Button>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {phoneVerified === false ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
                      <ShieldAlert className="h-8 w-8 text-warning" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Phone Verification Required</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You need to verify your phone number before making withdrawals.
                      </p>
                    </div>
                    <Link to="/dashboard/profile">
                      <Button className="gap-2">
                        <Phone className="h-4 w-4" />
                        Verify Phone Number
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Select Cryptocurrency</Label>
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crypto" />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptoOptions.map((crypto) => (
                            <SelectItem key={crypto.id} value={crypto.id}>
                              {crypto.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Amount (USD)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Available: ${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Wallet Address</Label>
                      <Input
                        placeholder="Enter your wallet address"
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleWithdraw}
                      disabled={isProcessing || (user?.balance || 0) < parseFloat(withdrawAmount || "0")}
                    >
                      {isProcessing ? "Processing..." : "Request Withdrawal"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent deposits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Deposits</CardTitle>
            <Button variant="ghost" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : deposits.length > 0 ? (
              <div className="space-y-4">
                {deposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${Number(deposit.amount_usd).toLocaleString()} USD</span>
                        {getStatusBadge(deposit.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {deposit.crypto_currency.toUpperCase()}
                        {deposit.crypto_amount && ` • ${deposit.crypto_amount}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deposit.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(deposit.status === "waiting" || deposit.status === "confirming") && deposit.invoice_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(deposit.invoice_url!, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Pay
                        </Button>
                      )}
                      {(deposit.status === "waiting" || deposit.status === "confirming") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => checkDepositStatus(deposit.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No deposits yet</p>
                <p className="text-sm">Make your first deposit to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Wallet;
