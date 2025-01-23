import { NextResponse } from "next/server";

interface TokenData {
  name: string;
  symbol: string;
  address: string;
  price: number;
  price_change_24h_percent: number;
  market_cap?: number;
  liquidity: number;
  volume_24h_usd: number;
  trade_24h: number;
  token_image: string;
  available: boolean;
  geckoTerminalVerified: boolean;
}

interface VerificationResult {
  address: string;
  hasPools: boolean;
}

async function verifyTokenOnGeckoTerminal(
  addresses: string[]
): Promise<Map<string, boolean>> {
  try {
    const addressList = addresses.join(",");
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/multi/${encodeURIComponent(
        addressList
      )}?x_cg_demo_api_key=${process.env.COINGECKO_DEMO_API_KEY}&include=top_pools`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn("GeckoTerminal verification failed:", await response.text());
      return new Map();
    }

    const data = await response.json();
    const verificationResults = new Map<string, boolean>();
    
    data.data.forEach((token: any) => {
      const address = token.attributes.address;
      const hasPools = token.relationships?.top_pools?.data?.length > 0;
      verificationResults.set(address, hasPools);
    });

    return verificationResults;
  } catch (error) {
    console.error("Error verifying tokens on GeckoTerminal:", error);
    return new Map();
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("q") || "";

  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-KEY": process.env.BIRDEYE_API_KEY || "",
      },
    };

    const response = await fetch(
      `https://public-api.birdeye.so/defi/v3/search?chain=solana&target=token&sort_by=volume_24h_usd&sort_type=desc&offset=0&limit=10${
        searchQuery ? `&keyword=${encodeURIComponent(searchQuery)}` : ""
      }`,
      options
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from Birdeye API");
    }

    const data = await response.json();

    let tokens = data.data.items
      .filter((item: any) => item.type === "token")
      .flatMap((item: any) => item.result)
      .map(
        (token: any): TokenData => ({
          name: token.name,
          symbol: token.symbol,
          address: token.address,
          price: token.price || 0,
          price_change_24h_percent: token.price_change_24h_percent || 0,
          market_cap: token.market_cap,
          liquidity: token.liquidity || 0,
          volume_24h_usd: token.volume_24h_usd || 0,
          trade_24h: token.trade_24h || 0,
          token_image: token.logo_uri || "",
          available: false,
          geckoTerminalVerified: false,
        })
      );

    const addresses = tokens.map((token) => token.address);
    const verificationResults = await verifyTokenOnGeckoTerminal(addresses);

    tokens = tokens.map((token) => {
      const hasVerifiedPools = verificationResults.get(token.address) || false;
      return {
        ...token,
        geckoTerminalVerified: verificationResults.has(token.address),
        available: hasVerifiedPools,
      };
    });

    tokens.sort((a, b) => {
      if (a.available !== b.available) {
        return b.available ? 1 : -1;
      }
      return (b.market_cap || 0) - (a.market_cap || 0);
    });

    return NextResponse.json({
      tokens,
      pagination: {
        total: tokens.length,
        offset: 0,
        limit: 20,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in token search:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch token data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}