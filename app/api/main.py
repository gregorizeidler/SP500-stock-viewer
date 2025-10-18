"""
Main API - S&P 500 Stock Viewer
Advanced US Stock Visualization System
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from app.services.paper_trading_service import paper_trading_service

logger = logging.getLogger(__name__)

app = FastAPI(
    title="S&P 500 Stock Viewer API",
    description="Advanced US Stock Visualization System",
    version="2.0.0",
)

# CORS - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Start application."""
    logger.info("🚀 S&P 500 Stock Viewer API started")
    logger.info("📊 Server ready to receive requests")


@app.get("/")
def root():
    return {
        "message": "S&P 500 Stock Viewer - US Stock Market API",
        "status": "active",
        "version": "2.0.0",
        "market": "S&P 500 - US Stock Market"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "S&P 500 Stock Viewer API"
    }


# ============= S&P 500 Specific Endpoints =============

@app.get("/api/sp500/stocks/main")
def get_main_sp500_stocks():
    """Returns main S&P 500 stocks with real-time data."""
    from ..services.sp500_data_service import sp500_service
    from ..services.cache_service import cache_service
    
    # Cache for 3 minutes
    cache_key = "main_stocks"
    cached = cache_service.get(cache_key)
    if cached:
        return cached
    
    stocks = sp500_service.get_main_stocks()
    result = {
        "stocks": stocks,
        "total": len(stocks),
        "market": "S&P 500",
        "timestamp": datetime.now().isoformat(),
    }
    
    cache_service.set(cache_key, result, ttl_seconds=180)
    return result


@app.get("/api/sp500/stock/{ticker}")
def get_sp500_stock_data(
    ticker: str,
    period: str = Query(default="1y", regex="^(1d|5d|1mo|3mo|6mo|1y|2y|5y|max)$")
):
    """Returns complete historical data for a US stock."""
    from ..services.sp500_data_service import sp500_service
    
    data = sp500_service.fetch_stock_data(ticker, period)
    info = sp500_service.fetch_stock_info(ticker)
    
    if data.empty:
        raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")
    
    # Convert to JSON format
    data_json = []
    for idx, row in data.iterrows():
        data_json.append({
            "date": idx.strftime("%Y-%m-%d"),
            "open": float(row['Open']) if pd.notna(row['Open']) else None,
            "high": float(row['High']) if pd.notna(row['High']) else None,
            "low": float(row['Low']) if pd.notna(row['Low']) else None,
            "close": float(row['Close']) if pd.notna(row['Close']) else None,
            "volume": int(row['Volume']) if pd.notna(row['Volume']) else None,
            "rsi": float(row['RSI']) if 'RSI' in row and pd.notna(row['RSI']) else None,
            "sma_20": float(row['SMA_20']) if 'SMA_20' in row and pd.notna(row['SMA_20']) else None,
            "sma_50": float(row['SMA_50']) if 'SMA_50' in row and pd.notna(row['SMA_50']) else None,
            "sma_200": float(row['SMA_200']) if 'SMA_200' in row and pd.notna(row['SMA_200']) else None,
            "macd": float(row['MACD']) if 'MACD' in row and pd.notna(row['MACD']) else None,
            "macd_signal": float(row['Signal']) if 'Signal' in row and pd.notna(row['Signal']) else None,
            "bb_upper": float(row['BB_Upper']) if 'BB_Upper' in row and pd.notna(row['BB_Upper']) else None,
            "bb_middle": float(row['BB_Middle']) if 'BB_Middle' in row and pd.notna(row['BB_Middle']) else None,
            "bb_lower": float(row['BB_Lower']) if 'BB_Lower' in row and pd.notna(row['BB_Lower']) else None,
            "volatility": float(row['Volatility']) if 'Volatility' in row and pd.notna(row['Volatility']) else None,
        })
    
    return {
        "ticker": ticker,
        "info": info,
        "data": data_json,
        "period": period,
        "total_records": len(data_json),
    }


