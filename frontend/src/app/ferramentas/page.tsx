"use client";

import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Lazy loading heavy components
const StockScreener = lazy(() => import("@/components/StockScreener"));
const HeatmapTreemap = lazy(() => import("@/components/HeatmapTreemap"));
const StockComparator = lazy(() => import("@/components/StockComparator"));
const CorrelationVisualizer = lazy(() => import("@/components/CorrelationVisualizer"));
const PaperTrading = lazy(() => import("@/components/PaperTrading"));

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="glass rounded-xl p-6 animate-pulse">
    <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-32 bg-gray-700 rounded"></div>
      <div className="h-32 bg-gray-700 rounded"></div>
    </div>
  </div>
);

export default function FerramentasPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🛠️ Advanced Tools
          </h1>
          <p className="text-gray-400">
            Screener, Comparator and Market Visualizations
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Paper Trading - Featured at the top */}
        <Suspense fallback={<LoadingSkeleton />}>
          <PaperTrading />
        </Suspense>

        {/* Screener - Loads first (lighter) */}
        <Suspense fallback={<LoadingSkeleton />}>
          <StockScreener />
        </Suspense>

        {/* Comparator - Loads after */}
        <Suspense fallback={<LoadingSkeleton />}>
          <StockComparator />
        </Suspense>

        {/* Visual Correlation */}
        <Suspense fallback={<LoadingSkeleton />}>
          <CorrelationVisualizer />
        </Suspense>

        {/* Treemap - Loads last (heaviest) */}
        <Suspense fallback={<LoadingSkeleton />}>
          <HeatmapTreemap />
        </Suspense>
      </div>
    </div>
  );
}
