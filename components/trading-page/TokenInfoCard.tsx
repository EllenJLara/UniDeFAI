import {
  BarChart2,
  TrendingUp,
  Activity,
  Users,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Copy,
  CheckCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTokenData } from "./contexts/token-data-context";
import { useState, useEffect } from "react";
import { formatCompact } from "@/lib/utils";

export default function TokenInfoCard() {
  const { tokenData, isLoading, isError } = useTokenData();
  const [animate, setAnimate] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timer);
  }, [tokenData?.market_data?.current_price.usd]);

  const getPriceChangeColor = (value: number) => {
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-400";
    return "text-gray-400";
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isError) {
    return (
      <Card className="bg-gray-900 rounded-2xl shadow-lg border-gray-800">
        <CardContent className="p-6">
          <p className="text-red-500">Error loading token data</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-900 rounded-2xl shadow-lg border-gray-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-800 rounded-full w-12"></div>
            <div className="h-4 bg-gray-800 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-800 rounded"></div>
              <div className="h-8 bg-gray-800 rounded"></div>
              <div className="h-8 bg-gray-800 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  const placeholderTokenIcon =
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmaWxsPSJub25lIj4gPGcgZmlsbD0iI2ZmZmZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPiA8cGF0aCBkPSJNNS43OTEgMy4zMThMMy4zMTYgNS43OTNhMSAxIDAgMDAwIDEuNDE0bDIuNDc1IDIuNDc1YTEgMSAwIDAwMS40MTUgMEw5LjY4IDcuMjA3YTEgMSAwIDAwMC0xLjQxNEw3LjIwNiAzLjMxOGExIDEgMCAwMC0xLjQxNSAwem0uNzA3IDQuOTVMNC43MzEgNi41bDEuNzY3LTEuNzY4TDguMjY2IDYuNSA2LjQ5OCA4LjI2OHoiLz4gPHBhdGggZD0iTTAgNi41YTYuNSA2LjUgMCAwMTEyLjM0Ni0yLjg0NSA2LjUgNi41IDAgMTEtOC42OTEgOC42OTFBNi41IDYuNSAwIDAxMCA2LjV6bTYuNS01YTUgNSAwIDEwMCAxMCA1IDUgMCAwMDAtMTB6bTYuNSA1YzAtLjIwMS0uMDEtLjQtLjAyNy0uNTk3YTUgNSAwIDExLTcuMDcgNy4wN0E2LjUgNi41IDAgMDAxMyA2LjV6Ii8+IDwvZz4gPC9zdmc+";
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-xl ring-2 ring-blue-500/20">
              <img
                src={
                  tokenData.image.includes("missing.png")
                    ? placeholderTokenIcon
                    : tokenData.image
                }
                alt={tokenData?.name}
                title={
                  tokenData.image.includes("missing.png")
                    ? `Icon for token ${
                        tokenData?.symbol?.toUpperCase() || tokenData?.name
                      } not available`
                    : tokenData?.name
                }
                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-200"
              />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                {tokenData?.name || "--"}
              </CardTitle>
              <p className="text-sm text-gray-400">
                {tokenData?.symbol?.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Price and Market Cap Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Price</p>
            <p className="text-lg font-bold text-white">
              $
              {Number(tokenData.market_data.current_price.usd).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 8,
                }
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Market Cap</p>
            <p className="text-lg font-bold text-white">
              $
              {Number(tokenData.market_data.market_cap.usd)
                ? formatCompact(Number(tokenData.market_data.market_cap.usd))
                : "--"}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Stats (24hr)</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Performance</p>
              <p
                className={`text-sm font-bold flex items-center gap-1 ${
                  tokenData.market_data.price_change_percentage_24h > 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {tokenData.market_data.price_change_percentage_24h > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {`${Number(
                  tokenData?.market_data?.price_change_percentage_24h
                ).toFixed(2)}%` || "--"}
              </p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Volume</p>
              <p className="text-sm font-bold text-white">
                $
                {formatCompact(
                  Number(tokenData?.market_data?.total_volume.usd)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Buyers/Sellers Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Buyers</p>
            <p className="text-sm font-bold text-green-400">
              {formatCompact(Number(tokenData?.market_data?.buyers_24h?.usd)) ||
                "--"}
            </p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Sellers</p>
            <p className="text-sm font-bold text-red-400">
              {formatCompact(
                Number(tokenData?.market_data?.sellers_24h?.usd)
              ) || "--"}
            </p>
          </div>
        </div>

        {/* Contract Address Row */}
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Contract Address</p>
              <p className="text-sm font-mono text-white">
                {`${tokenData.contract_address.slice(
                  0,
                  20
                )}...${tokenData.contract_address.slice(-4)}`}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(tokenData.contract_address)}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              {copied ? (
                <CheckCheck className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
