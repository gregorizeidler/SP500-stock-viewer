"use client";

import { motion } from "framer-motion";
import { GitCompare, TrendingUp } from "lucide-react";
import { useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from "recharts";

interface ComparisonItem {
  ticker: string;
  total_return: number;
  volatility: number;
  sharpe: number;
  beta: number;
  max_drawdown: number;
  rsi: number;
  score: number;
}

export default function StockComparator() {
  const [tickers, setTickers] = useState("");
  const [comparison, setComparison] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(false);

  const compareStocks = async () => {
    if (!tickers.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/sp500/analysis/comparator?tickers=${encodeURIComponent(
          tickers
        )}&period=1y`,
        { method: "POST" }
      );
      const data = await res.json();
      setComparison(data.comparison || []);
    } catch (error) {
      console.error("Error comparing stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const scatterData = comparison.map((item) => ({
    x: item.volatility * 100,
    y: item.total_return * 100,
    z: item.sharpe * 10,
    ticker: item.ticker,
    sharpe: item.sharpe,
  }));

  const getColor = (sharpe: number) => {
    if (sharpe > 1) return "#10B981";
    if (sharpe > 0.5) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <GitCompare className="w-6 h-6 text-orange-400" />
        <h3 className="text-xl font-bold text-white">Advanced Stock Comparator</h3>
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="e.g. AAPL,MSFT,GOOGL,META"
          value={tickers}
          onChange={(e) => setTickers(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={compareStocks}
          disabled={loading || !tickers.trim()}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>
      </div>

      {comparison.length > 0 && (
        <div className="space-y-6">
          {/* Scatter Plot: Return vs Risk */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 rounded-lg p-6"
          >
            <h4 className="text-lg font-bold text-white mb-4">📊 Return vs Risk (Volatility)</h4>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Volatility"
                  unit="%"
                  stroke="#9CA3AF"
                  label={{ value: "Volatility (%)", position: "insideBottom", offset: -10, fill: "#9CA3AF" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Return"
                  unit="%"
                  stroke="#9CA3AF"
                  label={{ value: "Return (%)", angle: -90, position: "insideLeft", fill: "#9CA3AF" }}
                />
                <ZAxis type="number" dataKey="z" range={[100, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                          <p className="font-bold text-white mb-1">{data.ticker}</p>
                          <p className="text-sm text-gray-300">Return: {(data.y || 0).toFixed(2)}%</p>
                          <p className="text-sm text-gray-300">Volatility: {(data.x || 0).toFixed(2)}%</p>
                          <p className="text-sm text-gray-300">Sharpe: {(data.sharpe || 0).toFixed(2)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.sharpe)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center gap-6 justify-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">Sharpe &gt; 1 (Excellent)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-400">Sharpe 0.5-1 (Good)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-gray-400">Sharpe &lt; 0.5 (Poor)</span>
              </div>
            </div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="text-left text-sm text-gray-400 font-semibold p-3">Ticker</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Return</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Volatility</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Sharpe</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Beta</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Max DD</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">RSI</th>
                  <th className="text-right text-sm text-gray-400 font-semibold p-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, idx) => (
                  <motion.tr
                    key={item.ticker}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-3">
                      <span className="font-bold text-white">{item.ticker}</span>
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`font-semibold ${
                          (item.total_return || 0) > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {(item.total_return || 0) > 0 ? "+" : ""}
                        {((item.total_return || 0) * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-3 text-right text-yellow-400 font-semibold">
                      {((item.volatility || 0) * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`font-semibold ${
                          (item.sharpe || 0) > 1
                            ? "text-green-400"
                            : (item.sharpe || 0) > 0.5
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {(item.sharpe || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3 text-right text-blue-400 font-semibold">
                      {(item.beta || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-red-400 font-semibold">
                      {((item.max_drawdown || 0) * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right text-purple-400 font-semibold">
                      {(item.rsi || 0).toFixed(1)}
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-cyan-400">{(item.score || 0).toFixed(0)}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Best/Worst Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-green-900/20 border-2 border-green-600 rounded-lg p-4"
            >
              <p className="text-xs text-gray-400 mb-1">🏆 Best Sharpe Ratio</p>
              <p className="text-2xl font-bold text-white">
                {comparison.reduce((prev, curr) => ((prev.sharpe || 0) > (curr.sharpe || 0) ? prev : curr)).ticker}
              </p>
              <p className="text-sm text-green-400">
                {((comparison.reduce((prev, curr) => ((prev.sharpe || 0) > (curr.sharpe || 0) ? prev : curr)).sharpe) || 0).toFixed(2)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-900/20 border-2 border-blue-600 rounded-lg p-4"
            >
              <p className="text-xs text-gray-400 mb-1">📈 Highest Return</p>
              <p className="text-2xl font-bold text-white">
                {comparison.reduce((prev, curr) => ((prev.total_return || 0) > (curr.total_return || 0) ? prev : curr)).ticker}
              </p>
              <p className="text-sm text-blue-400">
                +{(((comparison.reduce((prev, curr) => ((prev.total_return || 0) > (curr.total_return || 0) ? prev : curr)).total_return) || 0) * 100).toFixed(2)}%
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-purple-900/20 border-2 border-purple-600 rounded-lg p-4"
            >
              <p className="text-xs text-gray-400 mb-1">🎯 Best Score</p>
              <p className="text-2xl font-bold text-white">
                {comparison.reduce((prev, curr) => ((prev.score || 0) > (curr.score || 0) ? prev : curr)).ticker}
              </p>
              <p className="text-sm text-purple-400">
                {((comparison.reduce((prev, curr) => ((prev.score || 0) > (curr.score || 0) ? prev : curr)).score) || 0).toFixed(0)} points
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {comparison.length === 0 && !loading && (
        <div className="text-center py-12">
          <GitCompare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Enter tickers separated by comma and click "Compare"</p>
        </div>
      )}
    </motion.div>
  );
}
