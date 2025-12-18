# Gemini API Error Handling

## Error Codes Reference

| HTTP Code | Error Type | Nguyên nhân | Xử lý |
|-----------|------------|-------------|-------|
| 400 | INVALID_ARGUMENT | Request không hợp lệ | Kiểm tra params, prompt |
| 401 | UNAUTHENTICATED | API key không hợp lệ | Thay key mới |
| 403 | PERMISSION_DENIED | Không có quyền | Kiểm tra region, billing |
| 404 | NOT_FOUND | Model không tồn tại | Kiểm tra model name |
| 429 | RESOURCE_EXHAUSTED | Rate limited | Fallback key / wait |
| 500 | INTERNAL | Server error | Retry with backoff |
| 503 | UNAVAILABLE | Service down | Retry sau 30s |

## Chi tiết xử lý từng loại lỗi

### 400 - Invalid Argument

```python
def handle_invalid_argument(error):
    """
    Nguyên nhân phổ biến:
    - Prompt quá dài
    - Format không đúng
    - Params không hợp lệ
    """
    error_msg = str(error).lower()
    
    if 'token' in error_msg:
        # Prompt quá dài
        return truncate_prompt(prompt)
    
    if 'format' in error_msg or 'json' in error_msg:
        # Validate request format
        return validate_and_fix_request(request)
    
    # Log và raise
    logger.error(f"Invalid argument: {error}")
    raise error
```

### 401 - Unauthenticated

```python
def handle_auth_error(error, key_index):
    """
    API key không hợp lệ hoặc hết hạn
    """
    logger.warning(f"API key {key_index} invalid, removing from pool")
    
    # Remove key permanently
    pool.mark_permanently_invalid(key_index)
    
    # Alert admin
    send_alert(f"Gemini API key #{key_index} is invalid")
    
    # Try next key
    return pool.get_next_client()
```

### 403 - Permission Denied

```python
def handle_permission_error(error):
    """
    Nguyên nhân:
    - Region không được hỗ trợ
    - Model cần billing
    - Content policy violation
    """
    error_msg = str(error).lower()
    
    if 'region' in error_msg or 'location' in error_msg:
        raise Exception("API not available in your region. Use VPN or Vertex AI.")
    
    if 'billing' in error_msg:
        raise Exception("This model requires billing. Enable at console.cloud.google.com")
    
    if 'safety' in error_msg or 'policy' in error_msg:
        # Content blocked
        return "Nội dung không phù hợp với chính sách của Google."
```

### 429 - Rate Limited (Quan trọng nhất)

```python
import time
import re

def handle_rate_limit(error, key_index):
    """
    Parse retry-after và xử lý thông minh
    """
    error_str = str(error)
    
    # Try to parse retry-after
    retry_after = 60  # default
    
    # Pattern 1: retry-after header
    match = re.search(r'retry.?after[:\s]+(\d+)', error_str, re.IGNORECASE)
    if match:
        retry_after = int(match.group(1))
    
    # Pattern 2: "try again in X seconds"
    match = re.search(r'try again in (\d+)', error_str, re.IGNORECASE)
    if match:
        retry_after = int(match.group(1))
    
    # Pattern 3: quota type
    if 'per minute' in error_str.lower():
        retry_after = 60
    elif 'per day' in error_str.lower():
        retry_after = 3600  # wait 1 hour, or switch key
    
    logger.warning(f"Key {key_index} rate limited, retry after {retry_after}s")
    
    # Strategy 1: Switch to next key immediately
    pool.mark_rate_limited(key_index, retry_after)
    return pool.get_next_client()
    
    # Strategy 2: Wait (if only 1 key)
    # time.sleep(retry_after + random.uniform(0, 5))
```

### 500/503 - Server Errors

```python
def handle_server_error(error, attempt):
    """
    Exponential backoff với jitter
    """
    if attempt >= MAX_RETRIES:
        raise error
    
    # Exponential backoff
    base_delay = 1
    max_delay = 60
    
    delay = min(base_delay * (2 ** attempt), max_delay)
    jitter = random.uniform(0, delay * 0.1)  # 10% jitter
    
    total_delay = delay + jitter
    
    logger.info(f"Server error, retrying in {total_delay:.1f}s (attempt {attempt + 1})")
    time.sleep(total_delay)
    
    return attempt + 1
```

## Complete Error Handler

