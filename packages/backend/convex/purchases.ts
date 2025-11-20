// Unified purchase management for all product types
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// Get customer purchases
export const getCustomerPurchases = query({
    args: {
        customerId: v.id("customers"),
        productType: v.optional(v.string()),
        accessStatus: v.optional(v.string()),
    },
    handler: async (ctx, { customerId, productType, accessStatus }) => {
        let purchases = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer", (q) => q.eq("customerId", customerId))
            .collect();

        if (productType) {
            purchases = purchases.filter((p) => p.productType === productType);
        }

        if (accessStatus) {
            purchases = purchases.filter((p) => p.accessStatus === accessStatus);
        }

        return purchases;
    },
});

// Get customer purchase by product
export const getCustomerPurchaseByProduct = query({
    args: {
        customerId: v.id("customers"),
        productType: v.string(),
        productId: v.string(),
    },
    handler: async (ctx, { customerId, productType, productId }) => {
        const purchases = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer_product", (q) =>
                q.eq("customerId", customerId).eq("productType", productType)
            )
            .collect();

        // Filter by product ID since we can't do multi-field queries with optional fields
        return purchases.find((p) => {
            if (productType === "course") {
                return p.courseId === productId;
            } else if (productType === "resource") {
                return p.resourceId === productId;
            } else if (productType === "vfx") {
                return p.vfxId === productId;
            }
            return false;
        }) ?? null;
    },
});

// Check if customer has access to product
export const hasProductAccess = query({
    args: {
        customerId: v.id("customers"),
        productType: v.string(),
        productId: v.string(),
    },
    handler: async (ctx, { customerId, productType, productId }) => {
        const purchase = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer_product", (q) =>
                q.eq("customerId", customerId).eq("productType", productType)
            )
            .collect()
            .then((purchases) => {
                if (productType === "course") {
                    return purchases.find((p) => p.courseId === productId) ?? null;
                } else if (productType === "resource") {
                    return purchases.find((p) => p.resourceId === productId) ?? null;
                } else if (productType === "vfx") {
                    return purchases.find((p) => p.vfxId === productId) ?? null;
                }
                return null;
            });

        if (!purchase) return false;

        // Check if access is still active
        if (purchase.accessStatus === "revoked") return false;
        if (purchase.accessStatus === "expired") {
            if (purchase.accessEndDate && purchase.accessEndDate < Date.now()) {
                return false;
            }
        }

        return true;
    },
});

// Create purchase record after successful order
export const createPurchase = mutation({
    args: {
        customerId: v.id("customers"),
        orderId: v.id("orders"),
        productType: v.string(),
        courseId: v.optional(v.id("courses")),
        resourceId: v.optional(v.id("library_resources")),
        vfxId: v.optional(v.id("vfx_products")),
        accessStatus: v.union(v.literal("active"), v.literal("expired"), v.literal("revoked"), v.literal("lifetime")),
        accessEndDate: v.optional(v.number()), // null = lifetime or no expiry
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const id = await ctx.db.insert("customer_purchases", {
            customerId: args.customerId,
            orderId: args.orderId,
            productType: args.productType,
            courseId: args.courseId,
            resourceId: args.resourceId,
            vfxId: args.vfxId,
            accessStatus: args.accessStatus,
            accessStartDate: now,
            accessEndDate: args.accessEndDate,
            createdAt: now,
            updatedAt: now,
        });

        return await ctx.db.get(id);
    },
});

// Update purchase access status
export const updatePurchaseStatus = mutation({
    args: {
        id: v.id("customer_purchases"),
        accessStatus: v.union(v.literal("active"), v.literal("expired"), v.literal("revoked"), v.literal("lifetime")),
        accessEndDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            accessStatus: args.accessStatus,
            accessEndDate: args.accessEndDate,
            updatedAt: Date.now(),
        });
        return { ok: true } as const;
    },
});

// Increment download count for resources/vfx
export const incrementDownloadCount = mutation({
    args: { id: v.id("customer_purchases") },
    handler: async (ctx, { id }) => {
        const purchase = await ctx.db.get(id);
        if (!purchase) throw new Error("Purchase not found");

        await ctx.db.patch(id, {
            downloadCount: (purchase.downloadCount ?? 0) + 1,
            lastAccessedAt: Date.now(),
            updatedAt: Date.now(),
        });

        return { ok: true } as const;
    },
});

