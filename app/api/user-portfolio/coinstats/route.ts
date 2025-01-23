import { NextResponse } from "next/server";
import coinstatsopenapi from "@api/coinstatsopenapi";

coinstatsopenapi.auth(process.env.COINSTATS_API_KEY);

export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const { data } = await coinstatsopenapi.getWalletBalances({
      address,
      networks: "all",
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("CoinStats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet balances" },
      { status: 500 }
    );
  }
}
