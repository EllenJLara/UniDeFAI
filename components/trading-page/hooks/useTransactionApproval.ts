import { create } from 'zustand';
import { VersionedTransaction } from "@solana/web3.js";

interface TransactionDetails {
  inputAmount: number;
  outputAmount: number;
  inputToken: {
    symbol: string;
    icon: string;
  };
  outputToken: {
    symbol: string;
    icon: string;
  };
  usdValue?: number;
  instructions: any[];
  estimatedFees?: number;
  priceImpact?: number;
  minimumReceived?: number;
  route?: string;
}

interface TransactionApprovalStore {
  isOpen: boolean;
  transaction?: VersionedTransaction;
  transactionDetails?: TransactionDetails;
  isLoading: boolean;
  wallet?: any;
  setOpen: (isOpen: boolean) => void;
  setTransaction: (transaction: VersionedTransaction, details: TransactionDetails) => void;
  setLoading: (isLoading: boolean) => void;
  setWallet: (wallet: any) => void; 
  reset: () => void;
}

export const useTransactionApproval = create<TransactionApprovalStore>((set) => ({
  isOpen: false,
  transaction: undefined,
  transactionDetails: undefined,
  isLoading: false,
  wallet: undefined,
  setOpen: (isOpen) => set({ isOpen }),
  setTransaction: (transaction, details) => set({ transaction, transactionDetails: details }),
  setLoading: (isLoading) => set({ isLoading }),
  setWallet: (wallet) => set({ wallet }),
  reset: () => set({ 
    isOpen: false, 
    transaction: undefined, 
    transactionDetails: undefined, 
    isLoading: false,
    wallet: undefined 
  }),
}));