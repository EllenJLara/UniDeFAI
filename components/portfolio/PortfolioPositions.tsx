import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionCard } from "./PositionCard";
import type { Position } from "./types/portfolio";

interface Props {
  positions: Position[];
}

export function PortfolioPositions({ positions }: Props) {
  console.log("Positions: ", positions);
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3 border-b border-pink-500/10 pb-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">Positions</h3>
          {/* <span className="text-sm text-gray-400">{positions.length}</span> */}
        </div>
      </div>
      <Card className="border-gray-800 p-2">
        <div className="divide-y divide-gray-800">
          {positions.map((position, index) => (
            <PositionCard key={index} position={position} />
          ))}
        </div>
      </Card>
    </div>
  );
}
