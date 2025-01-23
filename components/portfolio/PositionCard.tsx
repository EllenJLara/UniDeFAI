import type { Position } from "./types/portfolio";

interface Props {
  position: Position;
}

export function PositionCard({ position }: Props) {
  const isNegative = position.percentageChange < 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
          {position.imgUrl ? (
            <img
              src={position.imgUrl}
              alt={position.symbol}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold">
              {position.symbol?.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{position.symbol}</span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-400 text-sm">
              ${Number(position.currentValue).toFixed(2)}
            </span>
          </div>
          <span className="text-xs text-gray-400">{position.details}</span>
        </div>
      </div>
      <div
        className={`text-right ${
          isNegative ? "text-red-500" : "text-green-500"
        }`}
      >
        <div className="text-sm">
          {isNegative ? "↓" : "↑"}{" "}
          {Math.abs(position.percentageChange).toFixed(2)}%
        </div>
        <div className="text-sm">
          ${Math.abs(parseFloat(position.gainLoss)).toFixed(2)}
        </div>
      </div>
    </div>
  );
}
