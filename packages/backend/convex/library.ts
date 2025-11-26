import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";

const pricingType = v.union(v.literal("free"), v.literal("paid"));

type AnyCtx = MutationCtx | QueryCtx;

type ResourceId = Id<"library_resources">;
type SoftwareId = Id<"library_softwares">;

const normalizeFeatures = (features?: string[]) => {
  if (!features) return undefined;
  const trimmed = features
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  if (!trimmed.length) return [] as string[];
  return Array.from(new Set(trimmed));
};

const assertResourceSlugUnique = async (
  ctx: AnyCtx,
  slug: string,
  excludeId?: ResourceId
) => {
  const existed = await ctx.db
    .query("library_resources")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (existed && (!excludeId || existed._id !== excludeId)) {
    throw new ConvexError("Resource slug already exists");
  }
};

const assertSoftwareSlugUnique = async (
  ctx: AnyCtx,
  slug: string,
  excludeId?: SoftwareId
) => {
  const existed = await ctx.db
    .query("library_softwares")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (existed && (!excludeId || existed._id !== excludeId)) {
    throw new ConvexError("Software slug already exists");
  }
};

const normalizePricing = (
  pricingType: "free" | "paid",
  price?: number | null,
  originalPrice?: number | null
) => {
  if (pricingType === "free") {
    return { price: 0, originalPrice: null };
  }

  const nextPrice =
    typeof price === "number" && Number.isFinite(price) ? price : null;
  if (!nextPrice || nextPrice <= 0) {
    throw new ConvexError("Gia ban phai lon hon 0 voi tai nguyen tra phi");
  }

  const compare =
    typeof originalPrice === "number" && Number.isFinite(originalPrice)
      ? originalPrice
      : null;
  const nextOriginal = compare && compare > nextPrice ? compare : null;

  return { price: nextPrice, originalPrice: nextOriginal };
};

const nextImageOrder = async (ctx: AnyCtx, resourceId: ResourceId) => {
  const siblings = await ctx.db
    .query("library_resource_images")
    .withIndex("by_resource_order", (q) => q.eq("resourceId", resourceId))
    .collect();
  if (!siblings.length) return 0;
  return Math.max(...siblings.map((item) => item.order)) + 1;
};

const nextMappingOrder = async (ctx: AnyCtx, resourceId: ResourceId) => {
  const siblings = await ctx.db
    .query("library_resource_softwares")
    .withIndex("by_resource_order", (q) => q.eq("resourceId", resourceId))
    .collect();
  if (!siblings.length) return 0;
  return Math.max(...siblings.map((item) => item.order)) + 1;
};

export const listResources = query({
  args: {
    activeOnly: v.optional(v.boolean()),
    pricingType: v.optional(pricingType),
    softwareId: v.optional(v.id("library_softwares")),
  },
  handler: async (ctx, { activeOnly = false, pricingType, softwareId }) => {
    let resources = await ctx.db.query("library_resources").collect();

    if (activeOnly) {
      resources = resources.filter((item) => item.active);
    }

    if (pricingType) {
      resources = resources.filter((item) => item.pricingType === pricingType);
    }

    if (softwareId) {
      const links = await ctx.db
        .query("library_resource_softwares")
        .withIndex("by_software", (q) => q.eq("softwareId", softwareId))
        .collect();
      const allowed = new Set(
        links.filter((link) => link.active).map((link) => link.resourceId)
      );
      resources = resources.filter((item) => allowed.has(item._id));
    }

    resources.sort((a, b) => a.order - b.order);
    return resources;
  },
});

export const getResourceDetail = query({
  args: {
    id: v.optional(v.id("library_resources")),
    slug: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, slug, includeInactive = false }) => {
    if (!id && !slug) {
      throw new ConvexError("Provide id or slug");
    }

    let resource = null;
    if (id) {
      resource = await ctx.db.get(id);
    }
    if (!resource && slug) {
      resource = await ctx.db
        .query("library_resources")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
    }

    if (!resource) return null;
    if (!includeInactive && !resource.active) return null;

    const images = await ctx.db
      .query("library_resource_images")
      .withIndex("by_resource_order", (q) => q.eq("resourceId", resource._id))
      .collect();

    const mappings = await ctx.db
      .query("library_resource_softwares")
      .withIndex("by_resource_order", (q) => q.eq("resourceId", resource._id))
      .collect();

    images.sort((a, b) => a.order - b.order);
    mappings.sort((a, b) => a.order - b.order);

    const softwares = (
      await Promise.all(
        mappings.map(async (link) => {
          const software = await ctx.db.get(link.softwareId);
          if (!software) return null;
          if (!includeInactive && (!link.active || !software.active)) {
            return null;
          }
          return { software, link } as const;
        })
      )
    ).filter(Boolean) as { software: any; link: any }[];

    const filteredImages = includeInactive
      ? images
      : images.filter((item) => item.active);

    return {
      resource,
      images: filteredImages,
      softwares,
    } as const;
  },
});

