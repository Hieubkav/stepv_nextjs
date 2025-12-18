# Gemini API Advanced Features

## File API - Upload & Process Files

### Upload Files (hỗ trợ audio, video, images lên đến vài GB)

**Python:**
```python
from google import genai

client = genai.Client()

# Upload file
myfile = client.files.upload(file="path/to/sample.mp3")

# Sử dụng file trong generation
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=["Mô tả audio clip này", myfile]
)
print(response.text)

# List tất cả uploaded files
files = client.files.list()
for file in files:
    print(f"{file.name}: {file.display_name} ({file.state})")

# Xóa file khi không cần nữa
client.files.delete(name=myfile.name)
```

**JavaScript:**
```javascript
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

const ai = new GoogleGenAI({});

// Upload file
const myfile = await ai.files.upload({
    file: "path/to/sample.mp3",
    config: { mimeType: "audio/mp3" }
});

// Generate với file
const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: createUserContent([
        createPartFromUri(myfile.uri, myfile.mimeType),
        "Mô tả audio clip này"
    ])
});

console.log(response.text);
```

## Context Caching - Giảm Chi Phí

Cache nội dung hay dùng (documents lớn, system instructions) để tiết kiệm tokens.

```python
import pathlib
import requests
from google import genai
from google.genai import types

client = genai.Client()

# Download và upload video
url = 'https://storage.googleapis.com/generativeai-downloads/data/SherlockJr._10min.mp4'
path_to_video_file = pathlib.Path('SherlockJr._10min.mp4')
if not path_to_video_file.exists():
    response = requests.get(url)
    path_to_video_file.write_bytes(response.content)

video_file = client.files.upload(file=str(path_to_video_file))

# Tạo cache với system instruction và video
cache = client.caches.create(
    model="gemini-2.5-flash",
    config=types.CreateCachedContentConfig(
        contents=[
            types.Content(
                role="user",
                parts=[types.Part.from_uri(file_uri=video_file.uri, mime_type=video_file.mime_type)]
            )
        ],
        system_instruction="Bạn là chuyên gia phân tích video.",
        ttl="3600s"  # Cache 1 giờ
    )
)

# Sử dụng cache cho nhiều requests (tiết kiệm chi phí)
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Mô tả các cảnh chính trong video",
    config=types.GenerateContentConfig(
        cached_content=cache.name
    )
)
print(response.text)

# Request thứ 2 reuse cache
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Cảm xúc nào được thể hiện trong video?",
    config=types.GenerateContentConfig(
        cached_content=cache.name
    )
)

# List và xóa caches
caches = client.caches.list()
for c in caches:
    print(f"{c.name}: expires at {c.expire_time}")

client.caches.delete(name=cache.name)
```

## Batch API - Xử Lý Hàng Loạt (50% Discount)

Gửi batch requests để xử lý với chi phí giảm 50%, target hoàn thành trong 24h.

```python
from google import genai
from google.genai import types
import time

client = genai.Client()

# Tạo batch với inline requests
inline_requests = [
    {
        'contents': [{
            'parts': [{'text': 'Kể một câu chuyện cười ngắn.'}],
            'role': 'user'
        }]
    },
    {
        'contents': [{
            'parts': [{'text': 'Tại sao bầu trời màu xanh?'}],
            'role': 'user'
        }]
    },
    {
        'contents': [{
            'parts': [{'text': 'Giải thích quantum computing đơn giản.'}],
            'role': 'user'
        }]
    }
]

batch = client.batches.create(
    model="gemini-2.5-flash",
    requests=inline_requests
)

print(f"Batch created: {batch.name}")
print(f"Status: {batch.state}")

# Monitor batch status
while batch.state == "PROCESSING":
    time.sleep(10)
    batch = client.batches.get(name=batch.name)
    print(f"Status: {batch.state}")

# Lấy kết quả khi hoàn thành
if batch.state == "SUCCEEDED":
    for i, response in enumerate(batch.inline_responses):
        print(f"\nRequest {i+1}:")
        print(response.candidates[0].content.parts[0].text)
```

