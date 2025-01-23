import { getTokenData } from "@/services/getTokenData";
import TradingPage from "@/components/trading-page/TradingPage";
import { Toaster } from "@/components/ui/toaster";

interface Props {
  params: {
    tokenAddress: string;
    referrerAddress: string;
  };
}

export default async function Page({ params }: Props) {
  const { tokenAddress, referrerAddress } = await params;
  const initialData = await getTokenData(tokenAddress);

  return (
    <div>
      <TradingPage
        initialData={initialData}
        tokenAddress={tokenAddress}
        referrerAddress={referrerAddress}
      />
      <Toaster />
    </div>
  );
}
