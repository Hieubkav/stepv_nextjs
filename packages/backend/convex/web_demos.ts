import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

const reviewValidator = v.object({
  name: v.string(),
  role: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  comment: v.string(),
  rating: v.number(),
});

const blockValidator = v.object({
  title: v.string(),
  description: v.optional(v.string()),
  imageId: v.optional(v.id("media")),
});

const normalizeSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

// Kiểm tra tính duy nhất của slug
async function assertSlugUnique(ctx: any, slug: string, excludeId?: string) {
  const existed = await ctx.db
    .query("web_demos")
    .withIndex("by_slug", (q: any) => q.eq("slug", slug))
    .first();
  if (existed && existed._id !== excludeId) {
    throw new ConvexError("Slug của giao diện mẫu đã tồn tại");
  }
}

// 1. Lấy danh sách Web Demos
export const list = query({
  args: {
    search: v.optional(v.string()),
    tag: v.optional(v.string()),
    active: v.optional(v.union(v.literal("all"), v.literal("true"), v.literal("false"))),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { search, tag, active = "all", offset = 0, limit = 100 } = args;
    
    // Đọc dữ liệu thô (đã lọc soft delete nếu có, ở đây là active/deletedAt)
    let items = await ctx.db.query("web_demos").collect();

    // Lọc theo trạng thái xóa mềm
    items = items.filter((x: any) => !x.deletedAt);

    // Lọc theo active status
    if (active !== "all") {
      const isActive = active === "true";
      items = items.filter((x: any) => x.active === isActive);
    }

    // Lọc theo tag
    if (tag && tag !== "Tất cả") {
      items = items.filter((x: any) => x.tags && x.tags.includes(tag));
    }

    // Lọc tìm kiếm theo title, slug, summary
    if (search && search.trim().length > 0) {
      const s = search.trim().toLowerCase();
      items = items.filter(
        (x: any) =>
          x.title.toLowerCase().includes(s) ||
          x.slug.toLowerCase().includes(s) ||
          (x.summary && x.summary.toLowerCase().includes(s))
      );
    }

    // Sắp xếp theo order tăng dần
    items.sort((a: any, b: any) => a.order - b.order);

    const total = items.length;
    const page = items.slice(offset, offset + limit);

    return { items: page, total };
  },
});

// 2. Lấy chi tiết Web Demo theo ID
export const getById = query({
  args: { id: v.id("web_demos") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) return null;
    return doc;
  },
});

// 3. Lấy chi tiết Web Demo theo slug (dành cho client/public)
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const doc = await ctx.db
      .query("web_demos")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
    if (!doc || doc.deletedAt || !doc.active) return null;
    return doc;
  },
});

// 4. Tạo mới Web Demo
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    summary: v.optional(v.string()),
    description: v.optional(v.string()),
    thumbnailId: v.optional(v.id("media")),
    previewUrl: v.optional(v.string()),
    screenshotLaptopId: v.optional(v.id("media")),
    screenshotMobileId: v.optional(v.id("media")),
    sections: v.optional(v.number()),
    pages: v.optional(v.number()),
    popups: v.optional(v.number()),
    forms: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    reviews: v.optional(v.array(reviewValidator)),
    blocks: v.optional(v.array(blockValidator)),
    tags: v.optional(v.array(v.string())),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (!title) throw new ConvexError("Tiêu đề không được trống");
    
    const slug = normalizeSlug(args.slug);
    if (!slug) throw new ConvexError("Slug không hợp lệ");
    
    await assertSlugUnique(ctx, slug);

    // Tính toán order tiếp theo
    const all = await ctx.db.query("web_demos").collect();
    const activeItems = all.filter((x: any) => !x.deletedAt);
    const maxOrder = activeItems.length > 0 ? Math.max(...activeItems.map((x: any) => x.order)) : 0;
    const order = maxOrder + 1;

    const now = Date.now();
    const id = await ctx.db.insert("web_demos", {
      title,
      slug,
      summary: args.summary ? args.summary.trim() : undefined,
      description: args.description ? args.description.trim() : undefined,
      thumbnailId: args.thumbnailId,
      previewUrl: args.previewUrl ? args.previewUrl.trim() : undefined,
      screenshotLaptopId: args.screenshotLaptopId,
      screenshotMobileId: args.screenshotMobileId,
      sections: args.sections,
      pages: args.pages,
      popups: args.popups,
      forms: args.forms,
      features: args.features,
      reviews: args.reviews,
      blocks: args.blocks,
      tags: args.tags,
      order,
      active: args.active,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

// 5. Cập nhật Web Demo
export const update = mutation({
  args: {
    id: v.id("web_demos"),
    title: v.string(),
    slug: v.string(),
    summary: v.optional(v.string()),
    description: v.optional(v.string()),
    thumbnailId: v.optional(v.id("media")),
    previewUrl: v.optional(v.string()),
    screenshotLaptopId: v.optional(v.id("media")),
    screenshotMobileId: v.optional(v.id("media")),
    sections: v.optional(v.number()),
    pages: v.optional(v.number()),
    popups: v.optional(v.number()),
    forms: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    reviews: v.optional(v.array(reviewValidator)),
    blocks: v.optional(v.array(blockValidator)),
    tags: v.optional(v.array(v.string())),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new ConvexError("Không tìm thấy mẫu giao diện cần sửa");
    }

    const title = updates.title.trim();
    if (!title) throw new ConvexError("Tiêu đề không được trống");
    
    const slug = normalizeSlug(updates.slug);
    if (!slug) throw new ConvexError("Slug không hợp lệ");
    
    await assertSlugUnique(ctx, slug, id);

    await ctx.db.patch(id, {
      title,
      slug,
      summary: updates.summary ? updates.summary.trim() : undefined,
      description: updates.description ? updates.description.trim() : undefined,
      thumbnailId: updates.thumbnailId,
      previewUrl: updates.previewUrl ? updates.previewUrl.trim() : undefined,
      screenshotLaptopId: updates.screenshotLaptopId,
      screenshotMobileId: updates.screenshotMobileId,
      sections: updates.sections,
      pages: updates.pages,
      popups: updates.popups,
      forms: updates.forms,
      features: updates.features,
      reviews: updates.reviews,
      blocks: updates.blocks,
      tags: updates.tags,
      active: updates.active,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// 6. Xóa Web Demo (Xóa mềm - Soft Delete)
export const remove = mutation({
  args: { id: v.id("web_demos") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new ConvexError("Không tìm thấy mẫu giao diện cần xóa");
    }
    // Ghi nhận deletedAt thay vì delete thực sự để tránh mất data và giữ chuẩn soft-delete của codebase
    await ctx.db.patch(id, { deletedAt: Date.now() });
    return { success: true };
  },
});

// 7. Toggle trạng thái hiển thị nhanh
export const setActive = mutation({
  args: { id: v.id("web_demos"), active: v.boolean() },
  handler: async (ctx, { id, active }) => {
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new ConvexError("Không tìm thấy mẫu giao diện");
    }
    await ctx.db.patch(id, { active, updatedAt: Date.now() });
    return { success: true };
  },
});

// 8. Reorder sắp xếp vị trí
export const reorder = mutation({
  args: { orderedIds: v.array(v.id("web_demos")) },
  handler: async (ctx, { orderedIds }) => {
    let orderIndex = 1;
    for (const id of orderedIds) {
      await ctx.db.patch(id, {
        order: orderIndex++,
        updatedAt: Date.now(),
      });
    }
    return { success: true };
  },
});
