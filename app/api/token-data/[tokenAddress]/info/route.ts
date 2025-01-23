import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tokenAddress: string }> }
) {
  const { tokenAddress } = await params;

  const url = `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${tokenAddress}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      // "x-cg-demo-api-key": process.env.COINGECKO_DEMO_API_KEY || "",
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      return NextResponse.json(
        { exists: false, message: `Failed to fetch data for ${tokenAddress}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    const refinedData = {
      exists: true,
      name: data?.data?.attributes?.name || null,
      symbol: data?.data?.attributes?.symbol || null,
      image: data?.data?.attributes?.image_url || null,
    };

    return NextResponse.json(refinedData, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching CoinGecko data:", error);

    if (error instanceof Error) {
      return NextResponse.json({
        exists: false,
        error: "Failed to fetch CoinGecko data",
        details: error.message,
      });
    }

    return NextResponse.json({
      exists: false,
      error: "Failed to fetch CoinGecko data",
      details: "An unknown error occurred.",
    });
  }
}
