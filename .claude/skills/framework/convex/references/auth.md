# Authentication & Authorization Patterns

Implement authentication với Convex Auth, JWTs, và authorization checks.

## Setup Convex Auth Integration
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    tokenIdentifier: v.string(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
  
  posts: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
  }).index("by_authorId", ["authorId"]),
});
```

## Get Current User
```typescript
// convex/users.ts
import { query } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get current user identity from auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Lookup user in database
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    return user;
  },
});
```

## Check User Authorization in Mutations
```typescript
// convex/posts.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createPost = mutation({
  args: { title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in");
    }

    // Get or create user
    let user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) {
      user = {
        email: identity.email || "",
        name: identity.givenName || identity.name,
        tokenIdentifier: identity.tokenIdentifier,
      };
      const userId = await ctx.db.insert("users", user);
    }

    const userId = user._id;

    // Create post
    const postId = await ctx.db.insert("posts", {
      authorId: userId,
      ...args,
    });

    return postId;
  },
});
```

## Update Post Only by Author
```typescript
// convex/posts.ts
export const updatePost = mutation({
  args: { postId: v.id("posts"), title: v.string() },
  handler: async (ctx, { postId, title }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in");
    }

    // Get post
    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user || post.authorId !== user._id) {
      throw new Error("Unauthorized: Only author can edit");
    }

    // Update post
    await ctx.db.patch(postId, { title });
    return postId;
  },
});
```

## Delete Post Only by Author
```typescript
export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in");
    }

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user || post.authorId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(postId);
  },
});
```

## Protected Query (Only Authenticated Users)
```typescript
export const getUserPosts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Optional: require authentication for private posts
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Allow public access or throw error
      return [];
    }

    return await ctx.db
      .query("posts")
      .withIndex("by_authorId", (q) => q.eq("authorId", userId))
      .collect();
  },
});
```

## Admin Authorization
```typescript
// convex/schema.ts
export default defineSchema({
  ...authTables,
  users: defineTable({
    email: v.string(),
    tokenIdentifier: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("user"),
    ),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
});

// convex/admin.ts
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in");
    }

    // Check if current user is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    await ctx.db.delete(userId);
  },
});
```

## HTTP Action with JWT Bearer Token
```typescript
// convex/http.ts
http.route({
  path: "/api/private",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Verify JWT (Convex handles this internally)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return new Response("Invalid token", { status: 401 });
    }

    return new Response(JSON.stringify({ user: identity }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});
```

## Client-Side: Getting Auth Token
```typescript
// src/lib/auth.ts
export async function getAuthToken() {
  // Convex Auth provides this token automatically
  // when using ConvexReactClient
  const response = await fetch("/api/auth/token");
  if (!response.ok) {
    throw new Error("Failed to get auth token");
  }
  return response.text();
}

// Use in fetch requests
const token = await getAuthToken();
const response = await fetch("https://your-deployment.convex.site/api/private", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Best Practices
- **Always check authentication** before mutations
- **Validate user ownership** before updates/deletes
- **Use role-based access control** for admin features
- **Never store sensitive data** unencrypted
- **Validate input** from authenticated users too
- **Use internal functions** for sensitive operations
- **Log security events** for audit trails
