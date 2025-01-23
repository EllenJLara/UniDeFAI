"use client";
import { useState } from "react";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { claimPlatformFees } from "@/services/process-claim-reward/claimPlatformFees";
import { useConnection } from "./hooks/useConnection";
import { REFERRER_ADDRESS } from "./constants";
import posthog from "posthog-js";

export default function ClaimButton() {
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      posthog.capture("profile", { action: "claim_button_click" })
      const privateKeyBase58 = '';
      // Decode the private key
      const secretKey = bs58.decode(privateKeyBase58);
      const keypair = Keypair.fromSecretKey(secretKey);

      const signature = await claimPlatformFees(connection, REFERRER_ADDRESS);

      console.log("Transaction confirmed successfully:", signature);
      setSuccess(`Transaction confirmed! Signature: ${signature}`);
    } catch (err) {
      console.error("Error claiming trading fees", err);
      setError("Failed to claim fees. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`px-6 py-3 font-semibold text-black transition-all duration-300 rounded-lg shadow-md ${
          isLoading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-green-400 to-blue-500 hover:scale-105 hover:from-green-500 hover:to-blue-600"
        }`}
      >
        {isLoading ? "Processing..." : "Claim Fees"}
      </button>

      {success && (
        <div className="text-green-400 text-sm text-center">
          {success}{" "}
          <a
            href={`https://solscan.io/tx/${success.split("Signature: ")[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline hover:text-blue-500"
          >
            View on Solscan
          </a>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
