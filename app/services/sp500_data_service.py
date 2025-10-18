"""
Data Service for the S&P 500 Market
Fetches and processes US stock data
"""

from __future__ import annotations

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging
from .technical_analysis_advanced import TechnicalAnalysisAdvanced, StockComparator

logger = logging.getLogger(__name__)


class SP500DataService:
    """Service to fetch S&P 500 stock data"""
    
    # Major S&P 500 stocks available on Yahoo Finance
    MAIN_STOCKS = [
        # Technology
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AVGO', 
        'ADBE', 'CRM', 'ORCL', 'CSCO', 'INTC', 'AMD', 'QCOM', 'TXN',
        'INTU', 'NOW', 'PANW', 'AMAT', 'MU', 'NFLX', 'PYPL', 'ABNB',
        
        # Financial
        'BRK-B', 'JPM', 'V', 'MA', 'BAC', 'WFC', 'MS', 'GS', 'BLK',
        'SPGI', 'C', 'AXP', 'SCHW', 'CB', 'PGR', 'MMC', 'CME', 'ICE',
        
        # Healthcare
        'UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'PFE', 'TMO', 'ABT', 'DHR',
        'BMY', 'AMGN', 'CVS', 'CI', 'GILD', 'ISRG', 'REGN', 'VRTX', 'SYK',
        
        # Consumer Discretionary
        'AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'LOW', 'SBUX', 'TJX', 'BKNG',
        'CMG', 'MAR', 'F', 'GM', 'YUM', 'ORLY', 'ROST', 'AZO', 'DHI',
        
        # Consumer Staples
        'PG', 'KO', 'PEP', 'COST', 'WMT', 'PM', 'MO', 'CL', 'MDLZ',
        'EL', 'KHC', 'GIS', 'HSY', 'SYY', 'KMB', 'STZ', 'KR', 'DG',
        
        # Energy
        'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'MPC', 'PSX', 'VLO', 'OXY',
        'WMB', 'KMI', 'HES', 'DVN', 'HAL', 'BKR', 'FANG', 'MRO', 'APA',
        
        # Industrials
        'BA', 'HON', 'UPS', 'RTX', 'CAT', 'DE', 'LMT', 'UNP', 'GE',
        'MMM', 'ADP', 'FDX', 'NSC', 'ETN', 'ITW', 'EMR', 'PCAR', 'CSX',
        
        # Utilities
        'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'ES',
        'WEC', 'PEG', 'ED', 'EIX', 'AWK', 'DTE', 'ETR', 'AEE', 'CMS',
        
        # Real Estate
        'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'WELL', 'SPG', 'DLR', 'O',
        'SBAC', 'AVB', 'EQR', 'VICI', 'WY', 'INVH', 'MAA', 'ARE', 'VTR',
        
        # Materials
        'LIN', 'APD', 'SHW', 'FCX', 'ECL', 'NEM', 'DD', 'DOW', 'NUE',
        'PPG', 'ALB', 'MLM', 'VMC', 'CTVA', 'IFF', 'CE', 'FMC', 'MOS',
        
        # Communication Services
        'GOOGL', 'META', 'NFLX', 'DIS', 'VZ', 'T', 'CMCSA', 'TMUS',
        'CHTR', 'EA', 'TTWO', 'OMC', 'IPG', 'NWSA', 'FOXA', 'MTCH',
    ]
    
    SECTORS = {
        'Technology': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AVGO'],
        'Financial': ['BRK-B', 'JPM', 'V', 'MA', 'BAC', 'WFC', 'MS', 'GS'],
        'Healthcare': ['UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'PFE', 'TMO', 'ABT'],
        'Consumer Discretionary': ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'LOW', 'SBUX', 'TJX'],
        'Consumer Staples': ['PG', 'KO', 'PEP', 'COST', 'WMT', 'PM', 'MO', 'CL'],
        'Energy': ['XOM', 'CVX', 'COP', 'EOG', 'SLB', 'MPC', 'PSX', 'VLO'],
        'Industrials': ['BA', 'HON', 'UPS', 'RTX', 'CAT', 'DE', 'LMT', 'UNP'],
        'Utilities': ['NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL'],
        'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'WELL', 'SPG', 'DLR'],
        'Materials': ['LIN', 'APD', 'SHW', 'FCX', 'ECL', 'NEM', 'DD', 'DOW'],
        'Communication Services': ['GOOGL', 'META', 'NFLX', 'DIS', 'VZ', 'T', 'CMCSA', 'TMUS'],
    }
    
    def __init__(self):
        self.cache: Dict[str, Any] = {}
        
    def fetch_stock_data(self, ticker: str, period: str = '1y') -> pd.DataFrame:
        """
        Fetch historical stock data
        
        Args:
            ticker: Stock ticker (e.g., 'AAPL')
            period: Data period ('1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max')
        """
        try:
            stock = yf.Ticker(ticker)
            data = stock.history(period=period)
            
            if data.empty:
                logger.warning(f"No data for {ticker}")
                return pd.DataFrame()
            
            # Add technical indicators
            data = self._calculate_indicators(data)
            
            return data
        except Exception as e:
            logger.error(f"Error fetching {ticker}: {e}")
            return pd.DataFrame()
    
    def fetch_stock_info(self, ticker: str) -> Dict[str, Any]:
        """Fetch detailed stock information"""
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            
            return {
                'ticker': ticker,
                'name': info.get('longName', ticker),
                'sector': info.get('sector', 'N/A'),
                'current_price': info.get('currentPrice', 0),
                'day_change': info.get('regularMarketChangePercent', 0),
                'volume': info.get('volume', 0),
                'market_cap': info.get('marketCap', 0),
                'pe_ratio': info.get('trailingPE', 0),
                'dividend_yield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
                'week_52_low': info.get('fiftyTwoWeekLow', 0),
                'week_52_high': info.get('fiftyTwoWeekHigh', 0),
                'avg_volume': info.get('averageVolume', 0),
            }
        except Exception as e:
            logger.error(f"Error fetching info for {ticker}: {e}")
            return {'ticker': ticker, 'name': ticker, 'error': str(e)}
    
    def fetch_realtime_quotes(self, tickers: List[str]) -> pd.DataFrame:
        """Fetch real-time quotes for multiple stocks"""
        try:
            data = yf.download(tickers, period='1d', interval='1m', progress=False)
            return data
        except Exception as e:
            logger.error(f"Error fetching quotes: {e}")
            return pd.DataFrame()
    
    def fetch_sp500_index(self, period: str = '1y') -> pd.DataFrame:
        """Fetch S&P 500 index data"""
        try:
            sp500 = yf.Ticker('^GSPC')
            data = sp500.history(period=period)
            return data
        except Exception as e:
            logger.error(f"Error fetching S&P 500: {e}")
            return pd.DataFrame()
    
    def fetch_sector_performance(self) -> Dict[str, float]:
        """Fetch sector performance"""
        sector_performance = {}
        
        for sector, tickers in self.SECTORS.items():
            try:
                changes = []
                for ticker in tickers[:3]:  # Top 3 from each sector
                    info = self.fetch_stock_info(ticker)
                    if 'day_change' in info:
                        changes.append(info['day_change'])
                
                if changes:
                    sector_performance[sector] = np.mean(changes)
            except Exception as e:
                logger.error(f"Error processing sector {sector}: {e}")
        
        return sector_performance
    
    def _calculate_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """Calculate technical indicators"""
        try:
            # RSI (Relative Strength Index)
            delta = data['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            data['RSI'] = 100 - (100 / (1 + rs))
            
            # Moving Averages
            data['SMA_20'] = data['Close'].rolling(window=20).mean()
            data['SMA_50'] = data['Close'].rolling(window=50).mean()
            data['SMA_200'] = data['Close'].rolling(window=200).mean()
            
            # MACD
            exp1 = data['Close'].ewm(span=12, adjust=False).mean()
            exp2 = data['Close'].ewm(span=26, adjust=False).mean()
            data['MACD'] = exp1 - exp2
            data['Signal'] = data['MACD'].ewm(span=9, adjust=False).mean()
            data['MACD_Histogram'] = data['MACD'] - data['Signal']
            
            # Bollinger Bands
            data['BB_Middle'] = data['Close'].rolling(window=20).mean()
            std = data['Close'].rolling(window=20).std()
            data['BB_Upper'] = data['BB_Middle'] + (std * 2)
            data['BB_Lower'] = data['BB_Middle'] - (std * 2)
            
            # Volatility
            data['Volatility'] = data['Close'].pct_change().rolling(window=20).std() * np.sqrt(252) * 100
            
            # Average Volume
            data['Volume_SMA'] = data['Volume'].rolling(window=20).mean()
            
            # Advanced Indicators
            data['VWAP'] = TechnicalAnalysisAdvanced.calculate_vwap(data)
            data['OBV'] = TechnicalAnalysisAdvanced.calculate_obv(data)
            data['MFI'] = TechnicalAnalysisAdvanced.calculate_mfi(data)
            data['Force_Index'] = TechnicalAnalysisAdvanced.calculate_force_index(data)
            data['AD'] = TechnicalAnalysisAdvanced.calculate_accumulation_distribution(data)
            data['ROC'] = TechnicalAnalysisAdvanced.calculate_roc(data)
            data['Momentum'] = TechnicalAnalysisAdvanced.calculate_momentum(data)
            data['ADX'] = TechnicalAnalysisAdvanced.calculate_adx(data)
            
            # Detect Patterns
            data['Doji'] = TechnicalAnalysisAdvanced.detect_doji(data)
            data['Hammer'] = TechnicalAnalysisAdvanced.detect_hammer(data)
            data['Bullish_Engulfing'] = TechnicalAnalysisAdvanced.detect_bullish_engulfing(data)
            data['Bearish_Engulfing'] = TechnicalAnalysisAdvanced.detect_bearish_engulfing(data)
            
            return data
        except Exception as e:
            logger.error(f"Error calculating indicators: {e}")
            return data
    
    def get_main_stocks(self) -> List[Dict[str, Any]]:
        """Return list of main stocks with basic information"""
        stocks = []
        for ticker in self.MAIN_STOCKS[:15]:  # Top 15
            try:
                info = self.fetch_stock_info(ticker)
                stocks.append(info)
            except Exception as e:
                logger.error(f"Error fetching {ticker}: {e}")
        
        return stocks
    
    def fetch_change_ranking(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Return stock ranking by daily change (half gainers, half losers)"""
        from .cache_service import cache_service
        
        # CACHE: avoid fetching 150+ stocks every time (2 minutes)
        cache_key = f"ranking_raw_{limit}"
        cached = cache_service.get(cache_key)
        if cached:
            logger.info("🚀 Ranking returned from CACHE!")
            return cached
        
        logger.info(f"⏳ Fetching {len(self.MAIN_STOCKS)} stocks (will take ~90s)...")
        stocks = []
        for ticker in self.MAIN_STOCKS:
            try:
                info = self.fetch_stock_info(ticker)
                if 'day_change' in info:
                    stocks.append(info)
            except Exception as e:
                logger.error(f"Error fetching {ticker}: {e}")
        
        # Sort by change (highest to lowest)
        sorted_stocks = sorted(stocks, key=lambda x: x.get('day_change', 0), reverse=True)
        
        # Get half top gainers and half top losers
        half = limit // 2
        top_gainers = sorted_stocks[:half]
        top_losers = sorted_stocks[-half:]
        top_losers.reverse()  # Reverse to show from highest loss to lowest
        
        # Combine: gainers first, then losers
        result = top_gainers + top_losers
        
        # Cache for 2 minutes
        cache_service.set(cache_key, result, ttl_seconds=120)
        logger.info(f"✅ Ranking of {len(result)} stocks cached!")
        
        return result
    
    def calculate_correlations(self, tickers: List[str], period: str = '6mo') -> pd.DataFrame:
        """Calculate correlation matrix between stocks"""
        try:
            data = yf.download(tickers, period=period, progress=False)['Close']
            
            if isinstance(data, pd.Series):
                return pd.DataFrame()
            
            returns = data.pct_change().dropna()
            correlations = returns.corr()
            
            return correlations
        except Exception as e:
            logger.error(f"Error calculating correlations: {e}")
            return pd.DataFrame()


# Global instance
sp500_service = SP500DataService()

