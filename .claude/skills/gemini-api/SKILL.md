---
name: gemini-api
description: "Tích hợp Google Gemini API miễn phí vào dự án. Hướng dẫn: (1) Lấy API key miễn phí, (2) Sử dụng SDK Python/JavaScript, (3) Rate limits và models, (4) Fallback strategy với nhiều API keys, (5) Xử lý lỗi rate limit. Sử dụng khi cần tích hợp AI, gọi Gemini API, xử lý rate limit, hoặc cần fallback giữa các API keys."
version: 1.0.0
---

# Google Gemini API Integration

## Overview

Google Gemini API cung cấp quyền truy cập MIỄN PHÍ vào các model AI mạnh mẽ nhất của Google. Skill này hướng dẫn cách tích hợp và sử dụng hiệu quả với chiến lược fallback để tránh rate limit.

## Tại sao chọn Gemini API?

- **MIỄN PHÍ**: Free tier với 15 RPM, 1M tokens/phút
- **Mạnh mẽ**: Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 3 Pro
- **Dễ tích hợp**: SDK cho Python, JavaScript, Go, Java, C#
- **Multimodal**: Hỗ trợ text, image, audio, video
- **Context Caching**: Giảm chi phí với repeated content
- **Batch API**: Xử lý hàng loạt với 50% discount
- **Code Execution**: Chạy Python code trong model
- **Function Calling**: Tích hợp external tools
- **Structured Output**: JSON output với schema validation

## Quick Start

### 1. Lấy API Key (Miễn phí)

```
1. Truy cập: https://aistudio.google.com/apikey
2. Đăng nhập Google Account
3. Click "Create API Key"
4. Copy API key và lưu an toàn
```

### 2. Cài đặt SDK

**Python:**
```bash
pip install -q -U google-genai
```

**JavaScript/Node.js:**
```bash
npm install @google/genai
```

### 3. Gọi API đơn giản

**Python:**
```python
from google import genai

client = genai.Client(api_key="YOUR_API_KEY")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Giải thích AI trong vài từ"
)
print(response.text)
```

**JavaScript:**
```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Giải thích AI trong vài từ",
});
console.log(response.text);
```

## Free Tier Rate Limits

| Model | RPM | TPM | RPD |
|-------|-----|-----|-----|
| **Gemini 2.5 Flash** | 15 | 1,000,000 | 1,500 |
| **Gemini 2.5 Flash-Lite** | 30 | 1,000,000 | 3,000 |
| **Gemini 2.5 Pro** | 5 | 250,000 | 50 |
| **Gemini 3 Pro Preview** | 5 | 250,000 | 25 |

- **RPM**: Requests per Minute
- **TPM**: Tokens per Minute
- **RPD**: Requests per Day (reset lúc midnight Pacific Time)

## Chiến lược Fallback với Nhiều API Keys

### Tại sao cần Fallback?

- Free tier có giới hạn RPM/RPD
- Một key bị rate limit → chuyển sang key khác
- Tăng throughput tổng thể
- Không bị gián đoạn service

### Python - API Key Pool với Fallback

