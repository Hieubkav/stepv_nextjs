// Order management - supports multi-item orders
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id, Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";

type AnyCtx = MutationCtx | QueryCtx;
type ProductTypeLiteral = "course" | "resource" | "vfx";

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

const getProductByType = async (ctx: AnyCtx, productType: string, productId: string) => {
    if (productType === "course") return ctx.db.get(productId as Id<"courses">);
    if (productType === "resource") return ctx.db.get(productId as Id<"library_resources">);
    return ctx.db.get(productId as Id<"vfx_products">);
};

const getSiteContactEmail = async (ctx: AnyCtx): Promise<string | null> => {
    const site = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", "site"))
        .first();

    const value = (site?.value ?? {}) as Record<string, unknown>;
    const primary = typeof value.contactEmail === "string" ? value.contactEmail.trim() : "";
    const legacy = typeof value.contact_email === "string" ? value.contact_email.trim() : "";

    return primary || legacy || null;
};

const activeStatuses = new Set(["pending", "paid", "activated"]);

const findActiveOrderForProduct = async (
    ctx: AnyCtx,
    customerId: Id<"customers">,
    productType: ProductTypeLiteral,
    productId: string,
) => {
    const orders = await ctx.db
        .query("orders")
        .withIndex("by_customer", (q) => q.eq("customerId", customerId))
        .collect();

    for (const order of orders) {
        if (!activeStatuses.has(order.status)) continue;
        const items = await ctx.db
            .query("order_items")
            .withIndex("by_order", (q) => q.eq("orderId", order._id))
            .collect();
        const matched = items.find(
            (item) => item.productType === productType && item.productId === productId,
        );
        if (matched) {
            return {
                order,
                item: matched,
            };
        }
    }
    return null;
};

const findExistingPurchase = async (
    ctx: AnyCtx,
    customerId: Id<"customers">,
    productType: ProductTypeLiteral,
    productId: string,
) => {
    return await ctx.db
        .query("customer_purchases")
        .withIndex("by_customer_product", (q) =>
            q.eq("customerId", customerId).eq("productType", productType).eq("productId", productId),
        )
        .first();
};

const resolveProductPrice = (productType: ProductTypeLiteral, product: any, override?: number) => {
    if (override !== undefined && Number.isFinite(override)) return Math.max(0, override);
    if (!product) return 0;
    if (productType === "course") return product.pricingType === "paid" ? Number(product.priceAmount ?? 0) : 0;
    if (productType === "resource") return product.pricingType === "paid" ? Number(product.price ?? 0) : 0;
    return product.pricingType === "paid" ? Number(product.price ?? 0) : 0;
};

const createManualOrder = async (
    ctx: MutationCtx,
    customerId: Id<"customers">,
    totalAmount: number,
    notes?: string,
): Promise<Doc<"orders">> => {
    const now = Date.now();
    const orderNumber = await generateOrderNumber(ctx);
    const orderId = await ctx.db.insert("orders", {
        customerId,
        orderNumber,
        totalAmount,
        status: "activated",
        notes: notes?.trim() || "Thêm thủ công bởi admin",
        createdAt: now,
        updatedAt: now,
    });
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Không tạo được đơn hàng");
    return order as Doc<"orders">;
};

const getOrderItemsWithProduct = async (ctx: AnyCtx, orderId: Id<"orders">) => {
    const items = await ctx.db
        .query("order_items")
        .withIndex("by_order", (q) => q.eq("orderId", orderId))
        .collect();

    return Promise.all(
        items.map(async (item) => ({
            ...item,
            product: await getProductByType(ctx, item.productType, item.productId),
        })),
    );
};

type OrderItemSummary = {
    name: string;
    type: ProductTypeLiteral;
    slug?: string;
};

