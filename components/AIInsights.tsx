import React, { useState } from 'react';
import { Stock, AIAnalysisResult } from '../types';
import { getMarketAnalysis } from '../services/geminiService';
import { Sparkles, Brain, CheckCircle, AlertTriangle, MinusCircle, Loader2 } from 'lucide-react';

interface AIInsightsProps {
  stock: Stock;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ stock }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await getMarketAnalysis(stock);
      setAnalysis(result);
    } catch (e) {
      console.error("Failed to analyze", e);
    } finally {
      setLoading(false);
    }
  };

  // Reset analysis when stock changes (simple effect alternative: just clear on render if IDs mismatch, but button press is safer for API quotas)
  React.useEffect(() => {
    setAnalysis(null);
  }, [stock.symbol]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return 'text-trade-up';
      case 'BEARISH': return 'text-trade-down';
      default: return 'text-yellow-400';
    }
  };

  const getRecIcon = (rec: string) => {
    switch (rec) {
      case 'BUY': return <CheckCircle className="text-trade-up" size={24} />;
      case 'SELL': return <AlertTriangle className="text-trade-down" size={24} />;
      default: return <MinusCircle className="text-yellow-400" size={24} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Brain size={120} className="text-indigo-400" />
      </div>
      
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <Sparkles className="text-indigo-400" />
        <h3 className="text-xl font-bold text-white">Gemini Market Insights</h3>
      </div>

      {!analysis && !loading && (
        <div className="text-center py-8 relative z-10">
          <p className="text-trade-muted mb-4">
            Leverage Google Gemini 3 models to analyze real-time technical indicators, 
            market sentiment, and sector performance for {stock.name}.
          </p>
          <button
            onClick={handleAnalyze}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-900/50 flex items-center gap-2 mx-auto"
          >
            <Brain size={18} />
            Generate AI Analysis
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 relative z-10">
          <Loader2 className="animate-spin text-indigo-400" size={48} />
          <p className="text-indigo-200 animate-pulse">Analyzing market patterns...</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
          {/* Header Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <span className="text-xs text-trade-muted uppercase tracking-wider">Sentiment</span>
              <div className={`font-bold text-lg ${getSentimentColor(analysis.sentiment)}`}>
                {analysis.sentiment}
              </div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
              <span className="text-xs text-trade-muted uppercase tracking-wider">Confidence</span>
              <div className="font-bold text-lg text-white">
                {analysis.score}%
              </div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 flex flex-col justify-center items-center">
              <span className="text-xs text-trade-muted uppercase tracking-wider mb-1">Verdict</span>
              <div className="flex items-center gap-2 font-bold text-white">
                {getRecIcon(analysis.recommendation)}
                <span>{analysis.recommendation}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h4 className="text-sm font-semibold text-indigo-300 mb-2">Executive Summary</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Key Points */}
          <div>
            <h4 className="text-sm font-semibold text-indigo-300 mb-2">Key Factors</h4>
            <ul className="space-y-2">
              {analysis.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