```python
import time
from google import genai
from google.genai import types

class GeminiPool:
    def __init__(self, api_keys: list[str]):
        self.clients = [genai.Client(api_key=key) for key in api_keys]
        self.current_index = 0
        self.failed_keys = set()
        self.retry_after = {}
    
    def get_next_client(self):
        """Lấy client tiếp theo có thể sử dụng"""
        current_time = time.time()
        
        # Reset failed keys nếu đã hết thời gian chờ
        for key_idx in list(self.failed_keys):
            if self.retry_after.get(key_idx, 0) <= current_time:
                self.failed_keys.discard(key_idx)
        
        # Tìm client khả dụng
        attempts = len(self.clients)
        while attempts > 0:
            if self.current_index not in self.failed_keys:
                client = self.clients[self.current_index]
                return client, self.current_index
            
            self.current_index = (self.current_index + 1) % len(self.clients)
            attempts -= 1
        
        # Tất cả keys đều failed, chờ key sớm nhất
        min_wait = min(self.retry_after.values()) - current_time
        if min_wait > 0:
            time.sleep(min_wait + 1)
            return self.get_next_client()
        
        raise Exception("Tất cả API keys đều không khả dụng")
    
    def mark_rate_limited(self, key_index: int, wait_seconds: int = 60):
        """Đánh dấu key bị rate limit"""
        self.failed_keys.add(key_index)
        self.retry_after[key_index] = time.time() + wait_seconds
        self.current_index = (key_index + 1) % len(self.clients)
    
    def generate(self, prompt: str, model: str = "gemini-2.5-flash", max_retries: int = 3):
        """Generate với auto-fallback"""
        for attempt in range(max_retries):
            try:
                client, key_idx = self.get_next_client()
                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                # Thành công → rotate để phân tải
                self.current_index = (key_idx + 1) % len(self.clients)
                return response.text
                
            except Exception as e:
                error_msg = str(e).lower()
                
                if "429" in str(e) or "rate" in error_msg or "quota" in error_msg:
                    # Rate limited → chuyển key
                    self.mark_rate_limited(key_idx)
                    print(f"Key {key_idx} rate limited, chuyển sang key khác...")
                    continue
                    
                elif "401" in str(e) or "invalid" in error_msg:
                    # Key không hợp lệ → bỏ qua vĩnh viễn
                    self.mark_rate_limited(key_idx, wait_seconds=3600*24)
                    print(f"Key {key_idx} không hợp lệ")
                    continue
                    
                else:
                    raise e
        
        raise Exception(f"Failed sau {max_retries} lần thử")


# Sử dụng
pool = GeminiPool([
    "API_KEY_1",
    "API_KEY_2", 
    "API_KEY_3"
])

result = pool.generate("Viết một câu chuyện ngắn về AI")
print(result)
```

### JavaScript/TypeScript - API Key Pool

```typescript
import { GoogleGenAI } from "@google/genai";

class GeminiPool {
    private clients: GoogleGenAI[];
    private currentIndex: number = 0;
    private failedKeys: Set<number> = new Set();
    private retryAfter: Map<number, number> = new Map();

    constructor(apiKeys: string[]) {
        this.clients = apiKeys.map(key => new GoogleGenAI({ apiKey: key }));
    }

    private getNextClient(): { client: GoogleGenAI; index: number } {
        const currentTime = Date.now();

        // Reset failed keys nếu hết thời gian chờ
        for (const keyIdx of this.failedKeys) {
            if ((this.retryAfter.get(keyIdx) || 0) <= currentTime) {
                this.failedKeys.delete(keyIdx);
            }
        }

        // Tìm client khả dụng
        let attempts = this.clients.length;
        while (attempts > 0) {
            if (!this.failedKeys.has(this.currentIndex)) {
                const client = this.clients[this.currentIndex];
                return { client, index: this.currentIndex };
            }
            this.currentIndex = (this.currentIndex + 1) % this.clients.length;
            attempts--;
        }

        throw new Error("Tất cả API keys đều không khả dụng");
    }

    private markRateLimited(keyIndex: number, waitMs: number = 60000): void {
        this.failedKeys.add(keyIndex);
        this.retryAfter.set(keyIndex, Date.now() + waitMs);
        this.currentIndex = (keyIndex + 1) % this.clients.length;
    }

    async generate(
        prompt: string,
        model: string = "gemini-2.5-flash",
        maxRetries: number = 3
    ): Promise<string> {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const { client, index } = this.getNextClient();
                
                const response = await client.models.generateContent({
                    model,
                    contents: prompt,
                });
                
                // Thành công → rotate
                this.currentIndex = (index + 1) % this.clients.length;
                return response.text || "";
                
            } catch (error: any) {
                const errorMsg = error.message?.toLowerCase() || "";
                const { index } = this.getNextClient();
                
                if (errorMsg.includes("429") || errorMsg.includes("rate") || errorMsg.includes("quota")) {
                    this.markRateLimited(index);
                    console.log(`Key ${index} rate limited, switching...`);
                    continue;
                }
                
                if (errorMsg.includes("401") || errorMsg.includes("invalid")) {
                    this.markRateLimited(index, 24 * 60 * 60 * 1000);
                    console.log(`Key ${index} invalid`);
                    continue;
                }
                
                throw error;
            }
        }
        
        throw new Error(`Failed after ${maxRetries} retries`);
    }
}

// Sử dụng
const pool = new GeminiPool([
    "API_KEY_1",
    "API_KEY_2",
    "API_KEY_3"
]);

const result = await pool.generate("Viết một câu chuyện ngắn về AI");
console.log(result);
```

