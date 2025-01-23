import { Connection, ConnectionConfig } from "@solana/web3.js";

const config: ConnectionConfig = {
  commitment: "confirmed",
  disableRetryOnRateLimit: false,
  confirmTransactionInitialTimeout: 120000, // 2 minutes
};

// Environment variables
const HELIUS_RPC =
  // "https://mainnet.helius-rpc.com/?api-key=a459b2b3-7cef-41cf-9004-a8d285f4d7c3";
"https://mainnet.helius-rpc.com/?api-key=971bf7aa-fddc-473c-89e9-c2a9a9718db8"
// Connection singleton
let connection: Connection | null = null;

export const getConnection = () => {
  if (!connection) {
    if (!HELIUS_RPC) {
      throw new Error("Helius RPC endpoint not configured");
    }

    try {
      connection = new Connection(HELIUS_RPC, config);
    } catch (error) {
      console.error("Failed to establish Solana connection:", error);
      throw error;
    }
  }

  return connection;
};

// Helper to reset connection (useful for testing or endpoint changes)
export const resetConnection = () => {
  connection = null;
};
