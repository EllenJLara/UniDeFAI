import { useEffect, useState } from 'react';
import { fetchQuote } from '@/services/jupiterService';
import { TokenData } from '@/types';
import { SOLANA_MINT } from '../constants';

export const useTransactionDetailsUpdater = (
  tokenAddress: string,
  amount: number,
  tradeType: "buy" | "sell",
  tokenData?: TokenData
) => {
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

  const updateTransactionDetails = async () => {
    if (!tokenData || !tokenData.contract_address) return;
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


    setTransactionDetails(newTransactionDetails);
  };

  useEffect(() => {
    updateTransactionDetails();
  }, [tokenAddress, amount, tradeType, tokenData]);

  return { transactionDetails, updateTransactionDetails };
};