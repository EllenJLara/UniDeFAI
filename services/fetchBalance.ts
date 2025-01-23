import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";

const JUPITER_SOL_PRICE_API =
  "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112";

// Function to fetch SOL balance in SOL
export const fetchBalance = async (
  connection: Connection,
  address: string
): Promise<number> => {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw new Error("Failed to fetch balance");
  }
};

// Function to fetch the price of 1 SOL in USD
export const fetchSolPriceInUsd = async (): Promise<number> => {
  try {
    const response = await axios.get(JUPITER_SOL_PRICE_API);
    const solPrice = parseFloat(
      response.data.data["So11111111111111111111111111111111111111112"].price
    );

    if (isNaN(solPrice)) {
      throw new Error("Invalid SOL price received");
    }

    return solPrice;
  } catch (error) {
    console.error("Error fetching SOL price:", error);
    throw new Error("Failed to fetch SOL price");
  }
};

// Function to fetch the user's SOL balance in USD
export const fetchBalanceInUsd = async (
  connection?: Connection,
  address?: string
): Promise<number> => {
  try {
    if (!connection || !address) {
      // If connection or address is null, return null
      return null;
    }

    const [solBalance, solPrice] = await Promise.all([
      fetchBalance(connection, address),
      fetchSolPriceInUsd(),
    ]);

    const balanceInUsd = solBalance * solPrice;

    // Return balance in USD rounded to 1 decimal place
    return Math.round(balanceInUsd * 10) / 10;
  } catch (error) {
    console.error("Error fetching balance in USD:", error);
    throw new Error("Failed to fetch balance in USD");
  }
};
