"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import { motion } from "framer-motion";

interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Props {
  ticker: string;
  data: StockData[];
  showVolume?: boolean;
  height?: number;
}

export default function CandlestickChart({ 
  ticker, 
  data, 
  showVolume = true,
  height = 500 
}: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("none");

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9CA3AF",
      },
      grid: {
        vertLines: { color: "rgba(42, 46, 57, 0.5)" },
        horzLines: { color: "rgba(42, 46, 57, 0.5)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        borderColor: "#2B2B43",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#2B2B43",
      },
    });

    chartRef.current = chart;

    // Candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#10B981",
      downColor: "#EF4444",
      borderUpColor: "#10B981",
      borderDownColor: "#EF4444",
      wickUpColor: "#10B981",
      wickDownColor: "#EF4444",
    });

    // Convert data to chart format
    const candlestickData = data.map((d) => ({
      time: new Date(d.date).getTime() / 1000,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(candlestickData);

    // Volume
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: "#3B82F6",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = data.map((d) => ({
        time: new Date(d.date).getTime() / 1000,
        value: d.volume,
        color: d.close >= d.open ? "#10B98180" : "#EF444480",
      }));

      volumeSeries.setData(volumeData);
    }

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, showVolume, height]);

  // Add indicators when selected
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    // Here you can add logic for technical indicators
    // For example: SMA, EMA, Bollinger Bands, etc.
  }, [selectedIndicator, data]);

  const calculateStatistics = () => {
    if (data.length === 0) return null;

    const currentPrice = data[data.length - 1]?.close || 0;
    const previousPrice = data[data.length - 2]?.close || currentPrice;
    const change = currentPrice - previousPrice;
    const changePct = (change / previousPrice) * 100;

    const high52w = Math.max(...data.map(d => d.high));
    const low52w = Math.min(...data.map(d => d.low));
    const avgVolume = data.reduce((acc, d) => acc + d.volume, 0) / data.length;

    return {
      currentPrice,
      change,
      changePct,
      high52w,
      low52w,
      avgVolume,
    };
  };

  const stats = calculateStatistics();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{ticker}</h3>
          {stats && (
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-2xl font-bold text-white">
                $ {stats.currentPrice.toFixed(2)}
              </span>
              <span
                className={`font-medium ${
                  stats.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {stats.change >= 0 ? "+" : ""}
                {stats.change.toFixed(2)} ({stats.changePct.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedIndicator("sma")}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              selectedIndicator === "sma"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            SMA
          </button>
          <button
            onClick={() => setSelectedIndicator("bollinger")}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              selectedIndicator === "bollinger"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Bollinger
          </button>
          <button
            onClick={() => setSelectedIndicator("none")}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              selectedIndicator === "none"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Clear
          </button>
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full" />

      {stats && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
          <div>
            <p className="text-xs text-gray-400">High (period)</p>
            <p className="text-sm font-semibold text-white">
              $ {stats.high52w.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Low (period)</p>
            <p className="text-sm font-semibold text-white">
              $ {stats.low52w.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Avg Volume</p>
            <p className="text-sm font-semibold text-white">
              {(stats.avgVolume / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
