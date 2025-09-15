// KISS: Query tổng hợp dữ liệu cho trang chủ từ Convex
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getHomepage = query({
  args: {
    slug: v.optional(v.string()), // mac dinh 'home'
  },
  handler: async (ctx, { slug = "home" }) => {
    // 1) Settings chung của site (key='site'). Nếu chưa có, trả null.
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .first();

    // 2) Tìm page theo slug
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!page || page.active === false) {
      return { settings, page: null, blocks: [] } as const;
    }

    // 3) Lấy blocks theo pageId, sort theo order
    let blocks = await ctx.db
      .query("page_blocks")
      .withIndex("by_page_order", (q) => q.eq("pageId", page._id))
      .collect();

    // Loc theo active + visible
    blocks = blocks.filter((b) => b.active !== false && b.isVisible === true);

    blocks.sort((a, b) => a.order - b.order);

    return { settings, page, blocks } as const;
  },
});
