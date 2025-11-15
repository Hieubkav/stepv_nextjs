# Performance Optimization & Query Tuning

Query optimization, indexing strategies, và performance best practices.

## Indexing Strategy
```typescript
// convex/schema.ts
defineTable({
  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  })
  // Index for frequent single-field lookups
  .index("by_channel", ["channelId"])
  .index("by_author", ["authorId"])
  // Compound index for multi-field queries
  .index("by_channel_time", ["channelId", "createdAt"])
  // Full-text search index
  .searchIndex("search_content", {
    searchField: "content",
    filterField: "channelId",
  }),
});
```

## Never Use .filter() - Use .withIndex()
```typescript
// ❌ SLOW - scans entire table
export const getMessagesSlowBad = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    return await ctx.db
      .query("messages")
      .filter((msg) => msg.channelId === channelId)  // Slow!
      .collect();
  },
});

// ✅ FAST - uses index
export const getMessagesFastGood = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .collect();
  },
});
```

## Use .take() Instead of .collect()
```typescript
// ❌ SLOW - collects all documents
const allMessages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) => q.eq("channelId", channelId))
  .collect();

// ✅ FAST - limits results
const recentMessages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) => q.eq("channelId", channelId))
  .order("desc")
  .take(50);
```

## Pagination Pattern
```typescript
export const listMessages = query({
  args: {
    channelId: v.id("channels"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { channelId, paginationOpts }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .order("desc")
      .paginate(paginationOpts);
  },
});
```

## Batch Multiple Operations
```typescript
// ❌ SLOW - 3 separate database calls
export const slowAction = action({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    const channel = await ctx.runQuery(
      internal.channels.getChannel,
      { channelId }
    );
    const messages = await ctx.runQuery(
      internal.messages.getMessages,
      { channelId }
    );
    const users = await ctx.runQuery(
      internal.users.getChannelUsers,
      { channelId }
    );
    return { channel, messages, users };
  },
});

// ✅ FAST - single database call
export const fastAction = action({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    return await ctx.runQuery(internal.channels.getChannelData, {
      channelId,
    });
  },
});

export const getChannelData = internalQuery({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    const channel = await ctx.db.get(channelId);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .take(50);
    const users = await ctx.db
      .query("users")
      .filter((u) => u.channelId === channelId)
      .take(100);
    return { channel, messages, users };
  },
});
```

## Query Limits to Know
- **Max results in one query**: 16,384 documents
- **Query timeout**: 1 second
- **Mutation timeout**: 1 second
- **Action timeout**: 10 minutes
- **Concurrent operations in action**: 1000
- **Results from full-text search**: Limited to 100 results

## Database Query Optimization
```typescript
// Problem: Getting user's first 3 posts with comments
export const getUserPostsWithComments = query({
  args: { userId: v.id("users"), limit: v.number() },
  handler: async (ctx, { userId, limit }) => {
    // 1. Get user's posts
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_authorId", (q) => q.eq("authorId", userId))
      .order("desc")
      .take(limit);

    // 2. For each post, get comments (more efficient than separate queries)
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_postId", (q) => q.eq("postId", post._id))
          .take(5);
        return { ...post, comments };
      })
    );

    return postsWithComments;
  },
});
```

## Denormalization for Performance
```typescript
// Instead of looking up author every time:
defineTable({
  posts: defineTable({
    authorId: v.id("users"),  // This requires lookup
    title: v.string(),
  }),
});

// Denormalize author info directly:
defineTable({
  posts: defineTable({
    authorId: v.id("users"),
    authorName: v.string(),  // Cache for display
    authorEmail: v.string(),  // Cache for display
    title: v.string(),
  }),
});
```

## Caching Strategy
```typescript
// Cache user data client-side to avoid refetching
import { useQuery } from "convex/react";

export function UserProfile({ userId }: { userId: string }) {
  // This automatically caches and only refetches on change
  const user = useQuery(api.users.getUser, { userId });

  return <div>{user?.name}</div>;
}
```

## Monitor Performance
- Use Convex Dashboard "Functions" tab to see query times
- Check "Database" tab for document counts
- Monitor "Logs" for slow queries
- Profile with browser DevTools
- Use React DevTools Profiler

## Best Practices Summary
- Always use indexes for frequently queried fields
- Avoid .filter() on large datasets
- Use .take() to limit results
- Batch related queries together
- Paginate large result sets
- Denormalize hot data paths
- Cache client-side with useQuery
- Monitor and profile regularly