### Laravel/PHP - API Key Pool

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class GeminiService
{
    private array $apiKeys;
    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    
    public function __construct()
    {
        // Lấy từ config hoặc .env
        $this->apiKeys = config('services.gemini.api_keys', []);
    }
    
    public function generate(string $prompt, string $model = 'gemini-2.5-flash'): ?string
    {
        $maxRetries = count($this->apiKeys);
        
        for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
            $apiKey = $this->getAvailableKey();
            
            if (!$apiKey) {
                sleep(60);
                continue;
            }
            
            try {
                $response = Http::timeout(30)
                    ->withHeaders(['x-goog-api-key' => $apiKey])
                    ->post("{$this->baseUrl}/models/{$model}:generateContent", [
                        'contents' => [
                            ['parts' => [['text' => $prompt]]]
                        ]
                    ]);
                
                if ($response->successful()) {
                    return $response->json('candidates.0.content.parts.0.text');
                }
                
                if ($response->status() === 429) {
                    $this->markRateLimited($apiKey);
                    continue;
                }
                
                throw new \Exception("Gemini API error: " . $response->body());
                
            } catch (\Exception $e) {
                if (str_contains($e->getMessage(), '429') || str_contains($e->getMessage(), 'rate')) {
                    $this->markRateLimited($apiKey);
                    continue;
                }
                throw $e;
            }
        }
        
        return null;
    }
    
    private function getAvailableKey(): ?string
    {
        foreach ($this->apiKeys as $key) {
            $cacheKey = 'gemini_rate_limited_' . md5($key);
            if (!Cache::has($cacheKey)) {
                return $key;
            }
        }
        return null;
    }
    
    private function markRateLimited(string $apiKey): void
    {
        $cacheKey = 'gemini_rate_limited_' . md5($apiKey);
        Cache::put($cacheKey, true, now()->addMinutes(1));
    }
}
```

**Config (config/services.php):**
```php
'gemini' => [
    'api_keys' => explode(',', env('GEMINI_API_KEYS', '')),
],
```

**.env:**
```
GEMINI_API_KEYS=key1,key2,key3
```

## Xử lý Error

### Error Codes thường gặp

| Code | Ý nghĩa | Xử lý |
|------|---------|-------|
| 400 | Invalid request | Kiểm tra prompt/params |
| 401 | Invalid API key | Thay key mới |
| 403 | Permission denied | Kiểm tra region/quota |
| 429 | Rate limited | Fallback sang key khác |
| 500 | Server error | Retry sau 5-10s |
| 503 | Service unavailable | Retry sau 30s |

### Retry với Exponential Backoff

```python
import time
import random

def retry_with_backoff(func, max_retries=5, base_delay=1):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            
            # Exponential backoff với jitter
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            print(f"Retry {attempt + 1}/{max_retries} sau {delay:.1f}s...")
            time.sleep(delay)
```

## Best Practices

1. **Tạo nhiều API keys**: Mỗi Google account = 1 free API key
2. **Load balancing**: Rotate keys để phân tải đều
3. **Cache responses**: Lưu cache cho các query giống nhau
4. **Batch requests**: Gộp nhiều requests nếu có thể
5. **Monitor usage**: Theo dõi usage tại https://aistudio.google.com/usage
6. **Dùng model phù hợp**: Flash-Lite cho tasks đơn giản (30 RPM)

## Model Comparison

| Model | Đặc điểm | Use case |
|-------|----------|----------|
| **gemini-2.5-flash** | Nhanh, cân bằng | General purpose |
| **gemini-2.5-flash-lite** | Siêu nhanh, nhẹ | High-volume, simple tasks |
| **gemini-2.5-pro** | Chất lượng cao | Complex reasoning |
| **gemini-3-pro-preview** | Mới nhất | Experimental |

## Tài liệu tham khảo

- [Rate Limits Chi tiết](./references/rate-limits.md)
- [SDK Usage](./references/sdk-usage.md)
- [API Key Fallback Strategy](./references/api-key-fallback.md)
- [Error Handling](./references/error-handling.md)
- [Advanced Features](./references/advanced-features.md) - File API, Caching, Batch, Code Execution, Embeddings

## External Links

- Official Docs: https://ai.google.dev/gemini-api/docs
- Get API Key: https://aistudio.google.com/apikey
- Rate Limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Pricing: https://ai.google.dev/gemini-api/docs/pricing
- Cookbook: https://github.com/google-gemini/cookbook
- LLMs.txt (Context7): https://context7.com/websites/ai_google_dev_gemini-api/llms.txt