export const createResource = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    pricingType,
    price: v.optional(v.union(v.number(), v.null())),
    originalPrice: v.optional(v.union(v.number(), v.null())),
    coverImageId: v.optional(v.id("media")),
    downloadUrl: v.optional(v.string()),
    isDownloadVisible: v.boolean(),
    order: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await assertResourceSlugUnique(ctx, args.slug);
    const now = Date.now();
    const features = normalizeFeatures(args.features) ?? [];
    const { price, originalPrice } = normalizePricing(
      args.pricingType,
      args.price,
      args.originalPrice
    );
    const id = await ctx.db.insert("library_resources", {
      title: args.title,
      slug: args.slug,
      description: args.description,
      features,
      pricingType: args.pricingType,
      price,
      originalPrice,
      coverImageId: args.coverImageId,
      downloadUrl: args.downloadUrl,
      isDownloadVisible: args.isDownloadVisible,
      order: args.order,
      active: args.active,
      createdAt: now,
      updatedAt: now,
    } as any);
    return await ctx.db.get(id);
  },
});

export const updateResource = mutation({
  args: {
    id: v.id("library_resources"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    pricingType: v.optional(pricingType),
    price: v.optional(v.union(v.number(), v.null())),
    originalPrice: v.optional(v.union(v.number(), v.null())),
    coverImageId: v.optional(v.id("media")),
    downloadUrl: v.optional(v.string()),
    isDownloadVisible: v.optional(v.boolean()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, slug, features, price, originalPrice, pricingType, ...rest } =
      args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError("Resource not found");
    if (slug && slug !== existing.slug) {
      await assertResourceSlugUnique(ctx, slug, id);
    }

    const patch: Partial<typeof existing> = { ...rest };
    if (slug !== undefined) patch.slug = slug;
    const nextPricingType = pricingType ?? existing.pricingType;
    const normalized = normalizePricing(
      nextPricingType,
      price ?? existing.price ?? null,
      originalPrice ?? existing.originalPrice ?? null
    );
    patch.pricingType = nextPricingType;
    patch.price = normalized.price as any;
    patch.originalPrice = normalized.originalPrice as any;

    if (features !== undefined) {
      patch.features = normalizeFeatures(features) ?? [];
    }
    patch.updatedAt = Date.now();

    await ctx.db.patch(id, patch as any);
    return await ctx.db.get(id);
  },
});

export const setResourceActive = mutation({
  args: { id: v.id("library_resources"), active: v.boolean() },
  handler: async (ctx, { id, active }) => {
    await ctx.db.patch(id, { active, updatedAt: Date.now() });
    return { ok: true } as const;
  },
});

export const deleteResource = mutation({
  args: { id: v.id("library_resources") },
  handler: async (ctx, { id }) => {
    const resource = await ctx.db.get(id);
    if (!resource) return { ok: false } as const;

    const images = await ctx.db
      .query("library_resource_images")
      .withIndex("by_resource_order", (q) => q.eq("resourceId", id))
      .collect();
    for (const image of images) {
      await ctx.db.delete(image._id);
    }

    const mappings = await ctx.db
      .query("library_resource_softwares")
      .withIndex("by_resource_order", (q) => q.eq("resourceId", id))
      .collect();
    for (const link of mappings) {
      await ctx.db.delete(link._id);
    }

    await ctx.db.delete(id);
    return { ok: true } as const;
  },
});

export const listSoftwares = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, { activeOnly = false }) => {
    let softwares = await ctx.db.query("library_softwares").collect();
    if (activeOnly) {
      softwares = softwares.filter((item) => item.active);
    }
    softwares.sort((a, b) => a.order - b.order);
    return softwares;
  },
});

export const getSoftwareBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const software = await ctx.db
      .query("library_softwares")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    return software ?? null;
  },
});

export const createSoftware = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    iconImageId: v.optional(v.id("media")),
    officialUrl: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await assertSoftwareSlugUnique(ctx, args.slug);
    const now = Date.now();
    const id = await ctx.db.insert("library_softwares", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      iconImageId: args.iconImageId,
      officialUrl: args.officialUrl,
      order: args.order,
      active: args.active,
      createdAt: now,
      updatedAt: now,
    } as any);
    return await ctx.db.get(id);
  },
});

