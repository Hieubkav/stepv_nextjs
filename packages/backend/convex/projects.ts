 import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type {
  Id,
  Doc,
} from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type AnyCtx = MutationCtx | QueryCtx;
type ProjectId = Id<"projects">;
type CategoryId = Id<"project_categories">;
type ImageId = Id<"project_images">;

const imageInput = v.object({
  id: v.optional(v.id("project_images")),
  mediaId: v.id("media"),
  caption: v.optional(v.string()),
  altText: v.optional(v.string()),
  order: v.optional(v.number()),
  active: v.optional(v.boolean()),
});

const normalizeSlug = (value: string) => value.toLowerCase().trim();
const normalizeText = (value?: string | null) =>
  value && value.trim().length > 0 ? value.trim() : undefined;

async function assertCategorySlugUnique(
  ctx: AnyCtx,
  slug: string,
  excludeId?: CategoryId
) {
  const existed = await ctx.db
    .query("project_categories")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (existed && (!excludeId || existed._id !== excludeId)) {
    throw new ConvexError("Slug danh mục đã tồn tại");
  }
}

async function assertProjectSlugUnique(
  ctx: AnyCtx,
  slug: string,
  excludeId?: ProjectId
) {
  const existed = await ctx.db
    .query("projects")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (existed && (!excludeId || existed._id !== excludeId)) {
    throw new ConvexError("Slug dự án đã tồn tại");
  }
}

async function ensureCategoryExists(ctx: AnyCtx, id?: CategoryId | null) {
  if (!id) return;
  const category = await ctx.db.get(id);
  if (!category) {
    throw new ConvexError("Danh mục dự án không tồn tại");
  }
}

async function nextImageOrder(ctx: AnyCtx, projectId: ProjectId) {
  const siblings = await ctx.db
    .query("project_images")
    .withIndex("by_project_order", (q) => q.eq("projectId", projectId))
    .collect();
  if (!siblings.length) return 0;
  return Math.max(...siblings.map((item) => item.order)) + 1;
}

