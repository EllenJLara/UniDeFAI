"use client";

import { getTokenData } from "@/services/getTokenData";
import { useEffect, useState } from "react";
// import { getTopPoolFromTokenAddress } from "@/services/getTopPool";

interface ChartWidgetProps {
  tokenAddress: string;
}

const ChartWidget = ({ tokenAddress }: ChartWidgetProps) => {
  const [poolId, setPoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(tokenAddress);
    const fetchPoolId = async () => {
      try {
        const id = await getTokenData(tokenAddress);
        setPoolId(id.top_pool_address);
        // console.log("pool id", id);
      } catch (error) {
        console.error("Error fetching pool ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoolId();
  }, [tokenAddress]);

  if (loading) {
    return <div className="w-2/3 bg-gray-900 text-white">Loading chart...</div>;
  }

  if (!poolId) {
    return (
      <div className="w-full h-full">
        Failed to load chart. Please try again.
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <iframe
        height="85%"
        width="100%"
        id="geckoterminal-embed"
        title="GeckoTerminal Embed"
        src={`https://www.geckoterminal.com/solana/pools/${poolId}?embed=1&info=0&swaps=0`}
        className="w-full h-full border-none"
        allow="clipboard-write"
        allowFullScreen
      />
    </div>
  );
};

export default ChartWidget;
