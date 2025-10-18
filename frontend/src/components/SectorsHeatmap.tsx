"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SectorData {
  sector: string;
  change: number;
}

interface Props {
  sectors: SectorData[];
}

export default function SectorsHeatmap({ sectors }: Props) {
  const getChangeColor = (change: number) => {
    if (change >= 3) return "bg-green-600";
    if (change >= 1) return "bg-green-500";
    if (change >= 0) return "bg-green-400";
    if (change >= -1) return "bg-red-400";
    if (change >= -3) return "bg-red-500";
    return "bg-red-600";
  };

  const getOpacity = (change: number) => {
    const abs = Math.abs(change);
    if (abs >= 5) return "opacity-100";
    if (abs >= 3) return "opacity-90";
    if (abs >= 2) return "opacity-80";
    if (abs >= 1) return "opacity-70";
    return "opacity-60";
  };

  const getSize = (index: number, total: number) => {
    // Distribute sizes in a balanced way
    if (total <= 6) return "col-span-2 row-span-2";
    if (index < 3) return "col-span-2 row-span-2";
    if (index < 8) return "col-span-1 row-span-1";
    return "col-span-1 row-span-1";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">Performance by Sector</h3>
        <p className="text-sm text-gray-400 mt-1">
          Heatmap of S&P 500 sector changes
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 auto-rows-fr">
        {sectors.map((sector, index) => (
          <motion.div
            key={sector.sector}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`
              ${getSize(index, sectors.length)}
              ${getChangeColor(sector.change)}
              ${getOpacity(sector.change)}
              rounded-lg p-4 flex flex-col justify-between
              hover:scale-105 transition-transform cursor-pointer
              shadow-lg
            `}
          >
            <div>
              <p className="text-white font-semibold text-sm mb-1 leading-tight">
                {sector.sector}
              </p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white font-bold text-lg">
                {sector.change >= 0 ? "+" : ""}
                {sector.change?.toFixed(2) || '0.00'}%
              </span>
              {sector.change >= 0 ? (
                <TrendingUp className="w-5 h-5 text-white" />
              ) : (
                <TrendingDown className="w-5 h-5 text-white" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 bg-green-600 rounded"></div>
          <span className="text-gray-400">Strong Up</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 bg-green-400 rounded"></div>
          <span className="text-gray-400">Up</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 bg-gray-500 rounded"></div>
          <span className="text-gray-400">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 bg-red-400 rounded"></div>
          <span className="text-gray-400">Down</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 bg-red-600 rounded"></div>
          <span className="text-gray-400">Strong Down</span>
        </div>
      </div>
    </motion.div>
  );
}

