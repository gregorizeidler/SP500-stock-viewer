"use client";

import { motion } from "framer-motion";
import { BarChart2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  ticker: string;
}

export default function AlternativeCharts({ ticker }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"renko" | "kagi" | "point_figure" | "range">("renko");

  useEffect(() => {
    fetchData();
  }, [ticker]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/sp500/stock/${ticker}?period=3mo`);
      const json = await res.json();
      setData(json.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Renko Algorithm
  const calculateRenko = (data: any[], brickSize: number = 2) => {
    if (data.length === 0) return [];
    
    const renkoBricks = [];
    let currentPrice = data[0].close;
    let direction = 0; // 1 = up, -1 = down

    data.forEach((candle, idx) => {
      const price = candle.close;
      const diff = price - currentPrice;

      if (Math.abs(diff) >= brickSize) {
        const numBricks = Math.floor(Math.abs(diff) / brickSize);
        const newDirection = diff > 0 ? 1 : -1;

        for (let i = 0; i < numBricks; i++) {
          currentPrice += brickSize * newDirection;
          renkoBricks.push({
            index: idx,
            price: currentPrice,
            direction: newDirection,
            low: currentPrice - (newDirection > 0 ? 0 : brickSize),
            high: currentPrice + (newDirection > 0 ? brickSize : 0)
          });
        }
        direction = newDirection;
      }
    });

    return renkoBricks.slice(-30); // Last 30 bricks
  };

  // Kagi Algorithm (Simplified)
  const calculateKagi = (data: any[], reversalAmount: number = 3) => {
    if (data.length === 0) return [];
    
    const kagiLines = [];
    let currentTrend = "up";
    let lastHigh = data[0].close;
    let lastLow = data[0].close;

    data.forEach((candle, idx) => {
      const price = candle.close;

      if (currentTrend === "up") {
        if (price > lastHigh) {
          lastHigh = price;
          kagiLines.push({ index: idx, price, trend: "up" });
        } else if (price < lastHigh - reversalAmount) {
          currentTrend = "down";
          lastLow = price;
          kagiLines.push({ index: idx, price, trend: "down" });
        }
      } else {
        if (price < lastLow) {
          lastLow = price;
          kagiLines.push({ index: idx, price, trend: "down" });
        } else if (price > lastLow + reversalAmount) {
          currentTrend = "up";
          lastHigh = price;
          kagiLines.push({ index: idx, price, trend: "up" });
        }
      }
    });

    return kagiLines.slice(-40);
  };

  // Point & Figure (Simplified)
  const calculatePointFigure = (data: any[], boxSize: number = 1, reversalSize: number = 3) => {
    if (data.length === 0) return [];
    
    const points = [];
    let column = 0;
    let direction = 0; // 1 = X (up), -1 = O (down)
    let currentPrice = Math.round(data[0].close);

    data.forEach((candle, idx) => {
      const price = Math.round(candle.close);
      
      if (direction === 0) {
        direction = price > currentPrice ? 1 : -1;
        column++;
      }

      if (direction === 1 && price >= currentPrice + boxSize) {
        while (price >= currentPrice + boxSize) {
          currentPrice += boxSize;
          points.push({ column, price: currentPrice, type: "X" });
        }
      } else if (direction === -1 && price <= currentPrice - boxSize) {
        while (price <= currentPrice - boxSize) {
          currentPrice -= boxSize;
          points.push({ column, price: currentPrice, type: "O" });
        }
      } else if ((direction === 1 && price <= currentPrice - (boxSize * reversalSize)) ||
                 (direction === -1 && price >= currentPrice + (boxSize * reversalSize))) {
        direction = -direction;
        column++;
        currentPrice = price;
      }
    });

    return points.slice(-50);
  };

  // Range Bars
  const calculateRangeBars = (data: any[], rangeSize: number = 2) => {
    if (data.length === 0) return [];
    
    const rangeBars = [];
    let tempBar: any = null;

    data.forEach((candle, idx) => {
      if (!tempBar) {
        tempBar = {
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          index: idx
        };
      }

      tempBar.high = Math.max(tempBar.high, candle.high);
      tempBar.low = Math.min(tempBar.low, candle.low);
      tempBar.close = candle.close;

      if (tempBar.high - tempBar.low >= rangeSize) {
        rangeBars.push({ ...tempBar });
        tempBar = null;
      }
    });

    return rangeBars.slice(-30);
  };

  const renkoBricks = calculateRenko(data, 2);
  const kagiLines = calculateKagi(data, 3);
  const pointFigure = calculatePointFigure(data, 1, 3);
  const rangeBars = calculateRangeBars(data, 2);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Alternative Charts</h3>
        </div>
      </div>

      {/* Chart Type Toggle */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <button
          onClick={() => setChartType("renko")}
          className={`py-2 px-4 rounded-lg font-semibold transition-all ${
            chartType === "renko"
              ? "bg-cyan-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          🧱 Renko
        </button>
        <button
          onClick={() => setChartType("kagi")}
          className={`py-2 px-4 rounded-lg font-semibold transition-all ${
            chartType === "kagi"
              ? "bg-cyan-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          📈 Kagi
        </button>
        <button
          onClick={() => setChartType("point_figure")}
          className={`py-2 px-4 rounded-lg font-semibold transition-all ${
            chartType === "point_figure"
              ? "bg-cyan-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          ⭕ P&F
        </button>
        <button
          onClick={() => setChartType("range")}
          className={`py-2 px-4 rounded-lg font-semibold transition-all ${
            chartType === "range"
              ? "bg-cyan-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          📊 Range Bars
        </button>
      </div>

      {/* Renko Chart */}
      {chartType === "renko" && (
        <div>
          <h4 className="text-lg font-bold text-white mb-4">🧱 Renko Chart</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={renkoBricks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="price" name="Price">
                {renkoBricks.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.direction > 0 ? "#10B981" : "#EF4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-300">
              💡 <strong>Renko</strong> filters noise, showing only significant price movements.
            </p>
          </div>
        </div>
      )}

      {/* Kagi Chart */}
      {chartType === "kagi" && (
        <div>
          <h4 className="text-lg font-bold text-white mb-4">📈 Kagi Chart</h4>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={kagiLines}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Line type="stepAfter" dataKey="price" stroke="#06B6D4" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-300">
              💡 <strong>Kagi</strong> ignores time, focusing only on significant reversals.
            </p>
          </div>
        </div>
      )}

      {/* Point & Figure */}
      {chartType === "point_figure" && (
        <div>
          <h4 className="text-lg font-bold text-white mb-4">⭕ Point & Figure</h4>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" dataKey="column" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis type="number" dataKey="price" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Scatter data={pointFigure} shape="circle">
                {pointFigure.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.type === "X" ? "#10B981" : "#EF4444"} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-300">
              💡 <strong>Point & Figure</strong> uses X (up) and O (down) to represent movements.
            </p>
          </div>
        </div>
      )}

      {/* Range Bars */}
      {chartType === "range" && (
        <div>
          <h4 className="text-lg font-bold text-white mb-4">📊 Range Bars</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={rangeBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="close" name="Close">
                {rangeBars.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.close > entry.open ? "#10B981" : "#EF4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-300">
              💡 <strong>Range Bars</strong> creates bars based on price range, not time.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
