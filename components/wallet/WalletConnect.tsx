import React, { useState, useEffect, useCallback } from "react";
import { Wallet, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import bs58 from "bs58";
import { toast } from "react-hot-toast";
import posthog from "posthog-js";

type PhantomEvent = "connect" | "disconnect" | "accountChanged";

type PhantomProvider = {
  isPhantom?: boolean;
  connect: (params: {
    onlyIfTrusted?: boolean;
  }) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signTransaction: (transaction: any) => Promise<any>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  off: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: any, params: any) => Promise<any>;
};

interface Window {
  solana?: PhantomProvider;
}
const BALANCE_REFRESH_INTERVAL = 30000;
const APP_STORE_TIMEOUT = 1000;

const generateNonce = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return bs58.encode(array);
};

const createPhantomDeepLink = (targetUrl: string): string => {
  const encodedUrl = encodeURIComponent(targetUrl);
  const encodedRef = encodeURIComponent(targetUrl);
  return `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedRef}`;
};

const PhantomWalletIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 593 493"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M70.0546 493C145.604 493 202.38 427.297 236.263 375.378C232.142 386.865 229.852 398.351 229.852 409.378C229.852 439.703 247.252 461.297 281.592 461.297C328.753 461.297 379.119 419.946 405.218 375.378C403.386 381.811 402.471 387.784 402.471 393.297C402.471 414.432 414.375 427.757 438.643 427.757C515.108 427.757 592.03 292.216 592.03 173.676C592.03 81.3243 545.327 0 428.112 0C222.069 0 0 251.784 0 414.432C0 478.297 34.3405 493 70.0546 493ZM357.141 163.568C357.141 140.595 369.962 124.514 388.734 124.514C407.049 124.514 419.87 140.595 419.87 163.568C419.87 186.541 407.049 203.081 388.734 203.081C369.962 203.081 357.141 186.541 357.141 163.568ZM455.126 163.568C455.126 140.595 467.947 124.514 486.719 124.514C505.034 124.514 517.855 140.595 517.855 163.568C517.855 186.541 505.034 203.081 486.719 203.081C467.947 203.081 455.126 186.541 455.126 163.568Z"
      fill="#AB9FF2"
    />
  </svg>
);

