---
name: convex
description: PROACTIVELY USED for Convex backend development. Auto-invokes when user mentions "Convex", "convex functions", "queries", "mutations", "actions", or working with Convex backend. Ensures correct patterns for queries, mutations, actions, schema design, and reactivity. Handles the complete development lifecycle from schema to deployment.
---

# Convex Development Expert Skill

## Level 1: Overview

Expert Convex development skill providing comprehensive guidance for building reactive, real-time backends with TypeScript. Ensures correct patterns for queries, mutations, actions, schema design, React hooks integration, and deployment.

### Skill này làm gì?
- Query development với pagination, indexing, optimization
- Mutation patterns với transactions, validation, batch operations
- Action workflows với external APIs, scheduling, runtime selection
- Schema design với validators, relationships, redundant index optimization
- React integration với useQuery, useMutation, type-safety
- Authentication & authorization với JWT patterns, access control
- File storage với upload/download workflows
- Performance optimization và error handling

### Yêu cầu gì?
- Convex project đã setup (`npx create-convex-app` hoặc existing project)
- TypeScript knowledge cho type-safety
- Understanding của reactive programming paradigms
- React hooks familiarity cho frontend integration

### Output ra sao?
- Production-ready Convex backend code
- Optimized queries/mutations/actions theo best practices
- Proper schema với validation và indexing
- Complete integration patterns cho frontend

---

## Level 2: Quick Start

### Core Patterns (Official Best Practices 2025)

#### Query Development
```typescript
// ✅ PAGINATION WITH INDEXES
export const getMessages = query({
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

#### Mutation with Auth & Validation
```typescript
// ✅ AUTH + VALIDATION PATTERN
export const sendMessage = mutation({
  args: { channelId: v.id("channels"), content: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    
    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel not found");
    
    return await ctx.db.insert("messages", {
      channelId: args.channelId,
      content: args.content,
      authorId: user.subject as Id<"users">,
      timestamp: Date.now(),
    });
  },
});
```

#### Action Workflows
```typescript
// ✅ EXTERNAL API INTEGRATION
export const generateResponse = internalAction({
  args: { message: v.string() },
  handler: async (ctx, { message }) => {
    const response = await fetch('https://api.openai.com/...', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    
    return await response.json();
  },
});
```

#### Schema with Best Indexes
```typescript
// ✅ REDUNDANT INDEX ELIMINATION
const schema = defineSchema({
  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.id("users"), 
    content: v.string(),
  })
  .index("by_channel_and_author", ["channelId", "authorId"]), // ✅ COMPOUND
  // ❌ AVOID: .index("by_channel", ["channelId"]) - REDUNDANT!
});
```

### React Integration
```typescript
// ✅ TYPE-SAFE HOOKS USAGE
export function MessageList({ channelId }: { channelId: Id<"channels"> }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.getMessages,
    { channelId },
    { initialNumItems: 20 }
  );
  
  const sendMessage = useMutation(api.messages.sendMessage);
  
  return (
    <div>
      {results?.map(msg => <div key={msg._id}>{msg.content}</div>)}
      <button onClick={() => sendMessage({ 
        channelId, 
        content: "Hello!" 
      })}>
        Send Message
      </button>
    </div>
  );
}
```

### Performance Guidelines
- **AwAIWA**: AIl promises với ESLint `no-floating-promises`
- **Filter rule**: Dùng `.withIndex()` cho 1000+ docs, filter trong code cho nhỏ
- **Collection limit**: Tránh `.collect()` trên unbounded datasets
- **Index optimization**: Xóa redundant prefixes trong indexes
- **Helper functions**: Ưu tiên plain TypeScript thay vì `ctx.run*`

---

## Level 3: References

### Function Development
- [queries.md](./references/queries.md) - Query patterns, pagination, indexing optimization
- [mutations.md](./references/mutations.md) - Mutation patterns, OCC, transaction management
- [actions.md](./references/actions.md) - External API integration, scheduling, runtime selection

### Data & Architecture
- [schema.md](./references/schema.md) - Schema design, validators, relationship modeling
- [performance.md](./references/performance.md) - Query tuning, index strategies, bandwidth optimization
- [errors.md](./references/errors.md) - Error handling, recovery patterns, debugging

### Integration & Security
- [react.md](./references/react.md) - React hooks, type-safety, frontend integration
- [auth.md](./references/auth.md) - Authentication patterns, access control, JWT integration
- [files.md](./references/files.md) - File storage, upload/download workflows
- [config.md](./references/config.md) - Environment variables, secrets management

### Advanced
- [testing.md](./references/testing.md) - Unit testing, integration testing, debugging workflows
