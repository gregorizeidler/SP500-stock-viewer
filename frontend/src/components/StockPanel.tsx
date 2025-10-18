"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";

interface Props {
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
}

const POPULAR_STOCKS = [
  // Technology
  { ticker: "AAPL", name: "Apple Inc" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "GOOGL", name: "Alphabet (Google)" },
  { ticker: "META", name: "Meta Platforms" },
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "TSLA", name: "Tesla" },
  { ticker: "AMD", name: "AMD" },
  { ticker: "INTC", name: "Intel" },
  { ticker: "CRM", name: "Salesforce" },
  { ticker: "ORCL", name: "Oracle" },
  { ticker: "ADBE", name: "Adobe" },
  { ticker: "CSCO", name: "Cisco" },
  { ticker: "AVGO", name: "Broadcom" },
  { ticker: "QCOM", name: "Qualcomm" },
  { ticker: "TXN", name: "Texas Instruments" },
  
  // Financial
  { ticker: "JPM", name: "JPMorgan Chase" },
  { ticker: "BAC", name: "Bank of America" },
  { ticker: "WFC", name: "Wells Fargo" },
  { ticker: "GS", name: "Goldman Sachs" },
  { ticker: "MS", name: "Morgan Stanley" },
  { ticker: "C", name: "Citigroup" },
  { ticker: "BLK", name: "BlackRock" },
  { ticker: "SCHW", name: "Charles Schwab" },
  { ticker: "AXP", name: "American Express" },
  { ticker: "V", name: "Visa" },
  { ticker: "MA", name: "Mastercard" },
  { ticker: "PYPL", name: "PayPal" },
  
  // Healthcare
  { ticker: "JNJ", name: "Johnson & Johnson" },
  { ticker: "UNH", name: "UnitedHealth" },
  { ticker: "PFE", name: "Pfizer" },
  { ticker: "ABBV", name: "AbbVie" },
  { ticker: "TMO", name: "Thermo Fisher" },
  { ticker: "ABT", name: "Abbott Labs" },
  { ticker: "MRK", name: "Merck" },
  { ticker: "LLY", name: "Eli Lilly" },
  { ticker: "BMY", name: "Bristol Myers" },
  { ticker: "AMGN", name: "Amgen" },
  { ticker: "GILD", name: "Gilead Sciences" },
  { ticker: "CVS", name: "CVS Health" },
  
  // Consumer
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "WMT", name: "Walmart" },
  { ticker: "HD", name: "Home Depot" },
  { ticker: "MCD", name: "McDonald's" },
  { ticker: "NKE", name: "Nike" },
  { ticker: "SBUX", name: "Starbucks" },
  { ticker: "TGT", name: "Target" },
  { ticker: "LOW", name: "Lowe's" },
  { ticker: "COST", name: "Costco" },
  { ticker: "PG", name: "Procter & Gamble" },
  { ticker: "KO", name: "Coca-Cola" },
  { ticker: "PEP", name: "PepsiCo" },
  
  // Energy
  { ticker: "XOM", name: "Exxon Mobil" },
  { ticker: "CVX", name: "Chevron" },
  { ticker: "COP", name: "ConocoPhillips" },
  { ticker: "SLB", name: "Schlumberger" },
  { ticker: "EOG", name: "EOG Resources" },
  { ticker: "MPC", name: "Marathon Petroleum" },
  { ticker: "PSX", name: "Phillips 66" },
  { ticker: "VLO", name: "Valero Energy" },
  
  // Industrial
  { ticker: "BA", name: "Boeing" },
  { ticker: "CAT", name: "Caterpillar" },
  { ticker: "GE", name: "General Electric" },
  { ticker: "MMM", name: "3M" },
  { ticker: "HON", name: "Honeywell" },
  { ticker: "UNP", name: "Union Pacific" },
  { ticker: "UPS", name: "UPS" },
  { ticker: "RTX", name: "Raytheon Tech" },
  { ticker: "LMT", name: "Lockheed Martin" },
  { ticker: "DE", name: "Deere & Company" },
  
  // Communication
  { ticker: "DIS", name: "Walt Disney" },
  { ticker: "NFLX", name: "Netflix" },
  { ticker: "CMCSA", name: "Comcast" },
  { ticker: "T", name: "AT&T" },
  { ticker: "VZ", name: "Verizon" },
  { ticker: "TMUS", name: "T-Mobile" },
  
  // Real Estate & Utilities
  { ticker: "AMT", name: "American Tower" },
  { ticker: "PLD", name: "Prologis" },
  { ticker: "NEE", name: "NextEra Energy" },
  { ticker: "DUK", name: "Duke Energy" },
  { ticker: "SO", name: "Southern Company" },
  
  // Materials
  { ticker: "LIN", name: "Linde" },
  { ticker: "APD", name: "Air Products" },
  { ticker: "DD", name: "DuPont" },
  { ticker: "DOW", name: "Dow Inc" },
  { ticker: "NEM", name: "Newmont" },
  { ticker: "FCX", name: "Freeport-McMoRan" },
  
  // Others
  { ticker: "BRK.B", name: "Berkshire Hathaway" },
  { ticker: "SPY", name: "S&P 500 ETF" },
  { ticker: "QQQ", name: "Nasdaq 100 ETF" },
];

export default function StockPanel({ selectedTicker, onTickerChange }: Props) {
  const [search, setSearch] = useState("");

  const filteredStocks = POPULAR_STOCKS.filter(
    (stock) =>
      stock.ticker.toLowerCase().includes(search.toLowerCase()) ||
      stock.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-4">
          Select Stock for Analysis
        </h3>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ticker or name..."
            value={search}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 max-h-[500px] overflow-y-auto custom-scrollbar">
        {filteredStocks.map((stock) => (
          <motion.button
            key={stock.ticker}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTickerChange(stock.ticker)}
            className={`
              p-4 rounded-lg transition-all text-left
              ${
                selectedTicker === stock.ticker
                  ? "bg-blue-600 border-2 border-blue-400"
                  : "bg-gray-800/50 border-2 border-transparent hover:bg-gray-800"
              }
            `}
          >
            <p className="font-bold text-white text-sm">{stock.ticker}</p>
            <p className="text-xs text-gray-400 mt-1 truncate">{stock.nome}</p>
          </motion.button>
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <p className="text-center text-gray-400 py-8">
          No stocks found
        </p>
      )}
    </motion.div>
  );
}
