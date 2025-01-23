import { PortfolioHeader } from "./PortfolioHeader";
import { PortfolioPositions } from "./PortfolioPositions";
import type { Position, PortfolioStats } from "./types/portfolio";

interface Props {
  portfolioData: PortfolioStats;
  positions: Position[];
}

export function Portfolio({ portfolioData, positions }: Props) {
  return (
    <div className="min-h-screen text-white p-4">
      <PortfolioHeader portfolioData={portfolioData} />
      <PortfolioPositions positions={positions} />
    </div>
  );
}