export const updateSoftware = mutation({
  args: {
    id: v.id("library_softwares"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    iconImageId: v.optional(v.id("media")),
    officialUrl: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, slug, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError("Software not found");
    if (slug && slug !== existing.slug) {
      await assertSoftwareSlugUnique(ctx, slug, id);
    }
    const patch: Partial<typeof existing> = { ...rest };
    if (slug !== undefined) patch.slug = slug;
    patch.updatedAt = Date.now();
    await ctx.db.patch(id, patch as any);
    return await ctx.db.get(id);
  },
});

export const setSoftwareActive = mutation({
  args: { id: v.id("library_softwares"), active: v.boolean() },
  handler: async (ctx, { id, active }) => {
    await ctx.db.patch(id, { active, updatedAt: Date.now() });
    return { ok: true } as const;
  },
});

export const deleteSoftware = mutation({
  args: { id: v.id("library_softwares") },
  handler: async (ctx, { id }) => {
    const software = await ctx.db.get(id);
    if (!software) return { ok: false } as const;

    const mappings = await ctx.db
      .query("library_resource_softwares")
      .withIndex("by_software", (q) => q.eq("softwareId", id))
      .collect();
    for (const link of mappings) {
      await ctx.db.delete(link._id);
    }

    await ctx.db.delete(id);
    return { ok: true } as const;
  },
});

export const listResourceImages = query({
  args: { resourceId: v.id("library_resources"), includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, { resourceId, includeInactive = false }) => {
    const images = await ctx.db
      .query("library_resource_images")
      .withIndex("by_resource_order", (q) => q.eq("resourceId", resourceId))
      .collect();
    images.sort((a, b) => a.order - b.order);
    return includeInactive ? images : images.filter((item) => item.active);
  },
});

export const createResourceImage = mutation({
  args: {
    resourceId: v.id("library_resources"),
    mediaId: v.id("media"),
    caption: v.optional(v.string()),
    altText: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) throw new ConvexError("Resource not found");

    const order =
      args.order ?? (await nextImageOrder(ctx, args.resourceId));
    const id = await ctx.db.insert("library_resource_images", {
      resourceId: args.resourceId,
      mediaId: args.mediaId,
      caption: args.caption,
      altText: args.altText,
      order,
      active: args.active,
      createdAt: Date.now(),
    } as any);
    return await ctx.db.get(id);
  },
});

export const updateResourceImage = mutation({
  args: {
    id: v.id("library_resource_images"),
    caption: v.optional(v.string()),
    altText: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch as any);
    return await ctx.db.get(id);
  },
});

export const deleteResourceImage = mutation({
  args: { id: v.id("library_resource_images") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { ok: true } as const;
  },
});

export const reorderResourceImages = mutation({
  args: {
    resourceId: v.id("library_resources"),
    orderedIds: v.array(v.id("library_resource_images")),
  },
  handler: async (ctx, { resourceId, orderedIds }) => {
    for (let index = 0; index < orderedIds.length; index++) {
      await ctx.db.patch(orderedIds[index], { order: index });
    }
    const images = await ctx.db
      .query("library_resource_images")
      .withIndex("by_resource_order", (q) => q.eq("resourceId", resourceId))
      .collect();
    images.sort((a, b) => a.order - b.order);
    return images;
  },
});

export const listResourceSoftwares = query({
  args: {
    resourceId: v.id("library_resources"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { resourceId, includeInactive = false }) => {
    const mappings = await ctx.db
      .query("library_resource_softwares")
      .withIndex("by_resource_order", (q) => q.eq("resourceId", resourceId))
      .collect();
    mappings.sort((a, b) => a.order - b.order);
    const softwares = (
      await Promise.all(
        mappings.map(async (link) => {
          const software = await ctx.db.get(link.softwareId);
          if (!software) return null;
          if (!includeInactive && (!link.active || !software.active)) {
            return null;
          }
          return { software, link } as const;
        })
      )
    ).filter(Boolean) as { software: any; link: any }[];
    return softwares;
  },
});

export const assignSoftwareToResource = mutation({
  args: {
    resourceId: v.id("library_resources"),
    softwareId: v.id("library_softwares"),
    note: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) throw new ConvexError("Resource not found");
    const software = await ctx.db.get(args.softwareId);
    if (!software) throw new ConvexError("Software not found");

    const existed = await ctx.db
      .query("library_resource_softwares")
      .withIndex("by_pair", (q) =>
        q.eq("resourceId", args.resourceId).eq("softwareId", args.softwareId)
      )
      .first();

    if (existed) {
      const patch: Partial<typeof existed> = {};
      if (args.note !== undefined) patch.note = args.note;
      if (args.order !== undefined) patch.order = args.order;
      if (args.active !== undefined) patch.active = args.active;
      await ctx.db.patch(existed._id, patch as any);
      return await ctx.db.get(existed._id);
    }

    const order =
      args.order ?? (await nextMappingOrder(ctx, args.resourceId));
    const id = await ctx.db.insert("library_resource_softwares", {
      resourceId: args.resourceId,
      softwareId: args.softwareId,
      note: args.note,
      order,
      active: args.active ?? true,
      assignedAt: Date.now(),
    } as any);
    return await ctx.db.get(id);
  },
});

export const updateResourceSoftware = mutation({
  args: {
    id: v.id("library_resource_softwares"),
    note: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch as any);
    return await ctx.db.get(id);
  },
});

export const removeResourceSoftware = mutation({
  args: { id: v.id("library_resource_softwares") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { ok: true } as const;
  },
});
