// Purchase management - lifetime access after buying
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";

type AnyCtx = QueryCtx | MutationCtx;
type ProductType = "course" | "resource" | "vfx";

const loadProduct = async (ctx: AnyCtx, productType: string, productId: string) => {
    if (productType === "course") return ctx.db.get(productId as Id<"courses">);
    if (productType === "resource") return ctx.db.get(productId as Id<"library_resources">);
    if (productType === "vfx") return ctx.db.get(productId as Id<"vfx_products">);
    return null;
};

// Get customer purchases
export const getCustomerPurchases = query({
    args: { customerId: v.id("customers") },
    handler: async (ctx, { customerId }) => {
        return await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer", (q) => q.eq("customerId", customerId))
            .collect();
    },
});

// List purchases for a product (admin view)
export const listPurchasesByProduct = query({
    args: {
        productType: v.union(v.literal("course"), v.literal("resource"), v.literal("vfx")),
        productId: v.string(),
    },
    handler: async (ctx, { productType, productId }) => {
        const purchases = await ctx.db
            .query("customer_purchases")
            .withIndex("by_product", (q) => q.eq("productType", productType).eq("productId", productId))
            .collect();

        purchases.sort((a, b) => b.createdAt - a.createdAt);

        return Promise.all(
            purchases.map(async (purchase) => {
                const customer = await ctx.db.get(purchase.customerId);
                const order = await ctx.db.get(purchase.orderId);
                return {
                    ...purchase,
                    customer: customer
                        ? {
                              _id: customer._id,
                              fullName: customer.fullName,
                              email: customer.email,
                              phone: customer.phone,
                              account: customer.account,
                              active: customer.active,
                          }
                        : null,
                    orderNumber: order?.orderNumber ?? null,
                    orderStatus: order?.status ?? null,
                };
            })
        );
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
        const purchase = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer_product", (q) =>
                q.eq("customerId", customerId)
                    .eq("productType", productType)
                    .eq("productId", productId)
            )
            .first();

        return !!purchase;
    },
});

// Get single purchase record
export const getPurchase = query({
    args: {
        customerId: v.id("customers"),
        productType: v.string(),
        productId: v.string(),
    },
    handler: async (ctx, { customerId, productType, productId }) => {
        return (
            (await ctx.db
                .query("customer_purchases")
                .withIndex("by_customer_product", (q) =>
                    q.eq("customerId", customerId)
                        .eq("productType", productType)
                        .eq("productId", productId)
                )
                .first()) ?? null
        );
    },
});

// Increment download count (for resources & vfx)
export const incrementDownloadCount = mutation({
    args: {
        purchaseId: v.id("customer_purchases"),
    },
    handler: async (ctx, { purchaseId }) => {
        const purchase = await ctx.db.get(purchaseId);
        if (!purchase) throw new ConvexError("Purchase not found");

        await ctx.db.patch(purchaseId, {
            downloadCount: (purchase.downloadCount ?? 0) + 1,
            updatedAt: Date.now(),
        });

        return { ok: true } as const;
    },
});

// Update course progress
export const updateCourseProgress = mutation({
    args: {
        purchaseId: v.id("customer_purchases"),
        progressPercent: v.number(),
    },
    handler: async (ctx, { purchaseId, progressPercent }) => {
        if (progressPercent < 0 || progressPercent > 100) {
            throw new ConvexError("Progress must be between 0 and 100");
        }

        const purchase = await ctx.db.get(purchaseId);
        if (!purchase) throw new ConvexError("Purchase not found");

        await ctx.db.patch(purchaseId, {
            progressPercent,
            updatedAt: Date.now(),
        });

        return { ok: true } as const;
    },
});

// Mark course as completed
export const completeCourse = mutation({
    args: {
        purchaseId: v.id("customer_purchases"),
        certificateId: v.optional(v.id("certificates")),
    },
    handler: async (ctx, { purchaseId, certificateId }) => {
        const purchase = await ctx.db.get(purchaseId);
        if (!purchase) throw new ConvexError("Purchase not found");

        await ctx.db.patch(purchaseId, {
            progressPercent: 100,
            completedAt: Date.now(),
            certificateId,
            updatedAt: Date.now(),
        });

        return { ok: true } as const;
    },
});

// Get customer's library (all purchases with product details)
export const getCustomerLibrary = query({
    args: {
        customerId: v.id("customers"),
        productType: v.optional(v.string()),
    },
    handler: async (ctx, { customerId, productType }) => {
        let purchases = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer", (q) => q.eq("customerId", customerId))
            .collect();

        if (productType) {
            purchases = purchases.filter((p) => p.productType === productType);
        }

        // Enrich with product details
        const enriched = await Promise.all(
            purchases.map(async (purchase) => {
                let product: any = null;

                if (purchase.productType === "course") {
                    product = await ctx.db.get(purchase.productId as any);
                } else if (purchase.productType === "resource") {
                    product = await ctx.db.get(purchase.productId as any);
                } else if (purchase.productType === "vfx") {
                    product = await ctx.db.get(purchase.productId as any);
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

// Admin: purchases kèm product + order
export const getCustomerPurchasesWithMeta = query({
    args: { customerId: v.id("customers") },
    handler: async (ctx, { customerId }) => {
        const purchases = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer", (q) => q.eq("customerId", customerId))
            .collect();

        purchases.sort((a, b) => b.createdAt - a.createdAt);

        return Promise.all(
            purchases.map(async (purchase) => {
                const product = await loadProduct(ctx, purchase.productType, purchase.productId);
                const order = await ctx.db.get(purchase.orderId);
                return { ...purchase, product, order };
            })
        );
    },
});

// Get recent purchases (for dashboard)
export const getRecentPurchases = query({
    args: {
        customerId: v.id("customers"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { customerId, limit = 10 }) => {
        const purchases = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer", (q) => q.eq("customerId", customerId))
            .collect();

        purchases.sort((a, b) => b.createdAt - a.createdAt);
        return purchases.slice(0, limit);
    },
});

// Get purchases by order (check what was bought in an order)
export const getPurchasesByOrder = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, { orderId }) => {
        return await ctx.db
            .query("customer_purchases")
            .withIndex("by_order", (q) => q.eq("orderId", orderId))
            .collect();
    },
});

// Revoke a purchase (admin)
export const revokePurchase = mutation({
    args: { purchaseId: v.id("customer_purchases") },
    handler: async (ctx, { purchaseId }) => {
        const purchase = await ctx.db.get(purchaseId);
        if (!purchase) return { ok: false } as const;

        await ctx.db.delete(purchaseId);
        return { ok: true } as const;
    },
});
