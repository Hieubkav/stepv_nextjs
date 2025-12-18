# API Key Fallback Strategy

## Tổng quan

Khi sử dụng Free Tier, việc sử dụng nhiều API keys với fallback strategy giúp:
- Tăng throughput tổng thể
- Tránh service interruption
- Load balancing giữa các keys

## Kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                    Application                          │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   GeminiPool                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │  API Keys: [key1, key2, key3, key4, key5]       │   │
│  │  Failed Keys: {2, 4}                            │   │
│  │  Retry After: {2: 1702123456, 4: 1702123789}    │   │
│  │  Current Index: 0                               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
     ┌────────┐      ┌────────┐      ┌────────┐
     │ Key 1  │      │ Key 3  │      │ Key 5  │
     │  OK    │      │  OK    │      │  OK    │
     └────────┘      └────────┘      └────────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
               ┌──────────────────┐
               │   Gemini API     │
               └──────────────────┘
```

## Các chiến lược Fallback

### 1. Round Robin (Khuyến nghị)

Rotate qua tất cả keys theo thứ tự, skip keys đang rate limited.

```python
class RoundRobinPool:
    def __init__(self, api_keys):
        self.clients = [genai.Client(api_key=k) for k in api_keys]
        self.current = 0
        self.failed = set()
    
    def get_next(self):
        attempts = len(self.clients)
        while attempts > 0:
            if self.current not in self.failed:
                client = self.clients[self.current]
                self.current = (self.current + 1) % len(self.clients)
                return client
            self.current = (self.current + 1) % len(self.clients)
            attempts -= 1
        raise Exception("All keys exhausted")
```

**Ưu điểm**: Phân tải đều, đơn giản
**Nhược điểm**: Không tối ưu nếu một số keys có quota cao hơn

### 2. Weighted Round Robin

Gán weight cho mỗi key dựa trên quota/tier.

```python
class WeightedPool:
    def __init__(self, api_keys_with_weights):
        # [(key1, 3), (key2, 1), (key3, 2)]
        self.pool = []
        for key, weight in api_keys_with_weights:
            for _ in range(weight):
                self.pool.append(genai.Client(api_key=key))
        self.current = 0
```

**Use case**: Khi có mix free/paid keys

### 3. Primary-Backup

Dùng primary key cho đến khi fail, rồi chuyển sang backup.

```python
class PrimaryBackupPool:
    def __init__(self, primary_key, backup_keys):
        self.primary = genai.Client(api_key=primary_key)
        self.backups = [genai.Client(api_key=k) for k in backup_keys]
        self.primary_failed = False
        self.current_backup = 0
    
    def get_client(self):
        if not self.primary_failed:
            return self.primary
        return self.backups[self.current_backup]
```

**Use case**: Khi có 1 key mạnh (paid) và nhiều backup (free)

### 4. Health-Check Based

Theo dõi health của mỗi key, ưu tiên keys healthy.

```python
class HealthAwarePool:
    def __init__(self, api_keys):
        self.clients = {k: genai.Client(api_key=k) for k in api_keys}
        self.health = {k: {'success': 0, 'fail': 0, 'score': 100} for k in api_keys}
    
    def get_best_client(self):
        available = [(k, v['score']) for k, v in self.health.items() 
                     if v['score'] > 0]
        if not available:
            raise Exception("No healthy keys")
        
        # Weighted random selection based on score
        total = sum(s for _, s in available)
        r = random.uniform(0, total)
        for key, score in available:
            r -= score
            if r <= 0:
                return self.clients[key], key
    
    def record_result(self, key, success):
        if success:
            self.health[key]['success'] += 1
            self.health[key]['score'] = min(100, self.health[key]['score'] + 5)
        else:
            self.health[key]['fail'] += 1
            self.health[key]['score'] = max(0, self.health[key]['score'] - 20)
```

## Implementation đầy đủ (Production-ready)

```python
import time
import random
import threading
from dataclasses import dataclass, field
from typing import Optional, Callable
from google import genai

@dataclass
class KeyStatus:
    client: genai.Client
    available: bool = True
    rate_limited_until: float = 0
    success_count: int = 0
    fail_count: int = 0
    last_used: float = 0

