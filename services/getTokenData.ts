import { TokenData } from "@/types";

const cache = new Map<string, { data: TokenData; timestamp: number }>();
const CACHE_DURATION = 5000;

export async function getTokenData(tokenAddress: string): Promise<TokenData> {
  const cachedData = cache.get(tokenAddress);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${tokenAddress}?include=top_pools`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch token data");
    }

    const data = await response.json();
    // console.log(data);
    const tokenData: TokenData = {
      id: data?.data?.id,
      symbol: data?.data?.attributes?.symbol,
      name: data?.data?.attributes?.name,
      image: data?.data?.attributes?.image_url || "images/missing.png",
      market_data: {
        current_price: { usd: data?.data?.attributes?.price_usd },
        price_change_percentage_24h:
          data?.included[0]?.attributes?.price_change_percentage?.h24,
        // price_change_percentage_7d: data.market_data.price_change_percentage_7d,
        total_volume: { usd: data?.data?.attributes?.volume_usd?.h24 },
        market_cap: { usd: data?.data?.attributes?.market_cap_usd || "N/A" },
        buyers_24h: {
          usd:
            data?.included[0]?.attributes?.transactions?.h24?.buyers || "N/A",
        },
        sellers_24h: {
          usd:
            data?.included[0]?.attributes?.transactions?.h24?.sellers || "N/A",
        },
        // market_cap_rank: data.market_data.market_cap_rank
      },
      contract_address: data?.data?.attributes?.address,
      top_pool_address: data?.included[0]?.attributes?.address,
    };

    cache.set(tokenAddress, { data: tokenData, timestamp: now });
    return tokenData;
  } catch (error) {
    console.error("Error fetching token data:", error);
    throw error;
  }
}
