# Testing Setup & Debugging Approaches

Unit testing, integration testing, và debugging strategies cho Convex.

## Setup Vitest for Testing
```typescript
// convex/convexSetup.ts
import { createMockContext } from "convex/testing";

export function mockContext() {
  return createMockContext();
}
```

## Basic Unit Test
```typescript
// convex/users.test.ts
import { describe, it, expect } from "vitest";
import { mockContext } from "./convexSetup";
import { createUser } from "./users";

describe("createUser", () => {
  it("should create a new user", async () => {
    const ctx = mockContext();
    
    const userId = await createUser.handler(ctx, {
      email: "test@example.com",
      name: "Test User",
    });

    expect(userId).toBeDefined();
  });

  it("should reject duplicate email", async () => {
    const ctx = mockContext();

    await expect(
      createUser.handler(ctx, {
        email: "duplicate@example.com",
        name: "User 1",
      })
    ).rejects.toThrow("Email already registered");
  });
});
```

## Testing with Database Mocks
```typescript
// convex/posts.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { mockContext } from "./convexSetup";
import { createPost, getPosts } from "./posts";

describe("posts", () => {
  let ctx: any;

  beforeEach(() => {
    ctx = mockContext();
  });

  it("should create and retrieve posts", async () => {
    // Create post
    const postId = await createPost.handler(ctx, {
      title: "Test Post",
      content: "Test content",
    });

    expect(postId).toBeDefined();

    // Retrieve post
    const posts = await getPosts.handler(ctx, { limit: 10 });
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe("Test Post");
  });

  it("should validate post content", async () => {
    await expect(
      createPost.handler(ctx, {
        title: "Too Short",
        content: "short",  // Less than 10 chars
      })
    ).rejects.toThrow();
  });
});
```

## Testing Authentication
```typescript
// convex/auth.test.ts
import { describe, it, expect, vi } from "vitest";
import { mockContext } from "./convexSetup";
import { createPost } from "./posts";

describe("authentication", () => {
  it("should require authentication for post creation", async () => {
    const ctx = mockContext();
    
    // Simulate unauthenticated user
    ctx.auth.getUserIdentity = vi.fn().mockResolvedValue(null);

    await expect(
      createPost.handler(ctx, {
        title: "Test",
        content: "Test content",
      })
    ).rejects.toThrow("Must be logged in");
  });

  it("should allow authenticated users to create posts", async () => {
    const ctx = mockContext();
    
    // Mock authenticated identity
    ctx.auth.getUserIdentity = vi.fn().mockResolvedValue({
      email: "user@example.com",
      name: "Test User",
      tokenIdentifier: "user_123",
    });

    const postId = await createPost.handler(ctx, {
      title: "Test",
      content: "Test content",
    });

    expect(postId).toBeDefined();
  });
});
```

## Console Logging for Debugging
```typescript
// convex/debug.ts
export const debugQuery = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    console.log("Query started for channel:", channelId);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .collect();

    console.log(`Found ${messages.length} messages`);
    console.log("First message:", messages[0]);

    return messages;
  },
});
```

## Check Logs in Dashboard
```
Steps:
1. Go to Convex Dashboard → Your Project
2. Click "Logs" tab
3. Filter by time/function name
4. View console.log output in real-time
```

## Using Browser DevTools
```typescript
// src/components/DebugPanel.tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function DebugPanel() {
  const data = useQuery(api.debug.getCurrentData);

  // Inspect in browser console
  console.log("Current data:", data);

  // Add breakpoint by clicking into DevTools
  debugger;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

## Testing Error Paths
```typescript
// convex/errors.test.ts
import { describe, it, expect } from "vitest";
import { mockContext } from "./convexSetup";
import { updatePost, deletePost } from "./posts";

describe("error handling", () => {
  it("should not allow updating non-existent post", async () => {
    const ctx = mockContext();

    await expect(
      updatePost.handler(ctx, {
        postId: "fake_id" as any,
        title: "New Title",
      })
    ).rejects.toThrow("Post not found");
  });

  it("should not allow deleting other user's post", async () => {
    const ctx = mockContext();
    
    // Mock authenticated as user 1
    ctx.auth.getUserIdentity = vi.fn().mockResolvedValue({
      tokenIdentifier: "user_1",
    });

    // Try to delete post owned by user 2
    // This should fail if proper authorization is implemented
    await expect(deletePost.handler(ctx, { postId: "fake_id" as any }))
      .rejects
      .toThrow();
  });
});
```

## Integration Testing
```typescript
// src/__tests__/integration.test.ts
import { describe, it, expect } from "vitest";
import { ConvexHttpClient } from "convex/browser";

describe("integration tests", () => {
  const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

  it("should create and retrieve user", async () => {
    // This requires running local Convex instance
    const userId = await client.mutation(api.users.createUser, {
      email: "test@example.com",
      name: "Test",
    });

    const user = await client.query(api.users.getUser, { userId });
    expect(user.email).toBe("test@example.com");
  });
});
```

## Local Development: npx convex dev
```bash
# Start local Convex server
npx convex dev

# Runs at http://localhost:3210
# Auto-reloads on code changes
# Local database stored in memory
```

## Debugging Tips
1. **Use console.log** in mutations/queries
2. **Check Logs tab** in Convex Dashboard
3. **Use browser DevTools** for frontend debugging
4. **Enable breakpoints** with debugger statement
5. **Check database state** in Dashboard Data tab
6. **Run tests** with `npm test` or `vitest`
7. **Use TypeScript** to catch errors early
8. **Validate arguments** before operations
9. **Add error tracking** for production issues

## Error Traces
```typescript
// Get full error stack
try {
  await someOperation();
} catch (error) {
  console.error("Full error:", error);
  if (error instanceof Error) {
    console.error("Stack trace:", error.stack);
  }
}
```

## Monitoring Production
- Use Convex Dashboard "Functions" tab to monitor execution
- Check "Database" tab for document/index sizes
- Review "Logs" for errors and performance issues
- Set up external monitoring (e.g., Sentry)
- Track key metrics (latency, error rate, usage)
