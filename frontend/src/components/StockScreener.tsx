"use client";

import { motion } from "framer-motion";
import { Search, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface ScreenerResult {
  ticker: string;
  name: string;
  price: number;
  pe: number;
  rsi: number;
  score: number;
  recommendation: string;
  volume: number;
}

export default function StockScreener() {
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    pe_max: "",
    rsi_max: "",
    rsi_min: "",
    score_min: "",
    volume_min: "",
  });

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.pe_max) params.append("pe_max", filters.pe_max);
      if (filters.rsi_max) params.append("rsi_max", filters.rsi_max);
      if (filters.rsi_min) params.append("rsi_min", filters.rsi_min);
      if (filters.score_min) params.append("score_min", filters.score_min);
      if (filters.volume_min) params.append("volume_min", filters.volume_min);

      const res = await fetch(`http://localhost:8000/api/sp500/screener?${params}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Error filtering stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      pe_max: "",
      rsi_max: "",
      rsi_min: "",
      score_min: "",
      volume_min: "",
    });
    setResults([]);
  };

  const getRecommendationColor = (rec: string) => {
    if (rec.includes("Strong Buy")) return "bg-green-600";
    if (rec.includes("Buy")) return "bg-green-500";
    if (rec.includes("Neutral")) return "bg-yellow-500";
    if (rec.includes("Sell")) return "bg-red-500";
    return "bg-gray-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">S&P 500 Stock Screener</h3>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-xs text-gray-400 mb-2">Max P/E</label>
          <input
            type="number"
            placeholder="e.g. 15"
            value={filters.pe_max}
            onChange={(e) => setFilters({ ...filters, pe_max: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">Min RSI</label>
          <input
            type="number"
            placeholder="e.g. 30"
            value={filters.rsi_min}
            onChange={(e) => setFilters({ ...filters, rsi_min: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">Max RSI</label>
          <input
            type="number"
            placeholder="e.g. 70"
            value={filters.rsi_max}
            onChange={(e) => setFilters({ ...filters, rsi_max: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">Min Score</label>
          <input
            type="number"
            placeholder="e.g. 60"
            value={filters.score_min}
            onChange={(e) => setFilters({ ...filters, score_min: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">Min Volume</label>
          <input
            type="number"
            placeholder="e.g. 1000000"
            value={filters.volume_min}
            onChange={(e) => setFilters({ ...filters, volume_min: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={applyFilters}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Filter className="w-5 h-5 inline-block mr-2" />
          {loading ? "Filtering..." : "Apply Filters"}
        </button>
        <button
          onClick={clearFilters}
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          Clear
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              {results.length} stocks found
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-xs text-gray-400 font-semibold p-3">Ticker</th>
                  <th className="text-left text-xs text-gray-400 font-semibold p-3">Name</th>
                  <th className="text-right text-xs text-gray-400 font-semibold p-3">Price</th>
                  <th className="text-right text-xs text-gray-400 font-semibold p-3">P/E</th>
                  <th className="text-right text-xs text-gray-400 font-semibold p-3">RSI</th>
                  <th className="text-right text-xs text-gray-400 font-semibold p-3">Score</th>
                  <th className="text-left text-xs text-gray-400 font-semibold p-3">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <motion.tr
                    key={result.ticker}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-3">
                      <span className="font-bold text-white">{result.ticker}</span>
                    </td>
                    <td className="p-3 text-sm text-gray-400">{result.name}</td>
                    <td className="p-3 text-right font-semibold text-white">
                      $ {result.price.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-gray-300">{result.pe.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <span
                        className={`${
                          result.rsi > 70
                            ? "text-red-400"
                            : result.rsi < 30
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {result.rsi?.toFixed(1) || "-"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-cyan-400">{result.score.toFixed(0)}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`${getRecommendationColor(
                          result.recommendation
                        )} text-white text-xs font-semibold px-2 py-1 rounded`}
                      >
                        {result.recommendation}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Configure filters and click "Apply Filters"</p>
        </div>
      )}
    </motion.div>
  );
}
