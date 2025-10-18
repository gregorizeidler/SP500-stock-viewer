"""
Simple In-Memory Cache Service
Caches results from heavy calls for a few minutes
"""

from datetime import datetime, timedelta
from typing import Any, Optional, Dict
import threading

class CacheService:
    """Simple in-memory cache with TTL"""
    
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
    
    def get(self, key: str) -> Optional[Any]:
        """Retrieve value from cache"""
        with self._lock:
            if key in self._cache:
                entry = self._cache[key]
                if datetime.now() < entry['expires_at']:
                    return entry['value']
                else:
                    # Expired, remove it
                    del self._cache[key]
            return None
    
    def set(self, key: str, value: Any, ttl_seconds: int = 300, ttl: int = None):
        """Save value to cache with TTL (default 5 minutes)"""
        # Support both ttl_seconds and ttl parameter names
        if ttl is not None:
            ttl_seconds = ttl
            
        with self._lock:
            self._cache[key] = {
                'value': value,
                'expires_at': datetime.now() + timedelta(seconds=ttl_seconds)
            }
    
    def clear(self, pattern: Optional[str] = None):
        """Clear cache (total or by pattern)"""
        with self._lock:
            if pattern:
                keys_to_delete = [k for k in self._cache.keys() if pattern in k]
                for key in keys_to_delete:
                    del self._cache[key]
            else:
                self._cache.clear()
    
    def cleanup_expired(self):
        """Remove expired entries"""
        with self._lock:
            now = datetime.now()
            keys_to_delete = [
                key for key, entry in self._cache.items()
                if now >= entry['expires_at']
            ]
            for key in keys_to_delete:
                del self._cache[key]


# Global instance
cache_service = CacheService()
