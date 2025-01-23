import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { fetchQuote, fetchSwapTransaction } from '@/services/jupiterService';
import { recordTradeRewardByWalletAddress } from '@/services/ledger/recordTradeReward';
import { TokenData } from '@/types';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets} from '@privy-io/react-auth/solana';
import { Connection, LAMPORTS_PER_SOL, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { useTransactionDetailsUpdater } from './useTransactionDetailsUpdater';

import { PLATFORM_FEES, REFERRAL_PUBKEY, SOLANA_MINT } from '../constants';
import { TradeType } from '../types/index';
import { useTransactionApproval } from './useTransactionApproval';

export const useTrading = (
  referrerAddress: string,
  connection: Connection | null,
  tokenData?: TokenData
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'signing' | 'processing' | 'confirming'>('idle');
  const { authenticated, connectWallet } = usePrivy();
  const { ready, wallets, exportWallet } = useSolanaWallets();
  const { data: session } = useSession();
  const transactionApproval = useTransactionApproval();
  
useEffect(() => {
  const connectIfAuthenticated = async () => {
    if (authenticated) {
      // await connectWallet();
      // await exportWallet()
      console.log(ready, wallets);
    }
  };

  connectIfAuthenticated();
}, [authenticated]);
console.log("authenticated", authenticated);
// console.log(ConnectedSolanaWallet)
  const checkBalance = async (wallet: any, amount: number, tradeType: "buy" | "sell") => {
    try {
      if (tradeType === "buy") {
        const balance = await connection!.getBalance(new PublicKey(wallet.address));
        const solBalance = balance / LAMPORTS_PER_SOL;

        if (solBalance < (amount / LAMPORTS_PER_SOL)) {
          throw new Error(`Insufficient SOL balance. You have ${solBalance.toFixed(9)} SOL`);
        }
      } else {
        // For sell, you'd need to check token balance
        // Implement token balance check here
      }
    } catch (error: any) {
      console.error("Balance check failed:", error);
      throw new Error(error.message || "Failed to check balance");
    }
  };


  const handleNonPrivyTransaction = async (
    transaction: VersionedTransaction,
    wallet: any,
    quote: any,
    tradeType: TradeType
  ) => {
    const signedTx = await wallet.signTransaction(transaction);
    const signature = await connection!.sendRawTransaction(
      signedTx.serialize(),
      {
        skipPreflight: false,
        maxRetries: 3,
        preflightCommitment: "confirmed",
      }
    );

    const { blockhash, lastValidBlockHeight } = await connection!.getLatestBlockhash();
    const confirmation = await connection!.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }
    
    // Record trading fees
    // const totalTradingFees = parseFloat(quote.platformFee.amount) * (1 / LAMPORTS_PER_SOL);

    let totalTradingFees;
    if (tradeType == "buy") {
      totalTradingFees =
        parseFloat(quote.inAmount) *
        (PLATFORM_FEES / 10000) *
        (1 / LAMPORTS_PER_SOL);
    } else {
      totalTradingFees =
        parseFloat(quote.platformFee.amount) * (1 / LAMPORTS_PER_SOL);
    }
    console.log("Total Trading Fees", totalTradingFees);
    console.log("Referrer Address", referrerAddress);


    await recordTradeRewardByWalletAddress(
      referrerAddress,
      totalTradingFees
    );

    return signature;
  };

const handlePrivyTransaction = async (
  transaction: VersionedTransaction,
  wallet: any,
  amount: any,
  quote: any,
  tradeType: TradeType, 
  tokenData: any
) => {
  try {
    const input = tradeType === "buy" ? SOLANA_MINT : tokenData.contract_address;
    const output = tradeType === "buy" ? tokenData.contract_address : SOLANA_MINT;
    const inputTokenSymbol = tradeType === "buy" ? "SOL" : tokenData.symbol;
    const outputTokenSymbol = tradeType === "buy" ? tokenData.symbol : "SOL";
    const inputTokenIcon = tradeType === "buy" ? "/images/solana-icon.png" : tokenData.image;
    const outputTokenIcon = tradeType === "buy" ? tokenData.image : "/images/solana-icon.png";
    const quote = await fetchQuote(input, output, amount, 50, 100);
    if (!quote) return;
    let totalGasFees = 0;
  
    const fetchTokenPrices = async (mints: string[]): Promise<{[key: string]: number}> => {
      try {
        const mintsString = mints.join(',');
        const response = await fetch(`https://api.jup.ag/price/v2?ids=${mintsString}`);
        if (!response.ok) throw new Error('Failed to fetch prices');
        
        const data = await response.json();
        const prices: {[key: string]: number} = {};
        
        for (const mint of mints) {
          if (data.data[mint]) {
            prices[mint] = parseFloat(data.data[mint].price);
          }
        }
        
        return prices;
      } catch (error) {
        console.error('Error fetching token prices:', error);
        return {};
      }
    };
    
    // Collect all unique fee mints
    const feeMints = [...new Set(quote.routePlan.map(route => route.swapInfo.feeMint))];
    // Add SOL mint for reference price
    feeMints.push(SOLANA_MINT);
    
    // Fetch all prices at once
    const prices = await fetchTokenPrices(feeMints);
    const solPrice = prices[SOLANA_MINT];
    
    for (const route of quote.routePlan) {
      const feeAmount = parseFloat(route.swapInfo.feeAmount);
      const feeMint = route.swapInfo.feeMint;
      
      if (feeMint === SOLANA_MINT) {
        totalGasFees += feeAmount;
      } else if (prices[feeMint] && solPrice) {
        const feeInSOL = (feeAmount * prices[feeMint]) / solPrice;
        totalGasFees += feeInSOL;
      }
    }
    
    // Convert total fees to SOL
    totalGasFees = totalGasFees / LAMPORTS_PER_SOL;
    const newTransactionDetails = {
      inputAmount: quote?.inAmount,
      outputAmount: quote?.outAmount,
      gasFees: totalGasFees,
      platformFee: quote?.platformFee?.amount,
      priceImpact: quote?.priceImpactPct ? parseFloat(quote?.priceImpactPct) : 0,
      minimumReceived: parseFloat(quote?.otherAmountThreshold ?? '0'),
      routePlan: quote?.routePlan,
      slippageBps: quote?.slippageBps,
      swapMode: quote?.swapMode,
      inputToken: {
        symbol: inputTokenSymbol,
        icon: inputTokenIcon,
      },
      outputToken: {
        symbol: outputTokenSymbol,
        icon: outputTokenIcon,
      },
      tokenData,
    };

    transactionApproval.reset();
    transactionApproval.setTransaction(transaction, newTransactionDetails);
    transactionApproval.setWallet(wallet);
    transactionApproval.setOpen(true);
    console.log("Transaction approval state updated");
    return true;
  } catch (error) {
    console.error("handlePrivyTransaction error:", error);
    throw error;
  }
};
  const executeTrade = async (
    tokenAddress: string,
    amount: number,
    tradeType: "buy" | "sell"
  ) => {
    if (!connection || !amount || amount <= 0 || !authenticated) {
      throw new Error("Invalid trade parameters or not authenticated");
    }
    setIsLoading(true);
    setTransactionStatus('idle');
    try {
      const activeWallet = wallets.find(wallet =>
        wallet.address === session.user.walletAddress
      );

      if (!activeWallet) {
        throw new Error("Wallet not found");
      }
      await checkBalance(activeWallet, amount, tradeType);
      setTransactionStatus('signing');
      const input = tradeType === "buy" ? SOLANA_MINT : tokenAddress;
      const output = tradeType === "buy" ? tokenAddress : SOLANA_MINT;

      const quote = await fetchQuote(input, output, amount, 50, 100);
      if (!quote) throw new Error("Failed to fetch quote");

      const referralAccountPubkey = new PublicKey(REFERRAL_PUBKEY);
      const mint = new PublicKey(SOLANA_MINT);

      const swapTransaction = await fetchSwapTransaction(
        referralAccountPubkey,
        mint,
        quote,
        activeWallet
      );
console.log("swapTransaction", swapTransaction);
      if (!swapTransaction) {
        throw new Error("Unable to prepare the transaction");
      }
      setTransactionStatus('processing');
      const transactionBuffer = Buffer.from(swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      if (activeWallet.walletClientType !== 'privy') {
        return handleNonPrivyTransaction(transaction, activeWallet, quote, tradeType);
      } else {
        console.log("Preparing Privy transaction approval..."); // Debug log
        handlePrivyTransaction(transaction, activeWallet, amount, quote, tradeType, tokenData);
        return "PRIVY_MODAL_OPEN"
      }
    } catch (error: any) {
      console.error("Trade execution error:", error);
      toast.error(error.message || "Failed to execute trade");
      throw error;
    } finally {
      setIsLoading(false);
      setTransactionStatus('idle');
    }
  };

  return {
    executeTrade,
    isLoading,
    transactionStatus,
    wallets,
    ready
  };
};
