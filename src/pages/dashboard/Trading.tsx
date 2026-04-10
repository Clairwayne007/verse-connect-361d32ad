import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity, RefreshCw, Loader2 } from "lucide-react";
import { useMarketData, useChartData, formatVolume, formatPrice, Timeframe } from "@/hooks/useMarketData";
import { useInvestments } from "@/hooks/useInvestments";
import { PriceAlerts, PriceAlert } from "@/components/dashboard/PriceAlerts";
import { InvestmentTracker } from "@/components/dashboard/InvestmentTracker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_SYMBOLS = [
  { id: "btc", name: "Bitcoin", symbol: "BTC" },
  { id: "eth", name: "Ethereum", symbol: "ETH" },
  { id: "sol", name: "Solana", symbol: "SOL" },
  { id: "xrp", name: "Ripple", symbol: "XRP" },
  { id: "doge", name: "Dogecoin", symbol: "DOGE" },
  { id: "bnb", name: "BNB", symbol: "BNB" },
  { id: "ada", name: "Cardano", symbol: "ADA" },
  { id: "ltc", name: "Litecoin", symbol: "LTC" },
];

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: "1h", label: "1 Hour" },
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
];

const Trading = () => {
  const { toast } = useToast();
  const [selectedSymbol, setSelectedSymbol] = useState("btc");
  const [timeframe, setTimeframe] = useState<Timeframe>("24h");
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem("priceAlerts");
    return saved ? JSON.parse(saved).map((a: PriceAlert) => ({ ...a, createdAt: new Date(a.createdAt) })) : [];
  });
  
  const { prices, isLoading: pricesLoading, refetch: refetchPrices } = useMarketData();
  const { chartData, isLoading: chartLoading, refetch: refetchChart } = useChartData(selectedSymbol, timeframe);
  const { investments, totalInvested, totalEarned } = useInvestments();

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem("priceAlerts", JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  // Check price alerts
  useEffect(() => {
    if (prices.length === 0) return;
    
    priceAlerts.forEach((alert) => {
      if (alert.triggered) return;
      
      const coin = prices.find(
        (p) => p.symbol.toLowerCase() === alert.symbol.toLowerCase() || 
               p.id.toLowerCase() === alert.symbol.toLowerCase()
      );
      
      if (!coin) return;
      
      const isTriggered = 
        (alert.condition === "above" && coin.current_price >= alert.targetPrice) ||
        (alert.condition === "below" && coin.current_price <= alert.targetPrice);
      
      if (isTriggered) {
        toast({
          title: "🔔 Price Alert Triggered!",
          description: `${alert.symbol.toUpperCase()} is now ${alert.condition} ${formatPrice(alert.targetPrice)}`,
        });
        
        setPriceAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? { ...a, triggered: true } : a))
        );
      }
    });
  }, [prices, priceAlerts, toast]);

  const selectedCoin = prices.find(
    (p) => p.symbol.toLowerCase() === selectedSymbol.toLowerCase() || 
           p.id.toLowerCase() === selectedSymbol.toLowerCase()
  );

  const handleRefresh = () => {
    refetchPrices();
    refetchChart();
  };

  const handleAddAlert = (alert: Omit<PriceAlert, "id" | "createdAt">) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setPriceAlerts((prev) => [...prev, newAlert]);
  };

  const handleDeleteAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Build current prices map for alerts
  const currentPricesMap: Record<string, number> = {};
  prices.forEach((p) => {
    currentPricesMap[p.symbol.toLowerCase()] = p.current_price;
    currentPricesMap[p.id.toLowerCase()] = p.current_price;
  });

  // Get top 4 coins for market cards
  const topCoins = prices.slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Market overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pricesLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-24 mb-1" />
                  <Skeleton className="h-4 w-12" />
                </CardContent>
              </Card>
            ))
          ) : (
            topCoins.map((coin) => (
              <MarketCard
                key={coin.id}
                symbol={`${coin.symbol.toUpperCase()}/USD`}
                price={formatPrice(coin.current_price)}
                change={coin.price_change_percentage_24h}
                onClick={() => setSelectedSymbol(coin.symbol.toLowerCase())}
                isSelected={selectedSymbol === coin.symbol.toLowerCase()}
              />
            ))
          )}
        </div>

        {/* Chart section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Live Trading Charts
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_SYMBOLS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.symbol} - {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEFRAMES.map((tf) => (
                      <SelectItem key={tf.value} value={tf.value}>
                        {tf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={chartLoading}>
                  {chartLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Selected coin info */}
            {selectedCoin && (
              <div className="flex items-center gap-4 mt-4 p-3 rounded-lg bg-muted/50">
                <img src={selectedCoin.image} alt={selectedCoin.name} className="h-8 w-8" />
                <div>
                  <p className="font-semibold">{selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium">{formatPrice(selectedCoin.current_price)}</span>
                    <span className={`flex items-center gap-1 ${selectedCoin.price_change_percentage_24h >= 0 ? "text-success" : "text-destructive"}`}>
                      {selectedCoin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {selectedCoin.price_change_percentage_24h >= 0 ? "+" : ""}
                      {selectedCoin.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                    <span className="text-muted-foreground">
                      Vol: {formatVolume(selectedCoin.total_volume)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              {chartLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatPrice(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatPrice(value), "Price"]}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Market assets table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Market Overview</CardTitle>
            <Button variant="ghost" size="sm" onClick={refetchPrices} disabled={pricesLoading}>
              {pricesLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {pricesLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Asset</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">24h Change</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Volume</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((coin) => (
                      <tr 
                        key={coin.id} 
                        className={`border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${
                          selectedSymbol === coin.symbol.toLowerCase() ? "bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedSymbol(coin.symbol.toLowerCase())}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                            <div>
                              <p className="font-medium">{coin.symbol.toUpperCase()}</p>
                              <p className="text-sm text-muted-foreground">{coin.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4 font-medium">
                          {formatPrice(coin.current_price)}
                        </td>
                        <td className={`text-right py-4 px-4 font-medium ${coin.price_change_percentage_24h >= 0 ? "text-success" : "text-destructive"}`}>
                          <span className="flex items-center justify-end gap-1">
                            {coin.price_change_percentage_24h >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                            {coin.price_change_percentage_24h?.toFixed(2)}%
                          </span>
                        </td>
                        <td className="text-right py-4 px-4 text-muted-foreground">
                          {formatVolume(coin.total_volume)}
                        </td>
                        <td className="text-right py-4 px-4 text-muted-foreground">
                          {formatVolume(coin.market_cap)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Alerts */}
        <PriceAlerts
          alerts={priceAlerts}
          onAddAlert={handleAddAlert}
          onDeleteAlert={handleDeleteAlert}
          currentPrices={currentPricesMap}
        />

        {/* Investment Tracker */}
        <InvestmentTracker
          investments={investments}
          totalInvested={totalInvested}
          totalEarned={totalEarned}
        />
      </div>
    </DashboardLayout>
  );
};

interface MarketCardProps {
  symbol: string;
  price: string;
  change: number;
  onClick?: () => void;
  isSelected?: boolean;
}

const MarketCard = ({ symbol, price, change, onClick, isSelected }: MarketCardProps) => (
  <Card 
    className={`cursor-pointer transition-all hover:border-primary/50 ${isSelected ? "border-primary ring-1 ring-primary/20" : ""}`}
    onClick={onClick}
  >
    <CardContent className="pt-4">
      <p className="text-sm text-muted-foreground">{symbol}</p>
      <p className="text-xl font-bold mt-1">{price}</p>
      <div className={`flex items-center gap-1 mt-1 text-sm ${change >= 0 ? "text-success" : "text-destructive"}`}>
        {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span>{change >= 0 ? "+" : ""}{change?.toFixed(2)}%</span>
      </div>
    </CardContent>
  </Card>
);

export default Trading;