async function syncProjectImages(
  ctx: MutationCtx,
  projectId: ProjectId,
  images: Array<{
    id?: ImageId;
    mediaId: Id<"media">;
    caption?: string;
    altText?: string;
    order?: number;
    active?: boolean;
  }>
) {
  const existing = await ctx.db
    .query("project_images")
    .withIndex("by_project_order", (q) => q.eq("projectId", projectId))
    .collect();
  const existingMap = new Map(existing.map((img) => [img._id, img]));
  const incomingIds = new Set<ImageId>();
  let nextOrderValue =
    existing.length > 0 ? Math.max(...existing.map((i) => i.order)) + 1 : 0;

  for (const item of images) {
    const caption = normalizeText(item.caption);
    const altText = normalizeText(item.altText);
    const baseOrder = typeof item.order === "number" ? item.order : undefined;

    if (item.id) {
      const current = existingMap.get(item.id);
      if (!current) {
        throw new ConvexError("Ảnh dự án không hợp lệ");
      }
      incomingIds.add(item.id);
      await ctx.db.patch(item.id, {
        mediaId: item.mediaId,
        caption,
        altText,
        order: baseOrder ?? current.order,
        active: item.active ?? current.active,
        updatedAt: Date.now(),
      });
      continue;
    }

    const order = baseOrder ?? nextOrderValue++;
    await ctx.db.insert("project_images", {
      projectId,
      mediaId: item.mediaId,
      caption,
      altText,
      order,
      active: item.active ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  for (const img of existing) {
    if (!incomingIds.has(img._id)) {
      await ctx.db.delete(img._id);
    }
  }
}

// ========== CATEGORY QUERIES ==========

export const listCategories = query({
  args: { includeInactive: v.optional(v.boolean()) },
  async handler(ctx, args) {
    const categories = await ctx.db.query("project_categories").collect();
    const filtered = args.includeInactive
      ? categories
      : categories.filter((c) => c.active);
    return filtered.sort((a, b) => a.order - b.order);
  },
});

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  async handler(ctx, args) {
    const category = await ctx.db
      .query("project_categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return category ?? null;
  },
});

export const getCategory = query({
  args: { id: v.id("project_categories") },
  async handler(ctx, args) {
    const category = await ctx.db.get(args.id);
    return category ?? null;
  },
});

// ========== CATEGORY MUTATIONS ==========

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    active: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const name = args.name.trim();
    const slug = normalizeSlug(args.slug);
    if (!name) throw new ConvexError("Tên danh mục không được trống");
    if (!slug) throw new ConvexError("Slug không hợp lệ");

    await assertCategorySlugUnique(ctx, slug);
    const now = Date.now();

    return ctx.db.insert("project_categories", {
      name,
      slug,
      description: normalizeText(args.description),
      order: args.order,
      active: args.active ?? true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("project_categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const category = await ctx.db.get(args.id);
    if (!category) throw new ConvexError("Danh mục không tồn tại");

    const updates: Partial<Doc<"project_categories">> = {};

    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new ConvexError("Tên danh mục không được trống");
      updates.name = name;
    }

    if (args.slug !== undefined) {
      const slug = normalizeSlug(args.slug);
      if (!slug) throw new ConvexError("Slug không hợp lệ");
      if (slug !== category.slug) {
        await assertCategorySlugUnique(ctx, slug, args.id);
      }
      updates.slug = slug;
    }

    if (args.description !== undefined) {
      updates.description = normalizeText(args.description);
    }

    if (args.order !== undefined) {
      updates.order = args.order;
    }

    if (args.active !== undefined) {
      updates.active = args.active;
    }

    updates.updatedAt = Date.now();
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("project_categories") },
  async handler(ctx, args) {
    const category = await ctx.db.get(args.id);
    if (!category) throw new ConvexError("Danh mục không tồn tại");

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_category_order", (q) => q.eq("categoryId", args.id))
      .collect();
    if (projects.length > 0) {
      throw new ConvexError(
        `Không thể xóa vì còn ${projects.length} dự án thuộc danh mục này`
      );
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// ========== PROJECT QUERIES ==========

export const listProjects = query({
  args: {
    includeInactive: v.optional(v.boolean()),
    categoryId: v.optional(v.id("project_categories")),
  },
  async handler(ctx, args) {
    let projects = await ctx.db.query("projects").collect();

    if (args.categoryId) {
      projects = projects.filter(
        (project) => project.categoryId === args.categoryId
      );
    }

    if (!args.includeInactive) {
      projects = projects.filter((project) => project.active);
    }

    return projects.sort((a, b) => a.order - b.order);
  },
});

export const getProjectDetail = query({
  args: {
    id: v.optional(v.id("projects")),
    slug: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    if (!args.id && !args.slug) {
      throw new ConvexError("Thiếu id hoặc slug");
    }

    let project: Doc<"projects"> | null = null;
    if (args.id) {
      project = (await ctx.db.get(args.id)) ?? null;
    }
    if (!project && args.slug) {
      project =
        (await ctx.db
          .query("projects")
          .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
          .first()) ?? null;
    }

    if (!project) return null;
    if (!args.includeInactive && !project.active) return null;

    const category = project.categoryId
      ? await ctx.db.get(project.categoryId)
      : null;

    const images = await ctx.db
      .query("project_images")
      .withIndex("by_project_order", (q) => q.eq("projectId", project._id))
      .collect();

    const filteredImages = args.includeInactive
      ? images
      : images.filter((img) => img.active);

    filteredImages.sort((a, b) => a.order - b.order);

    return {
      project,
      category: category ?? null,
      images: filteredImages,
    };
  },
});

// ========== PROJECT MUTATIONS ==========

export const createProject = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    summary: v.optional(v.string()),
    content: v.optional(v.string()),
    thumbnailId: v.optional(v.id("media")),
    videoMediaId: v.optional(v.id("media")),
    videoUrl: v.optional(v.string()),
    categoryId: v.optional(v.id("project_categories")),
    order: v.number(),
    active: v.boolean(),
    images: v.optional(v.array(imageInput)),
  },
  async handler(ctx, args) {
    const title = args.title.trim();
    const slug = normalizeSlug(args.slug);
    if (!title) throw new ConvexError("Tên dự án không được trống");
    if (!slug) throw new ConvexError("Slug không hợp lệ");

    await assertProjectSlugUnique(ctx, slug);
    await ensureCategoryExists(ctx, args.categoryId);

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      title,
      slug,
      summary: normalizeText(args.summary),
      content: normalizeText(args.content),
      thumbnailId: args.thumbnailId,
      videoMediaId: args.videoMediaId,
      videoUrl: normalizeText(args.videoUrl),
      categoryId: args.categoryId,
      order: args.order,
      active: args.active,
      createdAt: now,
      updatedAt: now,
    });

    if (args.images && args.images.length > 0) {
      await syncProjectImages(
        ctx,
        projectId,
        args.images.map((img) => ({
          ...img,
          id: undefined,
        }))
      );
    }

    return projectId;
  },
});

