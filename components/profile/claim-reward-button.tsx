import { useCallback, useState, useEffect } from "react";
import { claimReward } from "@/services/process-claim-reward/claimReward";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import { cn } from "@/lib/utils";

interface ClaimButtonProps {
  userId: string;
  onSuccess?: () => void;
  className?: string;
  variant?: "default" | "menu-item" | "earnings-display";
}

export const ClaimButton = ({
  userId,
  onSuccess,
  className = "",
  variant = "default",
}: ClaimButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const { toast } = useToast();

  const fetchBalance = useCallback(async () => {
    try {
      const response = await axios.get(
        `/api/trading-fees-reward/check-balance/${userId}`,
        { validateStatus: (status) => true }
      );
      const newBalance = response.data?.balance ?? 0;
      setBalance(newBalance);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setBalance(0);
    }
  }, [userId]);

  useEffect(() => {
    let isMounted = true;
    const loadBalance = async () => {
      if (isMounted) {
        await fetchBalance();
      }
    };
    loadBalance();
    return () => {
      isMounted = false;
    };
  }, [fetchBalance]);

  const handleClaim = useCallback(async () => {
    // if (isLoading || balance <= 0) return;

    setIsLoading(true);
    try {
      const result = await claimReward(userId);

      if (!result.error) {
        toast({
          title: "Claim successful!",
          description: `Successfully claimed ${balance.toFixed(2)} SOL`,
          variant: "default",
          className:
            "flex items-center gap-3 rounded-lg bg-black px-8 py-5 text-white shadow-lg border-2 border-green-600",
        });
        onSuccess?.();
        setBalance(0);
      } else {
        toast({
          title: "Claim failed!",
          description: result.error || "Failed to claim rewards",
          variant: "destructive",
          className: "flex items-center gap-3 rounded-lg bg-black px-8 py-5 text-white shadow-lg border-2 border-red-500",
        });
      }
    } catch (error: any) {
      toast({
        title: "Claim failed!",
        description: error.message || "Failed to claim rewards",
        variant: "destructive",
        className:
          "flex items-center gap-3 rounded-lg bg-black px-8 py-5 text-white shadow-lg border-2 border-red-500",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, onSuccess, isLoading, balance, toast]);

  if (variant === "earnings-display") {
    return (
      <div className="flex flex-col items-end">
        <span className="text-sm text-muted-foreground">Available</span>
        <div className="flex items-center gap-2">
          {(
            <button
              onClick={handleClaim}
              disabled={isLoading}
              className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600 text-black rounded-md transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Claim"
              )}
            </button>
          )}

          <span className="font-medium">{balance.toFixed(3)} SOL</span>
        </div>
      </div>
    );
  }

  const defaultStyles = `
    flex items-center justify-center gap-2
    px-4 py-2 
    bg-green-500
    hover:bg-green-600
    text-white font-medium
    rounded-md
    transition-all
    disabled:bg-gray-300
    disabled:cursor-not-allowed
    shadow-sm hover:shadow-md
    text-sm
  `;

  const menuItemStyles = `
    flex w-full items-center gap-2
    px-2 py-1.5
    text-sm
    rounded-none
    bg-transparent
    hover:bg-accent
    hover:text-accent-foreground
    focus:bg-accent
    focus:text-accent-foreground
    cursor-pointer
    transition-colors
  `;

  const buttonStyle = variant === "menu-item" ? menuItemStyles : defaultStyles;

  return (
    <button
      onClick={handleClaim}
      disabled={isLoading || balance <= 0}
      className={cn(buttonStyle, className)}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Claiming...</span>
        </>
      ) : (
        <>
          <span>{balance.toFixed(3)} SOL available</span>
        </>
      )}
    </button>
  );
};
