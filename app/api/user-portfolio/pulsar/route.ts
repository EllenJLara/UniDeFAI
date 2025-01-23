import { NextResponse } from "next/server";
import pulsar from "@api/pulsar";

pulsar.auth(process.env.PULSAR_API_KEY);

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const { data } =
      await pulsar.get_wallet_timeseries_v1_thirdparty_wallet__address__timeseries_get(
        {
          chain: "SOLANA",
          tier: "1d",
          address,
        }
      );

    // Extract relevant stats
    const stats = {
      current_networth: data.stats.current_networth,
      networth_difference: data.stats.networth_difference,
      percentage_difference: data.stats.percentage_difference,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Pulsar API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats from Pulsar" },
      { status: 500 }
    );
  }
}
