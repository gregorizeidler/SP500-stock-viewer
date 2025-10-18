"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface StockRanking {
  ticker: string;
  name: string;
  current_price: number;
  day_change: number;
  volume: number;
  market_cap?: number;
}

interface Props {
  stocks: StockRanking[];
  type: "change" | "volume";
}

export default function StockRanking({ stocks, type }: Props) {
  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
    return volume.toString();
  };

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return "N/A";
    if (marketCap >= 1000000000) return `$ ${(marketCap / 1000000000).toFixed(2)}B`;
    if (marketCap >= 1000000) return `$ ${(marketCap / 1000000).toFixed(2)}M`;
    return `$ ${marketCap.toFixed(0)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">
            {type === "change" ? "Top Gainers & Losers" : "Highest Volume"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {type === "change" 
              ? "Stocks with biggest daily change" 
              : "Most traded stocks today"
            }
          </p>
        </div>
        <Activity className="w-8 h-8 text-blue-400" />
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
        {type === "change" && stocks.length > 0 && stocks[0].day_change >= 0 && (
          <div className="flex items-center gap-3 pb-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
            <span className="text-sm font-semibold text-green-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              TOP GAINERS
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
          </div>
        )}

        {stocks.map((stock, index) => {
          // Detect change from gainers to losers (when change turns negative)
          const showSeparator = type === "change" && index > 0 && 
            stocks[index - 1].day_change >= 0 && stock.day_change < 0;

          return (
            <div key={stock.ticker}>
              {showSeparator && (
                <div className="flex items-center gap-3 py-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                  <span className="text-sm font-semibold text-red-400 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    TOP LOSERS
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                </div>
              )}
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {stock.ticker.replace('.SA', '')}
                        </span>
                        {type === "change" && (
                          stock.day_change >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">
                        {stock.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          $ {stock.current_price.toFixed(2)}
                        </p>
                        {type === "change" && (
                          <p className={`text-xs font-medium ${
                            stock.day_change >= 0 ? "text-green-400" : "text-red-400"
                          }`}>
                            {stock.day_change >= 0 ? "+" : ""}
                            {stock.day_change.toFixed(2)}%
                          </p>
                        )}
                      </div>

                      {type === "volume" && (
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Volume</p>
                          <p className="text-sm font-semibold text-blue-400">
                            {formatVolume(stock.volume)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {stock.market_cap && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      Market Cap: <span className="text-gray-400">{formatMarketCap(stock.market_cap)}</span>
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
