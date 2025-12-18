# Gemini API SDK Usage Guide

## Cài đặt

### Python
```bash
pip install -q -U google-genai
```

### JavaScript/Node.js
```bash
npm install @google/genai
```

### Go
```bash
go get google.golang.org/genai
```

### Java (Maven)
```xml
<dependency>
    <groupId>com.google.genai</groupId>
    <artifactId>google-genai</artifactId>
    <version>1.0.0</version>
</dependency>
```

### C#/.NET
```bash
dotnet add package Google.GenAI
```

## Khởi tạo Client

### Python

```python
from google import genai

# Cách 1: Từ environment variable
# export GEMINI_API_KEY=your_key
client = genai.Client()

# Cách 2: Truyền trực tiếp
client = genai.Client(api_key="YOUR_API_KEY")

# Cách 3: Từ file
import os
api_key = open('api_key.txt').read().strip()
client = genai.Client(api_key=api_key)
```

### JavaScript

```javascript
import { GoogleGenAI } from "@google/genai";

// Cách 1: Từ environment variable
const ai = new GoogleGenAI({});

// Cách 2: Truyền trực tiếp
const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

// Cách 3: Từ process.env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

## Text Generation

### Basic

**Python:**
```python
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Viết một bài thơ về mùa xuân"
)
print(response.text)
```

**JavaScript:**
```javascript
const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Viết một bài thơ về mùa xuân",
});
console.log(response.text);
```

### Với System Instructions

**Python:**
```python
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Xin chào!",
    config={
        "system_instruction": "Bạn là một trợ lý AI thân thiện, luôn trả lời bằng tiếng Việt."
    }
)
```

**JavaScript:**
```javascript
const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Xin chào!",
    config: {
        systemInstruction: "Bạn là một trợ lý AI thân thiện, luôn trả lời bằng tiếng Việt."
    }
});
```

### Với Generation Config

**Python:**
```python
from google.genai import types

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Viết một câu chuyện ngắn",
    config=types.GenerateContentConfig(
        temperature=0.7,
        top_p=0.95,
        top_k=40,
        max_output_tokens=1024,
        stop_sequences=["THE END"]
    )
)
```

**JavaScript:**
```javascript
const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Viết một câu chuyện ngắn",
    config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
        stopSequences: ["THE END"]
    }
});
```

## Chat (Multi-turn Conversation)

### Python

```python
# Khởi tạo chat
chat = client.chats.create(model="gemini-2.5-flash")

# Gửi message
response = chat.send_message("Xin chào, tôi là Nam")
print(response.text)

response = chat.send_message("Tên tôi là gì?")
print(response.text)  # Sẽ nhớ context

# Xem history
for message in chat.history:
    print(f"{message.role}: {message.parts[0].text}")
```

### JavaScript

```javascript
// Khởi tạo chat
const chat = ai.chats.create({ model: "gemini-2.5-flash" });

// Gửi message
let response = await chat.sendMessage("Xin chào, tôi là Nam");
console.log(response.text);

response = await chat.sendMessage("Tên tôi là gì?");
console.log(response.text);

// Xem history
for (const message of chat.history) {
    console.log(`${message.role}: ${message.parts[0].text}`);
}
```

## Multimodal (Image + Text)

### Python - Image từ file

```python
import base64

# Đọc image
with open("image.png", "rb") as f:
    image_data = base64.b64encode(f.read()).decode()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        {"text": "Mô tả hình ảnh này"},
        {
            "inline_data": {
                "mime_type": "image/png",
                "data": image_data
            }
        }
    ]
)
print(response.text)
```

### Python - Image từ URL

```python
import requests
import base64

# Download image
image_url = "https://example.com/image.jpg"
image_data = base64.b64encode(requests.get(image_url).content).decode()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        {"text": "Mô tả hình ảnh này"},
        {
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": image_data
            }
        }
    ]
)
```

### JavaScript - Image

```javascript
import fs from 'fs';

const imageData = fs.readFileSync('image.png').toString('base64');

const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
        { text: "Mô tả hình ảnh này" },
        {
            inlineData: {
                mimeType: "image/png",
                data: imageData
            }
        }
    ]
});
```

## Streaming

### Python

```python
# Stream response
for chunk in client.models.generate_content_stream(
    model="gemini-2.5-flash",
    contents="Viết một bài văn dài về AI"
):
    print(chunk.text, end="", flush=True)
```

### JavaScript

```javascript
const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: "Viết một bài văn dài về AI",
});

