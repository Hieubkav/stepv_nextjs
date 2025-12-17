import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";

type AnyCtx = MutationCtx | QueryCtx;
type PostId = Id<"posts">;

const assertSlugUnique = async (
  ctx: AnyCtx,
  slug: string,
  excludeId?: PostId
) => {
  const existed = await ctx.db
    .query("posts")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (existed && (!excludeId || existed._id !== excludeId)) {
    throw new ConvexError("Post slug already exists");
  }
};

// List posts
export const listPosts = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, { activeOnly = false }) => {
    let posts = await ctx.db.query("posts").collect();

    if (activeOnly) {
      posts = posts.filter((item) => item.active);
    }

    posts.sort((a, b) => a.order - b.order);
    return posts;
  },
});

// List posts with thumbnail URL
export const listPostsWithThumbnail = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, { activeOnly = false }) => {
    let posts = await ctx.db.query("posts").collect();

    if (activeOnly) {
      posts = posts.filter((item) => item.active);
    }

    posts.sort((a, b) => a.order - b.order);

    const result = await Promise.all(
      posts.map(async (post) => {
        if (post.thumbnailId) {
          const media = await ctx.db.get(post.thumbnailId);
          if (media && !media.deletedAt && media.storageId) {
            try {
              const url = await ctx.storage.getUrl(media.storageId);
              return { ...post, thumbnailUrl: url };
            } catch (_) {
              // Storage blob may be deleted
            }
          }
        }
        return { ...post, thumbnailUrl: null };
      })
    );

    return result;
  },
});

// Get post by slug or id
export const getPostDetail = query({
  args: {
    id: v.optional(v.id("posts")),
    slug: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, slug, includeInactive = false }) => {
    if (!id && !slug) {
      throw new ConvexError("Provide id or slug");
    }

    let post = null;
    if (id) {
      post = await ctx.db.get(id);
    }
    if (!post && slug) {
      post = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
    }

    if (!post) return null;
    if (!includeInactive && !post.active) return null;

    // Get thumbnail URL
    let thumbnailUrl: string | null = null;
    if (post.thumbnailId) {
      const media = await ctx.db.get(post.thumbnailId);
      if (media && !media.deletedAt && media.storageId) {
        try {
          thumbnailUrl = await ctx.storage.getUrl(media.storageId);
        } catch (_) {
          // Storage blob may be deleted
        }
      }
    }

    return {
      post,
      thumbnailUrl,
    } as const;
  },
});

// Create post
export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    thumbnailId: v.id("media"),
    categoryId: v.optional(v.id("post_categories")),
    author: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertSlugUnique(ctx, args.slug);
    const now = Date.now();

    const id = await ctx.db.insert("posts", {
      title: args.title,
      slug: args.slug,
      content: args.content,
      thumbnailId: args.thumbnailId,
      categoryId: args.categoryId,
      author: args.author,
      viewCount: 0,
      order: args.order,
      active: args.active,
      publishedAt: args.publishedAt ?? (args.active ? now : undefined),
      createdAt: now,
      updatedAt: now,
    } as any);
    return await ctx.db.get(id);
  },
});

// Update post
export const updatePost = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    thumbnailId: v.optional(v.id("media")),
    categoryId: v.optional(v.id("post_categories")),
    author: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, slug, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError("Post not found");

    if (slug && slug !== existing.slug) {
      await assertSlugUnique(ctx, slug, id);
    }

    const patch: Partial<typeof existing> = { ...rest };
    if (slug !== undefined) patch.slug = slug;
    patch.updatedAt = Date.now();

    await ctx.db.patch(id, patch as any);
    return await ctx.db.get(id);
  },
});

// Toggle active status
export const setPostActive = mutation({
  args: { id: v.id("posts"), active: v.boolean() },
  handler: async (ctx, { id, active }) => {
    const post = await ctx.db.get(id);
    if (!post) throw new ConvexError("Post not found");

    const patch: any = { active, updatedAt: Date.now() };
    // Set publishedAt when first published
    if (active && !post.publishedAt) {
      patch.publishedAt = Date.now();
    }

    await ctx.db.patch(id, patch);
    return { ok: true } as const;
  },
});

// Delete post
export const deletePost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, { id }) => {
    const post = await ctx.db.get(id);
    if (!post) return { ok: false } as const;

    await ctx.db.delete(id);
    return { ok: true } as const;
  },
});

// Increment view count
export const incrementViewCount = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, { id }) => {
    const post = await ctx.db.get(id);
    if (!post) return { ok: false } as const;

    await ctx.db.patch(id, {
      viewCount: (post.viewCount ?? 0) + 1
    });
    return { ok: true } as const;
  },
});

// Get related posts (same category)
export const getRelatedPosts = query({
  args: {
    postId: v.id("posts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { postId, limit = 4 }) => {
    const currentPost = await ctx.db.get(postId);
    if (!currentPost) return [];

    let posts = await ctx.db.query("posts").collect();
    posts = posts.filter((p) => p.active && p._id !== postId);

    // Sort by same category first, then by order
    const currentCategoryId = currentPost.categoryId;
    posts.sort((a, b) => {
      const aMatchCategory = a.categoryId === currentCategoryId ? 1 : 0;
      const bMatchCategory = b.categoryId === currentCategoryId ? 1 : 0;
      if (bMatchCategory !== aMatchCategory) return bMatchCategory - aMatchCategory;
      return a.order - b.order;
    });

    const result = posts.slice(0, limit);

    // Get thumbnail URLs
    return await Promise.all(
      result.map(async (post) => {
        let thumbnailUrl: string | null = null;
        if (post.thumbnailId) {
          const media = await ctx.db.get(post.thumbnailId);
          if (media && !media.deletedAt && media.storageId) {
            try {
              thumbnailUrl = await ctx.storage.getUrl(media.storageId);
            } catch (_) {}
          }
        }
        return { ...post, thumbnailUrl };
      })
    );
  },
});

// ==================== POST CATEGORIES ====================

// List post categories
export const listPostCategories = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, { activeOnly = false }) => {
    let categories = await ctx.db.query("post_categories").collect();

    if (activeOnly) {
      categories = categories.filter((item) => item.active);
    }

    categories.sort((a, b) => a.order - b.order);
    return categories;
  },
});

// Create post category
export const createPostCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check slug unique
    const existed = await ctx.db
      .query("post_categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existed) {
      throw new ConvexError("Category slug already exists");
    }

    const now = Date.now();
    const id = await ctx.db.insert("post_categories", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      order: args.order,
      active: args.active,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

// Update post category
export const updatePostCategory = mutation({
  args: {
    id: v.id("post_categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, slug, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError("Category not found");

    if (slug && slug !== existing.slug) {
      const existed = await ctx.db
        .query("post_categories")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (existed) {
        throw new ConvexError("Category slug already exists");
      }
    }

    const patch: Partial<typeof existing> = { ...rest };
    if (slug !== undefined) patch.slug = slug;
    patch.updatedAt = Date.now();

    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});

// Delete post category
export const deletePostCategory = mutation({
  args: { id: v.id("post_categories") },
  handler: async (ctx, { id }) => {
    const category = await ctx.db.get(id);
    if (!category) return { ok: false } as const;

    await ctx.db.delete(id);
    return { ok: true } as const;
  },
});
