# Gemini API Rate Limits Chi Tiết

## Free Tier Limits (Tháng 12/2025)

### Text Models

| Model | RPM | TPM | RPD |
|-------|-----|-----|-----|
| gemini-2.5-flash | 15 | 1,000,000 | 1,500 |
| gemini-2.5-flash-lite | 30 | 1,000,000 | 3,000 |
| gemini-2.5-pro | 5 | 250,000 | 50 |
| gemini-3-pro-preview | 5 | 250,000 | 25 |
| gemini-2.0-flash | 15 | 1,000,000 | 1,500 |
| gemini-2.0-flash-lite | 30 | 1,000,000 | 3,000 |

### Image Generation (Imagen)

| Model | IPM (Images/Min) | IPD (Images/Day) |
|-------|------------------|------------------|
| imagen-3.0-generate-002 | 10 | 100 |

## Giải thích các metrics

- **RPM (Requests Per Minute)**: Số request tối đa mỗi phút
- **TPM (Tokens Per Minute)**: Số tokens input tối đa mỗi phút
- **RPD (Requests Per Day)**: Số request tối đa mỗi ngày (reset midnight PT)
- **IPM (Images Per Minute)**: Số ảnh generate mỗi phút
- **IPD (Images Per Day)**: Số ảnh generate mỗi ngày

## Paid Tiers

### Tier 1 (Billing enabled)

| Model | RPM | TPM | RPD |
|-------|-----|-----|-----|
| gemini-2.5-flash | 2,000 | 4,000,000 | Unlimited |
| gemini-2.5-flash-lite | 4,000 | 4,000,000 | Unlimited |
| gemini-2.5-pro | 1,000 | 4,000,000 | Unlimited |

### Tier 2 ($250+ spend)

| Model | RPM | TPM | RPD |
|-------|-----|-----|-----|
| gemini-2.5-flash | 4,000 | 10,000,000 | Unlimited |
| gemini-2.5-flash-lite | 10,000 | 10,000,000 | Unlimited |
| gemini-2.5-pro | 2,000 | 10,000,000 | Unlimited |

### Tier 3 ($1000+ spend)

Limits cao hơn nữa, tùy thuộc vào model.

## Cách tính Rate Limit

Rate limits được áp dụng **per project**, không phải per API key:

```
Project A:
  - API Key 1: share chung quota
  - API Key 2: share chung quota
  - API Key 3: share chung quota

Project B:
  - API Key 4: quota riêng biệt
```

**Tip**: Tạo nhiều Google Cloud projects để có nhiều quota độc lập.

## Khi nào bị Rate Limit?

Bạn bị rate limit khi vượt BẤT KỲ limit nào:

1. ✅ 10 requests trong 1 phút, mỗi request 50k tokens → OK (chưa vượt RPM hay TPM)
2. ❌ 20 requests trong 1 phút, mỗi request 1k tokens → FAIL (vượt RPM 15)
3. ❌ 5 requests trong 1 phút, mỗi request 300k tokens → FAIL (vượt TPM 1M)

## Kiểm tra Rate Limit hiện tại

Truy cập Google AI Studio để xem usage:
https://aistudio.google.com/usage?timeRange=last-28-days&tab=rate-limit

## Chiến lược tối ưu Free Tier

### 1. Chọn model phù hợp

```
Simple tasks (chatbot, Q&A):
→ gemini-2.5-flash-lite (30 RPM, 3000 RPD)

Moderate tasks (summarization, translation):
→ gemini-2.5-flash (15 RPM, 1500 RPD)

Complex tasks (reasoning, coding):
→ gemini-2.5-pro (5 RPM, 50 RPD)
```

### 2. Batch khi có thể

Thay vì:
```
5 requests × "Translate: Hello" (5 RPM used)
```

Gộp thành:
```
1 request × "Translate all: Hello, World, Goodbye, ..." (1 RPM used)
```

### 3. Multiple Projects

```
Account 1 → Project 1 → 1500 RPD
Account 2 → Project 2 → 1500 RPD
Account 3 → Project 3 → 1500 RPD
─────────────────────────────────
Total:                   4500 RPD
```

### 4. Caching

```python
import hashlib
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_generate(prompt_hash: str, actual_prompt: str):
    return pool.generate(actual_prompt)

def generate_with_cache(prompt: str):
    prompt_hash = hashlib.md5(prompt.encode()).hexdigest()
    return cached_generate(prompt_hash, prompt)
```

## Xử lý Error 429 (Rate Limited)

```python
import time

def handle_rate_limit(response):
    if response.status_code == 429:
        # Đọc retry-after header nếu có
        retry_after = int(response.headers.get('Retry-After', 60))
        
        # Hoặc fallback sang key khác
        pool.mark_rate_limited(current_key_index, retry_after)
        
        # Hoặc đợi
        time.sleep(retry_after)
```

## Reset Time

- **RPM**: Reset sau 60 giây kể từ request đầu tiên trong window
- **TPM**: Reset sau 60 giây
- **RPD**: Reset lúc **midnight Pacific Time** (UTC-8 hoặc UTC-7 DST)

```python
from datetime import datetime
import pytz

def get_rpd_reset_time():
    pacific = pytz.timezone('US/Pacific')
    now = datetime.now(pacific)
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    if now > midnight:
        midnight += timedelta(days=1)
    return midnight
```
