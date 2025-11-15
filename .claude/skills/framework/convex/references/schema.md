# Schema Design Patterns

Database schema definition, table structures, indexes, validators, và relationships.

## Basic Schema
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
  
  posts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
  }).index("by_userId", ["userId"]),
});
```

## Validators
```typescript
// Basic types
defineTable({
  stringField: v.string(),
  numberField: v.number(),
  boolField: v.boolean(),
  anyField: v.any(),
});

// Optional fields
defineTable({
  optionalString: v.optional(v.string()),
  optionalNumber: v.optional(v.number()),
});

// Unions (multiple types)
defineTable({
  status: v.union(
    v.literal("pending"),
    v.literal("completed"),
    v.literal("failed"),
  ),
});

// Objects
defineTable({
  metadata: v.object({
    tags: v.array(v.string()),
    category: v.string(),
  }),
});

// Arrays
defineTable({
  tags: v.array(v.string()),
  scores: v.array(v.number()),
});

// Record (key-value mapping)
defineTable({
  scores: v.record(v.string(), v.number()),
});
```

## Indexes for Performance
```typescript
defineTable({
  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.id("users"),
    timestamp: v.number(),
    content: v.string(),
  })
  .index("by_channel", ["channelId"])
  .index("by_author", ["authorId"])
  .index("by_channel_time", ["channelId", "timestamp"])
  .searchIndex("search_content", {
    searchField: "content",
    filterField: "channelId",
  }),
});
```

## Document References (Foreign Keys)
```typescript
defineTable({
  posts: defineTable({
    userId: v.id("users"),  // Reference to users table
    title: v.string(),
  }),
  users: defineTable({
    name: v.string(),
  }),
});
```

## Circular References (Handle Carefully)
```typescript
// ❌ Cannot do this directly (schema validation fails)
defineTable({
  users: defineTable({
    profileId: v.id("profiles"),
  }),
  profiles: defineTable({
    userId: v.id("users"),  // Circular reference!
  }),
});

// ✅ Make one reference optional/nullable
defineTable({
  users: defineTable({
    profileId: v.id("profiles"),
  }),
  profiles: defineTable({
    userId: v.union(v.id("users"), v.null()),
  }),
});

// Then in mutation:
// 1. Create profile first
// 2. Create user with profileId
// 3. Update profile with userId
```

## Polymorphic Documents (Union Types)
```typescript
// Store different document types in same table
defineTable({
  events: defineTable(
    v.union(
      v.object({
        type: v.literal("message"),
        channelId: v.id("channels"),
        content: v.string(),
      }),
      v.object({
        type: v.literal("join"),
        channelId: v.id("channels"),
        userId: v.id("users"),
      }),
      v.object({
        type: v.literal("leave"),
        channelId: v.id("channels"),
        userId: v.id("users"),
      }),
    )
  ),
});
```

## System Fields
```typescript
// Automatically added by Convex to every document:
{
  _id: Id<"tableName">,      // Unique document ID
  _creationTime: number,      // Timestamp when created
}
```

## Query with Indexes
```typescript
// In your query function
export const getMessages = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    // Use index for efficient querying
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(50);
  },
});
```

## Full-Text Search
```typescript
defineTable({
  articles: defineTable({
    title: v.string(),
    content: v.string(),
    category: v.string(),
  }).searchIndex("search_articles", {
    searchField: "content",
    filterField: "category",
  }),
});

// Query with full-text search
export const searchArticles = query({
  args: { query: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, { query, category }) => {
    let q = ctx.db
      .query("articles")
      .withSearchIndex("search_articles", (q) => q.search(query));
    
    if (category) {
      q = q.filter((article) => article.category === category);
    }
    
    return await q.take(20);
  },
});
```

## Schema Validation Options
```typescript
export default defineSchema(
  {
    // Define tables...
  },
  {
    // Validate at runtime
    schemaValidation: true,  // default: true
    
    // Allow tables not in schema
    strictTableNameTypes: false,  // default: true (strict)
  },
);
```
