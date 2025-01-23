import {
  Connection,
  VersionedTransaction,
  TransactionSignature,
  AddressLookupTableAccount,
  TransactionMessage
} from "@solana/web3.js";
import { useSendSolanaTransaction } from '@privy-io/react-auth/';

export async function sendAndConfirmTransaction(
  connection: Connection,
  transaction: VersionedTransaction,
  wallet: any
): Promise<TransactionSignature> {
  try {
    // Resolve address lookup tables if present
    if (transaction.message.addressTableLookups.length > 0) {
      const lookupTableAccounts = await Promise.all(
        transaction.message.addressTableLookups.map(async (lookup) => {
          return connection.getAddressLookupTable(lookup.accountKey)
            .then((res) => res.value);
        })
      );

      const validAccounts = lookupTableAccounts.filter(
        (account): account is AddressLookupTableAccount => account !== null
      );

      const message = TransactionMessage.decompile(transaction.message, {
        addressLookupTableAccounts: validAccounts
      });
      transaction.message = message.compileToV0Message();
    } 

    // For Privy wallets
    if (wallet.walletClientType === 'privy') {
      // First, sign the transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Then send it using Privy's sendTransaction
      const signature = await wallet.sendTransaction(
        signedTransaction,
        connection,
        {
          skipPreflight: true,
          maxRetries: 3,
          preflightCommitment: "confirmed",
          
        }
      );

      // Wait for confirmation
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      return signature;
    }
    
    // For other wallets
    else {
      const signedTx = await wallet.signAllTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight: false,
          maxRetries: 3,
          preflightCommitment: "confirmed",
        }
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      return signature;
    }
  } catch (error: any) {
    console.error("Transaction failed:", error);
    if (error.logs) {
      console.error("Transaction logs:", error.logs);
    }
    throw error;
  }
}