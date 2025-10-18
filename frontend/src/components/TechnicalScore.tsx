"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MinusCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface ScoreData {
  score: number;
  recommendation: string;
  signals: string[];
  pivot_points: any;
  supports: number[];
  resistances: number[];
  anomalies: any[];
}

interface Props {
  ticker: string;
}

export default function ScoreTecnico({ ticker }: Props) {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScore();
  }, [ticker]);

  const fetchScore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/sp500/analysis/score/${ticker}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching score:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 60) return "text-green-400";
    if (score >= 40) return "text-yellow-500";
    if (score >= 25) return "text-red-400";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 60) return <TrendingUp className="w-12 h-12" />;
    if (score >= 40) return <MinusCircle className="w-12 h-12" />;
    return <TrendingDown className="w-12 h-12" />;
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "from-green-600 to-green-800";
    if (score >= 60) return "from-green-500 to-green-700";
    if (score >= 40) return "from-yellow-500 to-yellow-700";
    if (score >= 25) return "from-red-500 to-red-700";
    return "from-red-600 to-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Main Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass rounded-xl p-6 bg-gradient-to-br ${getScoreBg(data.score)} bg-opacity-10`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Technical Score</h3>
            <div className={`text-6xl font-bold ${getScoreColor(data.score)}`}>
              {data.score}
              <span className="text-2xl">/100</span>
            </div>
            <p className="text-xl font-semibold text-white mt-2">{data.recommendation}</p>
          </div>
          <div className={`${getScoreColor(data.score)}`}>
            {getScoreIcon(data.score)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${getScoreBg(data.score)}`}
          />
        </div>
      </motion.div>

      {/* Signals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">📊 Detected Signals</h3>
        <div className="space-y-3">
          {data.signals && data.signals.length > 0 ? (
            data.signals.map((signal, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">{signal}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No signals detected</p>
          )}
        </div>
      </motion.div>

      {/* Pivot Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">🎯 Pivot Points</h3>
        {data.pivot_points ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-400">R3</p>
              <p className="text-lg font-bold text-red-400">$ {data.pivot_points.r3?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-red-800/20 p-3 rounded-lg">
              <p className="text-xs text-gray-400">R2</p>
              <p className="text-lg font-bold text-red-400">$ {data.pivot_points.r2?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-red-700/20 p-3 rounded-lg">
              <p className="text-xs text-gray-400">R1</p>
              <p className="text-lg font-bold text-red-400">$ {data.pivot_points.r1?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-blue-700/20 p-3 rounded-lg">
              <p className="text-xs text-gray-400">PIVOT</p>
              <p className="text-lg font-bold text-blue-400">$ {data.pivot_points.pivot?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-green-700/20 p-3 rounded-lg">
              <p className="text-xs text-gray-400">S1</p>
              <p className="text-lg font-bold text-green-400">$ {data.pivot_points.s1?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-green-800/20 p-3 rounded-lg">
              <p className="text-xs text-gray-400">S2</p>
              <p className="text-lg font-bold text-green-400">$ {data.pivot_points.s2?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-green-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-400">S3</p>
              <p className="text-lg font-bold text-green-400">$ {data.pivot_points.s3?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No pivot points available</p>
        )}
      </motion.div>

      {/* Support and Resistance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">💪 Support Levels</h3>
          {data.supports && data.supports.length > 0 ? (
            <div className="space-y-2">
              {data.supports.map((support, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                  <span className="text-gray-400">Level {idx + 1}</span>
                  <span className="text-lg font-bold text-green-400">$ {support.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No support levels identified</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">🚀 Resistance Levels</h3>
          {data.resistances && data.resistances.length > 0 ? (
            <div className="space-y-2">
              {data.resistances.map((resistance, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
                  <span className="text-gray-400">Level {idx + 1}</span>
                  <span className="text-lg font-bold text-red-400">$ {resistance.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No resistance levels identified</p>
          )}
        </motion.div>
      </div>

      {/* Anomalies */}
      {data.anomalies && data.anomalies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6 border-2 border-yellow-500/30"
        >
          <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            ⚠️ Detected Anomalies
          </h3>
          <div className="space-y-3">
            {data.anomalies.map((anomaly, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  anomaly.severity === 'high'
                    ? 'bg-red-900/20 border-red-500'
                    : 'bg-yellow-900/20 border-yellow-500'
                }`}
              >
                <p className="font-semibold text-white">{anomaly.type}</p>
                <p className="text-sm text-gray-300 mt-1">{anomaly.message}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
