"""
Paper Trading Service (Portfolio Simulation)
Allows buying/selling stocks without real money
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any
from pathlib import Path

# File to persist portfolios
PORTFOLIOS_FILE = Path("paper_trading_portfolios.json")

class PaperTradingService:
    """Manages paper trading portfolios"""
    
    def __init__(self):
        self.portfolios = self._load_portfolios()
    
    def _load_portfolios(self) -> Dict:
        """Load portfolios from file"""
        if PORTFOLIOS_FILE.exists():
            with open(PORTFOLIOS_FILE, 'r') as f:
                return json.load(f)
        return {}
    
    def _save_portfolios(self):
        """Save portfolios to file"""
        with open(PORTFOLIOS_FILE, 'w') as f:
            json.dump(self.portfolios, f, indent=2)
    
    def create_portfolio(self, user_id: str, initial_capital: float = 100000.0) -> Dict:
        """Create a new portfolio"""
        if user_id in self.portfolios:
            return {"error": "Portfolio already exists"}
        
        self.portfolios[user_id] = {
            'initial_capital': initial_capital,
            'available_balance': initial_capital,
            'positions': {},
            'history': [],
            'created_at': datetime.now().isoformat()
        }
        self._save_portfolios()
        
        return self.portfolios[user_id]
    
    def get_portfolio(self, user_id: str) -> Dict:
        """Return user's portfolio"""
        if user_id not in self.portfolios:
            # Automatically create portfolio
            return self.create_portfolio(user_id)
        return self.portfolios[user_id]
    
    def buy_stock(self, user_id: str, ticker: str, quantity: int, price: float) -> Dict:
        """Simulate stock purchase"""
        portfolio = self.get_portfolio(user_id)
        
        total_cost = quantity * price
        
        if total_cost > portfolio['available_balance']:
            return {"error": "Insufficient balance"}
        
        # Update balance
        portfolio['available_balance'] -= total_cost
        
        # Update position
        if ticker in portfolio['positions']:
            pos = portfolio['positions'][ticker]
            # Weighted average
            total_shares = pos['quantity'] + quantity
            avg_price = ((pos['avg_price'] * pos['quantity']) + (price * quantity)) / total_shares
            pos['quantity'] = total_shares
            pos['avg_price'] = avg_price
        else:
            portfolio['positions'][ticker] = {
                'quantity': quantity,
                'avg_price': price,
                'bought_at': datetime.now().isoformat()
            }
        
        # Record in history
        portfolio['history'].append({
            'type': 'BUY',
            'ticker': ticker,
            'quantity': quantity,
            'price': price,
            'total': total_cost,
            'date': datetime.now().isoformat()
        })
        
        self._save_portfolios()
        
        return {
            "success": True,
            "message": f"Bought {quantity}x {ticker} at ${price:.2f}",
            "portfolio": portfolio
        }
    
    def sell_stock(self, user_id: str, ticker: str, quantity: int, price: float) -> Dict:
        """Simulate stock sale"""
        portfolio = self.get_portfolio(user_id)
        
        if ticker not in portfolio['positions']:
            return {"error": "You don't own this stock"}
        
        pos = portfolio['positions'][ticker]
        
        if quantity > pos['quantity']:
            return {"error": f"You only own {pos['quantity']} shares"}
        
        sale_value = quantity * price
        profit = (price - pos['avg_price']) * quantity
        
        # Update balance
        portfolio['available_balance'] += sale_value
        
        # Update position
        pos['quantity'] -= quantity
        if pos['quantity'] == 0:
            del portfolio['positions'][ticker]
        
        # Record in history
        portfolio['history'].append({
            'type': 'SELL',
            'ticker': ticker,
            'quantity': quantity,
            'price': price,
            'total': sale_value,
            'profit': profit,
            'date': datetime.now().isoformat()
        })
        
        self._save_portfolios()
        
        return {
            "success": True,
            "message": f"Sold {quantity}x {ticker} at ${price:.2f}",
            "profit": profit,
            "portfolio": portfolio
        }
    
    def calculate_equity(self, user_id: str, current_prices: Dict[str, float]) -> Dict:
        """Calculate total portfolio equity"""
        portfolio = self.get_portfolio(user_id)
        
        positions_value = 0
        position_details = []
        
        for ticker, pos in portfolio['positions'].items():
            current_price = current_prices.get(ticker, pos['avg_price'])
            total_value = pos['quantity'] * current_price
            profit = (current_price - pos['avg_price']) * pos['quantity']
            profit_pct = ((current_price / pos['avg_price']) - 1) * 100
            
            positions_value += total_value
            
            position_details.append({
                'ticker': ticker,
                'quantity': pos['quantity'],
                'avg_price': pos['avg_price'],
                'current_price': current_price,
                'total_value': total_value,
                'profit': profit,
                'profit_pct': profit_pct
            })
        
        total_equity = portfolio['available_balance'] + positions_value
        return_pct = ((total_equity / portfolio['initial_capital']) - 1) * 100
        
        return {
            'total_equity': total_equity,
            'available_balance': portfolio['available_balance'],
            'positions_value': positions_value,
            'initial_capital': portfolio['initial_capital'],
            'return_pct': return_pct,
            'positions': position_details
        }
    
    def reset_portfolio(self, user_id: str) -> Dict:
        """Reset portfolio to initial state"""
        if user_id in self.portfolios:
            capital = self.portfolios[user_id]['initial_capital']
            del self.portfolios[user_id]
            self._save_portfolios()
            return self.create_portfolio(user_id, capital)
        return {"error": "Portfolio not found"}


# Global instance
paper_trading_service = PaperTradingService()
