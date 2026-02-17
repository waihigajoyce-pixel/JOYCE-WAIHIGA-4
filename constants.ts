import { Stock } from './types';

export const INITIAL_BALANCE = 50000;

export const AVAILABLE_STOCKS: Stock[] = [
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 173.55,
    change: 1.25,
    changeAmount: 2.15,
    volume: "24.5M",
    marketCap: "2.1T",
    description: "Technology conglomerate holding company.",
    sector: "Technology"
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.30,
    change: -0.45,
    changeAmount: -0.85,
    volume: "52.1M",
    marketCap: "2.9T",
    description: "Consumer electronics and software company.",
    sector: "Technology"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 178.90,
    change: 3.40,
    changeAmount: 5.88,
    volume: "105M",
    marketCap: "580B",
    description: "Electric vehicle and clean energy company.",
    sector: "Automotive"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com",
    price: 182.10,
    change: 0.80,
    changeAmount: 1.45,
    volume: "33M",
    marketCap: "1.8T",
    description: "E-commerce and cloud computing giant.",
    sector: "Consumer Discretionary"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp",
    price: 945.20,
    change: 2.10,
    changeAmount: 19.45,
    volume: "45M",
    marketCap: "2.3T",
    description: "Semiconductor company specializing in GPUs.",
    sector: "Technology"
  }
];

// Helper to generate fake intraday data
export const generateMockHistory = (basePrice: number, points: number = 50) => {
  const data = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - i) * 5 * 60000); // 5 min intervals
    // Random walk
    const change = (Math.random() - 0.5) * (basePrice * 0.02);
    currentPrice += change;
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: parseFloat(currentPrice.toFixed(2))
    });
  }
  return data;
};