const PhantomWalletButton: React.FC = () => {
  const { data: session } = useSession();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [balance, setBalance] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://solana-mainnet.g.alchemy.com/v2/d1EymyBwCaXTuf_No1_ETM9lfRpBifCn",
    { commitment: "confirmed" }
  );

  const detectPhantomEnvironment = useCallback(() => {
    if (typeof window === "undefined") return null;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (window.solana?.isPhantom) return "installed";
    if (isIOS) return "ios";
    if (isAndroid) return "android";
    return "desktop";
  }, []);

  const fetchBalance = useCallback(
    async (address: string) => {
      if (!address) return;

      try {
        const publicKey = new PublicKey(address);
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(null);
      }
    },
    [connection]
  );

  const disconnectAndSignOut = useCallback(async () => {
    try {
      setWalletAddress("");
      setBalance(null);
      setIsDropdownOpen(false);

      await signOut({
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
  }, []);

  const handlePhantomDeepLink = useCallback(() => {
    const environment = detectPhantomEnvironment();
    const currentUrl =
      process.env.NEXT_PUBLIC_NEXTAUTH_URL || window.location.origin;
    const deepLink = createPhantomDeepLink(currentUrl);

    switch (environment) {
      case "installed":
        void connectWallet();
        break;
      case "ios":
        window.location.href = deepLink;
        break;
      case "android":
        window.location.href = deepLink;
        break;
      default:
        window.open("https://phantom.app/", "_blank");
    }
  }, []);

  const connectWallet = async () => {
    if (isConnecting) return;

    try {
      setIsConnecting(true);
      const provider = window.solana;

      if (!provider?.isPhantom) {
        handlePhantomDeepLink();
        return;
      }

      const response = await provider.connect();
      const walletAddress = response.publicKey.toString();

      const nonce = generateNonce();
      const messageContent = [
        `Sign in to ${process.env.NEXT_PUBLIC_SITE_NAME || "our site"}`,
        `Wallet: ${walletAddress}`,
        `Nonce: ${nonce}`,
        `Time: ${new Date().toISOString()}`,
      ].join("\n");

      const message = new TextEncoder().encode(messageContent);

      const signedMessage = await provider.signMessage(message);
      const signature = bs58.encode(signedMessage.signature);

      // Add this check for existing Google session
      const signInParams: any = {
        walletAddress,
        signature,
        nonce,
        message: messageContent,
        redirect: false,
      };

      // If user is already logged in with Google, pass their email
      if (session?.user?.email) {
        signInParams.email = session.user.email;
      }

      const result = await signIn("phantom", signInParams);

      if (result?.error) {
        throw new Error(result.error);
      }

      setWalletAddress(walletAddress);
      await fetchBalance(walletAddress);
      // If the user was previously logged in with a different account, show a switch message
      if (session?.user && session.user.walletAddress !== walletAddress) {
        toast.success("Switched to wallet account!");
      } else {
        toast.success("Wallet connected successfully!");
      }
    } catch (error) {
      console.error("Connection error:", error);
      await disconnectAndSignOut();
      toast.error("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = useCallback(async () => {
    try {
      const provider = window.solana;
      if (provider) {
        await provider.disconnect();
        setWalletAddress("");
        setBalance(null);
        setIsDropdownOpen(false);

        await signOut({
          callbackUrl: "/",
        });
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect. Please try again.");
    }
  }, []);

  const copyAddress = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy address");
    }
  };

  const viewOnExplorer = useCallback(() => {
    if (!walletAddress) return;
    const explorerUrl = `https://explorer.solana.com/address/${walletAddress}`;
    window.open(explorerUrl, "_blank", "noopener,noreferrer");
  }, [walletAddress]);

  useEffect(() => {
    if (session?.user?.walletAddress) {
      setWalletAddress(session.user.walletAddress);
      void fetchBalance(session.user.walletAddress);
    } else if (window.solana?.isConnected && !session?.user) {
      void disconnectAndSignOut();
    }
  }, [session, fetchBalance, disconnectAndSignOut]);

  useEffect(() => {
    const intervalId = walletAddress
      ? setInterval(
          () => void fetchBalance(walletAddress),
          BALANCE_REFRESH_INTERVAL
        )
      : undefined;

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [walletAddress, fetchBalance]);

  useEffect(() => {
    const handleWalletDisconnect = () => {
      void disconnectAndSignOut();
    };

    const handleAccountChange = () => {
      void disconnectAndSignOut();
    };

    const provider = window.solana;
    if (provider) {
      provider.on("disconnect", handleWalletDisconnect);
      provider.on("accountChanged", handleAccountChange);

      return () => {
        provider.off("disconnect", handleWalletDisconnect);
        provider.off("accountChanged", handleAccountChange);
      };
    }
  }, [disconnectAndSignOut]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        event.target instanceof Node &&
        !event.target.closest(".wallet-dropdown")
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div
      className="relative w-full flex justify-center"
      onClick={() =>
        posthog.capture("sign_in_attempt", { method: "wallet_connect_button" })
      }
    >
      <Button
        onClick={() =>
          walletAddress ? setIsDropdownOpen(!isDropdownOpen) : connectWallet()
        }
        disabled={isConnecting}
        size="lg"
        className="web3-button wallet-button rounded-[3px] flex items-center justify-center text-white w-[75%] gap-2 bg-purple-500 hover:bg-purple-600 transition-all"
      >
        <PhantomWalletIcon />
        <span className="font-mono">
          {isConnecting ? (
            "Connecting..."
          ) : walletAddress ? (
            <div className="flex items-center gap-3">
              <span>
                [{`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}]
              </span>
              {balance !== null && (
                <span className="text-sm">[{balance.toFixed(2)} SOL]</span>
              )}
            </div>
          ) : (
            "Connect Wallet"
          )}
        </span>
      </Button>

      {isDropdownOpen && walletAddress && (
        <div className="wallet-dropdown absolute mt-2 w-[75%] bg-background border border-border shadow-lg font-mono">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">[wallet info]</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyAddress}
                  className="p-2 hover:bg-muted transition-colors"
                  aria-label="Copy address"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={viewOnExplorer}
                  className="p-2 hover:bg-muted transition-colors"
                  aria-label="View on explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-sm break-all bg-muted p-3">
              {walletAddress}
            </div>

            <Button
              onClick={() => void disconnectWallet()}
              variant="destructive"
              size="sm"
              className="w-full font-mono"
            >
              [disconnect]
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhantomWalletButton;
