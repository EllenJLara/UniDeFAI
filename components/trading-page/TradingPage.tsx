"use client";

import TokenInfoCard from "./TokenInfoCard";
import TradingCard from "./TradingCard";
import ChartWidget from "./ChartWidget";
import { TokenDataProvider } from "./contexts/token-data-context";
import { TokenData } from "@/types";
import Sidebar from "../sidebar/sidebar";
import MobileNavbar from "../navbar/mobile-navbar";

interface TradingPageProps {
  initialData: TokenData;
  tokenAddress: string;
  referrerAddress: string;
}

export default function TradingPage({
  initialData,
  tokenAddress,
  referrerAddress,
}: TradingPageProps) {
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-black">
      {/* Sidebar - hidden on mobile, visible from md breakpoint */}
      <div className="hidden md:block md:w-[255px] bg-gray-900">
        <Sidebar />
      </div>

      {/* Mobile navbar - visible only on mobile */}
      <div className="md:hidden">
        <MobileNavbar />
      </div>

      {/* Main content area */}
      <div className="flex flex-col md:flex-row flex-grow w-full">
        {/* Chart section - full width on mobile, flex-grow on desktop */}
        <div className="w-full md:flex-grow bg-gray-900 shadow-lg border rounded-lg p-2 md:p-4">
          <div className="h-[500px] md:h-full">
            {" "}
            {/* Increased mobile height */}
            <ChartWidget tokenAddress={tokenAddress} />
          </div>
        </div>

        {/* Trading cards section - full width on mobile, 1/3 width on desktop */}
        <div className="w-full md:w-1/3 bg-gray-900 p-4 space-y-4 md:space-y-6 md:-ml-4">
          <TradingCard
            tokenData={initialData}
            tokenAddress={tokenAddress}
            referrerAddress={referrerAddress}
          />
          <TokenDataProvider
            initialData={initialData}
            tokenAddress={tokenAddress}
          >
            <TokenInfoCard />
          </TokenDataProvider>
        </div>
      </div>
    </div>
  );
}
