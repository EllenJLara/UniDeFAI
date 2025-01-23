export async function getTokenDataStatus(tokenAddress: string): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const url = `${baseUrl}/api/token-data/${tokenAddress}/info`;
  
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        return { exists: false, message: `Failed to fetch data for ${tokenAddress}` };
      }
  
      const resData = await response.json();
      return resData;
    } catch (error) {
      console.error("Error fetching token data:", error);
      return { exists: false, error: "Failed to fetch data", details: error.message };
    }
  }
  