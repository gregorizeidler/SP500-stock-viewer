"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface IndexData {
  date: string;
  close: number;
  volume: number;
}

interface Props {
  data: IndexData[];
  change: number;
}

export default function SP500Chart({ data, change }: Props) {
  const currentValue = data[data.length - 1]?.close || 0;
  const previousValue = data[data.length - 2]?.close || currentValue;
  const dayChange = ((currentValue - previousValue) / previousValue) * 100;

  const high = Math.max(...data.map(d => d.close));
  const low = Math.min(...data.map(d => d.close));
  const average = data.reduce((acc, d) => acc + d.close, 0) / data.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">S&P 500</h3>
          <p className="text-sm text-gray-400 mt-1">
            Standard & Poor's 500 Index
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">
            {currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-end gap-2 mt-1">
            <span className={`text-sm font-medium ${
              dayChange >= 0 ? "text-green-400" : "text-red-400"
            }`}>
              {dayChange >= 0 ? "+" : ""}
              {dayChange.toFixed(2)}%
            </span>
            {dayChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
          <YAxis
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#F3F4F6" }}
            formatter={(value: any) => [
              value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              "S&P 500"
            ]}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#3B82F6"
            strokeWidth={3}
            fill="url(#colorIndex)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div>
          <p className="text-xs text-gray-400 mb-1">Period Change</p>
          <p className={`text-lg font-bold ${
            change >= 0 ? "text-green-400" : "text-red-400"
          }`}>
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">High</p>
          <p className="text-lg font-bold text-white">
            {high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Low</p>
          <p className="text-lg font-bold text-white">
            {low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Average</p>
          <p className="text-lg font-bold text-white">
            {average.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