// Update last accessed time
export const updateLastAccessedAt = mutation({
    args: { id: v.id("customer_purchases") },
    handler: async (ctx, { id }) => {
        await ctx.db.patch(id, {
            lastAccessedAt: Date.now(),
            updatedAt: Date.now(),
        });
        return { ok: true } as const;
    },
});

// Update course progress (for courses)
export const updateCourseProgress = mutation({
    args: {
        id: v.id("customer_purchases"),
        progressPercent: v.number(),
    },
    handler: async (ctx, args) => {
        if (args.progressPercent < 0 || args.progressPercent > 100) {
            throw new Error("Progress must be between 0 and 100");
        }

        await ctx.db.patch(args.id, {
            progressPercent: args.progressPercent,
            updatedAt: Date.now(),
        });
        return { ok: true } as const;
    },
});

// Mark course as completed
export const completeCourse = mutation({
    args: {
        id: v.id("customer_purchases"),
        certificateId: v.optional(v.id("certificates")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            progressPercent: 100,
            completedAt: Date.now(),
            certificateId: args.certificateId,
            accessStatus: "lifetime", // Completed courses have lifetime access
            updatedAt: Date.now(),
        });
        return { ok: true } as const;
    },
});

// Get purchases by order ID
export const getPurchasesByOrder = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, { orderId }) => {
        return await ctx.db
            .query("customer_purchases")
            .withIndex("by_order", (q) => q.eq("orderId", orderId))
            .collect();
    },
});

// Get customer purchases with product details (enriched)
export const getCustomerPurchasesEnriched = query({
    args: { customerId: v.id("customers") },
    handler: async (ctx, { customerId }) => {
        const purchases = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer", (q) => q.eq("customerId", customerId))
            .collect();

        const enriched = await Promise.all(
            purchases.map(async (purchase) => {
                let product: any = null;

                if (purchase.productType === "course" && purchase.courseId) {
                    product = await ctx.db.get(purchase.courseId);
                } else if (purchase.productType === "resource" && purchase.resourceId) {
                    product = await ctx.db.get(purchase.resourceId);
                } else if (purchase.productType === "vfx" && purchase.vfxId) {
                    product = await ctx.db.get(purchase.vfxId);
                }

                return {
                    ...purchase,
                    product,
                };
            })
        );

        return enriched;
    },
});

// Check if customer has purchased specific product
export const hasPurchased = query({
    args: {
        customerId: v.id("customers"),
        productType: v.string(),
        productId: v.string(),
    },
    handler: async (ctx, { customerId, productType, productId }) => {
        const purchases = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer_product", (q) =>
                q.eq("customerId", customerId).eq("productType", productType)
            )
            .collect();

        const purchase = purchases.find((p) => {
            if (productType === "course" && p.courseId) {
                return String(p.courseId) === productId;
            } else if (productType === "resource" && p.resourceId) {
                return String(p.resourceId) === productId;
            } else if (productType === "vfx" && p.vfxId) {
                return String(p.vfxId) === productId;
            }
            return false;
        });

        return { hasPurchased: !!purchase, purchase: purchase ?? null };
    },
});

// Get recent purchases for customer
export const getRecentPurchases = query({
    args: { customerId: v.id("customers"), limit: v.optional(v.number()) },
    handler: async (ctx, { customerId, limit = 10 }) => {
        const purchases = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer", (q) => q.eq("customerId", customerId))
            .collect();

        // Sort by creation date descending
        purchases.sort((a, b) => b.createdAt - a.createdAt);

        return purchases.slice(0, limit);
    },
});

// Get active purchases for customer
export const getActivePurchases = query({
    args: { customerId: v.id("customers") },
    handler: async (ctx, { customerId }) => {
        const purchases = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer", (q) => q.eq("customerId", customerId))
            .collect();

        const now = Date.now();
        return purchases.filter((p) => {
            if (p.accessStatus === "revoked") return false;
            if (p.accessStatus === "lifetime") return true;
            if (p.accessEndDate && p.accessEndDate < now) return false;
            return p.accessStatus === "active";
        });
    },
});