const createPurchasesForOrder = async (ctx: MutationCtx, order: Doc<"orders">) => {
    if (!order.customerId) throw new Error("Order customer not found");

    const items = await ctx.db
        .query("order_items")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .collect();

    if (!items.length) throw new Error("Order has no items");

    const now = Date.now();
    for (const item of items) {
        const existing = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer_product", (q) =>
                q.eq("customerId", order.customerId as Id<"customers">)
                    .eq("productType", item.productType)
                    .eq("productId", item.productId),
            )
            .first();

        if (!existing) {
            await ctx.db.insert("customer_purchases", {
                customerId: order.customerId as Id<"customers">,
                orderId: order._id,
                productType: item.productType,
                productId: item.productId,
                createdAt: now,
                updatedAt: now,
            });
        }
    }

    return items;
};

const buildOrderItemSummaries = async (
    ctx: AnyCtx,
    items: Array<Doc<"order_items">>,
): Promise<OrderItemSummary[]> => {
    const summaries: OrderItemSummary[] = [];

    for (const item of items) {
        if (item.productType === "course") {
            const course = await ctx.db.get(item.productId as Id<"courses">);
            summaries.push({
                name: course?.title || "Khoa hoc",
                type: "course",
                slug: course?.slug || undefined,
            });
            continue;
        }

        if (item.productType === "resource") {
            const resource = await ctx.db.get(item.productId as Id<"library_resources">);
            summaries.push({
                name: resource?.title || "Tai nguyen",
                type: "resource",
                slug: resource?.slug || undefined,
            });
            continue;
        }

        const vfx = await ctx.db.get(item.productId as Id<"vfx_products">);
        summaries.push({
            name: vfx?.title || "VFX",
            type: "vfx",
            slug: vfx?.slug || undefined,
        });
    }

    return summaries;
};

const sendOrderActivatedEmail = async (
    ctx: MutationCtx,
    order: Doc<"orders">,
    items: Array<Doc<"order_items">>,
) => {
    if (!order.customerId) return;

    const customer = await ctx.db.get(order.customerId as Id<"customers">);
    if (!customer?.email) return;

    const itemSummaries = await buildOrderItemSummaries(ctx, items);

    await ctx.scheduler.runAfter(0, internal.email.sendOrderActivatedEmail, {
        customerEmail: customer.email,
        customerName: customer.fullName || customer.account || "Khach hang",
        orderNumber: order.orderNumber || order._id,
        totalAmount: order.totalAmount || 0,
        items: itemSummaries,
    });
};

export const getCustomerOrdersWithItems = query({
    args: { customerId: v.id("customers") },
    handler: async (ctx, { customerId }) => {
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_customer", (q) => q.eq("customerId", customerId))
            .collect();

        orders.sort((a, b) => b.createdAt - a.createdAt);

        return Promise.all(
            orders.map(async (order) => ({
                ...order,
                items: await getOrderItemsWithProduct(ctx, order._id),
            })),
        );
    },
});

// Get order with items
export const getOrderWithItems = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, { orderId }) => {
        const order = await ctx.db.get(orderId);
        if (!order) return null;

        const items = await getOrderItemsWithProduct(ctx, orderId);
        const customer = order.customerId ? await ctx.db.get(order.customerId) : null;
        const customerSafe = customer
            ? {
                  _id: customer._id,
                  fullName: customer.fullName,
                  email: customer.email,
                  phone: customer.phone,
                  account: customer.account,
                  notes: customer.notes,
                  active: customer.active,
              }
            : null;

        return { ...order, customer: customerSafe, items };
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

        // Ki?m tra tr�ng mua (purchase) ho?c ??n dang x? ly cho t?ng s?n ph?m
        for (const item of items) {
            const purchase = await ctx.db
                .query("customer_purchases")
                .withIndex("by_customer_product", (q) =>
                    q.eq("customerId", customerId)
                        .eq("productType", item.productType)
                        .eq("productId", item.productId),
                )
                .first();

            if (purchase) {
                throw new Error("S?n ph?m da du?c m?a, kh�ng th? t?o don m?i.");
            }

            const activeOrder = await findActiveOrderForProduct(
                ctx,
                customerId,
                item.productType as ProductTypeLiteral,
                item.productId,
            );

            if (activeOrder) {
                const number = activeOrder.order.orderNumber ?? activeOrder.order._id;
                throw new Error(
                    `S?n ph?m da c� ??n (${number}) ? trang th�i ${activeOrder.order.status}. Vui l�ng kh�ng t?o th�m.`,
                );
            }
        }

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

        const customer = await ctx.db.get(customerId);
        const contactEmail = await getSiteContactEmail(ctx);
        const paymentAdmin = await ctx.db.query("payment_settings").first();
        const adminEmail = contactEmail || paymentAdmin?.adminEmail || null;
        const customerEmail = typeof customer?.email === "string" ? customer.email.trim() : "";
        const customerName =
            customer?.fullName || customer?.account || customerEmail || "Khach hang";

        if ((adminEmail || customerEmail) && orderNumber) {
            await ctx.scheduler.runAfter(0, internal.email.sendCheckoutTransferEmails, {
                adminEmail: adminEmail || undefined,
                customerEmail: customerEmail || undefined,
                customerName,
                orderNumber,
                amount: totalAmount,
                itemCount: items.length,
            });
        }
        
        return { ...order, items: orderItems };
    },
});

