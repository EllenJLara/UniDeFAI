import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useDebounce } from "./hooks/use-debounce";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useMediaQuery } from "../tweets/hooks/use-media-query";

interface TokenDataToSend {
  name: string;
  symbol: string;
  image: any;
}

interface TokenSearchProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelect: (address: string, tokenData: TokenDataToSend) => Promise<void>;
  isAdvanced?: boolean;
  className?: string;
  standalone?: boolean;
}

interface TokenData {
  name: string;
  symbol: string;
  address: string;
  price: number;
  price_change_24h_percent: number;
  market_cap?: number;
  fdv?: number;
  liquidity: number;
  volume_24h_usd: number;
  volume_24h_change_percent: number;
  trade_24h: number;
  trade_24h_change_percent: number;
  unique_wallet_24h: number;
  token_image: string;
  available: boolean;
}

interface APIResponse {
  tokens: TokenData[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
  timestamp: string;
}

const TokenLogo: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1f2937] to-[#111827] flex items-center justify-center text-white font-bold border border-gray-800">
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="w-10 h-10 rounded-full object-cover border border-gray-800"
      onError={() => setError(true)}
    />
  );
};

const formatNumber = (value?: number): string => {
  if (!value && value !== 0) return "--";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

const formatPercentage = (value?: number): string => {
  if (!value && value !== 0) return "--";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};

const truncateAddress = (address: string): string => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      {[...Array(10)].map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-4 border-b border-gray-800"
        >
          <div className="w-10 h-10 rounded-full bg-gray-800" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 bg-gray-800 rounded w-24" />
              <div className="h-4 bg-gray-800 rounded w-12" />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
              <div className="h-3 bg-gray-800 rounded w-20" />
              <div className="h-3 bg-gray-800 rounded w-16" />
              <div className="h-3 bg-gray-800 rounded w-24" />
              <div className="h-3 bg-gray-800 rounded w-20" />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="h-4 bg-gray-800 rounded w-16 mb-2" />
            <div className="h-3 bg-gray-800 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};

const TokenSearchContent = ({
  onSelect,
  isAdvanced = true,
  className = "",
  standalone = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (isMobile) {
    isAdvanced = false;
  }

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) {
          params.append("q", debouncedSearch);
        }

        const response = await fetch(`/api/token-data/search?${params}`);
        if (!response.ok) throw new Error("Failed to fetch tokens");

        const data: APIResponse = await response.json();
        setTokens(data.tokens || []);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch tokens"
        );
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [debouncedSearch]);

  return (
    <div className={`  flex flex-col h-full ${className}`}>
      <div className="px-4 pb-4 border-b border-gray-800">
        <Input
          placeholder="Search by name or paste address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-[#1f2937] border-gray-800 h-12 text-base placeholder:text-gray-500"
          autoFocus
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <SkeletonLoader />
        ) : tokens.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No tokens found</div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-800">
            {tokens.map((token) => (
              <TokenRow
                key={token.address}
                token={token}
                isAdvanced={isAdvanced}
                onSelect={onSelect}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TokenRow = ({ token, isAdvanced, onSelect, isMobile }) => {
  const copyAddress = async (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    toast.success("Address copied");
  };

  const openExplorer = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    window.open(`https://solscan.io/token/${address}`, "_blank");
  };

  const tokenData = {
    name: token.name,
    symbol: token.symbol,
    image: token.token_image,
  };

  return (
    <div
      onClick={() => token.available && onSelect(token.address, tokenData)}
      className={`flex items-start gap-3 p-4 hover:bg-[#1f2937] transition-colors w-full ${
        !token.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          token.available && onSelect(token.address, tokenData);
        }
      }}
    >
      <TokenLogo src={token.token_image} alt={token.name} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-semibold text-white truncate">
            {token.name}
          </span>
          <span className="text-sm text-gray-400">{token.symbol}</span>
          {!isMobile && (
            <span className="text-xs text-gray-600">
              {truncateAddress(token.address)}
            </span>
          )}
        </div>

        {isAdvanced ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Market Cap</span>
              <span className="font-mono">
                {formatNumber(token.market_cap)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Volume 24h</span>
              <span className="font-mono">
                {formatNumber(token.volume_24h_usd)}
              </span>
            </div>
            {!isMobile && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Liquidity</span>
                  <span className="font-mono">
                    {formatNumber(token.liquidity)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Trades 24h</span>
                  <span className="font-mono">
                    {token.trade_24h?.toLocaleString() || "--"}
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-400 mt-1 truncate text-left">
            {formatNumber(token.market_cap || token.volume_24h_usd)}
          </div>
        )}
      </div>

      <div className="text-right shrink-0 ml-2 pr-2">
        <div className="font-medium font-mono text-white">
          {formatNumber(token.price)}
        </div>
        <div
          className={`text-sm flex items-center justify-end gap-1 mt-1
              ${
                token.price_change_24h_percent > 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
        >
          {token.price_change_24h_percent > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {formatPercentage(token.price_change_24h_percent)}
        </div>
        {isAdvanced && !isMobile && (
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={(e) => copyAddress(e, token.address)}
              className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => openExplorer(e, token.address)}
              className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TokenSearch: React.FC<TokenSearchProps> = ({
  isOpen,
  onClose,
  ...props
}) => {
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (props.standalone) {
    return <TokenSearchContent {...props} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`bg-black p-0 ${
          isMobile
            ? "w-screen h-[100dvh] max-w-none m-0 rounded-none"
            : "sm:max-w-[600px]"
        }`}
      >
        <DialogHeader className="px-5 py-5 border-b border-gray-800 relative max-w-inherit">
          <DialogTitle className="text-base font-normal flex items-center gap-2 ">
            Search tokens
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <TokenSearchContent
          {...props}
          className={isMobile ? "h-[calc(100dvh-57px)] min-h-[85vh] max-w-[100vw]" : "max-h-[80vh] min-h-[80vh] max-w-inherit"}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TokenSearch;
