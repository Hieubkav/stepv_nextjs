// Unified customer management for all product types (courses, resources, vfx)
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";

type AnyCtx = MutationCtx | QueryCtx;
type CustomerId = Id<"customers">;

type CustomerDoc = {
    _id: CustomerId;
    account: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    resetToken?: string;
    resetTokenExpiry?: number;
    rememberToken?: string;
    rememberTokenExpiry?: number;
    order: number;
    notes?: string;
    active: boolean;
    createdAt: number;
    updatedAt: number;
};

type PublicCustomer = {
    _id: CustomerId;
    account: string;
    email: string;
    fullName: string;
    phone?: string;
    notes?: string;
    order: number;
    active: boolean;
    createdAt: number;
    updatedAt: number;
};

const toPublicCustomer = (customer: CustomerDoc): PublicCustomer => ({
    _id: customer._id,
    account: customer.account,
    email: customer.email,
    fullName: customer.fullName,
    phone: customer.phone ?? undefined,
    notes: customer.notes ?? undefined,
    order: customer.order,
    active: customer.active,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
});



const requireUniqueAccount = async (
    ctx: AnyCtx,
    account: string,
    excludeId?: CustomerId,
) => {
    const existing = await ctx.db
        .query("customers")
        .withIndex("by_account", (q) => q.eq("account", account))
        .first();
    if (existing && (!excludeId || existing._id !== excludeId)) {
        throw new ConvexError("Tài khoản đã tồn tại");
    }
};

const requireUniqueEmail = async (
    ctx: AnyCtx,
    email: string,
    excludeId?: CustomerId,
) => {
    const existing = await ctx.db
        .query("customers")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
    if (existing && (!excludeId || existing._id !== excludeId)) {
        throw new ConvexError("Email đã tồn tại");
    }
};

const generateToken = (): string => {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
};

// List customers with optional filtering
export const listCustomers = query({
    args: {
        activeOnly: v.optional(v.boolean()),
        customerType: v.optional(v.string()),
        search: v.optional(v.string()),
    },
    handler: async (ctx, { activeOnly = false, customerType, search }) => {
        let customers = await ctx.db.query("customers").collect();
        
        if (activeOnly) {
            customers = customers.filter((item) => item.active);
        }
        
        if (search && search.trim().length > 0) {
            const keyword = search.trim().toLowerCase();
            customers = customers.filter((item) => {
                const values = [
                    item.account,
                    item.fullName,
                    item.email,
                    item.phone ?? "",
                ];
                return values.some((value) => value.toLowerCase().includes(keyword));
            });
        }
        
        customers.sort((a, b) => a.order - b.order);
        return customers;
    },
});

// Get single customer
export const getCustomer = query({
    args: { id: v.id("customers") },
    handler: async (ctx, { id }) => {
        return (await ctx.db.get(id)) ?? null;
    },
});

// Get customer profile (public version)
export const getCustomerProfile = query({
    args: { id: v.id("customers") },
    handler: async (ctx, { id }) => {
        const customer = await ctx.db.get(id);
        if (!customer) return null;
        return toPublicCustomer(customer as CustomerDoc);
    },
});

// Authenticate customer (login)
export const authenticateCustomer = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, { email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();
        if (!normalizedEmail || !normalizedPassword) {
            return null;
        }

        const customer = await ctx.db
            .query("customers")
            .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
            .first();

        if (!customer) return null;

        const doc = customer as CustomerDoc;
        if (!doc.active) return null;
        if (doc.password !== normalizedPassword) return null;

        return toPublicCustomer(doc);
    },
});

