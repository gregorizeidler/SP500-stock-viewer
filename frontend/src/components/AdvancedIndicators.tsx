"use client";

import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface IndicatorsData {
  ticker: string;
  current_price: number;
  vwap: number;
  obv: number;
  mfi: number;
  force_index: number;
  accumulation_distribution: number;
  roc: number;
  momentum: number;
  adx: number;
  history: any[];
}

interface Props {
  ticker: string;
}

export default function AdvancedIndicators({ ticker }: Props) {
  const [data, setData] = useState<IndicatorsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndicators();
  }, [ticker]);

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/sp500/analysis/advanced-indicators/${ticker}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching indicators:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-40 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const indicators = [
    { 
      name: "VWAP", 
      value: data.vwap, 
      description: "Volume Weighted Avg Price",
      format: "$",
      color: "text-blue-400"
    },
    { 
      name: "MFI", 
      value: data.mfi, 
      description: "Money Flow Index",
      format: "",
      color: data.mfi > 80 ? "text-red-400" : data.mfi < 20 ? "text-green-400" : "text-yellow-400"
    },
    { 
      name: "ROC", 
      value: data.roc, 
      description: "Rate of Change",
      format: "%",
      color: data.roc > 0 ? "text-green-400" : "text-red-400"
    },
    { 
      name: "ADX", 
      value: data.adx, 
      description: "Trend Strength",
      format: "",
      color: data.adx > 25 ? "text-green-400" : "text-yellow-400"
    },
    { 
      name: "Momentum", 
      value: data.momentum, 
      description: "Price Momentum",
      format: "$",
      color: data.momentum > 0 ? "text-green-400" : "text-red-400"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Indicator Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Advanced Indicators</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indicators.map((ind, idx) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800/50 rounded-lg p-4"
            >
              <p className="text-xs text-gray-400 mb-1">{ind.description}</p>
              <p className="text-2xl font-bold mb-1">
                <span className={ind.color}>
                  {ind.format === "$" && "$ "}
                  {ind.value?.toFixed(2)}
                  {ind.format === "%" && "%"}
                </span>
              </p>
              <p className="text-sm font-medium text-white">{ind.name}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* MFI Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">💹 MFI - Money Flow Index (30 days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#F3F4F6" }}
            />
            <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="3 3" label="Overbought" />
            <ReferenceLine y={20} stroke="#10B981" strokeDasharray="3 3" label="Oversold" />
            <Line
              type="monotone"
              dataKey="mfi"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              name="MFI"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ADX Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">💪 ADX - Trend Strength (30 days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#F3F4F6" }}
            />
            <ReferenceLine y={25} stroke="#F59E0B" strokeDasharray="3 3" label="Strong Trend" />
            <Line
              type="monotone"
              dataKey="adx"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              name="ADX"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
          <p className="text-xs text-gray-300">
            💡 <strong>ADX &gt; 25:</strong> Strong trend | <strong>ADX &lt; 25:</strong> Weak or sideways trend
          </p>
        </div>
      </motion.div>

      {/* OBV and A/D Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">📊 OBV</h3>
          <p className="text-3xl font-bold text-blue-400 mb-2">
            {(data.obv / 1e6).toFixed(1)}M
          </p>
          <p className="text-sm text-gray-400">On Balance Volume</p>
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-300">
              Accumulates volume on up days and subtracts on down days.
              Confirms price trends.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">🌊 A/D Line</h3>
          <p className="text-3xl font-bold text-purple-400 mb-2">
            {(data.accumulation_distribution / 1e6).toFixed(1)}M
          </p>
          <p className="text-sm text-gray-400">Accumulation/Distribution</p>
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-300">
              Measures money flow. Rising values indicate accumulation (buying).
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
