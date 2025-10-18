"use client";

import { motion } from "framer-motion";
import { CandlestickChart } from "lucide-react";
import { useEffect, useState } from "react";

interface Pattern {
  date: string;
  patterns: string[];
  price: number;
}

interface Props {
  ticker: string;
}

export default function CandlePatterns({ ticker }: Props) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatterns();
  }, [ticker]);

  const fetchPatterns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/sp500/analysis/patterns/${ticker}`);
      const data = await res.json();
      setPatterns(data.patterns || []);
    } catch (error) {
      console.error("Error fetching patterns:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPatternIcon = (pattern: string) => {
    if (pattern.includes("Hammer")) return "🔨";
    if (pattern.includes("Doji")) return "➕";
    if (pattern.includes("Bullish Engulfing")) return "🟢";
    if (pattern.includes("Bearish Engulfing")) return "🔴";
    return "🕯️";
  };

  const getPatternColor = (pattern: string) => {
    if (pattern.includes("Bullish") || pattern.includes("Hammer")) return "border-green-500 bg-green-900/20";
    if (pattern.includes("Bearish")) return "border-red-500 bg-red-900/20";
    return "border-yellow-500 bg-yellow-900/20";
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <CandlestickChart className="w-6 h-6 text-orange-400" />
        <h3 className="text-xl font-bold text-white">Detected Candlestick Patterns</h3>
      </div>

      {patterns.length > 0 ? (
        <div className="space-y-4">
          {patterns.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border-l-4 border-blue-500 bg-gray-800/50 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-2">
                    📅 {new Date(item.date).toLocaleDateString('en-US')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.patterns.map((pattern, pIdx) => (
                      <span
                        key={pIdx}
                        className={`px-3 py-1 rounded-lg text-sm font-medium border-2 ${getPatternColor(pattern)}`}
                      >
                        {getPatternIcon(pattern)} {pattern}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-400">Price</p>
                  <p className="text-lg font-bold text-white">$ {item.price.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CandlestickChart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No patterns detected in the last 10 days</p>
          <p className="text-sm text-gray-500 mt-2">
            Patterns: Doji, Hammer, Bullish/Bearish Engulfing
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-sm font-semibold text-gray-400 mb-3">📖 Legend:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span>🔨</span>
            <span className="text-gray-400">Hammer (Bullish)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>➕</span>
            <span className="text-gray-400">Doji (Indecision)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🟢</span>
            <span className="text-gray-400">Bullish Engulfing</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔴</span>
            <span className="text-gray-400">Bearish Engulfing</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