// Create new customer
export const createCustomer = mutation({
    args: {
        account: v.string(),
        email: v.string(),
        password: v.string(),
        fullName: v.string(),
        phone: v.optional(v.string()),
        notes: v.optional(v.string()),
        order: v.number(),
        active: v.boolean(),
    },
    returns: v.object({
        ok: v.boolean(),
        error: v.optional(v.string()),
        customer: v.optional(
            v.object({
                _id: v.id("customers"),
                account: v.string(),
                email: v.string(),
                fullName: v.string(),
                phone: v.optional(v.string()),
                notes: v.optional(v.string()),
                order: v.number(),
                active: v.boolean(),
                createdAt: v.number(),
                updatedAt: v.number(),
            })
        ),
    }),
    handler: async (ctx, args) => {
        const account = args.account.trim();
        if (!account) return { ok: false, error: "Yêu cầu nhập tài khoản" };

        const email = args.email.trim().toLowerCase();
        if (!email) return { ok: false, error: "Yêu cầu nhập email" };

        const password = args.password.trim();
        if (!password) return { ok: false, error: "Yêu cầu nhập mật khẩu" };

        const fullName = args.fullName.trim();
        if (!fullName) return { ok: false, error: "Yêu cầu nhập họ tên" };

        const now = Date.now();

        try {
            await requireUniqueAccount(ctx, account);
            await requireUniqueEmail(ctx, email);
        } catch (err) {
            if (err instanceof ConvexError) {
                return { ok: false, error: err.message };
            }
            throw err;
        }

        const id = await ctx.db.insert("customers", {
            account,
            email,
            password,
            fullName,
            phone: args.phone?.trim() || undefined,
            notes: args.notes?.trim() || undefined,
            order: args.order,
            active: args.active,
            createdAt: now,
            updatedAt: now,
        });

        const doc = (await ctx.db.get(id)) as CustomerDoc;
        return { ok: true, customer: toPublicCustomer(doc) };
    },
});

// Update customer
export const updateCustomer = mutation({
    args: {
        id: v.id("customers"),
        account: v.optional(v.string()),
        email: v.optional(v.string()),
        password: v.optional(v.string()),
        fullName: v.optional(v.string()),
        phone: v.optional(v.union(v.string(), v.null())),
        notes: v.optional(v.union(v.string(), v.null())),
        order: v.optional(v.number()),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, account, email, password, ...rest } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new ConvexError("Không tìm thấy khách hàng");

        const patch: Record<string, unknown> = { ...rest };

        if (account !== undefined) {
            const trimmed = account.trim();
            if (!trimmed) throw new ConvexError("Yêu cầu nhập tài khoản");
            if (trimmed !== (existing as CustomerDoc).account) {
                await requireUniqueAccount(ctx, trimmed, id);
            }
            patch.account = trimmed;
        }

        if (email !== undefined) {
            const trimmedEmail = email.trim().toLowerCase();
            if (!trimmedEmail) throw new ConvexError("Yêu cầu nhập email");
            if (trimmedEmail !== (existing as CustomerDoc).email) {
                await requireUniqueEmail(ctx, trimmedEmail, id);
            }
            patch.email = trimmedEmail;
        }

        if (password !== undefined) {
            const trimmedPassword = password.trim();
            if (!trimmedPassword) throw new ConvexError("Yêu cầu nhập mật khẩu");
            patch.password = trimmedPassword;
        }

        if (rest.fullName !== undefined) {
            patch.fullName = rest.fullName.trim();
        }

        if (rest.phone !== undefined) {
            patch.phone = rest.phone ? rest.phone.trim() : undefined;
        }

        if (rest.notes !== undefined) {
            patch.notes = rest.notes ? rest.notes.trim() : undefined;
        }

        patch.updatedAt = Date.now();

        await ctx.db.patch(id, patch as any);
        return await ctx.db.get(id);
    },
});

// Set customer active/inactive
export const setCustomerActive = mutation({
    args: { id: v.id("customers"), active: v.boolean() },
    handler: async (ctx, { id, active }) => {
        await ctx.db.patch(id, { active, updatedAt: Date.now() });
        return { ok: true } as const;
    },
});

// Password reset: Request reset token
export const requestPasswordReset = mutation({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const customer = await ctx.db
            .query("customers")
            .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
            .first();

        if (!customer) {
            return { ok: false, error: "Email not found" } as const;
        }

        const customerDoc = customer as CustomerDoc;
        const resetToken = generateToken();
        const resetTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        await ctx.db.patch(customer._id, {
            resetToken,
            resetTokenExpiry,
            updatedAt: Date.now(),
        });

        return { ok: true, resetToken, customerEmail: normalizedEmail } as const;
    },
});

