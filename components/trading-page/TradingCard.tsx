"use client";

import React, { act, useState } from "react";
import { TradeType } from "./types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useTokenBalance } from "./hooks/useTokenBalance";
import { useConnection } from "./hooks/useConnection";
import { useAmountCalculator } from "./hooks/useTokenAmountCalculator";
import { useTrading } from "./hooks/useTrading";
import { useSession } from "next-auth/react";
import AuthDialog from "../dialogs/auth-dialog";
import { AUTH_DIALOG_ACTION } from "../dialogs/aut-dialog.types";
import { useEffect } from "react";
import { TokenAmount } from "@solana/web3.js";
import { TokenData } from "@/types";
import posthog from "posthog-js";
interface TradingCardProps {
  tokenData?: TokenData;
  tokenAddress: string;
  referrerAddress?: string;
}

export default function TradingCard({
  tokenData,
  tokenAddress,
  referrerAddress,
}: TradingCardProps) {
  const [activeTab, setActiveTab] = useState<TradeType>("buy");
  const [amount, setAmount] = useState<string>("");
  const [outputAmount, setOutputAmount] = useState<string>("");
  const [isLoadingOutput, setIsLoadingOutput] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [requireWalletConnect, setRequireWalletConnect] = useState(false);
  const [wallet, setWallet] = useState<any | null>(null);
  const { data: session, status: isLoadingSession }: any = useSession();
  const { toast } = useToast();

  const isMaintenanceMode = true; // Toggle this to enable/disable maintenance mode

  const { connection } = useConnection();
  const {
    fetchTokenBalance,
    isLoading: isLoadingBalance,
    cachedBalances,
  } = useTokenBalance(wallet, connection);
  const { executeTrade, isLoading: isLoadingTrade } = useTrading(
    referrerAddress,
    connection,
    tokenData
  );
  const { calculatePercentageAmount, convertToBaseUnits, fetchOutputAmount } =
    useAmountCalculator();

  useEffect(() => {
    const reconnectWallet = async () => {
      try {
        // console.log("Session", session);
        // console.log("window.solana", window.solana);
        if (session?.user && window.solana?.isPhantom) {
          if (!window.solana.isConnected) {
            await window.solana.connect({ onlyIfTrusted: true });
          }
          setWallet(window.solana);
        }
      } catch (error) {
        console.error("Connection failed. User needs to reconnect.");
      }
    };

    reconnectWallet();
  }, [session]);

  useEffect(() => {
    const getOutputAmount = async () => {
      if (!amount || !connection || !tokenAddress) return;

      try {
        setIsLoadingOutput(true);
        if (Number(amount) <= 0) {
          setOutputAmount("0");
          return;
        }
        const output = await fetchOutputAmount(
          connection,
          amount,
          activeTab,
          tokenAddress
        );
        setOutputAmount(output);
      } catch (error) {
        console.error("Error fetching output amount:", error);
        setOutputAmount("");
      } finally {
        setIsLoadingOutput(false);
      }
    };

    getOutputAmount();
  }, [amount, activeTab, connection, tokenAddress]);

  // Handle percentage button clicks
  const handlePercentageClick = async (percentage: number) => {
    const balance = await fetchTokenBalance(tokenAddress);
    // console.log("balance fetched", balance);
    const calculatedAmount = calculatePercentageAmount(balance, percentage);
    setAmount(calculatedAmount);
  };

  const handleTrade = async () => {
    try {
      console.log("START handlTrade");
      if (!amount || Number(amount) <= 0) return;
      posthog.capture("trading_page", {
        action: activeTab === "buy" ? "buy_coin" : "sell_coin",
      });
      const tokenBalance: TokenAmount =
        activeTab === "sell"
          ? cachedBalances[tokenAddress] ||
            (await fetchTokenBalance(tokenAddress))
          : {
              amount: amount,
              decimals: 9,
              uiAmount: parseFloat(amount) || 0,
              uiAmountString: amount,
            };

      const baseUnits = convertToBaseUnits(amount, activeTab, tokenBalance);
      if (!baseUnits) {
        throw new Error("Failed to convert to token's base units");
      }

      const signature = await executeTrade(tokenAddress, baseUnits, activeTab);
      if (signature === "PRIVY_MODAL_OPEN") {
        return;
      }
      posthog.capture("trading_page", { event: "trade_successful" });
      toast({
        title: "Trade successful!",
        description: (
          <a
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View Transaction
          </a>
        ),
        variant: "default",
        className:
          "flex items-center gap-3 rounded-lg bg-black px-8 py-5 text-white shadow-lg border-[2px] border-green-600",
      });
    } catch (error: any) {
      posthog.capture("trading_page", { event: "trade_failed" });
      toast({
        title: "Trade failed!",
        description: error.message,
        variant: "destructive",
        className:
          "flex items-center gap-3 rounded-lg bg-black px-8 py-5 text-white shadow-lg border-[2px] border-red-500",
      });
    }
  };

  return (
    <>
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => {
          setShowAuthDialog(false);
          setRequireWalletConnect(false);
        }}
        dialogActionText={AUTH_DIALOG_ACTION.TRADE}
        onlyWallet={requireWalletConnect}
      />

      <Card className="bg-gray-700 rounded-2xl shadow-lg border-0 fun-text">
        <CardHeader className="pb-4">
          <Tabs
            defaultValue="buy"
            className="w-full"
            onValueChange={(value) => setActiveTab(value as "buy" | "sell")}
          >
            <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-800 rounded-md">
              <TabsTrigger
                value="buy"
                className="rounded-md transition-all duration-200 data-[state=active]:bg-green-500 data-[state=active]:text-black"
              >
                Buy
              </TabsTrigger>
              <TabsTrigger
                value="sell"
                className="rounded-md transition-all duration-200 data-[state=active]:bg-red-400 data-[state=active]:text-black"
              >
                Sell
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Amount (
                {activeTab === "buy" ? "SOL" : tokenData?.name || "tokens"})
              </label>
              {/* Add h-10 or h-11 to fix the height of the relative container */}
              <div className="relative h-11">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pr-16 rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
                {/* Add a background to the icon container and ensure it fills the height */}
                <div className="absolute right-0 top-0 bottom-0 flex items-center px-3 bg-transparent">
                  {activeTab === "buy" ? (
                    <img
                      src="/images/solana-icon.png"
                      alt="SOL"
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <img
                      src={tokenData?.image || "/images/missing.png"}
                      alt={tokenData?.name || "token"}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                </div>
              </div>
              {/* Move the output amount outside the relative container */}
              <div className="mt-2">
                {isLoadingOutput ? (
                  <div className="text-sm text-gray-400">Calculating...</div>
                ) : outputAmount ? (
                  <div className="text-sm text-gray-200">
                    {`${Number(outputAmount).toLocaleString()} ${
                      activeTab === "buy"
                        ? tokenData?.symbol || "tokens"
                        : "SOL"
                    }`}
                  </div>
                ) : null}
              </div>
            </div>{" "}
            {activeTab === "buy" ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg hover:bg-gray-800 transition-colors duration-200 bg-gray-900 text-gray-200"
                  onClick={() => setAmount("0")}
                >
                  reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg hover:bg-gray-800 transition-colors duration-200 bg-gray-900 text-gray-200"
                  onClick={() => setAmount("0.1")}
                >
                  0.1 SOL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg hover:bg-gray-800 transition-colors duration-200 bg-gray-900 text-gray-200"
                  onClick={() => setAmount("0.5")}
                >
                  0.5 SOL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg hover:bg-gray-800 transition-colors duration-200 bg-gray-900 text-gray-200"
                  onClick={() => setAmount("1")}
                >
                  1 SOL
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg hover:bg-gray-800 transition-colors duration-200 bg-gray-900 text-gray-200"
                  onClick={() => setAmount("0")}
                >
                  reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg hover:bg-gray-800 transition-colors duration-200 bg-gray-900 text-gray-200"
                  onClick={() => {
                    if (!session?.user?.id) {
                      setShowAuthDialog(true);
                    } else {
                      handlePercentageClick(0.25);
                    }
                  }}
                  disabled={isLoadingBalance}
                >
                  25%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg hover:bg-gray-800 transition-colors duration-200 bg-gray-900 text-gray-200"
                  onClick={() => {
                    if (!session?.user?.id) {
                      setShowAuthDialog(true);
                    } else {
                      handlePercentageClick(0.5);
                    }
                  }}
                  disabled={isLoadingBalance}
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg hover:bg-gray-800 transition-colors duration-200 bg-gray-900 text-gray-200"
                  onClick={() => {
                    if (!session?.user?.id) {
                      setShowAuthDialog(true);
                    } else {
                      handlePercentageClick(0.75);
                    }
                  }}
                  disabled={isLoadingBalance}
                >
                  75%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg hover:bg-gray-800 transition-colors duration-200 bg-gray-900 text-gray-200"
                  onClick={() => {
                    if (!session?.user?.id) {
                      setShowAuthDialog(true);
                    } else {
                      handlePercentageClick(1);
                    }
                  }}
                  disabled={isLoadingBalance}
                >
                  100%
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              {isLoadingSession === "loading" ? (
                // Show a loading state while the session is being fetched
                <Button
                  className="w-full rounded bg-gray-300 text-black"
                  disabled
                >
                  Loading...
                </Button>
              ) : !session?.user?.walletAddress ? (
                // Show the Connect Wallet button if the user is not logged in
                <Button
                  className="w-full rounded bg-blue-500 hover:bg-blue-600 text-black"
                  onClick={() => {
                    setRequireWalletConnect(true);
                    setShowAuthDialog(true);
                  }}
                >
                  Connect Wallet
                </Button>
              ) : (
                // Show the Place Trade button if the user is logged in
                <Button
                  className={`w-full rounded text-black ${
                    activeTab === "buy" ? "bg-green-500" : "bg-red-400"
                  }`}
                  onClick={() => {
                    console.log("Trade started, loading:", isLoadingTrade);
                    handleTrade();
                  }}
                  disabled={isMaintenanceMode || isLoadingTrade}
                >
                  {/* {isLoadingTrade ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    "Place Trade"
                  )} */}
                  {isMaintenanceMode ? (
                    "Place Trade (currently in maintenance!)"
                  ) : isLoadingTrade ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    "Place Trade"
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
