# Convex Queries - Updated with Official Best Practices (2025)

## Core Query Pattern (Official)
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getMessagesByChannel = query({
  args: { 
    channelId: v.id("channels"),
    paginationOpts: paginationOptsValidator 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

## Pagination (Official Implementation)
```typescript
// ✅ CURSOR-BASED PAGINATION (Latest Official Pattern)
export const listPaginatedItems = query({
  args: { 
    paginationOpts: paginationOptsValidator 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// React Hook Usage:
const { results, status, loadMore } = usePaginatedQuery(
  api.queries.listPaginatedItems,
  {},
  { initialNumItems: 20 }
);

// Manual pagination:
const paginationOpts = { cursor, numItems: 20 };
```

## Index Design (Official Best Practices)
```typescript
// ❌ AVOID REDUNDANT INDEXES
const badSchema = defineSchema({
  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.id("users"),
    content: v.string(),
  })
  .index("by_channel", ["channelId"]) // REDUNDANT!
  .index("by_channel_and_author", ["channelId", "authorId"]),
});

// ✅ USE COMPOUND INDEXES
const goodSchema = defineSchema({
  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.id("users"),
    content: v.string(),
  })
  .index("by_channel_and_author", ["channelId", "authorId"]), // Covers both queries!
});

// Query optimization:
export const getChannelMessages = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    // Use same index, omit author condition
    return await ctx.db
      .query("messages")
      .withIndex("by_channel_and_author", (q) => q.eq("channelId", channelId))
      .collect();
  },
});
```

## Full Text Search (Official Implementation)
```typescript
// Schema with search index (Latest)
const schema = defineSchema({
  documents: defineTable({
    title: v.string(),
    content: v.string(),
    category: v.string(),
  })
  .searchIndex("search_content", {
    searchField: "content",
    filterFields: ["category"], // Multiple filter fields supported
  }),
});

// Search query with filtering
export const searchDocuments = query({
  args: { 
    query: v.string(),
    category: v.optional(v.string())
  },
  handler: async (ctx, { query, category }) => {
    let searchQuery = ctx.db
      .query("documents")
      .withSearchIndex("search_content", (q) => q.search(query));
    
    if (category) {
      searchQuery = searchQuery.filter(doc => doc.category === category);
    }
    
    return await searchQuery.take(10);
  },
});
```

## Best Practices Summary (Official Guide)

### NEVER DO THIS:
```typescript
// ❌ ANTI-PATTERN: Using .filter() on database queries
const tomsMessages = await ctx.db
  .query("messages")
  .filter((q) => q.eq(q.field("author"), "Tom"))
  .collect();
```

### ALWAYS DO THIS:
```typescript
// ✅ BEST PRACTICE: Use .withIndex() or filter in code
// Option 1: Index (recommended for large datasets)
const tomsMessages = await ctx.db
  .query("messages")
  .withIndex("by_author", (q) => q.eq("author", "Tom"))
  .collect();

// Option 2: Filter in code (for small datasets)
const allMessages = await ctx.db.query("messages").collect();
const tomsMessages = allMessages.filter((m) => m.author === "Tom");
```

### BANDWIDTH OPTIMIZATION:
```typescript
// ❌ POTENTIALLY UNBOUNDED
const allWatchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", userId))
  .collect();

// ✅ OPTIMIZED PATTERNS:
// 1. Pagination for large datasets
const watchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", userId))
  .order("desc")
  .paginate(paginationOpts);

// 2. Take limit (for "99+" display)
const watchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", userId))
  .take(100);

// 3. Denormalize count
const watchedCount = await ctx.db
  .query("watchedMoviesCount")
  .withIndex("by_user", (q) => q.eq("user", userId))
  .unique();
```

## Advanced Query Patterns (Updated)

### Complex Filtering with Indexes:
```typescript
export const getFilteredMessages = query({
  args: { 
    channelId: v.id("channels"),
    dateRange: v.object({
      start: v.number(),
      end: v.number(),
    }),
    authorId: v.optional(v.id("users"))
  },
  handler: async (ctx, { channelId, dateRange, authorId }) => {
    let baseQuery = ctx.db
      .query("messages")
      .withIndex("by_channel_time", (q) => 
        q.eq("channelId", channelId)
         .gte("_creationTime", dateRange.start)
         .lt("_creationTime", dateRange.end)
      );
    
    if (authorId) {
      baseQuery = baseQuery.filter(msg => msg.authorId === authorId);
    }
    
    return await baseQuery.order("desc").take(50);
  },
});
```

## Performance Guidelines (Official)
- **AwAIWA**: AIl promises with ESLint `no-floating-promises`
- **Filter rule**: Use `.withIndex()` for 1000+ docs, filter in code for smaller sets
- **Collection limit**: Avoid `.collect()` on unbounded datasets
- **Index optimization**: Remove redundant prefixes in indexes
- **Pagination exception**: `.filter()` works better than code filtering on paginated queries
