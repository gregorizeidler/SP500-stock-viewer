"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ComparisonData {
  [ticker: string]: {
    data: Array<{
      date: string;
      normalized_value: number;
    }>;
    period_change: number;
  };
}

interface Props {
  data: ComparisonData;
  tickers: string[];
}

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
];

export default function ComparisonChart({ data, tickers }: Props) {
  const [visibleTickers, setVisibleTickers] = useState<Set<string>>(
    new Set(tickers)
  );

  // Convert data to chart format
  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];

    // Get all unique dates
    const allDates = new Set<string>();
    Object.values(data).forEach((info) => {
      if (info && info.data) {
        info.data.forEach((d) => allDates.add(d.date));
      }
    });

    const sortedDates = Array.from(allDates).sort();

    // Create combined object
    return sortedDates.map((date) => {
      const point: any = { date };
      Object.entries(data).forEach(([ticker, info]) => {
        if (info && info.data) {
          const dayData = info.data.find((d) => d.date === date);
          point[ticker] = dayData?.normalized_value || null;
        }
      });
      return point;
    });
  }, [data]);

  const toggleTicker = (ticker: string) => {
    const newSet = new Set(visibleTickers);
    if (newSet.has(ticker)) {
      newSet.delete(ticker);
    } else {
      newSet.add(ticker);
    }
    setVisibleTickers(newSet);
  };

  const getChange = (ticker: string) => {
    return data[ticker]?.period_change || 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">Performance Comparison</h3>
        <p className="text-sm text-gray-400 mt-1">
          Normalized relative performance (Base 100)
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {tickers.map((ticker, index) => {
          const visible = visibleTickers.has(ticker);
          const change = getChange(ticker);
          const color = COLORS[index % COLORS.length];

          return (
            <motion.button
              key={ticker}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleTicker(ticker)}
              className={`
                px-4 py-2 rounded-lg transition-all
                ${visible 
                  ? "bg-gray-700 border-2" 
                  : "bg-gray-800/50 border-2 border-transparent opacity-50"
                }
              `}
              style={{ borderColor: visible ? color : "transparent" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-semibold text-white text-sm">
                  {ticker.replace('.SA', '')}
                </span>
                <span
                  className={`text-xs font-medium ml-2 ${
                    change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)}%
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            label={{ value: "Base 100", angle: -90, position: "insideLeft", fill: "#9CA3AF" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#F3F4F6" }}
          />
          <Legend />
          {tickers.map((ticker, index) => (
            visibleTickers.has(ticker) && (
              <Line
                key={ticker}
                type="monotone"
                dataKey={ticker}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
                name={ticker.replace('.SA', '')}
                connectNulls
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {tickers.map((ticker, index) => {
          const change = getChange(ticker);
          const color = COLORS[index % COLORS.length];

          return (
            <div key={ticker} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-semibold text-white">
                  {ticker.replace('.SA', '')}
                </span>
              </div>
              <p className={`text-lg font-bold ${
                change >= 0 ? "text-green-400" : "text-red-400"
              }`}>
                {change >= 0 ? "+" : ""}
                {change.toFixed(2)}%
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
