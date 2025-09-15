// KISS: API đơn giản cho cấu hình site (settings)
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Lấy toàn bộ settings (ít dùng, chủ yếu debug/dashboard)
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("settings").collect();
  },
});

// Lấy settings theo key (vd: 'site')
export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const doc = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    return doc ?? null;
  },
});

// Upsert 1 key bất kỳ (đơn giản hoá dashboard)
export const upsert = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, { key, value }) => {
    const now = Date.now();
    const existed = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    if (existed) {
      await ctx.db.patch(existed._id, { value, updatedAt: now });
      return await ctx.db.get(existed._id);
    }

    const id = await ctx.db.insert("settings", { key, value, updatedAt: now });
    return await ctx.db.get(id);
  },
});