### Batch với File Input (cho large batches)

```python
import json

# Tạo JSONL file với requests
with open('batch_requests.jsonl', 'w') as f:
    for req in inline_requests:
        f.write(json.dumps(req) + '\n')

# Upload input file
input_file = client.files.upload(file='batch_requests.jsonl')

# Tạo batch với file
batch = client.batches.create(
    model="gemini-2.5-flash",
    input_uri=input_file.uri
)
```

## Code Execution - Chạy Python Code

Model có thể generate và chạy Python code cho calculations.

**Python:**
```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Tổng của 50 số nguyên tố đầu tiên là bao nhiêu? Generate và chạy code.",
    config=types.GenerateContentConfig(
        tools=[types.Tool(code_execution=types.ToolCodeExecution)]
    )
)

# Response chứa cả code và kết quả
for part in response.candidates[0].content.parts:
    if part.text is not None:
        print("Text:", part.text)
    if part.executable_code is not None:
        print("Code:", part.executable_code.code)
    if part.code_execution_result is not None:
        print("Result:", part.code_execution_result.output)
```

**JavaScript:**
```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: ["Tính dãy fibonacci đến số thứ 20 bằng code."],
    config: {
        tools: [{ codeExecution: {} }]
    }
});

console.log(response.text);
```

## Audio Understanding

Transcribe, tóm tắt và phân tích audio files.

```python
from google import genai

client = genai.Client()

# Upload audio
audio_file = client.files.upload(file="path/to/podcast.mp3")

# Transcribe audio
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=["Transcribe file audio này", audio_file]
)
print("Transcription:", response.text)

# Phân tích nội dung
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        "Tóm tắt các điểm chính được thảo luận trong audio này dạng bullet points",
        audio_file
    ]
)
print("\nSummary:", response.text)

# Trích xuất thông tin cụ thể
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        "Tên của những người nói là gì và mỗi người thảo luận về chủ đề gì?",
        audio_file
    ]
)
print("\nSpeaker Analysis:", response.text)
```

## Token Counting - Ước Tính Chi Phí

Đếm tokens trước khi request để ước tính chi phí.

**cURL:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:countTokens" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {"text": "Đây là text mẫu để đếm tokens."}
        ]
      }
    ]
  }'
```

**Response:**
```json
{
  "totalTokens": 12
}
```

**Python:**
```python
from google import genai

client = genai.Client()

result = client.models.count_tokens(
    model="gemini-2.5-flash",
    contents="Đây là text mẫu để đếm tokens."
)

print(f"Total tokens: {result.total_tokens}")
```

## Safety Settings - Cấu Hình Content Filters

Điều chỉnh mức độ filter cho các loại nội dung khác nhau.

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Viết một câu chuyện về...",
    config=types.GenerateContentConfig(
        safety_settings={
            types.HarmCategory.HARM_CATEGORY_HATE_SPEECH: types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: types.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: types.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            types.HarmCategory.HARM_CATEGORY_HARASSMENT: types.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
    )
)

print(response.text)

# Kiểm tra safety ratings trong response
for rating in response.candidates[0].safety_ratings:
    print(f"{rating.category}: {rating.probability}")
```

**Harm Categories:**
- `HARM_CATEGORY_HATE_SPEECH`: Ngôn từ thù địch
- `HARM_CATEGORY_DANGEROUS_CONTENT`: Nội dung nguy hiểm
- `HARM_CATEGORY_SEXUALLY_EXPLICIT`: Nội dung tình dục
- `HARM_CATEGORY_HARASSMENT`: Quấy rối

**Block Thresholds:**
- `BLOCK_NONE`: Không block
- `BLOCK_LOW_AND_ABOVE`: Block từ mức thấp
- `BLOCK_MEDIUM_AND_ABOVE`: Block từ mức trung bình
- `BLOCK_HIGH_AND_ABOVE`: Chỉ block mức cao
- `BLOCK_ONLY_HIGH`: Chỉ block mức rất cao