class ProductionGeminiPool:
    def __init__(
        self, 
        api_keys: list[str],
        max_retries: int = 3,
        base_delay: float = 1.0,
        on_fallback: Optional[Callable] = None
    ):
        self.keys = {
            key: KeyStatus(client=genai.Client(api_key=key))
            for key in api_keys
        }
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.on_fallback = on_fallback
        self._lock = threading.Lock()
    
    def _get_available_key(self) -> Optional[str]:
        """Thread-safe key selection"""
        current_time = time.time()
        
        with self._lock:
            # Reset expired rate limits
            for key, status in self.keys.items():
                if not status.available and status.rate_limited_until <= current_time:
                    status.available = True
            
            # Find best available key (least recently used)
            available = [
                (key, status) for key, status in self.keys.items()
                if status.available
            ]
            
            if not available:
                # Return key with earliest retry time
                min_wait_key = min(
                    self.keys.items(),
                    key=lambda x: x[1].rate_limited_until
                )
                return min_wait_key[0]
            
            # LRU selection
            selected = min(available, key=lambda x: x[1].last_used)
            selected[1].last_used = current_time
            return selected[0]
    
    def _mark_rate_limited(self, key: str, wait_seconds: float = 60):
        """Mark key as rate limited"""
        with self._lock:
            status = self.keys[key]
            status.available = False
            status.rate_limited_until = time.time() + wait_seconds
            status.fail_count += 1
    
    def _mark_success(self, key: str):
        """Record successful request"""
        with self._lock:
            self.keys[key].success_count += 1
    
    def generate(
        self, 
        prompt: str, 
        model: str = "gemini-2.5-flash",
        **kwargs
    ) -> str:
        """Generate with automatic fallback and retries"""
        last_error = None
        
        for attempt in range(self.max_retries * len(self.keys)):
            key = self._get_available_key()
            
            if not key:
                raise Exception("No available API keys")
            
            status = self.keys[key]
            
            # Wait if key is rate limited
            if not status.available:
                wait_time = status.rate_limited_until - time.time()
                if wait_time > 0:
                    time.sleep(wait_time + 0.5)
            
            try:
                response = status.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    **kwargs
                )
                
                self._mark_success(key)
                return response.text
                
            except Exception as e:
                last_error = e
                error_str = str(e).lower()
                
                if '429' in str(e) or 'rate' in error_str or 'quota' in error_str:
                    # Rate limited
                    wait_time = self._parse_retry_after(e) or 60
                    self._mark_rate_limited(key, wait_time)
                    
                    if self.on_fallback:
                        self.on_fallback(key, 'rate_limited')
                    
                    continue
                
                elif '401' in str(e) or 'invalid' in error_str or 'api_key' in error_str:
                    # Invalid key - disable permanently
                    self._mark_rate_limited(key, float('inf'))
                    
                    if self.on_fallback:
                        self.on_fallback(key, 'invalid_key')
                    
                    continue
                
                elif '500' in str(e) or '503' in str(e):
                    # Server error - retry with backoff
                    delay = self.base_delay * (2 ** (attempt % 3)) + random.uniform(0, 1)
                    time.sleep(delay)
                    continue
                
                else:
                    raise e
        
        raise Exception(f"All retries exhausted. Last error: {last_error}")
    
    def _parse_retry_after(self, error: Exception) -> Optional[float]:
        """Parse retry-after from error if available"""
        error_str = str(error)
        # Try to extract retry-after value from error message
        import re
        match = re.search(r'retry.?after[:\s]+(\d+)', error_str, re.IGNORECASE)
        if match:
            return float(match.group(1))
        return None
    
    def get_stats(self) -> dict:
        """Get pool statistics"""
        with self._lock:
            return {
                key: {
                    'available': status.available,
                    'success': status.success_count,
                    'fail': status.fail_count,
                    'rate_limited_until': status.rate_limited_until if not status.available else None
                }
                for key, status in self.keys.items()
            }


# Usage
def on_key_fallback(key, reason):
    print(f"⚠️ Key {key[:8]}... {reason}")

pool = ProductionGeminiPool(
    api_keys=[
        "API_KEY_1",
        "API_KEY_2",
        "API_KEY_3"
    ],
    max_retries=3,
    on_fallback=on_key_fallback
)

# Single request
result = pool.generate("Hello, tell me a joke")
print(result)

# Batch requests with concurrent
import concurrent.futures

prompts = ["Tell me about Python", "Tell me about JavaScript", "Tell me about Go"]

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    results = list(executor.map(pool.generate, prompts))
```

## Quản lý API Keys

### 1. Tạo nhiều keys từ nhiều accounts

```
account1@gmail.com → Project A → Key 1
account2@gmail.com → Project B → Key 2
account3@gmail.com → Project C → Key 3
```

### 2. Lưu trữ an toàn

**Environment Variables:**
```bash
export GEMINI_API_KEYS="key1,key2,key3"
```

**Python dotenv:**
```python
# .env
GEMINI_API_KEYS=key1,key2,key3

# app.py
import os
from dotenv import load_dotenv

load_dotenv()
api_keys = os.getenv('GEMINI_API_KEYS', '').split(',')
```

**Laravel config:**
```php
// .env
GEMINI_API_KEYS=key1,key2,key3

// config/services.php
'gemini' => [
    'api_keys' => explode(',', env('GEMINI_API_KEYS', '')),
],
```

### 3. Key rotation định kỳ

```python
import schedule

def rotate_keys():
    """Rotate key order daily to balance usage"""
    pool.keys = dict(list(pool.keys.items())[1:] + [list(pool.keys.items())[0]])

schedule.every().day.at("00:00").do(rotate_keys)
```

## Monitoring

### Log rate limit events

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('gemini_pool')

def on_fallback(key, reason):
    logger.warning(f"Key fallback: {key[:8]}... - {reason}")
    
    # Gửi alert nếu nhiều keys fail
    stats = pool.get_stats()
    failed_count = sum(1 for s in stats.values() if not s['available'])
    if failed_count >= len(stats) - 1:
        logger.critical("CRITICAL: Almost all API keys exhausted!")
        # Send alert to Slack/Discord/Email
```

### Metrics dashboard

```python
from prometheus_client import Counter, Gauge

gemini_requests_total = Counter('gemini_requests_total', 'Total requests', ['status'])
gemini_available_keys = Gauge('gemini_available_keys', 'Available API keys')

def update_metrics():
    stats = pool.get_stats()
    available = sum(1 for s in stats.values() if s['available'])
    gemini_available_keys.set(available)
```
