import { useState, useEffect, useCallback } from "react";

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  image: string;
  sparkline_in_7d?: { price: number[] };
}

export interface ChartDataPoint {
  time: string;
  price: number;
  timestamp: number;
}

export type Timeframe = "1h" | "24h" | "7d" | "30d" | "90d";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Map of symbol to CoinGecko ID
const CRYPTO_IDS: Record<string, string> = {
  btc: "bitcoin",
  eth: "ethereum",
  sol: "solana",
  xrp: "ripple",
  doge: "dogecoin",
  ada: "cardano",
  dot: "polkadot",
  ltc: "litecoin",
  link: "chainlink",
  bnb: "binancecoin",
};

// Get days parameter for CoinGecko API based on timeframe
const getTimeframeDays = (timeframe: Timeframe): number => {
  switch (timeframe) {
    case "1h":
      return 1; // CoinGecko minimum is 1 day, we'll filter to last hour
    case "24h":
      return 1;
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return 1;
  }
};

export const useMarketData = (symbols: string[] = ["btc", "eth", "sol", "xrp", "doge", "bnb"]) => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const ids = symbols.map((s) => CRYPTO_IDS[s.toLowerCase()] || s).join(",");
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch market data");
      }

      const data: CryptoPrice[] = await response.json();
      setPrices(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching prices:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch prices");
    } finally {
      setIsLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchPrices();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, isLoading, error, refetch: fetchPrices };
};

export const useChartData = (symbol: string, timeframe: Timeframe = "24h") => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    try {
      const coinId = CRYPTO_IDS[symbol.toLowerCase()] || symbol.toLowerCase();
      const days = getTimeframeDays(timeframe);
      
      const response = await fetch(
        `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chart data");
      }

      const data = await response.json();
      let prices: [number, number][] = data.prices;

      // For 1h timeframe, filter to last hour only
      if (timeframe === "1h") {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        prices = prices.filter(([timestamp]) => timestamp >= oneHourAgo);
      }

      // Format data for recharts
      const formattedData: ChartDataPoint[] = prices.map(([timestamp, price]) => {
        const date = new Date(timestamp);
        let timeLabel: string;

        if (timeframe === "1h" || timeframe === "24h") {
          timeLabel = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        } else if (timeframe === "7d") {
          timeLabel = date.toLocaleDateString("en-US", { weekday: "short", hour: "2-digit" });
        } else {
          timeLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }

        return {
          time: timeLabel,
          price: price,
          timestamp: timestamp,
        };
      });

      // Reduce data points for better performance (max 100 points)
      const maxPoints = 100;
      const step = Math.max(1, Math.floor(formattedData.length / maxPoints));
      const reducedData = formattedData.filter((_, index) => index % step === 0);

      setChartData(reducedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch chart data");
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return { chartData, isLoading, error, refetch: fetchChartData };
};

// Format large numbers for volume display
export const formatVolume = (volume: number): string => {
  if (volume >= 1e12) return `$${(volume / 1e12).toFixed(2)}T`;
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
  return `$${volume.toFixed(2)}`;
};

// Format price based on value
export const formatPrice = (price: number): string => {
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
};