## Embeddings - Vector Embeddings

Tạo vector embeddings cho semantic search, classification, clustering.

```python
from google import genai

client = genai.Client()

# Generate single embedding
result = client.models.embed_content(
    model="gemini-embedding-001",
    contents="Ý nghĩa của cuộc sống là gì?"
)

print(f"Embedding dimension: {len(result.embeddings[0].values)}")
print(f"First few values: {result.embeddings[0].values[:5]}")

# Với task type để tối ưu performance
result = client.models.embed_content(
    model="gemini-embedding-001",
    contents="Machine learning là một nhánh của AI",
    config={"task_type": "retrieval_document"}
)

# Batch embedding
texts = [
    "Con cáo nâu nhanh nhẹn nhảy qua con chó lười",
    "Machine learning cho phép máy tính học từ dữ liệu",
    "Python là ngôn ngữ lập trình phổ biến"
]

results = [
    client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config={"task_type": "retrieval_document"}
    )
    for text in texts
]

embeddings = [r.embeddings[0].values for r in results]
print(f"Generated {len(embeddings)} embeddings")
```

**Task Types:**
| Task Type | Mục đích |
|-----------|----------|
| `retrieval_document` | Index documents |
| `retrieval_query` | Search queries |
| `semantic_similarity` | So sánh độ tương đồng |
| `classification` | Phân loại text |
| `clustering` | Gom nhóm texts |

## Model Selection Guide

| Model | Best For | Context | Speed |
|-------|----------|---------|-------|
| **gemini-2.5-pro** | Complex reasoning, large context | 2M tokens | Slower |
| **gemini-2.5-flash** | Speed + cost efficiency | 1M tokens | Fast |
| **gemini-2.5-flash-lite** | High-volume, simple tasks | 1M tokens | Fastest |
| **gemini-3-pro-preview** | Latest capabilities | 2M tokens | Medium |

```python
from google import genai

client = genai.Client()

# List available models
models = client.models.list()
for model in models:
    print(f"{model.name}: {model.display_name}")
    print(f"  Input limit: {model.input_token_limit}")
    print(f"  Output limit: {model.output_token_limit}")
```

## System Instructions

Cấu hình behavior và parameters của model.

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Viết mô tả sản phẩm cho chai nước thông minh",
    config=types.GenerateContentConfig(
        system_instruction="Bạn là copywriter chuyên nghiệp về mô tả sản phẩm. Viết nội dung hấp dẫn, súc tích, nêu bật tính năng và lợi ích.",
        temperature=0.9,  # Cao hơn = sáng tạo hơn
        top_p=0.95,
        top_k=40,
        max_output_tokens=500,
        stop_sequences=["END"]
    )
)

print(response.text)
```

## Integration Patterns Summary

### Pattern 1: Simple Chatbot
```python
chat = client.chats.create(model="gemini-2.5-flash")
response = chat.send_message(user_input)
```

### Pattern 2: RAG System
```python
# 1. Embed documents
embeddings = [client.models.embed_content(model="gemini-embedding-001", contents=doc) for doc in docs]
# 2. Search relevant docs
# 3. Generate with context
response = client.models.generate_content(model="gemini-2.5-flash", contents=[context, query])
```

### Pattern 3: Batch Processing
```python
batch = client.batches.create(model="gemini-2.5-flash", requests=requests_list)
# Wait and retrieve results
```

### Pattern 4: Multimodal Analysis
```python
file = client.files.upload(file="video.mp4")
response = client.models.generate_content(model="gemini-2.5-flash", contents=["Analyze this", file])
```

### Pattern 5: Function Calling + Structured Output
```python
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=query,
    config={
        "tools": [tools],
        "response_mime_type": "application/json",
        "response_schema": schema
    }
)
```
