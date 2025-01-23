export async function getTopPoolFromTokenAddress(
  tokenAddress: string
): Promise<any> {
  try {
    // Construct query parameters
    const poolParams = new URLSearchParams({
      mint1: tokenAddress,
      poolType: "all",
      poolSortField: "liquidity", // Sort by liquidity
      sortType: "desc", // Highest liquidity first
      pageSize: "1", // Only get the top pool
      page: "1",
    });

    // Fetch both APIs concurrently
    const response = await fetch(
      `https://api-v3.raydium.io/pools/info/mint?${poolParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    // Check both responses
    if (!response.ok) {
      throw new Error(`API error for pool info: ${response.status}`);
    }

    // Parse both responses concurrently
    const poolData = await response.json();

    // Validate and construct the result
    if (poolData.success && poolData.data.data.length > 0) {
      const pool = poolData.data.data[0];
      return pool.id;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch top pool:", error);
    return null;
  }
}
