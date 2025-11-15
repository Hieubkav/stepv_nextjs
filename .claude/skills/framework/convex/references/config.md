# Environment Variables & Configuration

Setup environment variables, secrets, and configuration management cho Convex.

## .env.local Setup
```env
# Convex configuration
VITE_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment

# API Keys (keep secret!)
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
DATABASE_URL=mongodb://...
```

## Accessing Environment Variables in Actions
```typescript
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const callExternalAPI = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    return await response.json();
  },
});
```

## Accessing Environment Variables in Client
```typescript
// src/App.tsx
const convexUrl = import.meta.env.VITE_CONVEX_URL;
const clientOrigin = import.meta.env.VITE_APP_URL;
```

## Using Secrets with HTTP Actions
```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/webhook/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Verify Stripe signature
    const body = await request.text();
    // ... verification logic

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }),
});

export default http;
```

## Environment-Specific Configuration
```typescript
// convex/lib/config.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  
  // API endpoints
  openaiUrl: "https://api.openai.com/v1",
  stripeUrl: "https://api.stripe.com",
  
  // Rate limits
  maxRequestsPerSecond: process.env.NODE_ENV === "production" ? 100 : 1000,
  
  // Timeouts
  externalApiTimeout: 30000, // 30 seconds
};
```

## Using Config in Actions
```typescript
import { config } from "./lib/config";

export const processWithTimeout = action({
  args: { data: v.string() },
  handler: async (ctx, { data }) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        config.externalApiTimeout
      );

      const response = await fetch("https://api.example.com", {
        signal: controller.signal,
        body: JSON.stringify({ data }),
      });

      clearTimeout(timeoutId);
      return await response.json();
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  },
});
```

## Secure Secrets Best Practices
- **Never commit secrets** to version control
- **Use .env.local** for local development (add to .gitignore)
- **Use Convex Dashboard** for production secrets
- **Rotate API keys** regularly
- **Log sensitive data** carefully (never log full keys)
- **Use environment-specific values** for different deployments
