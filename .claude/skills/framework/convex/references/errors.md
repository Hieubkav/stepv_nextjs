# Error Handling & Recovery Patterns

Error handling strategies, retry logic, và recovery patterns.

## Basic Error Handling in Mutations
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, { email, name }) => {
    // Check for duplicate email
    const existing = await ctx.db
      .query("users")
      .filter((u) => u.email === email)
      .first();

    if (existing) {
      throw new Error("Email already registered");
    }

    // Validate input
    if (!email.includes("@")) {
      throw new Error("Invalid email format");
    }

    if (name.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }

    const userId = await ctx.db.insert("users", { email, name });
    return userId;
  },
});
```

## Error Handling in Actions (No Auto-Retry)
```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const callExternalAPI = action({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    try {
      // Call external API
      const response = await fetch("https://api.example.com/process", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        // Specific error for different status codes
        if (response.status === 404) {
          throw new Error("User not found in external system");
        } else if (response.status === 429) {
          throw new Error("Rate limited - please retry later");
        } else if (response.status >= 500) {
          throw new Error("External service temporarily unavailable");
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      // Actions don't auto-retry - error goes to client
      console.error("External API call failed:", error);
      throw error;
    }
  },
});
```

## Custom Error Classes
```typescript
// lib/errors.ts
export class ConvexError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ConvexError";
  }
}

export class ValidationError extends ConvexError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class AuthorizationError extends ConvexError {
  constructor(message: string) {
    super(message, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends ConvexError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND");
  }
}

// Usage in mutation
export const updateUser = mutation({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, { userId, name }) => {
    if (name.trim().length === 0) {
      throw new ValidationError("Name cannot be empty");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || user.tokenIdentifier !== identity.tokenIdentifier) {
      throw new AuthorizationError("Cannot update other users");
    }

    await ctx.db.patch(userId, { name });
    return userId;
  },
});
```

## Retry Logic in Actions
```typescript
export const callExternalAPIWithRetry = action({
  args: { userId: v.id("users"), maxRetries: v.number() },
  handler: async (ctx, { userId, maxRetries = 3 }) => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch("https://api.example.com/process", {
          method: "POST",
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}`);
          // Retry on 429 (rate limit) and 5xx errors
          if (response.status === 429 || response.status >= 500) {
            lastError = error;
            // Exponential backoff
            const delay = Math.pow(2, attempt - 1) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          throw error;
        }

        return await response.json();
      } catch (error: any) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed:`, error.message);

        if (attempt === maxRetries) {
          throw new Error(
            `Failed after ${maxRetries} attempts: ${lastError?.message}`
          );
        }
      }
    }

    throw lastError;
  },
});
```

## Validation with Error Messages
```typescript
import { ValidationError } from "./lib/errors";

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, { title, content, tags }) => {
    const errors: string[] = [];

    // Collect all validation errors
    if (!title?.trim()) {
      errors.push("Title is required");
    } else if (title.length > 200) {
      errors.push("Title must be less than 200 characters");
    }

    if (!content?.trim()) {
      errors.push("Content is required");
    } else if (content.length < 10) {
      errors.push("Content must be at least 10 characters");
    }

    if (tags.length > 10) {
      errors.push("Maximum 10 tags allowed");
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join("; "));
    }

    const postId = await ctx.db.insert("posts", {
      title: title.trim(),
      content: content.trim(),
      tags,
      createdAt: Date.now(),
    });

    return postId;
  },
});
```

## Client-Side Error Handling
```typescript
// src/components/UserForm.tsx
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

export function UserForm() {
  const [error, setError] = useState<string | null>(null);
  const createUser = useMutation(api.users.createUser);

  const handleSubmit = async (name: string, email: string) => {
    setError(null);

    try {
      await createUser({ name, email });
    } catch (err: any) {
      // Parse error from server
      const message = err.message || "Unknown error";

      if (message.includes("Email already registered")) {
        setError("This email is already registered");
      } else if (message.includes("Invalid email")) {
        setError("Please enter a valid email address");
      } else if (message.includes("VALIDATION_ERROR")) {
        setError(`Invalid input: ${message}`);
      } else {
        setError("Failed to create user. Please try again.");
      }
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSubmit(
            formData.get("name") as string,
            formData.get("email") as string
          );
        }}
      >
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <button type="submit">Create</button>
      </form>
      {error && <div className="error">{error}</div>}
    </>
  );
}
```

## Error Recovery Patterns
```typescript
// Mutation with automatic error recovery
export const updatePostWithRecovery = mutation({
  args: { postId: v.id("posts"), title: v.string() },
  handler: async (ctx, { postId, title }) => {
    // Get original data for rollback
    const originalPost = await ctx.db.get(postId);
    if (!originalPost) {
      throw new Error("Post not found");
    }

    try {
      // Update post
      await ctx.db.patch(postId, { title });

      // Validate update succeeded
      const updated = await ctx.db.get(postId);
      if (updated?.title !== title) {
        throw new Error("Update verification failed");
      }

      return updated;
    } catch (error) {
      // Log error for debugging
      console.error("Failed to update post:", error);

      // Optionally: record error event
      await ctx.db.insert("errorLogs", {
        type: "post_update_failed",
        postId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      });

      throw error;
    }
  },
});
```

## Error Logging
```typescript
// Capture errors for debugging
export const logError = mutation({
  args: {
    message: v.string(),
    code: v.string(),
    stack: v.optional(v.string()),
  },
  handler: async (ctx, { message, code, stack }) => {
    return await ctx.db.insert("errorLogs", {
      message,
      code,
      stack,
      timestamp: Date.now(),
      userAgent: undefined,
    });
  },
});
```

## Best Practices
- Throw meaningful error messages
- Use specific error types when possible
- Validate input early
- Don't expose sensitive errors to clients
- Log errors for debugging and monitoring
- Implement retry logic for flaky services
- Handle both client and server errors gracefully
- Test error paths in your code
