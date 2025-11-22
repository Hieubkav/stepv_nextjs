// Order management - supports multi-item orders
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

type AnyCtx = MutationCtx | QueryCtx;

// Generate order number: DH-YYMM-XXX
// Example: DH-2411-001 (November 2024, order 001)
const generateOrderNumber = async (ctx: AnyCtx): Promise<string> => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const yyyymm = `${year}${month}`;
    
    // Get count of orders from this month
    const allOrders = await ctx.db.query("orders").collect();
    const thisMonthOrders = allOrders.filter((o) => {
        const oDate = new Date(o.createdAt);
        const oYyyy = oDate.getFullYear().toString().slice(-2);
        const oMm = String(oDate.getMonth() + 1).padStart(2, '0');
        return `${oYyyy}${oMm}` === yyyymm;
    });
    
    const nextNum = thisMonthOrders.length + 1;
    const numStr = String(nextNum).padStart(3, '0');
    
    return `DH-${year}${month}-${numStr}`;
};

// Get orders for customer
export const getCustomerOrders = query({
    args: {
        customerId: v.id("customers"),
        status: v.optional(v.string()),
    },
    handler: async (ctx, { customerId, status }) => {
        let orders = await ctx.db
            .query("orders")
            .withIndex("by_customer", (q) => q.eq("customerId", customerId))
            .collect();

        if (status) {
            orders = orders.filter((o) => o.status === status);
        }

        // Sort by creation date descending
        orders.sort((a, b) => b.createdAt - a.createdAt);
        return orders;
    },
});

// Get order with items
export const getOrderWithItems = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, { orderId }) => {
        const order = await ctx.db.get(orderId);
        if (!order) return null;

        const items = await ctx.db
            .query("order_items")
            .withIndex("by_order", (q) => q.eq("orderId", orderId))
            .collect();

        return { ...order, items };
    },
});

// Get order by order number
export const getOrderByNumber = query({
    args: { orderNumber: v.string() },
    handler: async (ctx, { orderNumber }) => {
        const order = await ctx.db
            .query("orders")
            .withIndex("by_order_number", (q) => q.eq("orderNumber", orderNumber))
            .first();

        if (!order) return null;

        const items = await ctx.db
            .query("order_items")
            .withIndex("by_order", (q) => q.eq("orderId", order._id))
            .collect();

        return { ...order, items };
    },
});

// Create order with multiple items
export const createOrderWithItems = mutation({
    args: {
        customerId: v.id("customers"),
        items: v.array(
            v.object({
                productType: v.union(v.literal("course"), v.literal("resource"), v.literal("vfx")),
                productId: v.string(),
                price: v.number(),
            })
        ),
    },
    handler: async (ctx, { customerId, items }) => {
        if (!items.length) throw new Error("At least one item is required");

        // For MVP: customerId can be either customers or students (passed as customerId)
        // Just verify the ID is valid, no need to check if customer exists
        // const customer = await ctx.db.get(customerId);
        // if (!customer) throw new Error("Customer not found");

        // Calculate total
        const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

        // Generate order number
        const orderNumber = await generateOrderNumber(ctx);

        // Create order
        const orderId = await ctx.db.insert("orders", {
            customerId,
            orderNumber,
            totalAmount,
            status: "pending",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Create order items
        for (const item of items) {
            await ctx.db.insert("order_items", {
                orderId,
                productType: item.productType,
                productId: item.productId,
                price: item.price,
                createdAt: Date.now(),
            });
        }

        // Return order with items
        const order = await ctx.db.get(orderId);
        if (!order) return null;
        
        const orderItems = await ctx.db
            .query("order_items")
            .withIndex("by_order", (q) => q.eq("orderId", orderId))
            .collect();
        
        return { ...order, items: orderItems };
    },
});

// Check if customer already purchased a product
export const checkDuplicatePurchase = query({
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

        return { hasPurchased: !!purchase };
    },
});

// Mark order as paid
export const markOrderAsPaid = mutation({
    args: {
        orderId: v.id("orders"),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { orderId, notes }) => {
        const order = await ctx.db.get(orderId);
        if (!order) throw new Error("Order not found");

        await ctx.db.patch(orderId, {
            status: "paid",
            notes: notes || order.notes,
            updatedAt: Date.now(),
        });

        return { ok: true } as const;
    },
});

// Activate order - creates purchase records for each item
export const activateOrder = mutation({
    args: { orderId: v.id("orders") },
    handler: async (ctx, { orderId }) => {
        const order = await ctx.db.get(orderId);
        if (!order) throw new Error("Order not found");

        if (order.status !== "paid") {
            throw new Error("Order must be paid before activation");
        }

        if (!order.customerId) {
            throw new Error("Order customer not found");
        }

        const customerId = order.customerId;

        // Get order items
        const items = await ctx.db
            .query("order_items")
            .withIndex("by_order", (q) => q.eq("orderId", orderId))
            .collect();

        if (!items.length) throw new Error("Order has no items");

        // Create purchase record for each item
        const now = Date.now();
        for (const item of items) {
            // Check if purchase already exists
            const existing = await ctx.db
                .query("customer_purchases")
                .withIndex("by_customer_product", (q) =>
                    q.eq("customerId", customerId)
                        .eq("productType", item.productType)
                        .eq("productId", item.productId)
                )
                .first();

            if (!existing) {
                await ctx.db.insert("customer_purchases", {
                    customerId,
                    orderId,
                    productType: item.productType,
                    productId: item.productId,
                    createdAt: now,
                    updatedAt: now,
                });
            }
        }

        // Update order status
        await ctx.db.patch(orderId, {
            status: "activated",
            updatedAt: now,
        });

        return { ok: true } as const;
    },
});

// Get all pending orders (for admin)
export const getPendingOrders = query({
    args: {},
    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();

        // Sort by creation date
        orders.sort((a, b) => a.createdAt - b.createdAt);
        return orders;
    },
});

