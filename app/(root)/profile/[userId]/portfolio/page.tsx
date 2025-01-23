import { Metadata } from "next";
import { Portfolio } from "@/components/portfolio";
import ProfileHeader from "@/components/header/profile-header";
import Profile from "@/components/profile/profile";
import { getUserMetadata } from "@/components/profile/api/get-user-metadata";
import { transformPortfolioData } from "@/lib/transform-portfolio-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const user = await getUserMetadata({
    user_id: resolvedParams.userId,
    type: "portfolio",
  });

  if (!user) return { title: "User not found" };
  return {
    title: `Portfolio of ${user.name} (@${user.username})`,
  };
}

async function getPortfolioData(address: string) {
  const [portfolioStats, positions] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user-portfolio/pulsar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    }).then((res) => res.json()),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user-portfolio/coinstats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    })
      .then((res) => res.json())
      .then((data) => transformPortfolioData(data.data)),
  ]);

  return { stats: portfolioStats.stats, positions };
}

const NoWalletConnected = ({ user }: { user: any }) => (
  <Card className="mt-8 p-6 bg-black border-gray-800 text-center">
    <div className="flex flex-col items-center gap-4">
      <Wallet className="w-12 h-12 text-gray-400" />
      <h2 className="text-xl font-semibold">No Wallet Connected</h2>
      <p className="text-gray-400 max-w-md">
        {user.name} hasn't connected a wallet yet. Portfolio information will be
        available once they connect their wallet.
      </p>
      {/* Add your connect wallet button here if needed */}
    </div>
  </Card>
);

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const resolvedParams = await params;
  const user = await getUserMetadata({
    user_id: resolvedParams.userId,
    type: "portfolio",
  });

  if (!user) {
    return <div>User not found</div>;
  }

  let portfolioData;
  if (user.walletAddress) {
    try {
      portfolioData = await getPortfolioData(user.walletAddress);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    }
  }

  return (
    <>
      <ProfileHeader
        heading={user.name ?? undefined}
        stats={
          portfolioData
            ? `$${portfolioData.stats.current_networth.toLocaleString()}`
            : "No wallet connected"
        }
      />
      <Profile initialUser={user as any} />
      {user.walletAddress && portfolioData ? (
        <Portfolio
          portfolioData={portfolioData.stats}
          positions={portfolioData.positions}
        />
      ) : (
        <NoWalletConnected user={user} />
      )}
    </>
  );
}
