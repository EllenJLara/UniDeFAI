import { getTokenData } from "@/services/getTokenData";
import TradingPage from "@/components/trading-page/TradingPage";
import { Toaster } from "@/components/ui/toaster";

interface Props {
  params: {
    tokenAddress: string;
  };
}

export default async function Page({ params }: Props) {
  const { tokenAddress } = await params;
  const initialData = await getTokenData(tokenAddress);

  return (
    <div>
      <TradingPage initialData={initialData} tokenAddress={tokenAddress} />
      <Toaster />
    </div>
  );
}
