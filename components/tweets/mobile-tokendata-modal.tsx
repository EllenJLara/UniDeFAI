import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { TokenData } from "@/types";
import { formatCompact } from "./trade-button";

interface MobileTokenModalProps {
  token: TokenData;
  tokenData: TokenData | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onTradeClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const MobileTokenModal = ({
  token,
  tokenData,
  isLoading,
  error,
  onClose,
  onTradeClick,
}: MobileTokenModalProps) => {
  if (!tokenData && !isLoading && !error) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-end"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full bg-[#111111] rounded-t-xl border-t border-x border-[rgba(0, 255, 255, 0.2)]"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-cyan-900/50">
          <div className="flex items-center gap-3">
            <img
              src={token.image}
              alt={token.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="text-[15px] text-cyan-500 font-bold">
                {token.symbol?.toUpperCase()}/USD
              </div>
              <div className="text-[13px] text-gray-400">{token.name}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-6 text-center text-gray-400">
            Loading token data...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400">
            Failed to load token data
          </div>
        ) : (
          tokenData && (
            <>
              {/* Price and 24h Change */}
              <div className="p-4 border-b border-cyan-900/50">
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="text-[13px] text-gray-400 mb-1">
                      Current Price
                    </div>
                    <div className="text-[20px] text-white font-bold">
                      ${tokenData.market_data?.current_price?.usd}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] text-gray-400 mb-1">
                      24h Change
                    </div>
                    <div
                      className={`text-[15px] font-bold ${
                        tokenData.market_data?.price_change_percentage_24h >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      } flex items-center gap-1`}
                    >
                      <span>
                        {tokenData.market_data?.price_change_percentage_24h >= 0
                          ? "▲"
                          : "▼"}
                      </span>
                      {Math.abs(
                        tokenData.market_data?.price_change_percentage_24h || 0
                      ).toFixed(2)}
                      %
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 text-[13px] border-b border-cyan-900/50">
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 mb-1">24H VOLUME</div>
                    <div className="text-white font-bold">
                      $
                      {formatCompact(
                        Number(tokenData.market_data?.total_volume?.usd) || 0
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">MARKET CAP</div>
                    <div className="text-white font-bold">
                      $
                      {formatCompact(
                        Number(tokenData.market_data?.market_cap?.usd) || 0
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 mb-1">Buyers (24h)</div>
                    <div className="text-green-400 font-bold">
                      {tokenData.market_data?.buyers_24h.usd}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Sellers (24h)</div>
                    <div className="text-red-400 font-bold">
                      {tokenData.market_data?.sellers_24h.usd}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Address */}
              <div className="p-4 bg-black/50">
                <div className="text-[12px] text-gray-400 mb-1">
                  Contract Address
                </div>
                <div className="text-[13px] font-mono text-cyan-500/70 break-all leading-relaxed">
                  {token.address}
                </div>
              </div>
            </>
          )
        )}

        {/* Trade Button */}
        <div className="p-4 bg-black/30">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTradeClick(e);
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Trade ${token.symbol?.toUpperCase()}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MobileTokenModal;