for await (const chunk of stream) {
    process.stdout.write(chunk.text || "");
}
```

## Function Calling

### Python

```python
from google.genai import types

# Định nghĩa function
get_weather = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="get_weather",
            description="Lấy thông tin thời tiết hiện tại",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "location": types.Schema(
                        type="STRING",
                        description="Tên thành phố"
                    )
                },
                required=["location"]
            )
        )
    ]
)

# Gọi với function
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Thời tiết ở Hà Nội thế nào?",
    config=types.GenerateContentConfig(
        tools=[get_weather]
    )
)

# Kiểm tra function call
if response.candidates[0].content.parts[0].function_call:
    func_call = response.candidates[0].content.parts[0].function_call
    print(f"Function: {func_call.name}")
    print(f"Args: {func_call.args}")
```

### JavaScript

```javascript
const tools = [{
    functionDeclarations: [{
        name: "get_weather",
        description: "Lấy thông tin thời tiết hiện tại",
        parameters: {
            type: "OBJECT",
            properties: {
                location: {
                    type: "STRING",
                    description: "Tên thành phố"
                }
            },
            required: ["location"]
        }
    }]
}];

const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Thời tiết ở Hà Nội thế nào?",
    config: { tools }
});

const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;
if (functionCall) {
    console.log(`Function: ${functionCall.name}`);
    console.log(`Args: ${JSON.stringify(functionCall.args)}`);
}
```

## JSON Output

### Python

```python
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Liệt kê 3 ngôn ngữ lập trình phổ biến với mô tả ngắn",
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema={
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "name": {"type": "STRING"},
                    "description": {"type": "STRING"}
                }
            }
        }
    )
)

import json
data = json.loads(response.text)
```

### JavaScript

```javascript
const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Liệt kê 3 ngôn ngữ lập trình phổ biến với mô tả ngắn",
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING" },
                    description: { type: "STRING" }
                }
            }
        }
    }
});

const data = JSON.parse(response.text);
```

## REST API (cURL)

```bash
# Basic request
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [
      {"parts": [{"text": "Explain how AI works"}]}
    ]
  }'

# Với config
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [
      {"parts": [{"text": "Write a story"}]}
    ],
    "generationConfig": {
      "temperature": 0.7,
      "maxOutputTokens": 1024
    }
  }'
```

## PHP/Laravel

```php
<?php

use Illuminate\Support\Facades\Http;

class GeminiService
{
    private string $apiKey;
    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    
    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
    }
    
    public function generate(string $prompt, string $model = 'gemini-2.5-flash'): ?string
    {
        $response = Http::timeout(30)
            ->withHeaders([
                'x-goog-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post("{$this->baseUrl}/models/{$model}:generateContent", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 1024,
                ]
            ]);
        
        if ($response->successful()) {
            return $response->json('candidates.0.content.parts.0.text');
        }
        
        throw new \Exception('Gemini API error: ' . $response->body());
    }
    
    public function chat(array $messages, string $model = 'gemini-2.5-flash'): ?string
    {
        $contents = array_map(function ($msg) {
            return [
                'role' => $msg['role'],
                'parts' => [['text' => $msg['content']]]
            ];
        }, $messages);
        
        $response = Http::timeout(30)
            ->withHeaders([
                'x-goog-api-key' => $this->apiKey,
            ])
            ->post("{$this->baseUrl}/models/{$model}:generateContent", [
                'contents' => $contents
            ]);
        
        return $response->json('candidates.0.content.parts.0.text');
    }
}

// Usage
$gemini = new GeminiService();
$result = $gemini->generate('Viết một câu chuyện ngắn');
```

## Available Models

| Model | Description | Context | Best For |
|-------|-------------|---------|----------|
| gemini-2.5-flash | Fast, balanced | 1M tokens | General purpose |
| gemini-2.5-flash-lite | Ultra fast | 1M tokens | High volume, simple tasks |
| gemini-2.5-pro | High quality | 2M tokens | Complex reasoning |
| gemini-3-pro-preview | Latest | 2M tokens | Experimental |
| gemini-2.0-flash | Previous gen | 1M tokens | Stable, tested |

## Tips & Best Practices

1. **Chọn model phù hợp**: Dùng flash-lite cho tasks đơn giản
2. **Set temperature**: 0.0-0.3 cho factual, 0.7-1.0 cho creative
3. **Limit output tokens**: Tránh waste quota
4. **Cache responses**: Cho prompts giống nhau
5. **Use streaming**: Cho UX tốt hơn với responses dài
