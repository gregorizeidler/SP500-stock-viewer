"""
Real-Time Market Feed Service
Simulates market events and sends via WebSocket
"""

import random
import asyncio
from datetime import datetime
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class MarketFeedService:
    """Generates real-time market events"""
    
    # Main stocks to generate events for
    TICKERS = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 
        'TSLA', 'META', 'JPM', 'V', 'WMT',
        'UNH', 'JNJ', 'XOM', 'PG', 'HD'
    ]
    
    EVENT_TYPES = [
        'buy_order',      # New buy order
        'sell_order',     # New sell order
        'execution',      # Order execution
        'market_depth',   # Market depth update
        'price_change',   # Price change
        'volume_spike',   # Volume spike
    ]
    
    @staticmethod
    def generate_event() -> Dict[str, Any]:
        """Generate a random market event"""
        ticker = random.choice(MarketFeedService.TICKERS)
        event_type = random.choice(MarketFeedService.EVENT_TYPES)
        timestamp = datetime.now().strftime("%I:%M:%S %p")
        
        # Price variation (-5% to +5%)
        variation = round(random.uniform(-5, 5), 2)
        positive = variation >= 0
        
        # Base price (between $10 and $500)
        price = round(random.uniform(10, 500), 2)
        
        # Volume (between 10 and 1000 shares)
        quantity = random.randint(10, 1000)
        volume_k = random.randint(100, 999)
        
        event = {
            'id': f"{ticker}_{int(datetime.now().timestamp() * 1000)}",
            'ticker': ticker,
            'type': event_type,
            'timestamp': timestamp,
            'variation': variation,
            'positive': positive,
        }
        
        # Set message and specific data by type
        if event_type == 'buy_order':
            event['message'] = f"New BUY order"
            event['details'] = f"{quantity} shares at ${price:.2f}"
            
        elif event_type == 'sell_order':
            event['message'] = f"New SELL order"
            event['details'] = f"{quantity} shares at ${price:.2f}"
            
        elif event_type == 'execution':
            event['message'] = f"Executed {quantity} shares"
            event['details'] = f"Avg price: ${price:.2f}"
            
        elif event_type == 'market_depth':
            event['message'] = f"Market depth"
            event['details'] = f"Volume: {volume_k}k shares"
            
        elif event_type == 'price_change':
            event['message'] = f"Price change"
            event['details'] = f"New price: ${price:.2f}"
            
        elif event_type == 'volume_spike':
            event['message'] = f"Volume spike detected"
            event['details'] = f"Volume: {volume_k * 2}k shares (+{random.randint(50, 200)}%)"
        
        return event
    
    @staticmethod
    async def stream_events(websocket, interval: float = 2.0):
        """
        Send events continuously via WebSocket
        
        Args:
            websocket: WebSocket connection
            interval: Seconds between events (default: 2s)
        """
        try:
            while True:
                event = MarketFeedService.generate_event()
                await websocket.send_json(event)
                logger.info(f"📡 Event sent: {event['ticker']} - {event['type']}")
                
                # Random interval between events (1-4 seconds)
                await asyncio.sleep(random.uniform(1.0, 4.0))
                
        except Exception as e:
            logger.error(f"Error in event stream: {e}")


market_feed_service = MarketFeedService()
