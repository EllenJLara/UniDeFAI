import React, { useEffect, useRef, useState } from "react";
import { Loader2, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "./hooks/use-media-query";
import { TokenData } from "@/types";
import { getTokenData } from "@/services/getTokenData";
import MobileTokenModal from "./mobile-tokendata-modal";

interface TradeButtonProps {
  token: TokenData;
  onTradeClick: () => void;
}

interface Particle {
  id: string;
  startX: number;
  startY: number;
  angle: number;
  velocity: number;
  scale: number;
  rotation: number;
}

const placeholderTokenIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmaWxsPSJub25lIj4gPGcgZmlsbD0iI2ZmZmZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPiA8cGF0aCBkPSJNNS43OTEgMy4zMThMMy4zMTYgNS43OTNhMSAxIDAgMDAwIDEuNDE0bDIuNDc1IDIuNDc1YTEgMSAwIDAwMS40MTUgMEw5LjY4IDcuMjA3YTEgMSAwIDAwMC0xLjQxNEw3LjIwNiAzLjMxOGExIDEgMCAwMC0xLjQxNSAwem0uNzA3IDQuOTVMNC43MzEgNi41bDEuNzY3LTEuNzY4TDguMjY2IDYuNSA2LjQ5OCA4LjI2OHoiLz4gPHBhdGggZD0iTTAgNi41YTYuNSA2LjUgMCAwMTEyLjM0Ni0yLjg0NSA2LjUgNi41IDAgMTEtOC42OTEgOC42OTFBNi41IDYuNSAwIDAxMCA2LjV6bTYuNS01YTUgNSAwIDEwMCAxMCA1IDUgMCAwMDAtMTB6bTYuNSA1YzAtLjIwMS0uMDEtLjQtLjAyNy0uNTk3YTUgNSAwIDExLTcuMDcgNy4wN0E2LjUgNi41IDAgMDAxMyA2LjV6Ii8+IDwvZz4gPC9zdmc+"

export const formatCompact = (num: number): string => {
  if (!num) return "0";
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

const TradeButton: React.FC<TradeButtonProps> = ({ token, onTradeClick }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<"top" | "bottom">(
    "top"
  );
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  
  useEffect(() => {
    if (!isHovered || !token.address || !isDesktop) return;

    let isMounted = true;
    setIsLoading(true);

    getTokenData(token.address)
      .then((data) => {
        if (isMounted) {
          setTokenData(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token.address, isHovered, isDesktop, token]);
  
  
  useEffect(() => {
    if (buttonRef.current && isHovered) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const tooltipHeight = 340;
      setTooltipPosition(spaceAbove > tooltipHeight ? "top" : "bottom");
    }
  }, [isHovered]);
  
  // Separate effect for hover state management
  useEffect(() => {
    if (!isHovered) {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      setShowTooltip(false);
      setIsLoading(false);
      setError(null);
    }
  }, [isHovered]);

  
  const createParticle = (x: number, y: number, index: number): Particle => ({
    id: `${Date.now()}-${index}`,
    startX: x,
    startY: y,
    angle: Math.random() * Math.PI * 2,
    velocity: 12 + Math.random() * 8,
    scale: 0.6 + Math.random() * 0.8,
    rotation: Math.random() * 360,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isDesktop) {
      // On mobile, show the modal and fetch data if needed
      setShowMobileModal(true);
      if (!tokenData && !isLoading) {
        setIsLoading(true);
        setError(null);
        getTokenData(token.address)
          .then((data) => {
            setTokenData(data);
            setIsLoading(false);
          })
          .catch((err) => {
            setError(err.message);
            setIsLoading(false);
          });
      }
      return;
    }

    if (isAnimatingRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isAnimatingRef.current = true;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    setParticles(Array.from({ length: 25 }, (_, i) => createParticle(x, y, i)));

    clickTimeoutRef.current = setTimeout(() => {
      setParticles([]);
      isAnimatingRef.current = false;
    }, 600);

    onTradeClick();
  };

  const handleMouseEnter = () => {
    if (isDesktop) {
      setIsHovered(true);
      tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(true), 100);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
  };

  // Tooltip Components
  const LoadingTooltip = () => (
    <div className="w-[260px] bg-[#111111] rounded-lg overflow-hidden font-mono border border-[rgba(0, 255, 255, 0.2)] p-4">
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
        <span className="text-gray-400 text-sm">Loading token data...</span>
      </div>
    </div>
  );

  const ErrorTooltip = () => (
    <div className="w-[260px] bg-[#111111] rounded-lg overflow-hidden font-mono border border-red-500/20 p-4">
      <div className="text-red-400 text-sm text-center">
        Failed to load token data
      </div>
    </div>
  );


  return (
    <>
      <div
        className="relative group restrict-click"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={buttonRef}
      >
        {isDesktop && (
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: tooltipPosition === "top" ? 10 : -10,
                }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: tooltipPosition === "top" ? 10 : -10 }}
                className={`absolute ${
                  tooltipPosition === "top"
                    ? "bottom-full mb-2"
                    : "top-full mt-2"
                } left-1/2 transform -translate-x-1/2 z-50`}
              >
                {isLoading ? (
                  <LoadingTooltip />
                ) : error ? (
                  <ErrorTooltip />
                ) : tokenData ? (
                  <div className="w-[260px] bg-[#111111] rounded-lg overflow-hidden font-mono border border-[rgba(0, 255, 255, 0.2)] shadow-lg">
                    <div className="bg-black border-b border-cyan-900/50 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 flex-shrink-0">
                            <img
                              src={token.image.includes('missing.png') ? placeholderTokenIcon : token.image}
                              alt={token.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-[13px] text-cyan-500 font-bold">
                              {token.symbol?.toUpperCase()}/USD
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {token.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-b border-cyan-900/50">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <div className="text-[11px] text-gray-400 mb-1">
                            Current Price
                          </div>
                          <div className="text-[16px] text-white font-bold">
                            ${tokenData.market_data?.current_price?.usd}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-gray-400 mb-1">
                            24h Change
                          </div>
                          <div
                            className={`text-[13px] font-bold ${
                              tokenData.market_data
                                ?.price_change_percentage_24h >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            } flex items-center gap-1`}
                          >
                            <span className="inline-block w-3">
                              {tokenData.market_data
                                ?.price_change_percentage_24h >= 0
                                ? "▲"
                                : "▼"}
                            </span>
                            {Math.abs(
                              tokenData.market_data
                                ?.price_change_percentage_24h || 0
                            ).toFixed(2)}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4 text-[11px] border-b border-cyan-900/50">
                      <div className="space-y-3">
                        <div>
                          <div className="text-gray-400 mb-1">24H VOLUME</div>
                          <div className="text-white font-bold text-[12px]">
                            $
                            {formatCompact(
                              Number(
                                tokenData.market_data?.total_volume?.usd
                              ) || 0
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">MARKET CAP</div>
                          <div className="text-white font-bold text-[12px]">
                            $
                            {formatCompact(
                              Number(tokenData.market_data?.market_cap?.usd) ||
                                0
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-gray-400 mb-1">Buyers (24h)</div>
                          <div className="text-green-400 font-bold text-[12px]">
                            {tokenData.market_data?.buyers_24h.usd}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">
                            Sellers (24h)
                          </div>
                          <div className="text-red-400 font-bold text-[12px]">
                            {tokenData.market_data?.sellers_24h.usd}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2.5 bg-black/50">
                      <div className="text-[10px] text-gray-400 mb-1">
                        Contract Address
                      </div>
                      <div className="text-[11px] font-mono text-cyan-500/70 break-all leading-relaxed">
                      <a href={`https://solscan.io/token/${token.address}`} target="_blank" rel="noopener noreferrer">
                        {token.address.slice(0, 45)}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <div className="relative" onClick={handleClick}>
          <div
            className={`
          border-1 rounded-md relative cursor-pointer transition-all duration-300 ease-out
          ${isHovered ? "scale-105" : "scale-100"}
          neon-border
        `}
          >
            <div
              className={`
            p-[1.5px] rounded-lg transition-all duration-300
            ${isHovered ? "w-48" : "w-12"}
          `}
            >
              <div
                className="
              relative flex items-center gap-2 p-3 rounded-md bg-[color:hsl(220,20%,10%)]
              overflow-hidden whitespace-nowrap
            "
              >
                <Rocket
                  className={`
                  w-5 h-5 flex-shrink-0 transition-all duration-300 neon-icon
                  ${isHovered ? "text-transparent" : "text-transparent"}
                `}
                  strokeWidth={2}
                />
                <div
                  className={`
                font-mono text-sm text-white transition-opacity duration-300
                ${isHovered ? "opacity-100" : "opacity-0"}
              `}
                >
                  Trade ${token.symbol?.toUpperCase() || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute select-none pointer-events-none z-50"
            style={{
              left: particle.startX,
              top: particle.startY,
              fontSize: "16px",
              transform: "translate(-50%, -50%)",
              animation: `
              move-${particle.id} 0.5s cubic-bezier(0.25, 0.4, 0.2, 1) forwards,
              fade-${particle.id} 0.5s ease-out forwards
            `,
            }}
          >
            <Rocket
              className={`
              w-5 h-5 flex-shrink-0 transition-all duration-300 neon-icon
              ${isHovered ? "text-transparent" : "text-transparent"}
            `}
              strokeWidth={2}
            />
            <style jsx>{`
              @keyframes move-${particle.id} {
                0% {
                  transform: translate(-50%, -50%) scale(0.3) rotate(0deg);
                }
                100% {
                  transform: translate(
                      calc(
                        -50% + ${Math.cos(particle.angle) * particle.velocity * 8}px
                      ),
                      calc(
                        -50% + ${Math.sin(particle.angle) * particle.velocity * 8}px
                      )
                    )
                    scale(${particle.scale}) rotate(${particle.rotation}deg);
                }
              }

              @keyframes fade-${particle.id} {
                0% {
                  opacity: 1;
                }
                80% {
                  opacity: 1;
                }
                100% {
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {showMobileModal && !isDesktop && (
          <MobileTokenModal
            token={token}
            tokenData={tokenData}
            isLoading={isLoading}
            error={error}
            onClose={() => setShowMobileModal(false)}
            onTradeClick={() => {
              setShowMobileModal(false);
              onTradeClick();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TradeButton;
