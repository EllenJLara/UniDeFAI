import { useCallback } from "react";
import { Connection, TokenAmount } from "@solana/web3.js";
import { TradeType } from "../types";
import { SOLANA_MINT } from "../constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { fetchQuote } from "@/services/jupiterService";
import { getMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export const useAmountCalculator = () => {
  const calculatePercentageAmount = (
    tokenBalance: TokenAmount | null,
    percentage: number
  ): string => {
    if (!tokenBalance || !tokenBalance.uiAmount) {
      console.warn("Token balance is null or invalid");
      return "0"; // Default value when balance is null
    }
    // console.log("TOKEN AMOUNT:", tokenBalance);
    const amount = parseFloat(tokenBalance.uiAmountString) * percentage;
    // round to at most tokenBalance.decimals decimal places
    const factor = Math.pow(10, tokenBalance.decimals);
    const calculatedAmount = Math.round(amount * factor) / factor;
    return calculatedAmount.toString();
  };

  const convertToBaseUnits = useCallback(
    (
      amount: string,
      tradeType: TradeType,
      tokenBalance: TokenAmount | null
    ): number | undefined => {
      try {
        if (!tokenBalance) {
          console.warn("Failed to convert because token balance is null");
          return undefined;
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          throw new Error("Invalid amount");
        }

        // round to at most tokenBalance.decimals decimal places
        const factor = Math.pow(10, tokenBalance.decimals);
        const finalAmount = Math.round(parsedAmount * factor) / factor;

        // if (tradeType === "buy") {
        //   return Math.round(parsedAmount * 1e9); // Convert SOL to lamports
        // } else if (tokenBalance) {
        //   return Math.round(parsedAmount * Math.pow(10, tokenBalance.decimals));
        // }
        return Math.round(finalAmount * Math.pow(10, tokenBalance.decimals));
      } catch (error) {
        console.error("Error converting amount:", error);
        return undefined;
      }
    },
    []
  );

  const fetchOutputAmount = async (
    connection: Connection,
    amount: string,
    tradeType: TradeType,
    tokenAddress: string
  ): Promise<string> => {
    try {
      // Determine input and output tokens based on trade type
      const input = tradeType === "buy" ? SOLANA_MINT : tokenAddress;
      const output = tradeType === "buy" ? tokenAddress : SOLANA_MINT;

      // Convert input amount to base units based on trade type
      let baseAmount: number;
      if (tradeType === "buy") {
        // If buying tokens with SOL, convert SOL to lamports
        baseAmount = Number(amount) * LAMPORTS_PER_SOL;
      } else {
        // If selling tokens, get token decimals and convert to base units
        const mintInfo = await getMint(connection, new PublicKey(tokenAddress));
        baseAmount = Number(amount) * Math.pow(10, mintInfo.decimals);
      }

      // Fetch quote with amount in base units
      const quote = await fetchQuote(input, output, baseAmount);
      if (!quote) throw new Error("Failed to fetch quote");

      // Convert output amount back to normal units
      if (tradeType === "buy") {
        // Converting output token amount from base units
        const mintInfo = await getMint(connection, new PublicKey(tokenAddress));
        const adjustedAmount =
          Number(quote.outAmount) / Math.pow(10, mintInfo.decimals);
        return adjustedAmount.toString();
      } else {
        // Converting SOL amount from lamports
        const solAmount = Number(quote.outAmount) / LAMPORTS_PER_SOL;
        return solAmount.toString();
      }
    } catch (error) {
      console.error("Error in fetching output token amount:", error);
      throw error;
    }
  };

  return {
    calculatePercentageAmount,
    convertToBaseUnits,
    fetchOutputAmount,
  };
};
