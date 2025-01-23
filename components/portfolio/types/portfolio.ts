export interface Position {
  name: string;
  symbol: string;
  imgUrl: string;
  currentValue: string;
  percentageChange: number;
  gainLoss: string;
  details: string;
}

export interface PortfolioStats {
  current_networth: number;
  networth_difference: number;
  percentage_difference: number;
}
