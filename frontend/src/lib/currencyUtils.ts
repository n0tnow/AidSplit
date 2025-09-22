// Currency conversion utilities

export interface PriceData {
  stx: number;  // STX price in USD
  sbtc: number; // sBTC price in USD (should be ~same as BTC)
}

// Mock price data - in a real app, you'd fetch this from an API
export const mockPrices: PriceData = {
  stx: 0.50,  // Mock STX price in USD
  sbtc: 65000 // Mock sBTC price in USD (approximately BTC price)
};

// Convert USD to STX
export const usdToStx = (usdAmount: number, stxPrice: number): number => {
  if (stxPrice === 0) return 0;
  return usdAmount / stxPrice;
};

// Convert USD to sBTC
export const usdToSbtc = (usdAmount: number, sbtcPrice: number): number => {
  if (sbtcPrice === 0) return 0;
  return usdAmount / sbtcPrice;
};

// Convert STX to microSTX (ustx)
export const stxToUstx = (stxAmount: number): string => {
  return Math.round(stxAmount * 1_000_000).toString();
};

// Convert microSTX (ustx) to STX
export const ustxToStx = (ustxAmount: number | string): number => {
  const amount = typeof ustxAmount === 'string' ? parseInt(ustxAmount) : ustxAmount;
  return amount / 1_000_000;
};

// Convert BTC to Satoshis
export const btcToSats = (btcAmount: number): number => {
  return Math.round(btcAmount * 100_000_000);
};

// Convert Satoshis to sBTC (same as BTC)
export const satsToSbtc = (satsAmount: number): number => {
  return satsAmount / 100_000_000;
};

// Hook to fetch current prices (mock implementation)
export const useCurrentPrices = () => {
  // In a real app, you'd use useState and useEffect to fetch from an API
  // For now, returning mock data
  return {
    data: mockPrices,
    isLoading: false,
    error: null
  };
};

// Format currency amounts for display
export const formatCurrency = (amount: number, currency: 'USD' | 'STX' | 'sBTC'): string => {
  switch (currency) {
    case 'USD':
      return `$${amount.toFixed(2)}`;
    case 'STX':
      return `${amount.toFixed(6)} STX`;
    case 'sBTC':
      return `${amount.toFixed(8)} sBTC`;
    default:
      return amount.toString();
  }
};

// Get STX amount in USD
export const getStxValueInUsd = (stxAmount: number, stxPrice: number): number => {
  return stxAmount * stxPrice;
};

// Get sBTC amount in USD
export const getSbtcValueInUsd = (sbtcAmount: number, sbtcPrice: number): number => {
  return sbtcAmount * sbtcPrice;
};
