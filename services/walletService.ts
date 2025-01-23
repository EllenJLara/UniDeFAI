export const connectWallet = async (): Promise<any> => {
  if (!window.solana) throw new Error("Phantom wallet not installed.");

  try {
    await window.solana.connect();
    return window.solana;
  } catch (error) {
    console.error("Wallet connection failed:", error);
    throw error;
  }
};
