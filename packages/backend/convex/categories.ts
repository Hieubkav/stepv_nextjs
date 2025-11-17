import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Course Categories Management
 * - Tạo và quản lý danh mục khóa học
 * - Liệt kê khóa học theo danh mục
 */

// ==================== QUERIES ====================

/**
 * Lấy tất cả danh mục (active)
 */
export const listCategories = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    let query = ctx.db.query("course_categories");

    if (!args.includeInactive) {
      query = query.withIndex("by_active_order", (q) => q.eq("active", true));
    }

    const categories = await query.order("asc").collect();
    return categories;
  },
});

/**
 * Lấy danh mục theo slug
 */
export const getCategoryBySlug = query({
  args: {
    slug: v.string(),
  },
  async handler(ctx, args) {
    const category = await ctx.db
      .query("course_categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return category || null;
  },
});

/**
 * Lấy danh mục theo ID
 */
export const getCategory = query({
  args: {
    categoryId: v.id("course_categories"),
  },
  async handler(ctx, args) {
    const category = await ctx.db.get(args.categoryId);
    return category || null;
  },
});

/**
 * Lấy danh sách khóa học theo danh mục
 */
export const listCoursesByCategory = query({
  args: {
    categoryId: v.id("course_categories"),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const limit = args.limit || 20;

    const courses = await ctx.db
      .query("courses")
      .withIndex("by_category_order", (q) =>
        q.eq("categoryId", args.categoryId).eq("active", true)
      )
      .order("asc")
      .take(limit);

    return courses;
  },
});

// ==================== MUTATIONS ====================

/**
 * Tạo danh mục mới (admin)
 */
export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    imageId: v.optional(v.id("media")),
    order: v.number(),
  },
  async handler(ctx, args) {
    // Validate
    if (!args.name || args.name.trim().length === 0) {
      throw new Error("Tên danh mục không được trống");
    }

    if (!args.slug || args.slug.trim().length === 0) {
      throw new Error("Slug không được trống");
    }

    // Kiểm tra slug unique
    const existing = await ctx.db
      .query("course_categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Slug này đã tồn tại");
    }

    const categoryId = await ctx.db.insert("course_categories", {
      name: args.name.trim(),
      slug: args.slug.toLowerCase().trim(),
      description: args.description,
      icon: args.icon,
      imageId: args.imageId,
      order: args.order,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return categoryId;
  },
});

/**
 * Cập nhật danh mục (admin)
 */
export const updateCategory = mutation({
  args: {
    categoryId: v.id("course_categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    imageId: v.optional(v.id("media")),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Danh mục không tồn tại");
    }

    const updates: any = {};

    if (args.name !== undefined) {
      if (args.name.trim().length === 0) {
        throw new Error("Tên danh mục không được trống");
      }
      updates.name = args.name.trim();
    }

    if (args.slug !== undefined) {
      const newSlug = args.slug.toLowerCase().trim();
      if (newSlug !== category.slug) {
        const existing = await ctx.db
          .query("course_categories")
          .withIndex("by_slug", (q) => q.eq("slug", newSlug))
          .first();

        if (existing) {
          throw new Error("Slug này đã tồn tại");
        }
      }
      updates.slug = newSlug;
    }

    if (args.description !== undefined) {
      updates.description = args.description;
    }

    if (args.icon !== undefined) {
      updates.icon = args.icon;
    }

    if (args.imageId !== undefined) {
      updates.imageId = args.imageId;
    }

    if (args.order !== undefined) {
      updates.order = args.order;
    }

    if (args.active !== undefined) {
      updates.active = args.active;
    }

    updates.updatedAt = Date.now();

    await ctx.db.patch(args.categoryId, updates);
    return args.categoryId;
  },
});

/**
 * Xóa danh mục (admin)
 */
export const deleteCategory = mutation({
  args: {
    categoryId: v.id("course_categories"),
  },
  async handler(ctx, args) {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Danh mục không tồn tại");
    }

    // Kiểm tra có khóa học nào thuộc danh mục này không
    const courseCount = await ctx.db
      .query("courses")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .count();

    if (courseCount > 0) {
      throw new Error(
        `Không thể xóa danh mục này vì có ${courseCount} khóa học thuộc danh mục này`
      );
    }

    await ctx.db.delete(args.categoryId);
    return args.categoryId;
  },
});
