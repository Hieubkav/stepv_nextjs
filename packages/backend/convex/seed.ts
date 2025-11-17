// KISS: Seed dữ liệu tối thiểu để trang chủ đọc từ Convex
import { mutation } from "./_generated/server";

export const seedHome = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // 1) Upsert settings 'site' nếu chưa có
    const site = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .first();
    if (!site) {
      await ctx.db.insert("settings", {
        key: "site",
        value: {
          siteName: "Dohy",
          logoUrl: "/logo.png",
          contactEmail: "hello@example.com",
          address: "",
          zaloUrl: "",
          facebookUrl: "",
          instagramUrl: "",
          xUrl: "",
          youtubeUrl: "",
          tiktokUrl: "",
          pinterestUrl: "",
          bankAccountNumber: "",
          bankAccountName: "",
          bankCode: "",
        },
        updatedAt: now,
      });
    }

    // 2) Upsert page 'home'
    let page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", "home"))
      .first();
    if (!page) {
      const pageId = await ctx.db.insert("pages", {
        slug: "home",
        title: "Trang chủ",
        active: true,
        updatedAt: now,
      });
      page = await ctx.db.get(pageId);
    }
    if (!page) return { ok: false, reason: "PAGE_CREATE_FAILED" } as const;

    // 3) Nếu đã có blocks thì không seed lại (tránh nhân đôi)
    const existingBlocks = await ctx.db
      .query("page_blocks")
      .withIndex("by_page_order", (q) => q.eq("pageId", page._id))
      .collect();
    if (existingBlocks.length > 0) {
      return { ok: true, seeded: false } as const;
    }

    // 4) Seed danh sách blocks khớp thứ tự UI hiện tại
    const kinds = [
      "hero",
      "wordSlider",
      "gallery",
      "yourAdvice",
      "stats",
      "services",
      "whyChooseUs",
      "why3DVisuals",
      "turning",
      "weWork",
      "stayControl",
      "contactForm",
    ];

    for (let i = 0; i < kinds.length; i++) {
      const kind = kinds[i];
      await ctx.db.insert("page_blocks", {
        pageId: page._id,
        kind,
        order: i,
        isVisible: true,
        active: true,
        // data tối thiểu; dashboard sẽ chỉnh sau
        data: {},
        updatedAt: now,
      });
    }

    return { ok: true, seeded: true } as const;
  },
});

// Xoa toan bo du lieu CMS (pages + page_blocks)
export const resetCMS = mutation({
  handler: async (ctx) => {
    const pages = await ctx.db.query("pages").collect();
    for (const p of pages) await ctx.db.delete(p._id);
    const blocks = await ctx.db.query("page_blocks").collect();
    for (const b of blocks) await ctx.db.delete(b._id);
    return { ok: true } as const;
  },
});
