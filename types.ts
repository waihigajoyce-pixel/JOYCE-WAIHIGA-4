export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number; // Percentage change
  changeAmount: number;
  volume: string;
  marketCap: string;
  description: string;
  sector: string;
}

export interface StockHistoryPoint {
  time: string;
  price: number;
}

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export interface UserState {
  balance: number;
  portfolio: PortfolioItem[];
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  date: Date;
}

export interface AIAnalysisResult {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number; // 0-100
  summary: string;
  keyPoints: string[];
  recommendation: 'BUY' | 'SELL' | 'HOLD';
}
