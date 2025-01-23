"use client";
import { createContext, useContext, ReactNode } from "react";
import {
  useQuery,
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import { getTokenData } from "@/services/getTokenData";
import { TokenData } from "@/types";

interface TokenDataContextType {
  tokenData: TokenData | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<TokenData, Error>>;
}

const TokenDataContext = createContext<TokenDataContextType | undefined>(
  undefined
);

export function TokenDataProvider({
  children,
  initialData,
  tokenAddress,
}: {
  children: ReactNode;
  initialData: TokenData;
  tokenAddress: string;
}) {
  const { data, isLoading, isError, refetch } = useQuery<TokenData>({
    queryKey: ["tokenData", tokenAddress],
    queryFn: () => getTokenData(tokenAddress),
    initialData,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  return (
    <TokenDataContext.Provider
      value={{
        tokenData: data,
        isLoading,
        isError,
        refetch,
      }}
    >
      {children}
    </TokenDataContext.Provider>
  );
}

export function useTokenData() {
  const context = useContext(TokenDataContext);
  if (context === undefined) {
    throw new Error("useTokenData must be used within a TokenDataProvider");
  }
  return context;
}
