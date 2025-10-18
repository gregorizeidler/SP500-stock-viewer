"use client";

import { motion } from "framer-motion";
import { useState, lazy, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Lazy loading heavy components
const TechnicalScore = lazy(() => import("@/components/TechnicalScore"));
const CandlePatterns = lazy(() => import("@/components/CandlePatterns"));
const VolumeProfile = lazy(() => import("@/components/VolumeProfile"));
const AdvancedIndicators = lazy(() => import("@/components/AdvancedIndicators"));
const Fibonacci = lazy(() => import("@/components/Fibonacci"));
const AlternativeCharts = lazy(() => import("@/components/AlternativeCharts"));

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="glass rounded-xl p-6 animate-pulse">
    <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-20 bg-gray-700 rounded"></div>
      <div className="h-20 bg-gray-700 rounded"></div>
    </div>
  </div>
);

export default function AnalisePage() {
  const router = useRouter();
  const [ticker, setTicker] = useState("AAPL");

  const popularStocks = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "JPM",
    "V", "JNJ", "WMT", "PG", "DIS", "NFLX", "PYPL", "INTC"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Advanced Technical Analysis
            </h1>
            <p className="text-gray-400">
              Indicators, patterns and advanced metrics for {ticker}
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Enter ticker"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Access Stocks */}
        <div className="mt-6 flex flex-wrap gap-2">
          {popularStocks.map((stock) => (
            <button
              key={stock}
              onClick={() => setTicker(stock)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                ticker === stock
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {stock}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Technical Score - Loads first */}
        <Suspense fallback={<LoadingSkeleton />}>
          <TechnicalScore ticker={ticker} />
        </Suspense>

        {/* 2 column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <CandlePatterns ticker={ticker} />
          </Suspense>
          <Suspense fallback={<LoadingSkeleton />}>
            <VolumeProfile ticker={ticker} />
          </Suspense>
        </div>

        {/* Advanced Indicators */}
        <Suspense fallback={<LoadingSkeleton />}>
          <AdvancedIndicators ticker={ticker} />
        </Suspense>

        {/* Fibonacci - Zones and Extensions */}
        <Suspense fallback={<LoadingSkeleton />}>
          <Fibonacci ticker={ticker} />
        </Suspense>

        {/* Alternative Charts */}
        <Suspense fallback={<LoadingSkeleton />}>
          <AlternativeCharts ticker={ticker} />
        </Suspense>
      </div>
    </div>
  );
}
