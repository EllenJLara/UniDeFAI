import { NextResponse } from "next/server";
import { REFERRAL_PUBKEY } from "@/components/trading-page/constants";

export async function POST(req: Request) {
  const { mintAddress, referrerAddress } = await req.json();
  const endpoint = `https://referral.jup.ag/api/referral/${REFERRAL_PUBKEY}/token-accounts/claim`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mint: mintAddress,
        feePayer: referrerAddress,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Upstream error:", errorData);
      return NextResponse.json(
        { error: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to the upstream server" },
      { status: 500 }
    );
  }
}