// Verify reset token
export const verifyResetToken = query({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
        const customer = await ctx.db
            .query("customers")
            .collect()
            .then((customers) => {
                const doc = customers.find(
                    (c) => (c as CustomerDoc).resetToken === token
                ) as CustomerDoc | undefined;
                return doc || null;
            });

        if (!customer) return null;
        if (!customer.resetTokenExpiry || customer.resetTokenExpiry < Date.now()) {
            return null;
        }

        return { customerId: customer._id, email: customer.email };
    },
});

// Reset password with token
export const resetPassword = mutation({
    args: { token: v.string(), newPassword: v.string() },
    handler: async (ctx, { token, newPassword }) => {
        const normalizedPassword = newPassword.trim();
        if (!normalizedPassword) throw new ConvexError("Password is required");

        const customer = await ctx.db
            .query("customers")
            .collect()
            .then((customers) => {
                const doc = customers.find(
                    (c) => (c as CustomerDoc).resetToken === token
                ) as CustomerDoc | undefined;
                return doc || null;
            });

        if (!customer) return { ok: false, error: "Invalid token" } as const;
        if (!customer.resetTokenExpiry || customer.resetTokenExpiry < Date.now()) {
            return { ok: false, error: "Token expired" } as const;
        }

        await ctx.db.patch(customer._id, {
            password: normalizedPassword,
            resetToken: undefined,
            resetTokenExpiry: undefined,
            updatedAt: Date.now(),
        });

        return { ok: true } as const;
    },
});

// Verify remember token (auto-login)
export const verifyRememberToken = query({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
        const customer = await ctx.db
            .query("customers")
            .collect()
            .then((customers) => {
                const doc = customers.find(
                    (c) => (c as CustomerDoc).rememberToken === token
                ) as CustomerDoc | undefined;
                return doc || null;
            });

        if (!customer) return null;
        if (!customer.rememberTokenExpiry || customer.rememberTokenExpiry < Date.now()) {
            return null;
        }

        return toPublicCustomer(customer);
    },
});

// Update remember token (login with remember me)
export const updateRememberToken = mutation({
    args: { customerId: v.id("customers"), shouldRemember: v.boolean() },
    handler: async (ctx, { customerId, shouldRemember }) => {
        const customer = await ctx.db.get(customerId);
        if (!customer) throw new ConvexError("Customer not found");

        if (shouldRemember) {
            const rememberToken = generateToken();
            const rememberTokenExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

            await ctx.db.patch(customerId, {
                rememberToken,
                rememberTokenExpiry,
                updatedAt: Date.now(),
            });

            return { ok: true, rememberToken } as const;
        } else {
            await ctx.db.patch(customerId, {
                rememberToken: undefined,
                rememberTokenExpiry: undefined,
                updatedAt: Date.now(),
            });
            return { ok: true } as const;
        }
    },
});

// Change password with verification
export const changePassword = mutation({
    args: {
        customerId: v.id("customers"),
        currentPassword: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, { customerId, currentPassword, newPassword }) => {
        const customer = await ctx.db.get(customerId);
        if (!customer) {
            return { ok: false, error: "Customer not found" } as const;
        }

        const customerDoc = customer as CustomerDoc;
        if (customerDoc.password !== currentPassword.trim()) {
            return { ok: false, error: "Current password is incorrect" } as const;
        }

        const trimmedNewPassword = newPassword.trim();
        if (!trimmedNewPassword) {
            return { ok: false, error: "New password cannot be empty" } as const;
        }

        if (trimmedNewPassword === customerDoc.password) {
            return { ok: false, error: "New password must be different" } as const;
        }

        await ctx.db.patch(customerId, {
            password: trimmedNewPassword,
            updatedAt: Date.now(),
        });

        return { ok: true } as const;
    },
});

// Delete customer (MVP: hard delete)
export const deleteCustomer = mutation({
    args: { id: v.id("customers") },
    handler: async (ctx, { id }) => {
        const existing = await ctx.db.get(id);
        if (!existing) return { ok: false } as const;

        await ctx.db.delete(id);
        return { ok: true } as const;
    },
});