@app.get("/api/sp500/index")
def get_sp500_index(period: str = Query(default="1y")):
    """Returns historical data for the S&P 500 index."""
    from ..services.sp500_data_service import sp500_service
    from ..services.cache_service import cache_service
    
    # Cache for 5 minutes by period
    cache_key = f"sp500_index_{period}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached
    
    data = sp500_service.fetch_sp500_index(period)
    
    if data.empty:
        raise HTTPException(status_code=404, detail="S&P 500 index data not available")
    
    data_json = []
    for idx, row in data.iterrows():
        data_json.append({
            "date": idx.strftime("%Y-%m-%d"),
            "close": float(row['Close']),
            "volume": int(row['Volume']) if pd.notna(row['Volume']) else 0,
        })
    
    # Calculate variation
    day_change = 0
    period_change = 0
    if len(data_json) >= 2:
        day_change = ((data_json[-1]['close'] / data_json[-2]['close']) - 1) * 100
        period_change = ((data_json[-1]['close'] / data_json[0]['close']) - 1) * 100
    
    result = {
        "index": "S&P 500",
        "data": data_json,
        "day_change": round(day_change, 2),
        "period_change": round(period_change, 2),
        "period": period,
    }
    
    cache_service.set(cache_key, result, ttl_seconds=300)
    return result


@app.get("/api/sp500/sectors")
def get_sector_performance():
    """Returns performance of S&P 500 sectors."""
    from ..services.sp500_data_service import sp500_service
    from ..services.cache_service import cache_service
    
    # Cache for 5 minutes
    cache_key = "sectors"
    cached = cache_service.get(cache_key)
    if cached:
        return cached
    
    sectors = sp500_service.fetch_sector_performance()
    
    sectors_list = [
        {"sector": sector, "change": round(change, 2)}
        for sector, change in sectors.items()
    ]
    
    # Sort by change
    sectors_list = sorted(sectors_list, key=lambda x: x['change'], reverse=True)
    
    result = {
        "sectors": sectors_list,
        "total": len(sectors_list),
        "timestamp": datetime.now().isoformat(),
    }
    
    cache_service.set(cache_key, result, ttl_seconds=300)
    return result


@app.get("/api/sp500/ranking")
def get_stock_ranking(type: str = Query(default="change", regex="^(change|volume)$")):
    """Returns stock ranking by change or volume."""
    from ..services.sp500_data_service import sp500_service
    from ..services.cache_service import cache_service
    
    # Try cache first (2 minutes)
    cache_key = f"ranking_{type}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached
    
    if type == "change":
        ranking = sp500_service.fetch_change_ranking(limit=20)
    else:
        ranking = sp500_service.get_main_stocks()
        ranking = sorted(ranking, key=lambda x: x.get('volume', 0), reverse=True)[:20]
    
    result = {
        "ranking": ranking,
        "type": type,
        "total": len(ranking),
        "timestamp": datetime.now().isoformat(),
    }
    
    # Cache for 2 minutes
    cache_service.set(cache_key, result, ttl_seconds=120)
    
    return result


@app.get("/api/sp500/correlations")
def get_correlations(
    tickers: str = Query(..., description="Comma-separated tickers (e.g., AAPL,MSFT,GOOGL)"),
    period: str = Query(default="6mo")
):
    """Returns correlation matrix between stocks with advanced data."""
    from ..services.sp500_data_service import sp500_service
    
    ticker_list = [t.strip() for t in tickers.split(',')]
    
    if len(ticker_list) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 tickers")
    
    correlations = sp500_service.calculate_correlations(ticker_list, period)
    
    if correlations.empty:
        raise HTTPException(status_code=404, detail="Could not calculate correlations")
    
    # Convert to JSON format
    correlations_json = {}
    for ticker1 in correlations.columns:
        correlations_json[ticker1] = {}
        for ticker2 in correlations.columns:
            value = correlations.loc[ticker1, ticker2]
            correlations_json[ticker1][ticker2] = round(float(value), 3) if pd.notna(value) else None
    
    # Create correlation pairs for network graph
    pairs = []
    for i, ticker1 in enumerate(ticker_list):
        for ticker2 in ticker_list[i+1:]:
            if ticker1 in correlations.columns and ticker2 in correlations.columns:
                corr = correlations.loc[ticker1, ticker2]
                if pd.notna(corr):
                    pairs.append({
                        'source': ticker1,
                        'target': ticker2,
                        'correlation': round(float(corr), 3),
                        'strength': abs(float(corr))  # For line thickness
                    })
    
    return {
        "correlations": correlations_json,
        "pairs": pairs,
        "tickers": ticker_list,
        "period": period,
    }


