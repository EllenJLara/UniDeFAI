import { useState, useCallback } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { TokenAmount } from "@solana/web3.js";

export const useTokenBalance = (
  wallet: any | null,
  connection: Connection | null
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [balanceCache, setBalanceCache] = useState<Record<string, TokenAmount>>(
    {}
  );
  const [error, setError] = useState<Error | null>(null);

  const fetchTokenBalance = useCallback(
    async (mintAddress: string): Promise<TokenAmount | null> => {
      if (!connection) {
        const errorMessage = "Cannot connect to Solana blockchain";
        setError(new Error(errorMessage));
        console.error(errorMessage);
        return null;
      }

      if (!wallet?.publicKey) {
        const errorMessage = "Cannot connect wallet";
        setError(new Error(errorMessage));
        console.error(errorMessage);
        return null;
      }


      console.log("mintAddress from useTokenBalance",  mintAddress);
      console.log("balanceCache from useTokenBalance",  balanceCache);
    //   console.log("mintAddress from useTokenBalance",  mintAddress);

      // Return cached balance if available
      if (balanceCache[mintAddress]) {
        return balanceCache[mintAddress];
      }

      setIsLoading(true);
      try {
        const associatedMintAddress = await getAssociatedTokenAddress(
          new PublicKey(mintAddress),
          wallet.publicKey
        );
        console.log("Mint Address:", mintAddress);
        console.log("Wallet Public Key:", wallet.publicKey.toString());
        console.log(
          "Associated Token Address:",
          associatedMintAddress.toString()
        );

        const accountInfo = await connection.getTokenAccountBalance(
          associatedMintAddress
        );
        console.log("Account Info:", accountInfo.value);

        // Cache the result
        const balance = accountInfo.value;
        setBalanceCache((prev) => ({
          ...prev,
          [mintAddress]: balance,
        }));

        return balance;
      } catch (error) {
        console.error("Error fetching token balance:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet]
  );

  const clearCache = useCallback(() => {
    setBalanceCache({});
  }, []);

  return {
    fetchTokenBalance,
    isLoading,
    clearCache,
    cachedBalances: balanceCache,
  };
};
