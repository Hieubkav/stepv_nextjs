# Convex Mutations - Updated with Official Best Practices (2025)

## Basic Mutation Pattern (Official)
```typescript
import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { GenericMutationCtx } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // ✅ AUTH PATTERN - Always check user identity
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // ✅ VALIDATION - Check document exists
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    // ✅ ATOMIC INSERT - Use Date.now() for timestamps
    const messageId = await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: user.subject as Id<"users">,
      content: args.content,
      timestamp: Date.now(),
    });

    return { success: true, messageId };
  },
});
```

## Database Operations (Updated)

### CRUD Operations with Validation:
```typescript
// INSERT - Create with existence checks
export const createUser = mutation({
  args: { 
    name: v.string(), 
    email: v.string(),
    timezone: v.optional(v.string())
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    
    // Check for email conflicts
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .unique();
    
    if (existingUser) {
      throw new Error("Email already exists");
    }
    
    return await ctx.db.insert("users", args);
  },
});

// PATCH - Partial updates with validation
export const updateUserInfo = mutation({
  args: { 
    userId: v.id("users"), 
    name: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity();
    if (!currentUser) throw new Error("Unauthorized");
    
    // ✅ ACCESS CONTROL - Check ownership or admin
    if (currentUser.subject !== args.userId) {
      throw new Error("Cannot update other user");
    }
    
    const { userId, ...updates } = args;
    return await ctx.db.patch(userId, updates);
  },
});

// DELETE - Soft delete pattern (recommended)
export const softDeleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUser = await ctx.auth.getUserIdentity();
    if (!currentUser || currentUser.subject !== userId) {
      throw new Error("Unauthorized");
    }
    
    // ✅ SOFT DELETE - Mark as deleted instead of removing
    return await ctx.db.patch(userId, { 
      deleted: true,
      deletedAt: Date.now(),
    });
  },
});
```

## Scheduling (Official Pattern)
```typescript
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const sendMessageWithAI = mutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    
    // ✅ ATOMIC: All database ops happen in one transaction
    await ctx.db.insert("messages", {
      channelId: args.channelId,
      role: "user",
      content: args.content,
      authorId: user.subject as Id<"users">,
      timestamp: Date.now(),
    });

    // ✅ TRANSACTIONAL SCHEDULING: Only runs if mutation succeeds
    await ctx.scheduler.runAfter(0, internal.ai.generateResponse, {
      channelId: args.channelId,
    });

    return { sent: true };
  },
});

// ✅ INTERNAL ACTION - Cannot be called from client
export const generateResponse = internalAction({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    // ✅ RUNQUERY - Single call for consistency
    const recentMessages = await ctx.runQuery(
      internal.messages.getChannelMessages,
      { channelId, limit: 10 }
    );

    // ✅ EXTERNAL API CALL
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: recentMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
      }),
    });

    const data = await aiResponse.json();
    
    // ✅ RUNMUTATION - Save AI response
    await ctx.runMutation(internal.messages.saveAIMessage, {
      channelId,
      content: data.choices[0].message.content,
    });
  },
});
```

## OCC (Optimistic Concurrency Control) - Official Pattern
```typescript
export const transferFunds = mutation({
  args: {
    fromAccountId: v.id("accounts"),
    toAccountId: v.id("accounts"),
    amount: v.number(),
  },
  handler: async (ctx, { fromAccountId, toAccountId, amount }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    
    // ✅ OCC PATTERN: Check balances and update atomically
    const fromAccount = await ctx.db.get(fromAccountId);
    const toAccount = await ctx.db.get(toAccountId);
    
    if (!fromAccount || !toAccount) throw new Error("Account not found");
    if (fromAccount.balance < amount) throw new Error("Insufficient funds");
    if (fromAccount.owner !== user.subject) throw new Error("Unauthorized");
    
    // ✅ ATOMIC TRANSFER - All writes in one transaction
    await ctx.db.patch(fromAccountId, { 
      balance: fromAccount.balance - amount 
    });
    
    await ctx.db.patch(toAccountId, { 
      balance: toAccount.balance + amount 
    });
    
    return { success: true };
  },
});
```

## Error Handling with Validation
```typescript
// ✅ COMPREHENSIVE VALIDATION PATTERN
export const createChannel = mutation({
  args: { 
    name: v.string(),
    description: v.optional(v.string()),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // ✅ AUTHENTICATION
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    
    // ✅ INPUT VALIDATION
    if (args.name.length < 3 || args.name.length > 50) {
      throw new Error("Channel name must be 3-50 characters");
    }
    
    // ✅ BUSINESS RULES
    const existingChannel = await ctx.db
      .query("channels")
      .withIndex("by_name", q => q.eq("name", args.name))
      .first();
    
    if (existingChannel) {
      throw new Error("Channel name already exists");
    }
    
    // ✅ SAFE INSERT
    const channelId = await ctx.db.insert("channels", {
      name: args.name,
      description: args.description,
      isPrivate: args.isPrivate ?? false,
      ownerId: user.subject as Id<"users">,
      memberIds: [user.subject as Id<"users">],
      createdAt: Date.now(),
    });

    return { channelId, created: true };
  },
});
```

## Helper Function Pattern (Official Best Practice)
```typescript
// ✅ HELPER FUNCTIONS in convex/model/
export async function sendMessageHelper(
  ctx: GenericMutationCtx<any>, 
  args: { 
    channelId: Id<"channels">;
    content: string; 
    authorId: Id<"users">;
  }
) {
  // Shared validation logic
  const channel = await ctx.db.get(args.channelId);
  if (!channel) throw new Error("Channel not found");
  
  return await ctx.db.insert("messages", {
    channelId: args.channelId,
    content: args.content,
    authorId: args.authorId,
    timestamp: Date.now(),
  });
}

// Public function with auth + validation
export const sendMessage = mutation({
  args: { channelId: v.id("channels"), content: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    
    return await sendMessageHelper(ctx, {
      channelId: args.channelId,
      content: args.content,
      authorId: user.subject as Id<"users">,
    });
  },
});
```

## Mutation Best Practices (Official 2025)

### 🔴 AVOID THESE MISTAKES:
- **Missing auth checks** - Always verify user identity
- **Sequential ctx.run\*** - Use helper functions instead
- **Direct API calls** from mutations - schedule actions instead
- **No input validation** - Use v.* validators always
- **Unbounded operations** - Use pagination/limits

### ✅ RECOMMENDED PATTERNS:
- **AwAIWA**: All promises with ESLint `no-floating-promises`
- **Internal functions** for scheduled ops and ctx.run calls
- **Helper functions** for shared logic (convex/model/)
- **Atomic transactions** - all writes in one mutation
- **Access control** with `ctx.auth.getUserIdentity()`
- **OCC patterns** for financial/data-critical operations
- **Soft deletes** instead of hard deletes
- **Return meaningful data** for immediate UI feedback
