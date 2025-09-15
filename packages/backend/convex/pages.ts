// KISS: API đơn giản cho trang (pages)
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    return page ?? null;
  },
});

export const upsert = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    active: v.optional(v.boolean()),
    seoOverride: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        image: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { slug, title, active, seoOverride }) => {
    const now = Date.now();
    const existed = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existed) {
      await ctx.db.patch(existed._id, {
        title,
        active: active ?? existed.active ?? true,
        seoOverride,
        updatedAt: now,
      });
      return await ctx.db.get(existed._id);
    }

    const id = await ctx.db.insert("pages", {
      slug,
      title,
      active: active ?? true,
      seoOverride,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

// Publish/unpublish nhanh cho page theo slug (không đụng block)
// setStatus removed: publish/draft khong su dung nua
