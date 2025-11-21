// VFX products management (video effects 1-5 seconds)
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

type AnyCtx = MutationCtx | QueryCtx;

type VfxCategory = "explosion" | "fire" | "smoke" | "water" | "magic" | "particle" | "transition" | "other";

// List VFX products with filtering
export const listVfxProducts = query({
    args: {
        activeOnly: v.optional(v.boolean()),
        category: v.optional(v.string()),
        pricingType: v.optional(v.string()),
        search: v.optional(v.string()),
    },
    handler: async (ctx, { activeOnly = false, category, pricingType, search }) => {
        let products = await ctx.db.query("vfx_products").collect();

        if (activeOnly) {
            products = products.filter((p) => p.active);
        }

        if (category) {
            products = products.filter((p) => p.category === category);
        }

        if (pricingType) {
            products = products.filter((p) => p.pricingType === pricingType);
        }

        if (search && search.trim().length > 0) {
            const keyword = search.trim().toLowerCase();
            products = products.filter((p) => {
                const values = [
                    p.title,
                    p.subtitle ?? "",
                    p.description ?? "",
                    p.tags?.join(" ") ?? "",
                ];
                return values.some((v) => v.toLowerCase().includes(keyword));
            });
        }

        products.sort((a, b) => a.order - b.order);
        return products;
    },
});

// Get single VFX product
export const getVfxProduct = query({
    args: { id: v.id("vfx_products") },
    handler: async (ctx, { id }) => {
        return (await ctx.db.get(id)) ?? null;
    },
});

// Get VFX product by slug
export const getVfxProductBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, { slug }) => {
        return (
            (await ctx.db
                .query("vfx_products")
                .withIndex("by_slug", (q) => q.eq("slug", slug))
                .first()) ?? null
        );
    },
});

// Create VFX product
export const createVfxProduct = mutation({
    args: {
        slug: v.string(),
        title: v.string(),
        subtitle: v.optional(v.string()),
        description: v.optional(v.string()),
        category: v.union(
            v.literal("explosion"),
            v.literal("fire"),
            v.literal("smoke"),
            v.literal("water"),
            v.literal("magic"),
            v.literal("particle"),
            v.literal("transition"),
            v.literal("other")
        ),
        thumbnailId: v.optional(v.id("media")),
        previewVideoId: v.id("media"),
        downloadFileId: v.id("media"),
        pricingType: v.union(v.literal("free"), v.literal("paid")),
        priceAmount: v.optional(v.number()),
        comparePriceAmount: v.optional(v.number()),
        duration: v.number(),
        resolution: v.string(),
        frameRate: v.number(),
        format: v.string(),
        hasAlpha: v.boolean(),
        fileSize: v.number(),
        tags: v.optional(v.array(v.string())),
        order: v.number(),
        active: v.boolean(),
    },
    handler: async (ctx, args) => {
        const slug = args.slug.trim().toLowerCase();
        if (!slug) throw new Error("Slug is required");

        const existing = await ctx.db
            .query("vfx_products")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();
        if (existing) throw new Error("VFX with this slug already exists");

        const title = args.title.trim();
        if (!title) throw new Error("Title is required");

        const now = Date.now();

        const id = await ctx.db.insert("vfx_products", {
            slug,
            title,
            subtitle: args.subtitle?.trim() || undefined,
            description: args.description?.trim() || undefined,
            category: args.category,
            thumbnailId: args.thumbnailId,
            previewVideoId: args.previewVideoId,
            downloadFileId: args.downloadFileId,
            pricingType: args.pricingType,
            price: args.priceAmount || 0,
            originalPrice: args.comparePriceAmount,
            duration: args.duration,
            resolution: args.resolution,
            frameRate: args.frameRate,
            format: args.format,
            hasAlpha: args.hasAlpha,
            fileSize: args.fileSize,
            downloadCount: 0,
            tags: args.tags ?? [],
            order: args.order,
            active: args.active,
            createdAt: now,
            updatedAt: now,
        });

        return await ctx.db.get(id);
    },
});

