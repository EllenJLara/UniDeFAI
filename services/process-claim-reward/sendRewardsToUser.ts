import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createCloseAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import bs58 from "bs58";
import { SOLANA_MINT } from "@/components/trading-page/constants";

/**
 * Sends SOL rewards to a user, handling both native SOL and wrapped SOL (WSOL) cases
 * @param connection - Solana connection instance
 * @param recipientAddress - Recipient's public key as string
 * @param amountInSOL - Amount of SOL to send
 * @param keypair - Optional keypair, will derive from env if not provided
 * @returns Promise<boolean> - Returns true if successful
 */
export async function sendRewardsToUser(
  connection: Connection,
  recipientAddress: string,
  amountInSOL: number,
  keypair?: Keypair
): Promise<boolean> {
  try {
    console.log("Starting sendRewardsToUser...");
    console.log(
      `Recipient Address: ${recipientAddress}, Amount: ${amountInSOL} SOL`
    );

    // Load the Keypair if not provided
    if (!keypair) {
      const privateKeyBase58 = process.env.PLATFORM_PRIVATE_KEY;
      if (!privateKeyBase58) {
        throw new Error(
          "PLATFORM_PRIVATE_KEY not found in environment variables"
        );
      }
      const secretKey = bs58.decode(privateKeyBase58);
      keypair = Keypair.fromSecretKey(secretKey);
    }

    console.log(`Sender Public Key: ${keypair.publicKey.toBase58()}`);

    // Convert the amount to lamports
    const amountInLamports = Math.floor(amountInSOL * LAMPORTS_PER_SOL);
    console.log(`Amount in lamports: ${amountInLamports}`);

    // Check if we need to unwrap any WSOL
    const wsolMintAddress = new PublicKey(SOLANA_MINT);

    const senderTokenAccount = await getAssociatedTokenAddress(
      wsolMintAddress,
      keypair.publicKey
    );

    let totalAvailableBalance = await connection.getBalance(keypair.publicKey);

    // Check if WSOL token account exists and has balance
    try {
      const tokenAccount = await getAccount(connection, senderTokenAccount);
      if (tokenAccount && tokenAccount.amount > BigInt(0)) {
        console.log(
          `Found WSOL token account with balance: ${tokenAccount.amount}`
        );

        // Unwrap WSOL by closing the token account
        console.log("Unwrapping WSOL to native SOL...");
        const closeWsolTx = new Transaction().add(
          createCloseAccountInstruction(
            senderTokenAccount,
            keypair.publicKey,
            keypair.publicKey
          )
        );

        const closeWsolSignature = await sendAndConfirmTransaction(
          connection,
          closeWsolTx,
          [keypair]
        );
        console.log(
          `WSOL unwrapped successfully. Transaction signature: ${closeWsolSignature}`
        );

        // Update total available balance after unwrapping
        totalAvailableBalance = await connection.getBalance(keypair.publicKey);
      }
    } catch (error) {
      // Token account doesn't exist or has no balance, continue with native SOL
      console.log("No WSOL token account found or account has no balance");
    }

    console.log(
      `Total available SOL balance: ${totalAvailableBalance / LAMPORTS_PER_SOL}`
    );

    // Check if we have enough balance for the transfer
    if (totalAvailableBalance < amountInLamports) {
      throw new Error(
        `Insufficient SOL balance. Sender has ${
          totalAvailableBalance / LAMPORTS_PER_SOL
        } SOL, but needs ${amountInSOL} SOL.`
      );
    }

    // Validate recipient address
    const recipientPublicKey = new PublicKey(recipientAddress);
    console.log(`Recipient Public Key: ${recipientPublicKey.toString()}`);

    // Create and send SOL transfer transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amountInLamports,
      })
    );

    // Send and confirm the transaction
    console.log("Sending SOL to user...");
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      keypair,
    ]);

    if (signature) {
      console.log(`sendRewardsToUser successful! Signature: ${signature}`);
      console.log(
        `View sendRewardsToUser transaction: https://solscan.io/tx/${signature}`
      );
    }

    return true;
  } catch (error: any) {
    console.error("Failed to sendRewardsToUser:", error.message);
    // Add error logs if available
    if (error.logs) {
      console.error("Transaction logs:", error.logs);
    }
    throw new Error(`sendRewardsToUser transaction failed: ${error.message}`);
  }
}
