"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useEffect, useState, useCallback } from "react";

export function PrivyLoginButton() {
  const { login, authenticated, user, ready } = usePrivy();
  const { createWallet: createSolanaWallet, wallets: solanaWallets  } = useSolanaWallets();
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAuth = useCallback(async () => {
    if (!authenticated || !user || session || isProcessing) return;

    try {
      setIsProcessing(true);
      const walletAddress = user.linkedAccounts.find(a => a.chainType === 'solana' && a.connectorType === "embedded")?.address;
      const emailAddress = user.email?.address;
      let activeWallet = solanaWallets.find(w => w.address === walletAddress);

      if (!activeWallet && (!walletAddress || user.authMethod === 'email')) {
        try {
          const newWallet = await createSolanaWallet();
          if (newWallet) {
            try {
              await newWallet.connect();
              activeWallet = newWallet;
            } catch (connError) {
              console.warn("Wallet connection failed, proceeding without connection:", connError);
              activeWallet = newWallet;
            }
          }
        } catch (err) {
          if (err.message?.includes('already has an embedded wallet')) {
            activeWallet = solanaWallets.find(w => w.walletClientType === 'embedded');
            if (activeWallet) {
              try {
                await activeWallet.connect();
              } catch (connError) {
                console.warn("Existing wallet connection failed:", connError);
              }
            }
          } else {
            throw err;
          }
        }
      }

      const finalWalletAddress = activeWallet?.address || walletAddress;
      if (!finalWalletAddress) {
        throw new Error('No wallet address available');
      }

      const username = emailAddress
        ? emailAddress.split("@")[0]
        : `user_${finalWalletAddress.slice(0, 6)}`.toLowerCase();
      const email = emailAddress || `${finalWalletAddress}@solana.com`;
      const name = emailAddress
        ? username
        : `User ${finalWalletAddress.slice(0, 6)}`;
      const result = await signIn('privy', {
        walletAddress: finalWalletAddress,
        email,
        username,
        name,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success('Successfully connected!');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Failed to authenticate. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [authenticated, user, session, solanaWallets, createSolanaWallet, isProcessing]);

  useEffect(() => {
    handleAuth();
  }, [handleAuth]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to connect. Please try again.');
    }
  };

  const buttonText = !ready ? 'Loading...'
    : authenticated && session ? 'Connected'
      : isProcessing ? 'Connecting...'
        : authenticated ? 'Authenticating...'
          : 'Connect Wallet';

  return (
    <>
      <Button
        onClick={handleLogin}
        disabled={!ready || isProcessing || (authenticated && session)}
        size="lg"
        className="web3-button wallet-button rounded-[3px] flex items-center justify-center text-white w-[75%] gap-2 bg-purple-500 hover:bg-purple-600 transition-all"
      >
        <span className="font-mono">{buttonText}</span>
      </Button>
      {user?.wallet?.address && (
        <p className="text-xs mt-2 text-gray-500 truncate">
          {user.wallet.address}
        </p>
      )}
    </>
  );
}