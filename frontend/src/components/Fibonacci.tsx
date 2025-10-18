"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { useEffect, useState } from "react";

interface FibonacciData {
  retracements: { [key: string]: number };
  extensions: { [key: string]: number };
  camarilla: { [key: string]: number };
  max_price: number;
  min_price: number;
  current_price: number;
}

interface Props {
  ticker: string;
}

export default function Fibonacci({ ticker }: Props) {
  const [data, setData] = useState<FibonacciData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFibonacci();
  }, [ticker]);

  const fetchFibonacci = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/sp500/analysis/fibonacci/${ticker}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching Fibonacci:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.retracements || !data.max_price || !data.min_price || !data.current_price) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Fibonacci Retracements</h3>
        </div>
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No Fibonacci data available</p>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    if (level.includes('0.0')) return "bg-green-600";
    if (level.includes('23.6')) return "bg-green-500";
    if (level.includes('38.2')) return "bg-yellow-500";
    if (level.includes('50.0')) return "bg-orange-500";
    if (level.includes('61.8')) return "bg-red-500";
    if (level.includes('78.6')) return "bg-red-600";
    if (level.includes('100')) return "bg-purple-600";
    return "bg-blue-500";
  };

  const isNearLevel = (price: number) => {
    const diff = Math.abs(price - data.current_price);
    const pct = (diff / data.current_price) * 100;
    return pct < 3; // Less than 3% distance
  };

  return (
    <div className="space-y-6">
      {/* Fibonacci Retracements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Fibonacci Retracements</h3>
        </div>

        <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">High</p>
              <p className="text-lg font-bold text-green-400">$ {data.max_price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Current</p>
              <p className="text-lg font-bold text-white">$ {data.current_price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Low</p>
              <p className="text-lg font-bold text-red-400">$ {data.min_price.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(data.retracements).map(([level, price], idx) => {
            const near = isNearLevel(price);
            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  near ? "bg-yellow-900/30 border-2 border-yellow-500" : "bg-gray-800/30"
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${getLevelColor(level)}`}></div>
                <div className="flex-1">
                  <span className="text-white font-semibold">{level}</span>
                  {near && (
                    <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                      NEAR
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-white">$ {price.toFixed(2)}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Fibonacci Extensions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Fibonacci Extensions</h3>
        </div>

        <div className="space-y-2">
          {Object.entries(data.extensions).map(([level, price], idx) => (
            <motion.div
              key={level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="flex items-center gap-3 p-3 bg-cyan-900/20 rounded-lg"
            >
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <div className="flex-1">
                <span className="text-white font-semibold">{level}</span>
              </div>
              <span className="text-lg font-bold text-cyan-400">$ {price.toFixed(2)}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
          <p className="text-xs text-gray-300">
            💡 <strong>Extensions</strong> indicate price targets in case of a breakout above the high.
          </p>
        </div>
      </motion.div>

      {/* Camarilla Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingDown className="w-6 h-6 text-pink-400" />
          <h3 className="text-xl font-bold text-white">Camarilla Points</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Resistances */}
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-3">🟢 Resistances</h4>
            <div className="space-y-2">
              {['R4', 'R3', 'R2', 'R1'].map((key, idx) => (
                <div key={key} className="flex justify-between p-2 bg-green-900/20 rounded">
                  <span className="text-white font-semibold">{key}</span>
                  <span className="text-green-400">$ {data.camarilla[key].toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supports */}
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-3">🔴 Supports</h4>
            <div className="space-y-2">
              {['S1', 'S2', 'S3', 'S4'].map((key, idx) => (
                <div key={key} className="flex justify-between p-2 bg-red-900/20 rounded">
                  <span className="text-white font-semibold">{key}</span>
                  <span className="text-red-400">$ {data.camarilla[key].toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pivot Point */}
        <div className="mt-4 p-4 bg-purple-900/20 border-2 border-purple-500 rounded-lg text-center">
          <p className="text-sm text-gray-300 mb-2">Pivot Point</p>
          <p className="text-2xl font-bold text-purple-400">$ {data.camarilla.PP.toFixed(2)}</p>
        </div>

        <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
          <p className="text-xs text-gray-300">
            💡 <strong>Camarilla</strong> are intraday levels for short-term operations.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
