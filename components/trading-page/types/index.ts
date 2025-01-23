export interface TokenData {
  marketCap?: string;
  totalVolume?: string;
  priceChange24hPercent?: string;
  imageUrl?: string;
  tokenName?: string;
}

export interface TokenBalanceData {
  amount: string;
  decimals: number;
  uiAmount?: number;
  uiAmountString: string;
}

export type TradeType = "buy" | "sell";
