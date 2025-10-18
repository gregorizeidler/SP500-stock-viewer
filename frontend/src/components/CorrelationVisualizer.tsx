"use client";

import { motion } from "framer-motion";
import { Network, GitBranch } from "lucide-react";
import { useState } from "react";

interface CorrelationData {
  correlations: { [key: string]: { [key: string]: number } };
  pairs: Array<{
    source: string;
    target: string;
    correlation: number;
    strength: number;
  }>;
  tickers: string[];
}

export default function CorrelationVisualizer() {
  const [tickers, setTickers] = useState("AAPL,MSFT,GOOGL,META,TSLA,NVDA");
  const [data, setData] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"heatmap" | "network">("heatmap");

  const fetchCorrelations = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/sp500/correlations?tickers=${encodeURIComponent(tickers)}&period=6mo`
      );
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching correlations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCorrelationColor = (value: number) => {
    if (value > 0.7) return "bg-green-600";
    if (value > 0.4) return "bg-green-500";
    if (value > 0.1) return "bg-yellow-500";
    if (value > -0.1) return "bg-gray-500";
    if (value > -0.4) return "bg-red-500";
    return "bg-red-600";
  };

  const getCorrelationText = (value: number) => {
    if (value > 0.7) return "Strong Positive";
    if (value > 0.4) return "Moderate Positive";
    if (value > 0.1) return "Weak Positive";
    if (value > -0.1) return "Neutral";
    if (value > -0.4) return "Weak Negative";
    if (value > -0.7) return "Moderate Negative";
    return "Strong Negative";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Network className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Interactive Correlation Visual</h3>
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="e.g. AAPL,MSFT,GOOGL,META"
          value={tickers}
          onChange={(e) => setTickers(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={fetchCorrelations}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </div>

      {/* Toggle View Mode */}
      {data && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode("heatmap")}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              viewMode === "heatmap"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            🔥 Heatmap
          </button>
          <button
            onClick={() => setViewMode("network")}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              viewMode === "network"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            🕸️ Network
          </button>
        </div>
      )}

      {/* Heatmap */}
      {data && viewMode === "heatmap" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2"></th>
                {data.tickers.map((ticker) => (
                  <th key={ticker} className="p-2 text-white font-bold text-sm">
                    {ticker}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.tickers.map((ticker1, i) => {
                return (
                  <tr key={ticker1}>
                    <td className="p-2 text-white font-bold text-sm">{ticker1}</td>
                    {data.tickers.map((ticker2, j) => {
                      const corr = data.correlations[ticker1]?.[ticker2] ?? 0;
                      return (
                        <motion.td
                          key={`${ticker1}-${ticker2}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (i + j) * 0.02 }}
                          className="p-2"
                        >
                          <div
                            className={`${getCorrelationColor(
                              corr
                            )} rounded text-white text-center p-3 font-bold text-sm cursor-pointer hover:scale-110 transition-transform`}
                            title={getCorrelationText(corr)}
                          >
                            {corr.toFixed(2)}
                          </div>
                        </motion.td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm font-semibold text-gray-400 mb-3">Legend:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-gray-300">Strong Positive (&gt;0.7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Moderate (0.1-0.7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-gray-300">Neutral (-0.1 to 0.1)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-gray-300">Negative (&lt;-0.1)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network Graph (Simplified) */}
      {data && viewMode === "network" && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {data.tickers.map((ticker, idx) => (
              <motion.div
                key={ticker}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500 rounded-lg text-center"
              >
                <p className="text-2xl font-bold text-white">{ticker}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-white mb-4">🔗 Strong Connections</h4>
            {data.pairs
              .filter((p) => Math.abs(p.correlation) > 0.5)
              .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
              .map((pair, idx) => (
                <motion.div
                  key={`${pair.source}-${pair.target}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    pair.correlation > 0 ? "bg-green-900/20" : "bg-red-900/20"
                  }`}
                >
                  <GitBranch
                    className={`w-6 h-6 ${
                      pair.correlation > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      {pair.source} ↔️ {pair.target}
                    </p>
                    <p className="text-xs text-gray-400">{getCorrelationText(pair.correlation)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        pair.correlation > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {pair.correlation.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      If {pair.source} rises, {pair.target} {pair.correlation > 0 ? "rises" : "falls"}{" "}
                      {(Math.abs(pair.correlation) * 100).toFixed(0)}% of the time
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="text-center py-12">
          <Network className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Enter tickers and click "Calculate"</p>
        </div>
      )}
    </motion.div>
  );
}
