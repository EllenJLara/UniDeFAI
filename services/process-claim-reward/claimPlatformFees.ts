import {
  FEE_PAYER_ADDRESS,
  SOLANA_MINT,
} from "@/components/trading-page/constants";
import {
  Connection,
  TransactionSignature,
  Keypair,
  VersionedTransaction,
} from "@solana/web3.js";
import axios from "axios";
import bs58 from "bs58";
import { sendRewardsToUser } from "./sendRewardsToUser";
import { REFERRER_ADDRESS } from "@/components/trading-page/constants";

export async function claimPlatformFeesBase64(
  referrerAddress: string
): Promise<string> {
  const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/claim-trading-fees`;
  const requestBody = {
    mintAddress: SOLANA_MINT,
    referrerAddress: referrerAddress,
  };
  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Token claim response:", response.data);
    return response.data.tx;
  } catch (error) {
    console.error("Error claiming token account:", error.message);
  }
}

export async function claimPlatformFees(
  connection: Connection,
  referrerAddress: string,
  keypair?: Keypair
): Promise<TransactionSignature> {
  try {
    if (!keypair) {
      const privateKeyBase58 = process.env.FEE_PAYER_PRIVATE_KEY;
      // Decode the private key
      const secretKey = bs58.decode(privateKeyBase58);
      keypair = Keypair.fromSecretKey(secretKey);
    }
    // Fetch the base64 encoded transaction
    const base64Tx = await claimPlatformFeesBase64(referrerAddress);
    const rawTransaction = Buffer.from(base64Tx, "base64");

    // Deserialize transaction
    const versionedTransaction =
      VersionedTransaction.deserialize(rawTransaction);

    // Sign the transaction locally
    versionedTransaction.sign([keypair]);

    // Send the signed transaction
    const signature = await connection.sendRawTransaction(
      versionedTransaction.serialize(),
      {
        skipPreflight: false,
        maxRetries: 3,
        preflightCommitment: "confirmed",
      }
    );

    console.log("Transaction Signature for claimPlatformFees:", signature);

    // Confirm the transaction
    const latestBlockhash = await connection.getLatestBlockhash();
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "confirmed"
    );

    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${confirmation.value.err.toString()}`
      );
    }

    // Add an extra verification step
    const status = await connection.getSignatureStatuses([signature]);
    console.log("Status of transaction", status);
    if (status.value[0]?.err) {
      throw new Error(
        `Transaction failed verification: ${status[0].value?.err}`
      );
    }

    // Make sure we have at least "confirmed" status
    if (
      !status.value[0]?.confirmationStatus ||
      status.value[0].confirmationStatus === "processed"
    ) {
      throw new Error("Transaction was processed but not confirmed");
    }

    return signature;
  } catch (error) {
    console.error("Transaction failed:", error.message);
    throw error;
  }
}

export async function claimPlatformFeesAndSendRewardsToUser(
  connection: Connection,
  recipientAddress: string,
  amountInSOL: number,
  keypair?: Keypair
): Promise<{
  claimPlatformSignature: TransactionSignature;
  sendRewardSuccess: boolean;
}> {
  try {
    console.log(
      "Claiming platform fees in claimPlatformFeesAndSendRewardsToUser..."
    );
    const claimPlatformSignature = await claimPlatformFees(
      connection,
      FEE_PAYER_ADDRESS
    );

    if (claimPlatformSignature) {
      console.log(
        `claimPlatformFees successful! Signature: ${claimPlatformSignature}`
      );
    }

    console.log("Sending rewards to user...");
    const sendRewardSuccess = await sendRewardsToUser(
      connection,
      recipientAddress,
      amountInSOL
    );

    if (sendRewardSuccess) {
      console.log(
        "Rewards sent successfully with claimPlatformFeesAndSendRewardsToUser!"
      );
    } else {
      console.warn(
        "Rewards sending failed despite claiming platform fees with claimPlatformFeesAndSendRewardsToUser"
      );
    }
    return { claimPlatformSignature, sendRewardSuccess };
  } catch (error) {
    console.error(
      "Error in claimPlatformFeesAndSendRewardsToUser:",
      error.message
    );
    throw new Error(
      `claimPlatformFeesAndSendRewardsToUser failed: ${error.message}`
    );
  }
}
