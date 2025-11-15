# Action Implementation Patterns

Actions cho external API calls, HTTP endpoints, và Node.js runtime patterns.

## Basic Action Pattern
```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const externalAPICall = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    // Call external service
    const response = await fetch("https://api.example.com/", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
    return await response.json();
  },
});
```

## Reading/Writing Data from Action
```typescript
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

export const processMessage = action({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    // Read từ database
    const message = await ctx.runQuery(internal.messages.getById, { messageId });
    
    // Process
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message.content }],
    });
    
    // Write vào database
    await ctx.runMutation(internal.messages.updateResponse, {
      messageId,
      response: result.choices[0].message.content,
    });
  },
});
```

## HTTP Endpoints (HTTP Actions)
```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/webhook/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await request.json();
    
    // Process Stripe webhook
    if (event.type === "charge.succeeded") {
      await ctx.runMutation(internal.orders.recordPayment, {
        orderId: event.data.object.metadata.orderId,
        amount: event.data.object.amount,
      });
    }
    
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }),
});

export default http;
```

## Scheduling with Mutations
```typescript
export const createTask = mutation({
  args: { taskName: v.string() },
  handler: async (ctx, { taskName }) => {
    // Save task
    const taskId = await ctx.db.insert("tasks", { taskName });
    
    // Schedule action to process after 5 minutes
    await ctx.scheduler.runAfter(5 * 60 * 1000, internal.tasks.processTask, {
      taskId,
    });
    
    return taskId;
  },
});

export const processTask = internalAction({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    // Heavy processing
    const task = await ctx.runQuery(internal.tasks.getTask, { taskId });
    const result = await longRunningOperation(task);
    
    await ctx.runMutation(internal.tasks.updateResult, { taskId, result });
  },
});
```

## Use Node Runtime
```typescript
// convex/aiProcessing.ts
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import SomeNodePackage from "some-npm-package"; // Npm packages need "use node"

export const processWithNodePackage = action({
  args: { data: v.string() },
  handler: async (ctx, { data }) => {
    // Use Node.js-specific package
    const result = await SomeNodePackage.process(data);
    return result;
  },
});
```

## Error Handling (No Auto-Retry)
```typescript
export const unreliableAction = action({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    try {
      // Call external API
      const response = await fetch("https://payment-api.com/charge", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });
      
      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Action không tự động retry - lỗi sẽ được truyền đến client
      // Client có trách nhiệm retry nếu cần
      console.error("Payment processing failed:", error);
      throw error;
    }
  },
});
```

## Action Limits & Best Practices
- **Timeout**: 10 minutes max
- **Memory**: 512MB (Node.js), 64MB (Convex runtime)
- **Concurrent ops**: Up to 1000 concurrent queries/mutations/fetches
- **No auto-retry**: Errors propagate to client - implement retry logic yourself
- **Batch database calls**: Avoid multiple `ctx.runQuery` / `ctx.runMutation` calls separately
- **Await all promises**: Never leave dangling promises (may cause issues in reused runtimes)