// Admin: cấp quyền thủ công cho một sản phẩm
export const grantProductToCustomer = mutation({
    args: {
        customerId: v.id("customers"),
        productType: v.union(v.literal("course"), v.literal("resource"), v.literal("vfx")),
        productId: v.string(),
        price: v.optional(v.number()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { customerId, productType, productId, price, notes }) => {
        const product = await getProductByType(ctx, productType, productId);
        if (!product) throw new Error("Sản phẩm không tồn tại");

        const existing = await findExistingPurchase(ctx, customerId, productType, productId);
        if (existing) {
            return { ok: false as const, reason: "already_purchased" as const, purchaseId: existing._id };
        }

        const lock = await findActiveOrderForProduct(ctx, customerId, productType, productId);
        if (lock) {
            return {
                ok: false as const,
                reason: "has_active_order" as const,
                orderId: lock.order._id,
                status: lock.order.status,
                orderNumber: lock.order.orderNumber ?? lock.order._id,
            };
        }

        const amount = resolveProductPrice(productType, product, price);
        const order = await createManualOrder(ctx, customerId, amount, notes);

        await ctx.db.insert("order_items", {
            orderId: order._id,
            productType,
            productId,
            price: amount,
            createdAt: order.createdAt,
        });

        await createPurchasesForOrder(ctx, order);

        return { ok: true as const, orderId: order._id, orderNumber: order.orderNumber ?? "" };
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

// Ki?m tra nhanh: d� mua ho?c c� ??n dang x? ly
export const getProductLockStatus = query({
    args: {
        customerId: v.id("customers"),
        productType: v.union(v.literal("course"), v.literal("resource"), v.literal("vfx")),
        productId: v.string(),
    },
    handler: async (ctx, { customerId, productType, productId }) => {
        const purchase = await ctx.db
            .query("customer_purchases")
            .withIndex("by_customer_product", (q) =>
                q.eq("customerId", customerId)
                    .eq("productType", productType)
                    .eq("productId", productId),
            )
            .first();

        const activeOrder = await findActiveOrderForProduct(
            ctx,
            customerId,
            productType,
            productId,
        );

        return {
            hasPurchased: !!purchase,
            hasActiveOrder: Boolean(activeOrder),
            activeOrderId: activeOrder?.order._id ?? null,
            activeOrderStatus: activeOrder?.order.status ?? null,
            activeOrderNumber: activeOrder?.order.orderNumber ?? null,
        };
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

        if (order.status === "cancelled") {
            throw new Error("Cannot mark a cancelled order as paid");
        }

        const items = await createPurchasesForOrder(ctx, order);

        await ctx.db.patch(orderId, {
            status: "activated",
            notes: notes || order.notes,
            updatedAt: Date.now(),
        });

        await sendOrderActivatedEmail(ctx, order, items);

        return { ok: true, status: "activated" } as const;
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

        const items = await createPurchasesForOrder(ctx, order);

        // Update order status
        await ctx.db.patch(orderId, {
            status: "activated",
            updatedAt: Date.now(),
        });

        await sendOrderActivatedEmail(ctx, order, items);

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