```python
from enum import Enum
from dataclasses import dataclass
from typing import Optional, Callable
import time
import random

class ErrorType(Enum):
    INVALID_REQUEST = "invalid_request"
    AUTH_FAILED = "auth_failed"
    PERMISSION_DENIED = "permission_denied"
    RATE_LIMITED = "rate_limited"
    SERVER_ERROR = "server_error"
    UNKNOWN = "unknown"

@dataclass
class ErrorInfo:
    type: ErrorType
    message: str
    retry_after: Optional[float] = None
    recoverable: bool = True
    original_error: Optional[Exception] = None

class GeminiErrorHandler:
    def __init__(
        self,
        max_retries: int = 3,
        on_error: Optional[Callable[[ErrorInfo], None]] = None
    ):
        self.max_retries = max_retries
        self.on_error = on_error
    
    def classify_error(self, error: Exception) -> ErrorInfo:
        """Phân loại lỗi"""
        error_str = str(error).lower()
        status_code = self._extract_status_code(error)
        
        if status_code == 400 or 'invalid' in error_str:
            return ErrorInfo(
                type=ErrorType.INVALID_REQUEST,
                message="Invalid request parameters",
                recoverable=False,
                original_error=error
            )
        
        if status_code == 401 or 'api_key' in error_str or 'unauthenticated' in error_str:
            return ErrorInfo(
                type=ErrorType.AUTH_FAILED,
                message="Invalid API key",
                recoverable=False,
                original_error=error
            )
        
        if status_code == 403 or 'permission' in error_str:
            return ErrorInfo(
                type=ErrorType.PERMISSION_DENIED,
                message="Permission denied",
                recoverable=False,
                original_error=error
            )
        
        if status_code == 429 or 'rate' in error_str or 'quota' in error_str:
            retry_after = self._parse_retry_after(error)
            return ErrorInfo(
                type=ErrorType.RATE_LIMITED,
                message="Rate limited",
                retry_after=retry_after,
                recoverable=True,
                original_error=error
            )
        
        if status_code in (500, 502, 503, 504) or 'server' in error_str:
            return ErrorInfo(
                type=ErrorType.SERVER_ERROR,
                message="Server error",
                recoverable=True,
                original_error=error
            )
        
        return ErrorInfo(
            type=ErrorType.UNKNOWN,
            message=str(error),
            recoverable=False,
            original_error=error
        )
    
    def _extract_status_code(self, error: Exception) -> Optional[int]:
        """Extract HTTP status code from error"""
        error_str = str(error)
        
        # Pattern: "status: 429" or "code: 429" or just "429"
        import re
        patterns = [
            r'status[:\s]+(\d{3})',
            r'code[:\s]+(\d{3})',
            r'\b(4\d{2}|5\d{2})\b'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, error_str, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return None
    
    def _parse_retry_after(self, error: Exception) -> float:
        """Parse retry-after value"""
        error_str = str(error)
        
        import re
        patterns = [
            r'retry.?after[:\s]+(\d+)',
            r'try again in (\d+)',
            r'wait (\d+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, error_str, re.IGNORECASE)
            if match:
                return float(match.group(1))
        
        # Default based on error type
        if 'per day' in error_str.lower():
            return 3600.0  # 1 hour
        if 'per minute' in error_str.lower():
            return 60.0
        
        return 60.0  # default
    
    def handle(
        self,
        func: Callable,
        *args,
        **kwargs
    ):
        """Execute function with error handling"""
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                return func(*args, **kwargs)
                
            except Exception as e:
                error_info = self.classify_error(e)
                last_error = error_info
                
                if self.on_error:
                    self.on_error(error_info)
                
                if not error_info.recoverable:
                    raise e
                
                if error_info.type == ErrorType.RATE_LIMITED:
                    # Don't retry here, let pool handle fallback
                    raise e
                
                if error_info.type == ErrorType.SERVER_ERROR:
                    delay = (2 ** attempt) + random.uniform(0, 1)
                    time.sleep(delay)
                    continue
        
        raise Exception(f"Max retries exceeded: {last_error}")


# Usage
def on_error(error_info: ErrorInfo):
    print(f"Error: {error_info.type.value} - {error_info.message}")

handler = GeminiErrorHandler(max_retries=3, on_error=on_error)

result = handler.handle(
    pool.generate,
    prompt="Hello, world!",
    model="gemini-2.5-flash"
)
```

## Safety Filters

Gemini có built-in safety filters. Xử lý khi content bị block:

```python
def handle_safety_block(response):
    """
    Check và xử lý safety blocks
    """
    if hasattr(response, 'prompt_feedback'):
        feedback = response.prompt_feedback
        
        if feedback.block_reason:
            reasons = {
                'SAFETY': 'Content violates safety guidelines',
                'OTHER': 'Content blocked for other reasons',
                'BLOCKLIST': 'Contains blocked terms'
            }
            
            return {
                'blocked': True,
                'reason': reasons.get(str(feedback.block_reason), 'Unknown'),
                'safety_ratings': feedback.safety_ratings
            }
    
    return {'blocked': False}

# Usage
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt
)

block_info = handle_safety_block(response)
if block_info['blocked']:
    print(f"Content blocked: {block_info['reason']}")
else:
    print(response.text)
```

## Timeout Handling

```python
import asyncio
from concurrent.futures import TimeoutError

async def generate_with_timeout(prompt, timeout=30):
    """Async generation with timeout"""
    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(pool.generate, prompt),
            timeout=timeout
        )
        return result
    except asyncio.TimeoutError:
        logger.warning(f"Request timeout after {timeout}s")
        raise Exception("Request timeout")

# Sync version
import signal

def timeout_handler(signum, frame):
    raise TimeoutError("Request timeout")

def generate_with_timeout_sync(prompt, timeout=30):
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(timeout)
    
    try:
        result = pool.generate(prompt)
        signal.alarm(0)  # Cancel alarm
        return result
    except TimeoutError:
        logger.warning("Request timeout")
        raise
```
