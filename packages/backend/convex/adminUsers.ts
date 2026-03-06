import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword } from "./lib/password";
import { requireAdminPermission } from "./lib/adminPermissions";

const userDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("admin_users"),
  email: v.string(),
  lastLogin: v.optional(v.number()),
  name: v.string(),
  roleId: v.id("admin_roles"),
  status: v.union(v.literal("Active"), v.literal("Inactive")),
  createdAt: v.number(),
  updatedAt: v.number(),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function assertCanModifySuperAdmin(
  ctx: MutationCtx,
  actorIsSuper: boolean,
  targetRoleId: Id<"admin_roles">
) {
  const role = await ctx.db.get(targetRoleId);
  if (role?.isSuperAdmin && !actorIsSuper) {
    throw new Error("Không thể sửa/xóa tài khoản Super Admin");
  }
}

export const list = query({
  args: {
    token: v.string(),
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("Active"), v.literal("Inactive"))),
  },
  handler: async (ctx, args) => {
    await requireAdminPermission(ctx, args.token, "users", "read");
    const roles = await ctx.db.query("admin_roles").collect();
    const roleMap = new Map(roles.map((role) => [role._id, role]));

    let users = await ctx.db.query("admin_users").take(500);
    if (args.status) {
      users = users.filter((user) => user.status === args.status);
    }
    if (args.search?.trim()) {
      const keyword = args.search.trim().toLowerCase();
      users = users.filter((user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      );
    }
    const sorted = users.sort((a, b) => b.createdAt - a.createdAt);
    return sorted.map((user) => ({
      ...user,
      roleName: roleMap.get(user.roleId)?.name,
      isSuperAdmin: roleMap.get(user.roleId)?.isSuperAdmin ?? false,
    }));
  },
  returns: v.array(v.object({
    _creationTime: v.number(),
    _id: v.id("admin_users"),
    email: v.string(),
    lastLogin: v.optional(v.number()),
    name: v.string(),
    roleId: v.id("admin_roles"),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    createdAt: v.number(),
    updatedAt: v.number(),
    isSuperAdmin: v.boolean(),
    roleName: v.optional(v.string()),
  })),
});

export const getById = query({
  args: { id: v.id("admin_users"), token: v.string() },
  handler: async (ctx, args) => {
    await requireAdminPermission(ctx, args.token, "users", "read");
    return await ctx.db.get(args.id);
  },
  returns: v.union(userDoc, v.null()),
});

export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    roleId: v.id("admin_roles"),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { role } = await requireAdminPermission(ctx, args.token, "users", "create");
    await assertCanModifySuperAdmin(ctx, Boolean(role?.isSuperAdmin), args.roleId as any);
    const email = normalizeEmail(args.email);
    const existing = await ctx.db
      .query("admin_users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      throw new Error("Email đã tồn tại");
    }
    const now = Date.now();
    const passwordHash = await hashPassword(args.password.trim());
    return await ctx.db.insert("admin_users", {
      email,
      name: args.name.trim(),
      passwordHash,
      roleId: args.roleId,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });
  },
  returns: v.id("admin_users"),
});

export const update = mutation({
  args: {
    email: v.optional(v.string()),
    id: v.id("admin_users"),
    name: v.optional(v.string()),
    roleId: v.optional(v.id("admin_roles")),
    status: v.optional(v.union(v.literal("Active"), v.literal("Inactive"))),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { role: actorRole } = await requireAdminPermission(ctx, args.token, "users", "edit");
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }
    await assertCanModifySuperAdmin(ctx, Boolean(actorRole?.isSuperAdmin), user.roleId as any);
    if (args.roleId) {
      await assertCanModifySuperAdmin(ctx, Boolean(actorRole?.isSuperAdmin), args.roleId as any);
    }
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      updates.name = args.name.trim();
    }
    if (args.email !== undefined) {
      const email = normalizeEmail(args.email);
      if (email !== user.email) {
        const existing = await ctx.db
          .query("admin_users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .unique();
        if (existing) {
          throw new Error("Email đã tồn tại");
        }
      }
      updates.email = email;
    }
    if (args.roleId !== undefined) {
      updates.roleId = args.roleId;
    }
    if (args.status !== undefined) {
      updates.status = args.status;
    }
    await ctx.db.patch(args.id, updates);
    return null;
  },
  returns: v.null(),
});

export const changePassword = mutation({
  args: { id: v.id("admin_users"), password: v.string(), token: v.string() },
  handler: async (ctx, args) => {
    const { role: actorRole } = await requireAdminPermission(ctx, args.token, "users", "edit");
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }
    await assertCanModifySuperAdmin(ctx, Boolean(actorRole?.isSuperAdmin), user.roleId as any);
    const passwordHash = await hashPassword(args.password.trim());
    await ctx.db.patch(args.id, { passwordHash, updatedAt: Date.now() });
    return null;
  },
  returns: v.null(),
});

export const remove = mutation({
  args: { id: v.id("admin_users"), token: v.string() },
  handler: async (ctx, args) => {
    const { role: actorRole } = await requireAdminPermission(ctx, args.token, "users", "delete");
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }
    await assertCanModifySuperAdmin(ctx, Boolean(actorRole?.isSuperAdmin), user.roleId as any);
    const role = await ctx.db.get(user.roleId);
    if (role?.isSuperAdmin) {
      const superAdmins = await ctx.db
        .query("admin_roles")
        .withIndex("by_key", (q) => q.eq("key", "super_admin"))
        .unique();
      if (superAdmins) {
        const count = await ctx.db
          .query("admin_users")
          .withIndex("by_role_status", (q) => q.eq("roleId", superAdmins._id))
          .collect();
        if (count.length <= 1) {
          throw new Error("Phải giữ tối thiểu 1 Super Admin");
        }
      }
    }
    await ctx.db.delete(args.id);
    return null;
  },
  returns: v.null(),
});
