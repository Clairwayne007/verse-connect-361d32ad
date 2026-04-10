import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, BellRing, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/hooks/useMarketData";

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  createdAt: Date;
  triggered?: boolean;
}

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

interface PriceAlertsProps {
  alerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, "id" | "createdAt">) => void;
  onDeleteAlert: (id: string) => void;
  currentPrices?: Record<string, number>;
}

export const PriceAlerts = ({ alerts, onAddAlert, onDeleteAlert, currentPrices = {} }: PriceAlertsProps) => {
  const { toast } = useToast();
  const [selectedSymbol, setSelectedSymbol] = useState("btc");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");

  const handleAddAlert = () => {
    const price = parseFloat(targetPrice);
    if (!targetPrice || price <= 0) {
      toast({ title: "Error", description: "Please enter a valid price", variant: "destructive" });
      return;
    }

    onAddAlert({
      symbol: selectedSymbol,
      targetPrice: price,
      condition,
    });

    toast({
      title: "Alert Created",
      description: `You'll be notified when ${selectedSymbol.toUpperCase()} goes ${condition} ${formatPrice(price)}`,
    });

    setTargetPrice("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Price Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new alert form */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Asset</Label>
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_SYMBOLS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Condition</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as "above" | "below")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Above</SelectItem>
                <SelectItem value="below">Below</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Target Price ($)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddAlert} className="w-full">
              <BellRing className="h-4 w-4 mr-2" />
              Set Alert
            </Button>
          </div>
        </div>

        {/* Current price hint */}
        {currentPrices[selectedSymbol] && (
          <p className="text-xs text-muted-foreground">
            Current price: {formatPrice(currentPrices[selectedSymbol])}
          </p>
        )}

        {/* Active alerts list */}
        {alerts.length > 0 ? (
          <div className="space-y-2 mt-4">
            <p className="text-sm font-medium">Active Alerts</p>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  {alert.condition === "above" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {alert.symbol.toUpperCase()} {alert.condition} {formatPrice(alert.targetPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {alert.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.triggered && (
                    <Badge className="bg-success/10 text-success border-success/20">Triggered</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteAlert(alert.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No price alerts set</p>
            <p className="text-xs">Create an alert to get notified of price movements</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
