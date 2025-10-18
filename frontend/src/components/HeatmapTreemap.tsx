"use client";

import { motion } from "framer-motion";
import { Grid3x3, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

interface StockTreemap {
  ticker: string;
  name: string;
  market_cap: number;
  change: number;
  price: number;
}

interface SectorData {
  [sector: string]: StockTreemap[];
}

export default function HeatmapTreemap() {
  const [sectorsData, setSectorsData] = useState<SectorData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTreemapData();
  }, []);

  const fetchTreemapData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/sp500/heatmap/market-cap");
      const data = await res.json();
      setSectorsData(data.sectors || {});
    } catch (error) {
      console.error("Error fetching treemap:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 3) return "bg-green-600";
    if (change > 1) return "bg-green-500";
    if (change > 0) return "bg-green-400";
    if (change > -1) return "bg-red-400";
    if (change > -3) return "bg-red-500";
    return "bg-red-600";
  };

  const getSize = (marketCap: number, totalSectorCap: number) => {
    const percent = (marketCap / totalSectorCap) * 100;
    if (percent > 30) return "col-span-2 row-span-2";
    if (percent > 15) return "col-span-2 row-span-1";
    return "col-span-1 row-span-1";
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-96 bg-gray-700 rounded"></div>
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
        <Grid3x3 className="w-6 h-6 text-pink-400" />
        <h3 className="text-xl font-bold text-white">Market Cap Treemap by Sector</h3>
      </div>

      <div className="space-y-6">
        {Object.entries(sectorsData).map(([sector, stocks]) => {
          const totalSectorCap = stocks.reduce((sum, s) => sum + s.market_cap, 0);
          
          return (
            <motion.div
              key={sector}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-2 border-gray-700 rounded-xl p-4"
            >
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-pink-400">📊</span> {sector}
                <span className="text-sm text-gray-400 font-normal ml-2">
                  ({stocks.length} stocks)
                </span>
              </h4>

              <div className="grid grid-cols-4 gap-2">
                {stocks
                  .sort((a, b) => b.market_cap - a.market_cap)
                  .slice(0, 12)
                  .map((stock) => (
                    <motion.div
                      key={stock.ticker}
                      whileHover={{ scale: 1.05, zIndex: 10 }}
                      className={`${getSize(
                        stock.market_cap,
                        totalSectorCap
                      )} ${getChangeColor(
                        stock.change
                      )} rounded-lg p-3 cursor-pointer shadow-lg transition-all relative group`}
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <p className="text-white font-bold text-sm">{stock.ticker}</p>
                          <p className="text-white/80 text-xs truncate">{stock.name}</p>
                        </div>
                        <div className="mt-2">
                          <p className="text-white font-bold text-lg">
                            {stock.change > 0 ? "+" : ""}
                            {stock.change.toFixed(2)}%
                          </p>
                          <p className="text-white/80 text-xs">
                            $ {stock.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Tooltip on hover */}
                      <div className="absolute invisible group-hover:visible bg-gray-900 border-2 border-gray-700 rounded-lg p-3 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap z-20 shadow-2xl">
                        <p className="text-white font-bold mb-1">{stock.ticker}</p>
                        <p className="text-xs text-gray-400 mb-2">{stock.name}</p>
                        <p className="text-xs text-gray-300">
                          Market Cap: $ {(stock.market_cap / 1e9).toFixed(2)}B
                        </p>
                        <p className="text-xs text-gray-300">
                          Change: {stock.change.toFixed(2)}%
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center gap-6 justify-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-400">Strong Up (&gt;3%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-gray-400">Up (0-3%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-gray-400">Down (0-3%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-gray-400">Strong Down (&gt;3%)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
