// providers/privy-provider.tsx
"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { useTheme } from "next-themes";
import {toSolanaWalletConnectors} from '@privy-io/react-auth/solana';

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        "appearance": {
          "accentColor": "#6A6FF5",
          "theme": "#1f242e",
          "showWalletLoginFirst": false,
          "logo": "/images/unidefai-logo.png",
          "walletChainType": "solana-only",
          "walletList": [
            "detected_solana_wallets",
            "phantom"
          ]
        },
        loginMethods: [
          "wallet",
          "email",
          "google"
        ],
        fundingMethodConfig: {
          moonpay: {
            useSandbox: false,
          }
        },
        walletChainType: "solana-only",
        embeddedWallets: {
          waitForTransactionConfirmation: true,
          showWalletUIs: true,
          createOnLogin: "off",
          requireUserPasswordOnCreate: false
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },

      }}
    >
      {children}
    </PrivyProvider>
  );
}