@app.get("/api/sp500/comparison")
def get_stock_comparison(
    tickers: str = Query(..., description="Comma-separated tickers"),
    period: str = Query(default="1y")
):
    """Compares performance of multiple stocks."""
    from ..services.sp500_data_service import sp500_service
    
    ticker_list = [t.strip() for t in tickers.split(',')]
    
    if len(ticker_list) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 tickers for comparison")
    
    comparison = {}
    
    for ticker in ticker_list:
        data = sp500_service.fetch_stock_data(ticker, period)
        if not data.empty:
            # Normalize prices (base 100)
            normalized_prices = (data['Close'] / data['Close'].iloc[0]) * 100
            
            comparison[ticker] = {
                "data": [
                    {
                        "date": idx.strftime("%Y-%m-%d"),
                        "normalized_value": round(float(val), 2)
                    }
                    for idx, val in normalized_prices.items()
                ],
                "period_change": round(((data['Close'].iloc[-1] / data['Close'].iloc[0]) - 1) * 100, 2),
            }
    
    return {
        "comparison": comparison,
        "tickers": ticker_list,
        "period": period,
        "base": 100,
    }


# ============= Advanced Analysis Endpoints =============

@app.get("/api/sp500/analysis/score/{ticker}")
def get_technical_score(ticker: str, period: str = Query(default="3mo")):
    """Returns Technical Score and Automatic Recommendation"""
    from ..services.sp500_data_service import sp500_service
    from ..services.technical_analysis_advanced import TechnicalAnalysisAdvanced
    
    data = sp500_service.fetch_stock_data(ticker, period)
    if data.empty:
        raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")
    
    score = TechnicalAnalysisAdvanced.calculate_technical_score(data)
    pivot = TechnicalAnalysisAdvanced.calculate_pivot_points(data)
    anomalies = TechnicalAnalysisAdvanced.detect_anomalies(data)
    support_resistance = TechnicalAnalysisAdvanced.detect_support_resistance(data)
    
    return {
        "ticker": ticker,
        "score": score['score'],
        "recommendation": score['recommendation'],
        "signals": score['signals'],
        "pivot_points": pivot,
        "support": support_resistance['support'],
        "resistance": support_resistance['resistance'],
        "anomalies": anomalies,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/sp500/analysis/patterns/{ticker}")
def get_candle_patterns(ticker: str, period: str = Query(default="1mo")):
    """Detects candlestick patterns"""
    from ..services.sp500_data_service import sp500_service
    
    data = sp500_service.fetch_stock_data(ticker, period)
    if data.empty:
        raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")
    
    # Last 10 days with patterns
    patterns_found = []
    for i in range(max(0, len(data) - 10), len(data)):
        row = data.iloc[i]
        day_patterns = []
    
        if row.get('Doji', False):
            day_patterns.append('Doji')
        if row.get('Hammer', False):
            day_patterns.append('Hammer (Bullish)')
        if row.get('Bullish_Engulfing', False):
            day_patterns.append('Bullish Engulfing')
        if row.get('Bearish_Engulfing', False):
            day_patterns.append('Bearish Engulfing')
    
        if day_patterns:
            patterns_found.append({
                'date': row.name.strftime("%Y-%m-%d"),
                'patterns': day_patterns,
                'price': float(row['Close'])
            })
    
    return {
        "ticker": ticker,
        "patterns": patterns_found,
        "total": len(patterns_found)
    }


@app.get("/api/sp500/analysis/volume-profile/{ticker}")
def get_volume_profile(ticker: str, period: str = Query(default="3mo")):
    """Returns Volume Profile for the stock"""
    from ..services.sp500_data_service import sp500_service
    from ..services.technical_analysis_advanced import TechnicalAnalysisAdvanced
    
    data = sp500_service.fetch_stock_data(ticker, period)
    if data.empty:
        raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")
    
    volume_profile = TechnicalAnalysisAdvanced.calculate_volume_profile(data)
    
    return {
        "ticker": ticker,
        "profile": volume_profile['profile'],
        "poc": volume_profile['poc'],
        "total_volume": volume_profile['total_volume'],
        "period": period
    }


@app.get("/api/sp500/analysis/advanced-indicators/{ticker}")
def get_advanced_indicators(ticker: str, period: str = Query(default="6mo")):
    """Returns all advanced indicators"""
    from ..services.sp500_data_service import sp500_service
    
    data = sp500_service.fetch_stock_data(ticker, period)
    if data.empty:
        raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")
    
    last = data.iloc[-1]
    
    indicators = {
        "ticker": ticker,
        "current_price": float(last['Close']),
        "vwap": float(last.get('VWAP', 0)) if pd.notna(last.get('VWAP')) else None,
        "obv": float(last.get('OBV', 0)) if pd.notna(last.get('OBV')) else None,
        "mfi": float(last.get('MFI', 0)) if pd.notna(last.get('MFI')) else None,
        "force_index": float(last.get('Force_Index', 0)) if pd.notna(last.get('Force_Index')) else None,
        "accumulation_distribution": float(last.get('AD', 0)) if pd.notna(last.get('AD')) else None,
        "roc": float(last.get('ROC', 0)) if pd.notna(last.get('ROC')) else None,
        "momentum": float(last.get('Momentum', 0)) if pd.notna(last.get('Momentum')) else None,
        "adx": float(last.get('ADX', 0)) if pd.notna(last.get('ADX')) else None,
    
        # Time series of last 30 days
        "history": [
            {
                "date": idx.strftime("%Y-%m-%d"),
                "vwap": float(row.get('VWAP', 0)) if pd.notna(row.get('VWAP')) else None,
                "obv": float(row.get('OBV', 0)) if pd.notna(row.get('OBV')) else None,
                "mfi": float(row.get('MFI', 0)) if pd.notna(row.get('MFI')) else None,
                "adx": float(row.get('ADX', 0)) if pd.notna(row.get('ADX')) else None,
            }
            for idx, row in data.tail(30).iterrows()
        ]
    }
    
    return indicators


@app.post("/api/sp500/analysis/comparator")
def compare_stocks_advanced(
    tickers: str = Query(..., description="Comma-separated tickers"),
    period: str = Query(default="1y")
):
    """Compares multiple stocks with advanced metrics"""
    from ..services.sp500_data_service import sp500_service
    from ..services.technical_analysis_advanced import StockComparator
    
    ticker_list = [t.strip() for t in tickers.split(',')]
    
    if len(ticker_list) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 tickers")
    
    stocks_data = {}
    for ticker in ticker_list:
        data = sp500_service.fetch_stock_data(ticker, period)
        if not data.empty:
            stocks_data[ticker] = data
    
    comparison = StockComparator.compare_metrics(stocks_data)
    
    return {
        "comparison": comparison.to_dict(orient='records'),
        "tickers": ticker_list,
        "period": period
    }


@app.get("/api/sp500/analysis/fibonacci/{ticker}")
def get_fibonacci(ticker: str, period: str = Query(default="3mo")):
    """Returns Fibonacci levels, Camarilla and extensions"""
    from ..services.sp500_data_service import sp500_service
    from ..services.technical_analysis_advanced import TechnicalAnalysisAdvanced

    data = sp500_service.fetch_stock_data(ticker, period)
    if data.empty:
        raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")

    fibonacci = TechnicalAnalysisAdvanced.calculate_fibonacci(data)
    
    return {
        "ticker": ticker,
        **fibonacci,
        "period": period,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/sp500/screener")
def stock_screener(
    pe_max: float = Query(default=None),
    rsi_max: float = Query(default=None),
    rsi_min: float = Query(default=None),
    score_min: float = Query(default=None),
    volume_min: float = Query(default=None)
):
    """
    Stock screener with custom filters (with 5-minute cache)
    """
    from ..services.sp500_data_service import sp500_service
    from ..services.technical_analysis_advanced import TechnicalAnalysisAdvanced
    from ..services.cache_service import cache_service
    
    # Create unique key for this filter
    cache_key = f"screener_{pe_max}_{rsi_max}_{rsi_min}_{score_min}_{volume_min}"
    
    # Check cache (5 minutes)
    cached = cache_service.get(cache_key)
    if cached is not None:
        logger.info(f"📦 Screener returned from cache")
        return cached
    
    logger.info(f"🔍 Processing Screener (no cache)...")
    results = []
    
    # Fetch only 15 stocks to avoid taking too long
    stocks_to_analyze = sp500_service.MAIN_STOCKS[:15]
    
    for ticker in stocks_to_analyze:
        try:
            data = sp500_service.fetch_stock_data(ticker, '3mo')
            
            if data.empty or len(data) < 20:
                continue
            
            info = sp500_service.fetch_stock_info(ticker)
            last = data.iloc[-1]
            
            # Extract values with protection against None/NaN
            pe_value = float(info.get('pe_ratio', 0)) if info.get('pe_ratio') and pd.notna(info.get('pe_ratio')) else 999999
            rsi_value = float(last.get('RSI', 50)) if pd.notna(last.get('RSI')) else 50
            volume_value = float(last.get('Volume', 0)) if pd.notna(last.get('Volume')) else 0
            
            # Apply filters
            if pe_max and pe_value > pe_max:
                continue
            if rsi_max and rsi_value > rsi_max:
                continue
            if rsi_min and rsi_value < rsi_min:
                continue
            if volume_min and volume_value < volume_min:
                continue
            
            # Calculate score
            score_data = TechnicalAnalysisAdvanced.calculate_technical_score(data)
            
            if score_min and score_data['score'] < score_min:
                continue
            
            results.append({
                'ticker': str(ticker),
                'name': str(info.get('name', ticker)),
                'price': float(info.get('current_price', 0)) if info.get('current_price') else 0.0,
                'pe_ratio': float(pe_value) if pe_value < 999999 else 0.0,
                'rsi': float(rsi_value),
                'score': float(score_data['score']),
                'recommendation': str(score_data['recommendation']),
                'volume': float(volume_value)
            })
            
        except Exception as e:
            logger.error(f"❌ Error analyzing {ticker} in screener: {e}")
            continue
    
    # Sort by score
    results = sorted(results, key=lambda x: x['score'], reverse=True)
    
    response = {
        "results": results,
        "total": len(results),
        "filters_applied": {
            "pe_max": pe_max,
            "rsi_max": rsi_max,
            "rsi_min": rsi_min,
            "score_min": score_min,
            "volume_min": volume_min
        }
    }
    
    # Cache result for 5 minutes (300 seconds)
    cache_service.set(cache_key, response, ttl=300)
    logger.info(f"✅ Screener processed and cached: {len(results)} results")
    
    return response


@app.get("/api/sp500/heatmap/market-cap")
def get_heatmap_market_cap():
    """Returns data for Market Cap Treemap"""
    from ..services.sp500_data_service import sp500_service

    stocks = sp500_service.get_main_stocks()

    # Group by sector
    sectors_data = {}
    for stock in stocks:
        sector = stock.get('sector', 'Others')
        if sector not in sectors_data:
            sectors_data[sector] = []

        sectors_data[sector].append({
            'ticker': stock['ticker'],
            'name': stock['name'],
            'market_cap': stock.get('market_cap', 0),
            'change': stock.get('day_change', 0),
            'price': stock.get('current_price', 0)
        })
    
    return {
        "sectors": sectors_data,
        "total_stocks": len(stocks)
    }


# ============= Paper Trading Endpoints =============

@app.get("/api/paper-trading/portfolio/{user_id}")
def get_paper_trading_portfolio(user_id: str):
    """Returns user's paper trading portfolio"""
    portfolio = paper_trading_service.get_portfolio(user_id)
    return portfolio


@app.post("/api/paper-trading/buy")
def buy_stock_paper_trading(
    user_id: str = Query(...),
    ticker: str = Query(...),
    quantity: int = Query(...),
    price: float = Query(...)
):
    """Simulates stock purchase"""
    result = paper_trading_service.buy_stock(user_id, ticker, quantity, price)
    return result


@app.post("/api/paper-trading/sell")
def sell_stock_paper_trading(
    user_id: str = Query(...),
    ticker: str = Query(...),
    quantity: int = Query(...),
    price: float = Query(...)
):
    """Simulates stock sale"""
    result = paper_trading_service.sell_stock(user_id, ticker, quantity, price)
    return result


@app.get("/api/paper-trading/equity/{user_id}")
def get_paper_trading_equity(user_id: str, tickers: str = Query(default="")):
    """Calculates total portfolio equity"""
    from ..services.paper_trading_service import paper_trading_service
    from ..services.sp500_data_service import sp500_service
    
    portfolio = paper_trading_service.get_portfolio(user_id)
    
    # Fetch current prices
    current_prices = {}
    for ticker in portfolio['positions'].keys():
        try:
            info = sp500_service.fetch_stock_info(ticker)
            current_prices[ticker] = info.get('current_price', 0)
        except:
            current_prices[ticker] = portfolio['positions'][ticker]['avg_price']
    
    equity = paper_trading_service.calculate_equity(user_id, current_prices)
    return equity


@app.post("/api/paper-trading/reset/{user_id}")
def reset_paper_trading_portfolio(user_id: str):
    """Resets portfolio to initial state"""
    result = paper_trading_service.reset_portfolio(user_id)
    return result


# ============= WebSocket - Live Market Feed =============

@app.websocket("/ws/market-feed")
async def websocket_market_feed(websocket: WebSocket):
    """
    WebSocket for real-time market feed
    Continuously sends buy/sell/price change events
    """
    await websocket.accept()
    logger.info("🔌 Client connected to Market Feed")
    
    try:
        from ..services.market_feed_service import market_feed_service
        await market_feed_service.stream_events(websocket)
    
    except WebSocketDisconnect:
        logger.info("🔌 Client disconnected from Market Feed")
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
