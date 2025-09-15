// KISS: API cho block của trang (page_blocks)
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getForPage = query({
  args: { pageId: v.optional(v.id("pages")) },
  handler: async (ctx, { pageId }) => {
    if (!pageId) return [] as const;
    // Lấy toàn bộ block của 1 trang, sort theo order tăng dần
    const blocks = await ctx.db
      .query("page_blocks")
      .withIndex("by_page_order", (q) => q.eq("pageId", pageId))
      .collect();
    return blocks.sort((a, b) => a.order - b.order);
  },
});

export const create = mutation({
  args: {
    pageId: v.id("pages"),
    kind: v.string(),
    order: v.number(),
    isVisible: v.boolean(),
    status: v.union(v.literal("draft"), v.literal("published")),
    data: v.any(),
    locale: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("page_blocks", { ...args, updatedAt: now });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("page_blocks"),
    // Cho phép patch linh hoạt (KISS)
    kind: v.optional(v.string()),
    order: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    data: v.optional(v.any()),
    locale: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const now = Date.now();
    await ctx.db.patch(id, { ...patch, updatedAt: now });
    return { ok: true } as const;
  },
});

export const remove = mutation({
  args: { id: v.id("page_blocks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { ok: true } as const;
  },
});

// Reorder theo danh sách id đã sắp xếp sẵn ở client (drag & drop)
export const reorder = mutation({
  args: { pageId: v.id("pages"), orderedIds: v.array(v.id("page_blocks")) },
  handler: async (ctx, { pageId, orderedIds }) => {
    // KISS: gán order = index, không tính step size
    for (let i = 0; i < orderedIds.length; i++) {
      await ctx.db.patch(orderedIds[i], { order: i, updatedAt: Date.now() });
    }
    // Trả lại danh sách sau reorder
    const blocks = await ctx.db
      .query("page_blocks")
      .withIndex("by_page_order", (q) => q.eq("pageId", pageId))
      .collect();
    return blocks.sort((a, b) => a.order - b.order);
  },
});

export const toggleVisibility = mutation({
  args: { id: v.id("page_blocks"), isVisible: v.boolean() },
  handler: async (ctx, { id, isVisible }) => {
    await ctx.db.patch(id, { isVisible, updatedAt: Date.now() });
    return { ok: true } as const;
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("page_blocks"),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
    return { ok: true } as const;
  },
});
