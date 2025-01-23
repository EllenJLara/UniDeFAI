'use client';

import { useTransactionApproval } from './hooks/useTransactionApproval';
import { useState, useEffect } from 'react';
import { ChevronDown, ExternalLink, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { formatCompact } from '@/lib/utils';
import Image from 'next/image';
import { useConnection } from '@/components/trading-page/hooks/useConnection';
import { toast } from 'react-hot-toast';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useTransactionDetailsUpdater } from './hooks/useTransactionDetailsUpdater';

type TransactionStatus = 'idle' | 'signing' | 'processing' | 'confirmed' | 'failed';

export function TransactionApproval() {
  const { connection } = useConnection();
  const { 
    isOpen, 
    transaction, 
    transactionDetails: initialTransactionDetails, 
    wallet,
    isLoading,
    setOpen, 
    setLoading,
    reset 
  } = useTransactionApproval();
  
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const { transactionDetails, updateTransactionDetails } = useTransactionDetailsUpdater(
    initialTransactionDetails?.tokenData?.contract_address || '',
    initialTransactionDetails?.amount || 0,
    initialTransactionDetails?.tradeType || 'buy',
    initialTransactionDetails?.tokenData
  );

  const MISSING_ICON = '/images/missing.png';

  useEffect(() => {
    // updateTransactionDetails();
    // const intervalId = setInterval(updateTransactionDetails, 5000);
    // return () => clearInterval(intervalId);
  }, [initialTransactionDetails]);

  if (!isOpen || !transaction || Boolean(!transactionDetails && !initialTransactionDetails)) {
    return null;
  }
  let transactionObject = transactionDetails || initialTransactionDetails;

  const getPriceImpactSeverity = (priceImpact: number) => {
    if (priceImpact < 1) return 'text-green-400';
    if (priceImpact < 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = () => {
    switch (transactionStatus) {
      case 'signing':
      case 'processing':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-400" />;
      case 'confirmed':
        return <CheckCircle2 className="w-6 h-6 text-green-400" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-400" />;
      default:
        return null;
    }
  };

  const handleConfirm = async () => {
    if (!connection || !wallet) return;

    try {
      setError(null);
      setLoading(true);
      setTransactionStatus('signing');

      const signedTransaction = await wallet?.signTransaction(transaction);
      setTransactionStatus('processing');
      console.log('Signed transaction:', signedTransaction);
      const sig = await connection?.sendRawTransaction(
        signedTransaction?.serialize(),
        {
          skipPreflight: true,
          maxRetries: 3,
          preflightCommitment: "confirmed",
        }
      );
      console.log('Transaction signature:', sig);
      setSignature(sig);

      const { blockhash, lastValidBlockHeight } = await connection?.getLatestBlockhash();
      const confirmation = await connection?.confirmTransaction({
        signature: sig,
        blockhash,
        lastValidBlockHeight
      });

      if (confirmation?.value?.err) {
        throw new Error(`Transaction failed: ${confirmation?.value?.err}`);
      }

      setTransactionStatus('confirmed');
      toast?.success('Transaction confirmed successfully!');

      setTimeout(() => {
        reset();
      }, 2000);

    } catch (err: any) {
      console?.error('Transaction failed:', err);
      setError(err?.message || 'Transaction failed');
      setTransactionStatus('failed');
      toast?.error('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50 px-4">
      <div className="bg-gray-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Confirm Swap</h2>
            <p className="text-gray-400 text-sm">Review your transaction details</p>
          </div>
          
          <div className="relative py-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-sm rounded-bl-none rounded-br-none rounded-tl-2xl rounded-tr-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-700">
                  <Image
                    src={(transactionObject?.inputToken?.icon.includes("missing.png") && !transactionObject?.inputToken?.icon.includes("http")) ? MISSING_ICON : transactionObject?.inputToken?.icon}
                    alt={transactionObject?.inputToken?.symbol}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col" title={(transactionObject?.inputAmount / LAMPORTS_PER_SOL).toString()}>
                  <span className="text-2xl font-bold text-white">{formatCompact(transactionObject?.inputAmount / LAMPORTS_PER_SOL, 0, 3)}</span>
                  <span className="text-sm text-gray-400">{transactionObject?.inputToken?.symbol}</span>
                </div>
              </div>
              <span className="text-sm text-gray-500">You pay</span>
            </div>

            <div className="absolute left-1/2 right-1/2 -translate-y-1/2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center z-10">
              <ChevronDown className="w-4 h-4 text-blue-400" />
            </div>

            <div className="flex items-center justify-between p-4 pt-5 bg-gray-800/50 backdrop-blur-sm rounded-tl-none rounded-tr-none rounded-bl-2xl rounded-br-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-700">
                  <Image
                    src={(transactionObject?.outputToken?.icon.includes("missing.png") && !transactionObject?.outputToken?.icon.includes("http")) ? MISSING_ICON : transactionObject?.outputToken?.icon}
                    alt={transactionObject?.outputToken?.symbol}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col" title={(transactionObject?.outputAmount / (LAMPORTS_PER_SOL/1000)).toString()}>
                  <span className="text-2xl font-bold text-white">{formatCompact(transactionObject?.outputAmount / (LAMPORTS_PER_SOL/1000), 0, 3)}</span>
                  <span className="text-sm text-gray-400">{transactionObject?.outputToken?.symbol}</span>
                </div>
              </div>
              <span className="text-sm text-gray-500">You receive</span>
            </div>
          </div>

          <div className="space-y-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Gas Fees (Approx.)</span>
              <span className="text-white font-medium">
                {(transactionObject?.gasFees?.toFixed(10) || 0)} SOL
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Slippage</span>
              <span className="text-white font-medium">0.5%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Platform Fees (1%)</span>
              <span className="text-white font-medium">
                {((transactionObject?.platformFee || 0) / (LAMPORTS_PER_SOL/1000))} {transactionObject?.outputToken?.symbol}
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-xl border border-red-900/50">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 space-y-4 border-t border-gray-800 bg-gray-900/50">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCancel}
              disabled={isLoading || transactionStatus === 'processing'}
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || transactionStatus === 'processing' || transactionStatus === 'confirmed'}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  Confirm
                </div>
              ) : 'Confirm'}
            </button>
          </div>

          {signature && (
            <a
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View on Solscan
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {transactionStatus !== 'idle' && (
            <div className={`
              p-3 flex items-center justify-center gap-2 rounded-xl text-sm font-medium
              ${transactionStatus === 'confirmed' ? 'bg-green-900/20 text-green-400' : ''}
              ${transactionStatus === 'failed' ? 'bg-red-900/20 text-red-400' : ''}
              ${(transactionStatus === 'signing' || transactionStatus === 'processing') ? 'bg-blue-900/20 text-blue-400' : ''}
            `}>
              {getStatusIcon()}
              <span>
                {transactionStatus === 'signing' && 'Waiting for signature...'}
                {transactionStatus === 'processing' && 'Processing transaction...'}
                {transactionStatus === 'confirmed' && 'Transaction confirmed!'}
                {transactionStatus === 'failed' && 'Transaction failed'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}