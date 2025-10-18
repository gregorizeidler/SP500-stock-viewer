import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ========== S&P 500 Endpoints ==========

export const fetchMainStocks = async () => {
  const response = await api.get('/api/sp500/stocks/main');
  return response.data;
};

export const fetchStockData = async (ticker: string, period: string = '1y') => {
  const response = await api.get(`/api/sp500/stock/${ticker}`, {
    params: { period },
  });
  return response.data;
};

export const fetchSP500Index = async (period: string = '1y') => {
  const response = await api.get('/api/sp500/index', {
    params: { period },
  });
  return response.data;
};

export const fetchSectorPerformance = async () => {
  const response = await api.get('/api/sp500/sectors');
  return response.data;
};

export const fetchStockRanking = async (type: 'change' | 'volume' = 'change') => {
  const response = await api.get('/api/sp500/ranking', {
    params: { type },
  });
  return response.data;
};

export const fetchCorrelations = async (tickers: string[], period: string = '6mo') => {
  const tickersStr = tickers.join(',');
  const response = await api.get('/api/sp500/correlations', {
    params: { tickers: tickersStr, period },
  });
  return response.data;
};

export const fetchStockComparison = async (tickers: string[], period: string = '1y') => {
  const tickersStr = tickers.join(',');
  const response = await api.get('/api/sp500/comparison', {
    params: { tickers: tickersStr, period },
  });
  return response.data;
};

// ========== Analysis Endpoints ==========

export const fetchTechnicalScore = async (ticker: string, period: string = '3mo') => {
  const response = await api.get(`/api/sp500/analysis/score/${ticker}`, {
    params: { period },
  });
  return response.data;
};

export const fetchCandlePatterns = async (ticker: string, period: string = '1mo') => {
  const response = await api.get(`/api/sp500/analysis/patterns/${ticker}`, {
    params: { period },
  });
  return response.data;
};

export const fetchVolumeProfile = async (ticker: string, period: string = '3mo') => {
  const response = await api.get(`/api/sp500/analysis/volume-profile/${ticker}`, {
    params: { period },
  });
  return response.data;
};

export const fetchAdvancedIndicators = async (ticker: string, period: string = '6mo') => {
  const response = await api.get(`/api/sp500/analysis/advanced-indicators/${ticker}`, {
    params: { period },
  });
  return response.data;
};

export const fetchFibonacci = async (ticker: string, period: string = '3mo') => {
  const response = await api.get(`/api/sp500/analysis/fibonacci/${ticker}`, {
    params: { period },
  });
  return response.data;
};

export const fetchScreener = async (filters: {
  pe_max?: number;
  rsi_max?: number;
  rsi_min?: number;
  score_min?: number;
  volume_min?: number;
}) => {
  const response = await api.get('/api/sp500/screener', {
    params: filters,
  });
  return response.data;
};

export const fetchMarketCapHeatmap = async () => {
  const response = await api.get('/api/sp500/heatmap/market-cap');
  return response.data;
};

export const compareStocksAdvanced = async (tickers: string[], period: string = '1y') => {
  const tickersStr = tickers.join(',');
  const response = await api.post('/api/sp500/analysis/comparator', null, {
    params: { tickers: tickersStr, period },
  });
  return response.data;
};

// ========== Paper Trading Endpoints ==========

export const fetchPaperTradingPortfolio = async (userId: string) => {
  const response = await api.get(`/api/paper-trading/portfolio/${userId}`);
  return response.data;
};

export const buyStock = async (userId: string, ticker: string, quantity: number, price: number) => {
  const response = await api.post('/api/paper-trading/buy', null, {
    params: { user_id: userId, ticker, quantity, price },
  });
  return response.data;
};

export const sellStock = async (userId: string, ticker: string, quantity: number, price: number) => {
  const response = await api.post('/api/paper-trading/sell', null, {
    params: { user_id: userId, ticker, quantity, price },
  });
  return response.data;
};

export const fetchPortfolioEquity = async (userId: string) => {
  const response = await api.get(`/api/paper-trading/equity/${userId}`);
  return response.data;
};

export const resetPortfolio = async (userId: string) => {
  const response = await api.post(`/api/paper-trading/reset/${userId}`);
  return response.data;
};

// ========== Utility Functions ==========

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`;
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`;
  }
  return volume.toString();
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US');
};

export default api;


// ========== Legacy Functions (compatibility) ==========

export const fetchPortfolioOverview = async () => {
  try {
    const response = await api.get('/api/portfolio/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio overview:', error);
    return null;
  }
};

// Backwards compatibility exports (old names -> new names)
export const buscarPrincipaisAcoes = fetchMainStocks;
export const buscarDadosAcao = fetchStockData;
export const buscarIbovespa = fetchSP500Index;
export const buscarDesempenhoSetores = fetchSectorPerformance;
export const buscarRankingAcoes = fetchStockRanking;
export const buscarCorrelacoes = fetchCorrelations;
export const buscarComparacaoAcoes = fetchStockComparison;
