import { ArrowLeft, ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { PortfolioStats } from "./types/portfolio";

interface Props {
  portfolioData: PortfolioStats;
}

export function PortfolioHeader({ portfolioData }: Props) {
  const { current_networth, networth_difference, percentage_difference } =
    portfolioData;
  const isNegative = networth_difference < 0;

  return (
    <div className="space-y-1">
      <span className="text-xl text-gray-400">Balance</span>
      <h2 className="text-xl font-bold">
        $
        {current_networth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </h2>
      <div className="flex items-center space-x-2">
        {isNegative ? (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        )}
        <span
          className={`text-sm ${
            isNegative ? "text-red-500" : "text-green-500"
          }`}
        >
          ${Math.abs(networth_difference).toFixed(2)} (
          {Math.abs(percentage_difference).toFixed(2)}%) today
        </span>
      </div>
    </div>
  );
}
