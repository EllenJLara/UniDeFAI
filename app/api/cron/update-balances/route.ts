import { updateUserBalances } from "@/cron/balance-updater";
import { NextResponse } from "next/server";
const cronitor = require("cronitor")(process.env.CRONITOR_API_KEY); 

const monitor = new cronitor.Monitor("update-balances"); // Pre-configure the monitor

export async function POST() {
  try {
    // Start monitoring
    await monitor.ping({ state: "run" });

    // Execute the job logic
    console.log("Running updateUserBalances...");
    await updateUserBalances();
    console.log("updateUserBalances completed successfully.");

    // Mark the job as successful
    await monitor.ping({ state: "complete" });
    console.log("Pinged Cronitor with state 'complete'.");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update-balances:", error);

    // Mark the job as failed in Cronitor
    console.log("Pinging Cronitor to mark the job as failed...");
    try {
      await monitor.ping({ state: "fail" });
      console.log("Pinged Cronitor with state 'fail'.");
    } catch (pingError) {
      console.error("Failed to ping Cronitor with 'fail' state:", pingError);
    }

    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// Block all other methods
export async function GET() {
  console.log("GET request is not allowed for this endpoint.");
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
