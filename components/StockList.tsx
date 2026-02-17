import React from 'react';
import { Stock } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockListProps {
  stocks: Stock[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

export const StockList: React.FC<StockListProps> = ({ stocks, selectedSymbol, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-trade-card border-r border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-trade-accent w-2 h-6 rounded-full"></span>
          Markets
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {stocks.map((stock) => {
          const isUp = stock.change >= 0;
          const isSelected = stock.symbol === selectedSymbol;
          
          return (
            <div
              key={stock.symbol}
              onClick={() => onSelect(stock.symbol)}
              className={`p-4 cursor-pointer transition-all border-l-4 hover:bg-slate-700/50 ${
                isSelected 
                  ? 'bg-slate-700/30 border-trade-accent' 
                  : 'border-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold text-lg ${isSelected ? 'text-trade-accent' : 'text-white'}`}>
                  {stock.symbol}
                </span>
                <span className={`font-mono text-sm ${isUp ? 'text-trade-up' : 'text-trade-down'}`}>
                  {stock.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-trade-muted">
                <span>{stock.name}</span>
                <div className={`flex items-center gap-1 ${isUp ? 'text-trade-up' : 'text-trade-down'}`}>
                  {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{isUp ? '+' : ''}{stock.change}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