export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    summary: v.optional(v.string()),
    content: v.optional(v.string()),
    thumbnailId: v.optional(v.id("media")),
    videoMediaId: v.optional(v.id("media")),
    videoUrl: v.optional(v.string()),
    categoryId: v.optional(v.id("project_categories")),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
    images: v.optional(v.array(imageInput)),
  },
  async handler(ctx, args) {
    const project = await ctx.db.get(args.id);
    if (!project) throw new ConvexError("Dự án không tồn tại");

    const updates: Partial<Doc<"projects">> = {};

    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title) throw new ConvexError("Tên dự án không được trống");
      updates.title = title;
    }

    if (args.slug !== undefined) {
      const slug = normalizeSlug(args.slug);
      if (!slug) throw new ConvexError("Slug không hợp lệ");
      if (slug !== project.slug) {
        await assertProjectSlugUnique(ctx, slug, args.id);
      }
      updates.slug = slug;
    }

    if (args.summary !== undefined) {
      updates.summary = normalizeText(args.summary);
    }

    if (args.content !== undefined) {
      updates.content = normalizeText(args.content);
    }

    if (args.thumbnailId !== undefined) {
      updates.thumbnailId = args.thumbnailId;
    }

    if (args.videoMediaId !== undefined) {
      updates.videoMediaId = args.videoMediaId;
    }

    if (args.videoUrl !== undefined) {
      updates.videoUrl = normalizeText(args.videoUrl);
    }

    if (args.categoryId !== undefined) {
      await ensureCategoryExists(ctx, args.categoryId);
      updates.categoryId = args.categoryId;
    }

    if (args.order !== undefined) {
      updates.order = args.order;
    }

    if (args.active !== undefined) {
      updates.active = args.active;
    }

    updates.updatedAt = Date.now();
    await ctx.db.patch(args.id, updates);

    if (args.images !== undefined) {
      await syncProjectImages(ctx, args.id, args.images);
    }

    return args.id;
  },
});

export const setProjectActive = mutation({
  args: { id: v.id("projects"), active: v.boolean() },
  async handler(ctx, args) {
    const project = await ctx.db.get(args.id);
    if (!project) throw new ConvexError("Dự án không tồn tại");
    await ctx.db.patch(args.id, { active: args.active, updatedAt: Date.now() });
    return args.id;
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  async handler(ctx, args) {
    const project = await ctx.db.get(args.id);
    if (!project) throw new ConvexError("Dự án không tồn tại");

    const images = await ctx.db
      .query("project_images")
      .withIndex("by_project_order", (q) => q.eq("projectId", args.id))
      .collect();

    await Promise.all(images.map((img) => ctx.db.delete(img._id)));
    await ctx.db.delete(args.id);
    return args.id;
  },
});
