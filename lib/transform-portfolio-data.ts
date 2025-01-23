export function transformPortfolioData(data: any[]) {
  if (!data || !data[0]?.balances) return [];

  return data[0].balances.map((item: any) => {
    const currentValue = item.amount * item.price;
    const previousValue = currentValue / (1 + item.pCh24h / 100);
    const gainLossAmount = currentValue - previousValue;
    const sharesDetails = `${item.amount} ${item.symbol}`;

    return {
      name: item.name,
      symbol: item.symbol,
      imgUrl: item.imgUrl,
      currentValue: currentValue.toFixed(2),
      percentageChange: item.pCh24h || 0,
      gainLoss: gainLossAmount.toFixed(2),
      details: sharesDetails,
      price: item.price,
    };
  });
}
