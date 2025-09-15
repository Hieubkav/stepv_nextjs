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
    status: v.union(v.literal("draft"), v.literal("published")),
    seoOverride: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        image: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { slug, title, status, seoOverride }) => {
    const now = Date.now();
    const existed = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existed) {
      await ctx.db.patch(existed._id, {
        title,
        status,
        seoOverride,
        updatedAt: now,
        publishedAt: status === "published" ? now : existed.publishedAt,
      });
      return await ctx.db.get(existed._id);
    }

    const id = await ctx.db.insert("pages", {
      slug,
      title,
      status,
      seoOverride,
      updatedAt: now,
      publishedAt: status === "published" ? now : undefined,
    });
    return await ctx.db.get(id);
  },
});

// Publish/unpublish nhanh cho page theo slug (không đụng block)
export const setStatus = mutation({
  args: {
    slug: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, { slug, status }) => {
    const now = Date.now();
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!page) return { ok: false, reason: "PAGE_NOT_FOUND" } as const;

    await ctx.db.patch(page._id, {
      status,
      updatedAt: now,
      publishedAt: status === "published" ? now : page.publishedAt,
    });
    return { ok: true } as const;
  },
});

