import React, { useState } from 'react';
import { Stock, PortfolioItem } from '../types';
import { DollarSign, AlertCircle } from 'lucide-react';

interface TradePanelProps {
  stock: Stock;
  balance: number;
  holding?: PortfolioItem;
  onBuy: (symbol: string, quantity: number) => void;
  onSell: (symbol: string, quantity: number) => void;
}

export const TradePanel: React.FC<TradePanelProps> = ({ stock, balance, holding, onBuy, onSell }) => {
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(1);
  
  const totalCost = quantity * stock.price;
  const canBuy = balance >= totalCost;
  const canSell = holding ? holding.quantity >= quantity : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'BUY' && canBuy) {
      onBuy(stock.symbol, quantity);
      setQuantity(1);
    } else if (activeTab === 'SELL' && canSell) {
      onSell(stock.symbol, quantity);
      setQuantity(1);
    }
  };

  return (
    <div className="bg-trade-card rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Trade {stock.symbol}</h3>
        <span className="text-sm text-trade-muted">
          Available: <span className="text-white font-mono">${balance.toFixed(2)}</span>
        </span>
      </div>

      <div className="flex bg-slate-900 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('BUY')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeTab === 'BUY' ? 'bg-trade-up text-white' : 'text-trade-muted hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setActiveTab('SELL')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeTab === 'SELL' ? 'bg-trade-down text-white' : 'text-trade-muted hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-trade-muted mb-1">Quantity</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-trade-accent font-mono"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-900 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-trade-muted">Market Price</span>
            <span className="text-white font-mono">${stock.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-700">
            <span className="text-trade-muted">Estimated Total</span>
            <span className="text-white font-mono">${totalCost.toFixed(2)}</span>
          </div>
        </div>

        {activeTab === 'BUY' && !canBuy && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 p-2 rounded">
            <AlertCircle size={14} />
            <span>Insufficient funds</span>
          </div>
        )}
        
        {activeTab === 'SELL' && !canSell && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 p-2 rounded">
            <AlertCircle size={14} />
            <span>Insufficient holdings (Owned: {holding?.quantity || 0})</span>
          </div>
        )}

        <button
          type="submit"
          disabled={activeTab === 'BUY' ? !canBuy : !canSell}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all transform active:scale-95 ${
            activeTab === 'BUY'
              ? 'bg-trade-up hover:bg-emerald-600 disabled:bg-emerald-900/50 disabled:text-emerald-200/50'
              : 'bg-trade-down hover:bg-red-600 disabled:bg-red-900/50 disabled:text-red-200/50'
          }`}
        >
          {activeTab === 'BUY' ? 'Execute Buy Order' : 'Execute Sell Order'}
        </button>
      </form>

      {holding && (
        <div className="mt-4 pt-4 border-t border-slate-700 text-center">
           <p className="text-xs text-trade-muted">Your Position</p>
           <p className="text-lg font-mono text-white">{holding.quantity} shares @ ${holding.avgPrice.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};
