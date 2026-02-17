import React, { useState, useEffect, useMemo } from 'react';
import { User, Wallet, BarChart3, PieChart, Activity } from 'lucide-react';

import { StockList } from './components/StockList';
import { StockChart } from './components/StockChart';
import { TradePanel } from './components/TradePanel';
import { AIInsights } from './components/AIInsights';

import { AVAILABLE_STOCKS, INITIAL_BALANCE, generateMockHistory } from './constants';
import { Stock, UserState, Transaction } from './types';

// Mock live updates hook
const useLiveStockData = (initialStocks: Stock[]) => {
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(currentStocks => 
        currentStocks.map(stock => {
          // Random fluctuation between -0.2% and 0.2%
          const fluctuation = (Math.random() - 0.5) * 0.004; 
          const newPrice = stock.price * (1 + fluctuation);
          const changeAmount = newPrice - (stock.price / (1 + stock.change / 100)); // Rough estimate of original base
          
          return {
            ...stock,
            price: newPrice,
            changeAmount: changeAmount,
            // Keep the change % somewhat consistent with daily open for visual stability
            change: stock.change + (fluctuation * 100) 
          };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return stocks;
};

const App: React.FC = () => {
  const stocks = useLiveStockData(AVAILABLE_STOCKS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(AVAILABLE_STOCKS[0].symbol);
  
  const [user, setUser] = useState<UserState>({
    balance: INITIAL_BALANCE,
    portfolio: []
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const selectedStock = useMemo(() => 
    stocks.find(s => s.symbol === selectedSymbol) || stocks[0], 
  [stocks, selectedSymbol]);

  // Generate chart data based on the *current* price to make it look continuous
  const chartData = useMemo(() => 
    generateMockHistory(selectedStock.price), 
  // We intentionally depend mainly on symbol. 
  // In a real app, we'd append points. Here we regenerate for simplicity when switching.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [selectedSymbol]);

  const handleBuy = (symbol: string, quantity: number) => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const totalCost = stock.price * quantity;
    if (user.balance < totalCost) return;

    setUser(prev => {
      const existingHolding = prev.portfolio.find(p => p.symbol === symbol);
      let newPortfolio;

      if (existingHolding) {
        const totalValue = (existingHolding.quantity * existingHolding.avgPrice) + totalCost;
        const totalQuantity = existingHolding.quantity + quantity;
        newPortfolio = prev.portfolio.map(p => 
          p.symbol === symbol 
            ? { ...p, quantity: totalQuantity, avgPrice: totalValue / totalQuantity }
            : p
        );
      } else {
        newPortfolio = [...prev.portfolio, { symbol, quantity, avgPrice: stock.price }];
      }

      return {
        balance: prev.balance - totalCost,
        portfolio: newPortfolio
      };
    });

    setTransactions(prev => [{
      id: Date.now().toString(),
      symbol,
      type: 'BUY',
      quantity,
      price: stock.price,
      date: new Date()
    }, ...prev]);
  };

  const handleSell = (symbol: string, quantity: number) => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const holding = user.portfolio.find(p => p.symbol === symbol);
    if (!holding || holding.quantity < quantity) return;

    const totalValue = stock.price * quantity;

    setUser(prev => {
      const newPortfolio = prev.portfolio.map(p => {
        if (p.symbol === symbol) {
          return { ...p, quantity: p.quantity - quantity };
        }
        return p;
      }).filter(p => p.quantity > 0);

      return {
        balance: prev.balance + totalValue,
        portfolio: newPortfolio
      };
    });

    setTransactions(prev => [{
      id: Date.now().toString(),
      symbol,
      type: 'SELL',
      quantity,
      price: stock.price,
      date: new Date()
    }, ...prev]);
  };

  const currentHolding = user.portfolio.find(p => p.symbol === selectedSymbol);

  // Calculate Portfolio Total Value
  const portfolioValue = user.portfolio.reduce((acc, item) => {
    const currentPrice = stocks.find(s => s.symbol === item.symbol)?.price || 0;
    return acc + (item.quantity * currentPrice);
  }, 0);

  const totalEquity = user.balance + portfolioValue;

  return (
    <div className="flex flex-col h-screen bg-trade-bg text-trade-text overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-trade-card/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-lg">
            <Activity className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Gemini<span className="text-blue-400">Trade</span></h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
             <span className="text-xs text-trade-muted">Total Equity</span>
             <span className="font-mono font-bold text-emerald-400 text-lg">${totalEquity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div className="h-8 w-px bg-slate-700"></div>
          <div className="flex items-center gap-3 bg-slate-800 py-1.5 px-3 rounded-full border border-slate-700">
            <Wallet size={16} className="text-blue-400" />
            <span className="font-mono font-bold">${user.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User size={16} className="text-slate-300" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 hidden md:flex flex-col">
          <StockList 
            stocks={stocks} 
            selectedSymbol={selectedSymbol} 
            onSelect={setSelectedSymbol} 
          />
        </div>

        {/* Dashboard */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Top Row: Chart & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Section */}
              <div className="lg:col-span-2 bg-trade-card rounded-xl border border-slate-700 p-6 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">{selectedStock.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono text-white">${selectedStock.price.toFixed(2)}</span>
                      <span className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded text-sm ${selectedStock.change >= 0 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                        {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <span className="px-3 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">{selectedStock.sector}</span>
                     <span className="px-3 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">Cap: {selectedStock.marketCap}</span>
                  </div>
                </div>
                
                <StockChart 
                  data={chartData} 
                  color={selectedStock.change >= 0 ? '#10b981' : '#ef4444'} 
                />
              </div>

              {/* Trade Panel */}
              <div className="lg:col-span-1">
                <TradePanel 
                  stock={selectedStock}
                  balance={user.balance}
                  holding={currentHolding}
                  onBuy={handleBuy}
                  onSell={handleSell}
                />
              </div>
            </div>

            {/* Bottom Row: AI & Portfolio */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIInsights stock={selectedStock} />
              
              <div className="bg-trade-card rounded-xl border border-slate-700 p-6 flex flex-col">
                 <div className="flex items-center gap-2 mb-4">
                    <PieChart className="text-purple-400" />
                    <h3 className="text-xl font-bold text-white">Your Portfolio</h3>
                 </div>
                 
                 {user.portfolio.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-8">
                       <BarChart3 size={48} className="mb-2 opacity-20" />
                       <p>No active positions</p>
                    </div>
                 ) : (
                   <div className="space-y-3">
                     {user.portfolio.map(item => {
                       const currentPrice = stocks.find(s => s.symbol === item.symbol)?.price || 0;
                       const value = item.quantity * currentPrice;
                       const profit = (currentPrice - item.avgPrice) * item.quantity;
                       const isProfit = profit >= 0;

                       return (
                         <div key={item.symbol} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                           <div>
                             <div className="font-bold text-white">{item.symbol}</div>
                             <div className="text-xs text-slate-400">{item.quantity} shares</div>
                           </div>
                           <div className="text-right">
                             <div className="font-mono text-white">${value.toFixed(2)}</div>
                             <div className={`text-xs ${isProfit ? 'text-trade-up' : 'text-trade-down'}`}>
                               {isProfit ? '+' : ''}{profit.toFixed(2)}
                             </div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 )}
              </div>
            </div>
            
            {/* Recent Transactions List (Optional, just to fill space if needed, kept simple) */}
            {transactions.length > 0 && (
              <div className="mt-8">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Activity</h3>
                 <div className="bg-trade-card rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-slate-800/50 text-slate-400 font-medium">
                         <tr>
                           <th className="px-4 py-3">Type</th>
                           <th className="px-4 py-3">Symbol</th>
                           <th className="px-4 py-3">Quantity</th>
                           <th className="px-4 py-3">Price</th>
                           <th className="px-4 py-3 text-right">Time</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800">
                         {transactions.slice(0, 5).map(tx => (
                           <tr key={tx.id} className="hover:bg-slate-800/30">
                             <td className={`px-4 py-3 font-bold ${tx.type === 'BUY' ? 'text-trade-up' : 'text-trade-down'}`}>{tx.type}</td>
                             <td className="px-4 py-3 text-white">{tx.symbol}</td>
                             <td className="px-4 py-3 text-slate-300">{tx.quantity}</td>
                             <td className="px-4 py-3 text-slate-300">${tx.price.toFixed(2)}</td>
                             <td className="px-4 py-3 text-right text-slate-500">{tx.date.toLocaleTimeString()}</td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
