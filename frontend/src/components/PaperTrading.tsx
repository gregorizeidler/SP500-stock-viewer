"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, ShoppingCart, DollarSign, RotateCcw, History } from "lucide-react";
import { useEffect, useState } from "react";

interface Position {
  ticker: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  total_value: number;
  profit: number;
  profit_pct: number;
}

interface Portfolio {
  total_equity: number;
  available_balance: number;
  positions_value: number;
  initial_capital: number;
  return_pct: number;
  positions: Position[];
}

interface HistoryItem {
  type: string;
  ticker: string;
  quantity: number;
  price: number;
  total: number;
  profit?: number;
  date: string;
}

export default function PaperTrading() {
  const [userId] = useState("demo_user"); // Can be dynamic later
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"portfolio" | "trade" | "history">("portfolio");

  // Trading form
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [operationType, setOperationType] = useState<"buy" | "sell">("buy");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch portfolio
      const resPortfolio = await fetch(`http://localhost:8000/api/paper-trading/portfolio/${userId}`);
      const dataPortfolio = await resPortfolio.json();
      
      // Calculate positions value and total equity
      const positionsArray = Object.entries(dataPortfolio.positions || {}).map(([ticker, pos]: [string, any]) => ({
        ticker,
        quantity: pos.quantity,
        avg_price: pos.avg_price,
        current_price: pos.avg_price, // Using avg_price as current for now
        total_value: pos.quantity * pos.avg_price,
        profit: 0,
        profit_pct: 0
      }));
      
      const positions_value = positionsArray.reduce((sum, pos) => sum + pos.total_value, 0);
      const total_equity = dataPortfolio.available_balance + positions_value;
      const return_pct = ((total_equity - dataPortfolio.initial_capital) / dataPortfolio.initial_capital) * 100;
      
      setPortfolio({
        ...dataPortfolio,
        positions: positionsArray,
        positions_value,
        total_equity,
        return_pct
      });
      
      setHistory(dataPortfolio.history || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPrice = async (tickerSearch: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sp500/info/${tickerSearch}`);
      const data = await res.json();
      setPrice((data.current_price ?? 0).toFixed(2));
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  };

  const executeOperation = async () => {
    if (!ticker || !quantity || !price) {
      setMessage("⚠️ Fill all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const endpoint = operationType === "buy" 
        ? `/api/paper-trading/buy?user_id=${userId}&ticker=${ticker}&quantity=${quantity}&price=${price}`
        : `/api/paper-trading/sell?user_id=${userId}&ticker=${ticker}&quantity=${quantity}&price=${price}`;

      const res = await fetch(`http://localhost:8000${endpoint}`, { method: "POST" });
      const data = await res.json();

      if (data.error) {
        setMessage(`❌ ${data.error}`);
      } else if (data.success) {
        setMessage(`✅ ${data.message}`);
        setTicker("");
        setQuantity("");
        setPrice("");
        await loadData();
      }
    } catch (error) {
      setMessage("❌ Error executing operation");
    } finally {
      setLoading(false);
    }
  };

  const resetPortfolio = async () => {
    if (!confirm("Are you sure you want to reset your portfolio? All positions will be lost.")) {
      return;
    }

    try {
      await fetch(`http://localhost:8000/api/paper-trading/reset/${userId}`, { method: "POST" });
      setMessage("✅ Portfolio reset!");
      await loadData();
    } catch (error) {
      setMessage("❌ Error resetting portfolio");
    }
  };

  if (loading && !portfolio) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
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
          <Wallet className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Paper Trading</h3>
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">SIMULATION</span>
        </div>
        <button
          onClick={resetPortfolio}
          className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-semibold transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Summary Cards */}
      {portfolio && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-900/30 to-green-600/30 border-2 border-green-500 rounded-lg p-4"
          >
            <p className="text-xs text-gray-300 mb-1">💰 Total Equity</p>
            <p className="text-2xl font-bold text-white">
              $ {(portfolio.total_equity ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className={`text-sm font-semibold mt-1 ${(portfolio.return_pct ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {(portfolio.return_pct ?? 0) >= 0 ? "+" : ""}{(portfolio.return_pct ?? 0).toFixed(2)}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4"
          >
            <p className="text-xs text-gray-400 mb-1">💵 Available Balance</p>
            <p className="text-xl font-bold text-white">
              $ {(portfolio.available_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-lg p-4"
          >
            <p className="text-xs text-gray-400 mb-1">📊 Stock Value</p>
            <p className="text-xl font-bold text-white">
              $ {(portfolio.positions_value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-lg p-4"
          >
            <p className="text-xs text-gray-400 mb-1">🎯 Open Positions</p>
            <p className="text-xl font-bold text-white">{portfolio.positions?.length ?? 0}</p>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <button
          onClick={() => setTab("portfolio")}
          className={`px-4 py-2 font-semibold transition-all ${
            tab === "portfolio"
              ? "text-green-400 border-b-2 border-green-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          📊 Portfolio
        </button>
        <button
          onClick={() => setTab("trade")}
          className={`px-4 py-2 font-semibold transition-all ${
            tab === "trade"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          💹 Trade
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 font-semibold transition-all ${
            tab === "history"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          📜 History
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {tab === "portfolio" && portfolio && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {(portfolio.positions?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {portfolio.positions?.map((pos, idx) => (
                  <motion.div
                    key={pos.ticker}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gray-800/50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-white">{pos.ticker}</h4>
                          <span className="text-sm text-gray-400">{pos.quantity}x shares</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Avg Price</p>
                            <p className="text-white font-semibold">$ {(pos.avg_price ?? 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Current Price</p>
                            <p className="text-white font-semibold">$ {(pos.current_price ?? 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Total Value</p>
                            <p className="text-white font-semibold">$ {(pos.total_value ?? 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Profit/Loss</p>
                            <p className={`font-bold ${(pos.profit ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {(pos.profit ?? 0) >= 0 ? "+" : ""}$ {(pos.profit ?? 0).toFixed(2)} ({(pos.profit_pct ?? 0).toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      </div>
                      {(pos.profit ?? 0) >= 0 ? (
                        <TrendingUp className="w-8 h-8 text-green-400" />
                      ) : (
                        <TrendingDown className="w-8 h-8 text-red-400" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">You don't have any positions yet</p>
                <p className="text-sm text-gray-500 mt-2">Go to "Trade" to start</p>
              </div>
            )}
          </motion.div>
        )}

        {tab === "trade" && (
          <motion.div
            key="trade"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="max-w-2xl mx-auto">
              {/* Buy/Sell Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setOperationType("buy")}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    operationType === "buy"
                      ? "bg-green-600 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 inline-block mr-2" />
                  Buy
                </button>
                <button
                  onClick={() => setOperationType("sell")}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    operationType === "sell"
                      ? "bg-red-600 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  <DollarSign className="w-5 h-5 inline-block mr-2" />
                  Sell
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Stock Ticker</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. AAPL"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value.toUpperCase())}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => fetchCurrentPrice(ticker)}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                    >
                      Get Price
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Quantity</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price per Share</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 28.50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Total Calculation */}
                {ticker && quantity && price && (
                  <div className="p-4 bg-blue-900/20 border-2 border-blue-500 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Total Operation:</p>
                    <p className="text-2xl font-bold text-white">
                      $ {(parseFloat(quantity) * parseFloat(price)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}

                {/* Message */}
                {message && (
                  <div className={`p-4 rounded-lg ${message.includes("✅") ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                    {message}
                  </div>
                )}

                {/* Execute Button */}
                <button
                  onClick={executeOperation}
                  disabled={loading}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 ${
                    operationType === "buy"
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  }`}
                >
                  {loading ? "Processing..." : operationType === "buy" ? "🛒 Execute Buy" : "💰 Execute Sell"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {history.length > 0 ? (
              <div className="space-y-2">
                {[...history].reverse().map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      item.type === "BUY" ? "bg-green-900/20" : "bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        item.type === "BUY" ? "bg-green-600" : "bg-red-600"
                      }`}>
                        {item.type === "BUY" ? (
                          <ShoppingCart className="w-5 h-5 text-white" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {item.type} {item.quantity}x {item.ticker}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.date).toLocaleString('en-US')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">$ {(item.total ?? 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">@ $ {(item.price ?? 0).toFixed(2)}</p>
                      {item.profit !== undefined && (
                        <p className={`text-sm font-semibold ${(item.profit ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {(item.profit ?? 0) >= 0 ? "+" : ""}$ {(item.profit ?? 0).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No operations yet</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
