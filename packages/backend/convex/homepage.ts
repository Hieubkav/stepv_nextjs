// KISS: Query tổng hợp dữ liệu cho trang chủ từ Convex
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getHomepage = query({
  args: {
    slug: v.optional(v.string()), // mặc định 'home'
    includeDraft: v.optional(v.boolean()), // tuỳ chọn xem bản nháp khi preview
  },
  handler: async (ctx, { slug = "home", includeDraft = false }) => {
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

    if (!page) {
      return { settings, page: null, blocks: [] } as const;
    }

    // 3) Lấy blocks theo pageId, sort theo order
    let blocks = await ctx.db
      .query("page_blocks")
      .withIndex("by_page_order", (q) => q.eq("pageId", page._id))
      .collect();

    // Chỉ lấy block publish + visible nếu không phải chế độ preview
    if (!includeDraft) {
      blocks = blocks.filter((b) => b.status === "published" && b.isVisible);
    }

    blocks.sort((a, b) => a.order - b.order);

    return { settings, page, blocks } as const;
  },
});

