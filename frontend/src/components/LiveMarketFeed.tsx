"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Pause, 
  Play, 
  TrendingUp, 
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  DollarSign,
  Zap
} from "lucide-react";

interface MarketEvent {
  id: string;
  ticker: string;
  type: string;
  timestamp: string;
  message: string;
  details: string;
  variation: number;
  positive: boolean;
}

export default function LiveMarketFeed() {
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0 });
  const wsRef = useRef<WebSocket | null>(null);
  const pausedEventsRef = useRef<MarketEvent[]>([]);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/market-feed');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🔌 Connected to Market Feed');
    };

    ws.onmessage = (event) => {
      const newEvent: MarketEvent = JSON.parse(event.data);
      
      if (isPaused) {
        // If paused, store events
        pausedEventsRef.current.push(newEvent);
      } else {
        // Add event and keep last 10
        setEvents(prev => [newEvent, ...prev].slice(0, 10));
        
        // Update statistics
        setStats(prev => ({
          total: prev.total + 1,
          positive: prev.positive + (newEvent.positive ? 1 : 0),
          negative: prev.negative + (!newEvent.positive ? 1 : 0),
        }));
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('🔌 Disconnected from Market Feed');
    };

    return () => {
      ws.close();
    };
  }, [isPaused]);

  const togglePause = () => {
    setIsPaused(!isPaused);
    
    // If unpausing, add accumulated events
    if (isPaused && pausedEventsRef.current.length > 0) {
      setEvents(prev => [...pausedEventsRef.current, ...prev].slice(0, 10));
      pausedEventsRef.current = [];
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'buy_order':
        return <ArrowUpCircle className="w-5 h-5" />;
      case 'sell_order':
        return <ArrowDownCircle className="w-5 h-5" />;
      case 'execution':
        return <DollarSign className="w-5 h-5" />;
      case 'market_depth':
        return <BarChart3 className="w-5 h-5" />;
      case 'volume_spike':
        return <Zap className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: string, positive: boolean) => {
    if (type === 'buy_order' || (type === 'execution' && positive)) {
      return 'from-green-500/20 to-green-600/20 border-green-500/30';
    }
    if (type === 'sell_order' || type === 'market_depth') {
      return 'from-red-500/20 to-red-600/20 border-red-500/30';
    }
    return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
  };

  const getIconColor = (type: string, positive: boolean) => {
    if (type === 'buy_order' || (positive && type === 'execution')) {
      return 'text-green-400';
    }
    if (type === 'sell_order' || type === 'market_depth') {
      return 'text-red-400';
    }
    return 'text-blue-400';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Live Market Feed</h3>
            <p className="text-sm text-gray-400">Real-time trades & price changes</p>
          </div>
        </div>

        <button
          onClick={togglePause}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-all duration-200
            ${isPaused 
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }
          `}
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Play
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          )}
        </button>
      </div>

      {/* Events Feed */}
      <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto custom-scrollbar">
        <AnimatePresence initial={false}>
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05 
              }}
              className={`
                p-4 rounded-lg border bg-gradient-to-br
                ${getEventColor(event.type, event.positive)}
                hover:scale-[1.02] transition-transform
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`${getIconColor(event.type, event.positive)}`}>
                    {getIcon(event.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-lg">
                        {event.ticker}
                      </span>
                      <span className="text-xs text-gray-400">
                        {event.timestamp}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {event.message}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {event.details}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {event.positive ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`
                    text-lg font-bold
                    ${event.positive ? 'text-green-400' : 'text-red-400'}
                  `}>
                    {event.positive ? '+' : ''}{event.variation.toFixed(2)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
            <p>Waiting for market events...</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700/50">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {stats.total}
          </div>
          <div className="text-sm text-gray-400">Total Items</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">
            {stats.positive}
          </div>
          <div className="text-sm text-gray-400">Positive</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-red-400 mb-1">
            {stats.negative}
          </div>
          <div className="text-sm text-gray-400">Negative</div>
        </div>
      </div>

      {/* Connection Indicator */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-700/50">
        <div className={`
          w-2 h-2 rounded-full animate-pulse
          ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}
        `} />
        <span className="text-xs text-gray-400">
          {isPaused ? 'Feed paused' : 'Real-time data'}
        </span>
      </div>
    </div>
  );
}