// Get paid orders (ready to activate)
export const getPaidOrders = query({
    args: {},
    handler: async (ctx) => {
        let orders = await ctx.db
            .query("orders")
            .withIndex("by_status", (q) => q.eq("status", "paid"))
            .collect();

        orders.sort((a, b) => a.createdAt - b.createdAt);
        return orders;
    },
});

// Cancel order
export const cancelOrder = mutation({
    args: {
        orderId: v.id("orders"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { orderId, reason }) => {
        const order = await ctx.db.get(orderId);
        if (!order) throw new Error("Order not found");

        if (order.status === "activated") {
            throw new Error("Cannot cancel an order that has been fulfilled");
        }

        const notes = reason ? `Cancelled: ${reason}` : "Cancelled by admin";

        await ctx.db.patch(orderId, {
            notes,
            status: "cancelled",
            updatedAt: Date.now(),
        });

        // Note: We don't delete the order, just mark as cancelled via notes
        return { ok: true } as const;
    },
});

// Get order by ID
export const getOrderById = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, { orderId }) => {
        const order = await ctx.db.get(orderId);
        if (!order) return null;

        const items = await ctx.db
            .query("order_items")
            .withIndex("by_order", (q) => q.eq("orderId", orderId))
            .collect();

        return { ...order, items };
    },
});

// List all orders (admin)
export const listOrders = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, { limit }) => {
        const orders = await ctx.db
            .query("orders")
            .order("desc")
            .take(limit || 200);
        return orders;
    },
});

// Update order
export const updateOrder = mutation({
    args: {
        orderId: v.id("orders"),
        notes: v.optional(v.string()),
        status: v.optional(
            v.union(
                v.literal("pending"),
                v.literal("paid"),
                v.literal("activated"),
                v.literal("cancelled"),
            ),
        ),
    },
    handler: async (ctx, { orderId, notes, status }) => {
        const order = await ctx.db.get(orderId);
        if (!order) throw new Error("Order not found");

        const updates: any = { updatedAt: Date.now() };
        if (notes !== undefined) updates.notes = notes;
        if (status !== undefined) updates.status = status;

        await ctx.db.patch(orderId, updates);
        return { ok: true } as const;
    },
});

// Delete order
export const deleteOrder = mutation({
    args: { orderId: v.id("orders") },
    handler: async (ctx, { orderId }) => {
        const order = await ctx.db.get(orderId);
        if (!order) throw new Error("Order not found");

        // Delete order items first
        const items = await ctx.db
            .query("order_items")
            .withIndex("by_order", (q) => q.eq("orderId", orderId))
            .collect();

        for (const item of items) {
            await ctx.db.delete(item._id);
        }

        // Delete order
        await ctx.db.delete(orderId);
        return { ok: true } as const;
    },
});
