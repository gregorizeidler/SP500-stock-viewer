"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";

interface IndicatorData {
  date: string;
  rsi?: number;
  macd?: number;
  macd_signal?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  close?: number;
}

interface Props {
  data: IndicatorData[];
  type: "rsi" | "macd" | "bollinger";
  ticker?: string;
}

export default function IndicatorsChart({ data, type, ticker }: Props) {
  const renderRSIChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
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
        <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" label="Overbought" />
        <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" label="Oversold" />
        <Line
          type="monotone"
          dataKey="rsi"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          name="RSI"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderMACDChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
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
        <ReferenceLine y={0} stroke="#6B7280" />
        <Line
          type="monotone"
          dataKey="macd"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          name="MACD"
        />
        <Line
          type="monotone"
          dataKey="macd_signal"
          stroke="#F59E0B"
          strokeWidth={2}
          dot={false}
          name="Signal"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBollingerChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
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
        <Area
          type="monotone"
          dataKey="bb_upper"
          stroke="#EF4444"
          fill="#EF444420"
          strokeWidth={1}
          name="Upper Band"
        />
        <Line
          type="monotone"
          dataKey="bb_middle"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          name="Middle"
        />
        <Area
          type="monotone"
          dataKey="bb_lower"
          stroke="#10B981"
          fill="#10B98120"
          strokeWidth={1}
          name="Lower Band"
        />
        <Line
          type="monotone"
          dataKey="close"
          stroke="#F59E0B"
          strokeWidth={2}
          dot={false}
          name="Price"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const getTitle = () => {
    switch (type) {
      case "rsi":
        return "RSI - Relative Strength Index";
      case "macd":
        return "MACD - Moving Average Convergence Divergence";
      case "bollinger":
        return "Bollinger Bands";
      default:
        return "Technical Indicator";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "rsi":
        return "Measures the speed and magnitude of price changes. Above 70 indicates overbought, below 30 indicates oversold.";
      case "macd":
        return "Shows the relationship between two moving averages. Crossovers indicate possible trend changes.";
      case "bollinger":
        return "Bands that expand and contract with volatility. Price at bands may indicate reversal.";
      default:
        return "";
    }
  };

  const calculateCurrentSignal = () => {
    if (data.length === 0) return { text: "No data", color: "text-gray-400" };

    const last = data[data.length - 1];

    switch (type) {
      case "rsi":
        if (!last.rsi) return { text: "N/A", color: "text-gray-400" };
        if (last.rsi > 70) return { text: "Overbought", color: "text-red-400" };
        if (last.rsi < 30) return { text: "Oversold", color: "text-green-400" };
        return { text: "Neutral", color: "text-blue-400" };
      
      case "macd":
        if (!last.macd || !last.macd_signal) return { text: "N/A", color: "text-gray-400" };
        if (last.macd > last.macd_signal) return { text: "Bullish", color: "text-green-400" };
        return { text: "Bearish", color: "text-red-400" };
      
      case "bollinger":
        if (!last.close || !last.bb_upper || !last.bb_lower) 
          return { text: "N/A", color: "text-gray-400" };
        if (last.close >= last.bb_upper) return { text: "Near upper band", color: "text-red-400" };
        if (last.close <= last.bb_lower) return { text: "Near lower band", color: "text-green-400" };
        return { text: "Within bands", color: "text-blue-400" };
      
      default:
        return { text: "N/A", color: "text-gray-400" };
    }
  };

  const signal = calculateCurrentSignal();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{getTitle()}</h3>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${signal.color} bg-gray-800`}>
            {signal.text}
          </span>
        </div>
        {ticker && (
          <p className="text-sm text-gray-400 mt-1">{ticker}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">{getDescription()}</p>
      </div>

      <div className="mt-4">
        {type === "rsi" && renderRSIChart()}
        {type === "macd" && renderMACDChart()}
        {type === "bollinger" && renderBollingerChart()}
      </div>
    </motion.div>
  );
}
