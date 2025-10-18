"""
Advanced Technical Analysis Module
Indicators, Patterns and Sophisticated Analysis
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class TechnicalAnalysisAdvanced:
    """Class for advanced technical analysis"""
    
    @staticmethod
    def calculate_vwap(data: pd.DataFrame) -> pd.Series:
        """Calculate VWAP (Volume Weighted Average Price)"""
        typical_price = (data['High'] + data['Low'] + data['Close']) / 3
        vwap = (typical_price * data['Volume']).cumsum() / data['Volume'].cumsum()
        return vwap
    
    @staticmethod
    def calculate_fibonacci(data: pd.DataFrame) -> Dict[str, Any]:
        """Calculate Fibonacci retracements and extensions"""
        if len(data) < 2:
            return {}
        
        # Find max and min for the period
        max_price = data['High'].max()
        min_price = data['Low'].min()
        diff = max_price - min_price
        
        # Fibonacci levels (retracements)
        retracement_levels = {
            '0.0%': float(max_price),
            '23.6%': float(max_price - (diff * 0.236)),
            '38.2%': float(max_price - (diff * 0.382)),
            '50.0%': float(max_price - (diff * 0.500)),
            '61.8%': float(max_price - (diff * 0.618)),
            '78.6%': float(max_price - (diff * 0.786)),
            '100.0%': float(min_price)
        }
        
        # Fibonacci extensions
        extension_levels = {
            '161.8%': float(max_price + (diff * 0.618)),
            '261.8%': float(max_price + (diff * 1.618)),
            '423.6%': float(max_price + (diff * 3.236))
        }
        
        # Camarilla points (R1-R4, S1-S4)
        last = data.iloc[-1]
        close = last['Close']
        high = last['High']
        low = last['Low']
        
        diff_hl = high - low
        
        camarilla = {
            'R4': float(close + (diff_hl * 1.1) / 2),
            'R3': float(close + (diff_hl * 1.1) / 4),
            'R2': float(close + (diff_hl * 1.1) / 6),
            'R1': float(close + (diff_hl * 1.1) / 12),
            'PP': float((high + low + close) / 3),
            'S1': float(close - (diff_hl * 1.1) / 12),
            'S2': float(close - (diff_hl * 1.1) / 6),
            'S3': float(close - (diff_hl * 1.1) / 4),
            'S4': float(close - (diff_hl * 1.1) / 2)
        }
        
        return {
            'retracements': retracement_levels,
            'extensions': extension_levels,
            'camarilla': camarilla,
            'max_price': float(max_price),
            'min_price': float(min_price),
            'current_price': float(close)
        }
    
    @staticmethod
    def calculate_obv(data: pd.DataFrame) -> pd.Series:
        """Calculate OBV (On Balance Volume)"""
        obv = pd.Series(index=data.index, dtype=float)
        obv.iloc[0] = data['Volume'].iloc[0]
        
        for i in range(1, len(data)):
            if data['Close'].iloc[i] > data['Close'].iloc[i-1]:
                obv.iloc[i] = obv.iloc[i-1] + data['Volume'].iloc[i]
            elif data['Close'].iloc[i] < data['Close'].iloc[i-1]:
                obv.iloc[i] = obv.iloc[i-1] - data['Volume'].iloc[i]
            else:
                obv.iloc[i] = obv.iloc[i-1]
        
        return obv
    
    @staticmethod
    def calculate_mfi(data: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculate MFI (Money Flow Index)"""
        typical_price = (data['High'] + data['Low'] + data['Close']) / 3
        money_flow = typical_price * data['Volume']
        
        positive_flow = pd.Series(0, index=data.index)
        negative_flow = pd.Series(0, index=data.index)
        
        for i in range(1, len(data)):
            if typical_price.iloc[i] > typical_price.iloc[i-1]:
                positive_flow.iloc[i] = money_flow.iloc[i]
            elif typical_price.iloc[i] < typical_price.iloc[i-1]:
                negative_flow.iloc[i] = money_flow.iloc[i]
        
        positive_mf = positive_flow.rolling(window=period).sum()
        negative_mf = negative_flow.rolling(window=period).sum()
        
        mfi = 100 - (100 / (1 + (positive_mf / negative_mf)))
        return mfi
    
    @staticmethod
    def calculate_force_index(data: pd.DataFrame, period: int = 13) -> pd.Series:
        """Calculate Force Index"""
        force = (data['Close'] - data['Close'].shift(1)) * data['Volume']
        force_ema = force.ewm(span=period, adjust=False).mean()
        return force_ema
    
    @staticmethod
    def calculate_accumulation_distribution(data: pd.DataFrame) -> pd.Series:
        """Calculate Accumulation/Distribution Line"""
        clv = ((data['Close'] - data['Low']) - (data['High'] - data['Close'])) / (data['High'] - data['Low'])
        clv = clv.fillna(0)
        ad = (clv * data['Volume']).cumsum()
        return ad
    
    @staticmethod
    def calculate_roc(data: pd.DataFrame, period: int = 12) -> pd.Series:
        """Calculate Rate of Change"""
        roc = ((data['Close'] - data['Close'].shift(period)) / data['Close'].shift(period)) * 100
        return roc
    
    @staticmethod
    def calculate_momentum(data: pd.DataFrame, period: int = 10) -> pd.Series:
        """Calculate Momentum"""
        momentum = data['Close'] - data['Close'].shift(period)
        return momentum
    
    @staticmethod
    def calculate_adx(data: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculate ADX (Average Directional Index)"""
        high = data['High']
        low = data['Low']
        close = data['Close']
        
        plus_dm = high.diff()
        minus_dm = low.diff()
        plus_dm[plus_dm < 0] = 0
        minus_dm[minus_dm > 0] = 0
        minus_dm = abs(minus_dm)
        
        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean()
        
        plus_di = 100 * (plus_dm.rolling(window=period).mean() / atr)
        minus_di = 100 * (minus_dm.rolling(window=period).mean() / atr)
        
        dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di)
        adx = dx.rolling(window=period).mean()
        
        return adx
    
    @staticmethod
    def detect_doji(data: pd.DataFrame) -> pd.Series:
        """Detect Doji pattern"""
        body = abs(data['Close'] - data['Open'])
        total_range = data['High'] - data['Low']
        doji = (body / total_range < 0.1) & (total_range > 0)
        return doji
    
    @staticmethod
    def detect_hammer(data: pd.DataFrame) -> pd.Series:
        """Detect Hammer pattern"""
        body = abs(data['Close'] - data['Open'])
        lower_shadow = data[['Open', 'Close']].min(axis=1) - data['Low']
        upper_shadow = data['High'] - data[['Open', 'Close']].max(axis=1)
        
        hammer = (
            (lower_shadow > 2 * body) &
            (upper_shadow < body * 0.3) &
            (data['Close'] > data['Open'])
        )
        return hammer
    
    @staticmethod
    def detect_bullish_engulfing(data: pd.DataFrame) -> pd.Series:
        """Detect Bullish Engulfing pattern"""
        prev_red = data['Close'].shift(1) < data['Open'].shift(1)
        curr_green = data['Close'] > data['Open']
        engulfing = (
            prev_red & curr_green &
            (data['Open'] < data['Close'].shift(1)) &
            (data['Close'] > data['Open'].shift(1))
        )
        return engulfing
    
    @staticmethod
    def detect_bearish_engulfing(data: pd.DataFrame) -> pd.Series:
        """Detect Bearish Engulfing pattern"""
        prev_green = data['Close'].shift(1) > data['Open'].shift(1)
        curr_red = data['Close'] < data['Open']
        engulfing = (
            prev_green & curr_red &
            (data['Open'] > data['Close'].shift(1)) &
            (data['Close'] < data['Open'].shift(1))
        )
        return engulfing
    
    @staticmethod
    def calculate_pivot_points(data: pd.DataFrame) -> Dict[str, float]:
        """Calculate Pivot Points (S1, S2, S3, R1, R2, R3)"""
        last = data.iloc[-1]
        high = last['High']
        low = last['Low']
        close = last['Close']
        
        pivot = (high + low + close) / 3
        
        r1 = 2 * pivot - low
        r2 = pivot + (high - low)
        r3 = high + 2 * (pivot - low)
        
        s1 = 2 * pivot - high
        s2 = pivot - (high - low)
        s3 = low - 2 * (high - pivot)
        
        return {
            'pivot': pivot,
            'r1': r1, 'r2': r2, 'r3': r3,
            's1': s1, 's2': s2, 's3': s3
        }
    
    @staticmethod
    def detect_support_resistance(data: pd.DataFrame, window: int = 20) -> Dict[str, List[float]]:
        """Detect support and resistance levels"""
        highs = data['High'].rolling(window=window, center=True).max()
        lows = data['Low'].rolling(window=window, center=True).min()
        
        resistance_levels = []
        support_levels = []
        
        for i in range(window, len(data) - window):
            if data['High'].iloc[i] == highs.iloc[i]:
                resistance_levels.append(data['High'].iloc[i])
            if data['Low'].iloc[i] == lows.iloc[i]:
                support_levels.append(data['Low'].iloc[i])
        
        # Group nearby levels
        resistance_levels = list(set([round(r, 2) for r in resistance_levels]))
        support_levels = list(set([round(s, 2) for s in support_levels]))
        
        return {
            'resistance': sorted(resistance_levels, reverse=True)[:5],
            'support': sorted(support_levels, reverse=True)[:5]
        }
    
    @staticmethod
    def calculate_technical_score(data: pd.DataFrame) -> Dict[str, Any]:
        """Calculate Overall Technical Score (0-100)"""
        last = data.iloc[-1]
        
        scores = []
        signals = []
        
        # RSI Score
        rsi = last.get('RSI', 50)
        if rsi < 30:
            scores.append(100)
            signals.append('RSI Oversold (BUY)')
        elif rsi > 70:
            scores.append(0)
            signals.append('RSI Overbought (SELL)')
        else:
            scores.append(50)
            signals.append('RSI Neutral')
        
        # MACD Score
        macd = last.get('MACD', 0)
        macd_signal = last.get('Signal', 0)
        if macd > macd_signal:
            scores.append(75)
            signals.append('MACD Positive (BUY)')
        else:
            scores.append(25)
            signals.append('MACD Negative (SELL)')
        
        # Moving Averages
        close = last['Close']
        sma_20 = last.get('SMA_20', close)
        sma_50 = last.get('SMA_50', close)
        
        if close > sma_20 > sma_50:
            scores.append(100)
            signals.append('Uptrend')
        elif close < sma_20 < sma_50:
            scores.append(0)
            signals.append('Downtrend')
        else:
            scores.append(50)
            signals.append('Sideways Trend')
        
        # Volume
        current_volume = last['Volume']
        avg_volume = data['Volume'].rolling(20).mean().iloc[-1]
        if current_volume > avg_volume * 1.5:
            scores.append(75)
            signals.append('High Volume')
        elif current_volume < avg_volume * 0.5:
            scores.append(25)
            signals.append('Low Volume')
        else:
            scores.append(50)
            signals.append('Normal Volume')
        
        final_score = sum(scores) / len(scores)
        
        if final_score >= 75:
            recommendation = 'STRONG BUY 🟢🟢'
        elif final_score >= 60:
            recommendation = 'BUY 🟢'
        elif final_score >= 40:
            recommendation = 'NEUTRAL 🟡'
        elif final_score >= 25:
            recommendation = 'SELL 🔴'
        else:
            recommendation = 'STRONG SELL 🔴🔴'
        
        return {
            'score': round(final_score, 1),
            'recommendation': recommendation,
            'signals': signals
        }
    
    @staticmethod
    def detect_anomalies(data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detect anomalies in stock behavior"""
        anomalies = []
        
        if len(data) < 20:
            return anomalies
        
        last = data.iloc[-1]
        
        # Abnormal volume
        avg_volume = data['Volume'].rolling(20).mean().iloc[-2]
        current_volume = last['Volume']
        if current_volume > avg_volume * 3:
            anomalies.append({
                'type': 'HIGH_VOLUME',
                'message': f'Volume 3x above average! ({current_volume/1e6:.1f}M vs {avg_volume/1e6:.1f}M)',
                'severity': 'high'
            })
        
        # Opening gap
        prev_close = data['Close'].iloc[-2]
        current_open = last['Open']
        gap_pct = abs((current_open - prev_close) / prev_close) * 100
        if gap_pct > 5:
            anomalies.append({
                'type': 'GAP',
                'message': f'{gap_pct:.1f}% gap at opening!',
                'severity': 'high'
            })
        
        # Sudden volatility
        avg_volatility = data['Close'].pct_change().rolling(20).std().iloc[-2]
        current_volatility = abs(data['Close'].pct_change().iloc[-1])
        if current_volatility > avg_volatility * 3:
            anomalies.append({
                'type': 'VOLATILITY',
                'message': f'Volatility 3x above normal!',
                'severity': 'medium'
            })
        
        # Extreme intraday variation
        intraday_variation = ((last['High'] - last['Low']) / last['Low']) * 100
        if intraday_variation > 10:
            anomalies.append({
                'type': 'INTRADAY_VARIATION',
                'message': f'Intraday variation of {intraday_variation:.1f}%!',
                'severity': 'medium'
            })
        
        return anomalies
    
    @staticmethod
    def calculate_volume_profile(data: pd.DataFrame, bins: int = 20) -> Dict[str, Any]:
        """Calculate Volume Profile"""
        price_min = data['Low'].min()
        price_max = data['High'].max()
        
        price_bins = np.linspace(price_min, price_max, bins + 1)
        volume_at_price = np.zeros(bins)
        
        for _, row in data.iterrows():
            typical_price = (row['High'] + row['Low'] + row['Close']) / 3
            bin_idx = np.digitize(typical_price, price_bins) - 1
            if 0 <= bin_idx < bins:
                volume_at_price[bin_idx] += row['Volume']
        
        # Find POC (Point of Control) - price with highest volume
        poc_idx = np.argmax(volume_at_price)
        poc_price = (price_bins[poc_idx] + price_bins[poc_idx + 1]) / 2
        
        profile = [
            {
                'price_min': float(price_bins[i]),
                'price_max': float(price_bins[i + 1]),
                'volume': float(volume_at_price[i])
            }
            for i in range(bins)
        ]
        
        return {
            'profile': profile,
            'poc': float(poc_price),
            'total_volume': float(data['Volume'].sum())
        }


class StockComparator:
    """Class to compare multiple stocks"""
    
    @staticmethod
    def calculate_sharpe_ratio(returns: pd.Series, rf_rate: float = 0.04) -> float:
        """Calculate Sharpe Ratio - always returns a valid number"""
        try:
            # Check if we have enough data
            if returns is None or len(returns) < 2:
                return 0.0
            
            # Remove null values
            clean_returns = returns.dropna()
            if len(clean_returns) < 2:
                return 0.0
            
            avg_return = clean_returns.mean() * 252  # Annualized
            volatility = clean_returns.std() * np.sqrt(252)  # Annualized
            
            # Check if volatility is valid
            if volatility <= 0 or pd.isna(volatility):
                return 0.0
            
            sharpe = (avg_return - rf_rate) / volatility
            
            # Ensure it's not NaN or infinite
            if pd.isna(sharpe) or np.isinf(sharpe):
                return 0.0
            
            return float(sharpe)
        except Exception as e:
            logger.error(f"Error calculating Sharpe Ratio: {e}")
            return 0.0
    
    @staticmethod
    def calculate_beta(stock_returns: pd.Series, market_returns: pd.Series) -> float:
        """Calculate Beta relative to market"""
        covariance = stock_returns.cov(market_returns)
        market_variance = market_returns.var()
        beta = covariance / market_variance if market_variance > 0 else 1
        return beta
    
    @staticmethod
    def compare_metrics(stocks_data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Compare metrics of multiple stocks - always returns valid values"""
        results = []
        
        for ticker, data in stocks_data.items():
            if len(data) < 20:
                continue
            
            try:
                returns = data['Close'].pct_change().dropna()
                
                # Calculate each metric with error handling
                total_return = 0.0
                try:
                    total_return = float(((data['Close'].iloc[-1] / data['Close'].iloc[0]) - 1) * 100)
                    if pd.isna(total_return) or np.isinf(total_return):
                        total_return = 0.0
                except:
                    total_return = 0.0
                
                volatility = 0.0
                try:
                    volatility = float(returns.std() * np.sqrt(252) * 100)
                    if pd.isna(volatility) or np.isinf(volatility):
                        volatility = 0.0
                except:
                    volatility = 0.0
                
                sharpe_ratio = StockComparator.calculate_sharpe_ratio(returns)
                
                max_drawdown = 0.0
                try:
                    max_drawdown = float(((data['Close'].cummax() - data['Close']) / data['Close'].cummax()).max() * 100)
                    if pd.isna(max_drawdown) or np.isinf(max_drawdown):
                        max_drawdown = 0.0
                except:
                    max_drawdown = 0.0
                
                current_price = 0.0
                try:
                    current_price = float(data['Close'].iloc[-1])
                    if pd.isna(current_price) or np.isinf(current_price):
                        current_price = 0.0
                except:
                    current_price = 0.0
                
                metrics = {
                    'ticker': ticker,
                    'total_return': total_return,
                    'volatility': volatility,
                    'sharpe_ratio': sharpe_ratio,
                    'max_drawdown': max_drawdown,
                    'current_price': current_price
                }
                results.append(metrics)
                
            except Exception as e:
                logger.error(f"Error calculating metrics for {ticker}: {e}")
                # Add default values in case of total error
                metrics = {
                    'ticker': ticker,
                    'total_return': 0.0,
                    'volatility': 0.0,
                    'sharpe_ratio': 0.0,
                    'max_drawdown': 0.0,
                    'current_price': 0.0
                }
                results.append(metrics)
        
        return pd.DataFrame(results)

