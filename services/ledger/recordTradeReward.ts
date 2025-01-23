export const recordTradeRewardByWalletAddress = async (
  referrerAddress: string,
  totalTradingFees: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch("/api/trading-fees-reward/record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referrerAddress, totalTradingFees }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error recording trade reward:", data.error);
      throw new Error(data.error || "Failed to record trade reward");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in service function:", error.message);
    return { success: false, error: error.message };
  }
};
