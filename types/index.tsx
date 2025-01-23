export interface TokenData {
    id: string;
    address?: string;
    name?: string;
    symbol?: string;
    image?: string;
    market_data: {
      current_price: { usd: number | string };
      price_change_percentage_24h?: number;
      total_volume: { usd: number | string };
      market_cap: { usd: number | string };
      buyers_24h: { usd: number | string };
      sellers_24h: { usd: number | string };
    };
    contract_address?: string;
    top_pool_address?: string;
}