// Update VFX product
export const updateVfxProduct = mutation({
    args: {
        id: v.id("vfx_products"),
        slug: v.optional(v.string()),
        title: v.optional(v.string()),
        subtitle: v.optional(v.union(v.string(), v.null())),
        description: v.optional(v.union(v.string(), v.null())),
        category: v.optional(
            v.union(
                v.literal("explosion"),
                v.literal("fire"),
                v.literal("smoke"),
                v.literal("water"),
                v.literal("magic"),
                v.literal("particle"),
                v.literal("transition"),
                v.literal("other")
            )
        ),
        thumbnailId: v.optional(v.union(v.id("media"), v.null())),
        previewVideoId: v.optional(v.id("media")),
        downloadFileId: v.optional(v.id("media")),
        pricingType: v.optional(v.union(v.literal("free"), v.literal("paid"))),
        priceAmount: v.optional(v.union(v.number(), v.null())),
        comparePriceAmount: v.optional(v.union(v.number(), v.null())),
        duration: v.optional(v.number()),
        resolution: v.optional(v.string()),
        frameRate: v.optional(v.number()),
        format: v.optional(v.string()),
        hasAlpha: v.optional(v.boolean()),
        fileSize: v.optional(v.number()),
        tags: v.optional(v.array(v.string())),
        order: v.optional(v.number()),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, slug, ...rest } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("VFX product not found");

        const patch: Record<string, unknown> = { ...rest };

        if (slug !== undefined) {
            const trimmedSlug = slug.trim().toLowerCase();
            if (!trimmedSlug) throw new Error("Slug is required");
            if (trimmedSlug !== existing.slug) {
                const existing2 = await ctx.db
                    .query("vfx_products")
                    .withIndex("by_slug", (q) => q.eq("slug", trimmedSlug))
                    .first();
                if (existing2) throw new Error("VFX with this slug already exists");
            }
            patch.slug = trimmedSlug;
        }

        if (rest.title !== undefined) {
            patch.title = rest.title.trim();
        }

        if (rest.subtitle !== undefined) {
            patch.subtitle = rest.subtitle ? rest.subtitle.trim() : undefined;
        }

        if (rest.description !== undefined) {
            patch.description = rest.description ? rest.description.trim() : undefined;
        }

        patch.updatedAt = Date.now();

        await ctx.db.patch(id, patch as any);
        return await ctx.db.get(id);
    },
});

// Increment download count
export const incrementVfxDownloadCount = mutation({
    args: { id: v.id("vfx_products") },
    handler: async (ctx, { id }) => {
        const vfx = await ctx.db.get(id);
        if (!vfx) throw new Error("VFX product not found");

        await ctx.db.patch(id, {
            downloadCount: (vfx.downloadCount ?? 0) + 1,
            updatedAt: Date.now(),
        });

        return { ok: true } as const;
    },
});

// Set VFX product active/inactive
export const setVfxProductActive = mutation({
    args: { id: v.id("vfx_products"), active: v.boolean() },
    handler: async (ctx, { id, active }) => {
        await ctx.db.patch(id, { active, updatedAt: Date.now() });
        return { ok: true } as const;
    },
});

// Delete VFX product (hard delete for now, can implement soft delete later)
export const deleteVfxProduct = mutation({
    args: { id: v.id("vfx_products") },
    handler: async (ctx, { id }) => {
        const existing = await ctx.db.get(id);
        if (!existing) return { ok: false } as const;

        // Delete any purchases for this VFX
        const purchases = await ctx.db
            .query("customer_purchases")
            .filter((q) => 
                q.and(
                    q.eq(q.field("productType"), "vfx"),
                    q.eq(q.field("productId"), id.toString())
                )
            )
            .collect();
        for (const purchase of purchases) {
            await ctx.db.delete(purchase._id);
        }

        // Delete any order_items for this VFX
        const orderItems = await ctx.db
            .query("order_items")
            .filter((q) => 
                q.and(
                    q.eq(q.field("productType"), "vfx"),
                    q.eq(q.field("productId"), id.toString())
                )
            )
            .collect();
        for (const item of orderItems) {
            await ctx.db.delete(item._id);
        }

        await ctx.db.delete(id);
        return { ok: true } as const;
    },
});

// Get VFX products by category
export const getVfxByCategory = query({
    args: { category: v.string(), activeOnly: v.optional(v.boolean()) },
    handler: async (ctx, { category, activeOnly = true }) => {
        let products = await ctx.db
            .query("vfx_products")
            .withIndex("by_category", (q) => q.eq("category", category as VfxCategory))
            .collect();

        if (activeOnly) {
            products = products.filter((p) => p.active);
        }

        products.sort((a, b) => a.order - b.order);
        return products;
    },
});

// Get trending VFX products (by download count)
export const getTrendingVfx = query({
    args: { limit: v.optional(v.number()), activeOnly: v.optional(v.boolean()) },
    handler: async (ctx, { limit = 10, activeOnly = true }) => {
        let products = await ctx.db.query("vfx_products").collect();

        if (activeOnly) {
            products = products.filter((p) => p.active);
        }

        products.sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0));
        return products.slice(0, limit);
    },
});

// Reorder VFX products
export const reorderVfxProducts = mutation({
    args: { orderedIds: v.array(v.id("vfx_products")) },
    handler: async (ctx, { orderedIds }) => {
        const now = Date.now();
        for (let i = 0; i < orderedIds.length; i++) {
            await ctx.db.patch(orderedIds[i], { order: i, updatedAt: now });
        }
        const products = await ctx.db.query("vfx_products").collect();
        products.sort((a, b) => a.order - b.order);
        return products;
    },
});
