import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminPermission } from "./lib/adminPermissions";

const roleDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("admin_roles"),
  description: v.optional(v.string()),
  isSuperAdmin: v.boolean(),
  isSystem: v.boolean(),
  key: v.string(),
  name: v.string(),
  permissions: v.record(v.string(), v.array(v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
});

function toKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

export const listAll = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminPermission(ctx, args.token, "roles", "read");
    const roles = await ctx.db.query("admin_roles").collect();
    return roles.sort((a, b) => a.name.localeCompare(b.name));
  },
  returns: v.array(roleDoc),
});

export const create = mutation({
  args: {
    description: v.optional(v.string()),
    key: v.optional(v.string()),
    name: v.string(),
    permissions: v.record(v.string(), v.array(v.string())),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminPermission(ctx, args.token, "roles", "create");
    const key = toKey(args.key ?? args.name);
    if (!key) {
      throw new Error("Thiếu key vai trò");
    }
    const existingByKey = await ctx.db
      .query("admin_roles")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (existingByKey) {
      throw new Error("Key vai trò đã tồn tại");
    }
    const existingByName = await ctx.db
      .query("admin_roles")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (existingByName) {
      throw new Error("Tên vai trò đã tồn tại");
    }

    const now = Date.now();
    return await ctx.db.insert("admin_roles", {
      key,
      name: args.name.trim(),
      description: args.description?.trim(),
      isSystem: false,
      isSuperAdmin: false,
      permissions: args.permissions,
      createdAt: now,
      updatedAt: now,
    });
  },
  returns: v.id("admin_roles"),
});

export const update = mutation({
  args: {
    description: v.optional(v.string()),
    id: v.id("admin_roles"),
    name: v.optional(v.string()),
    permissions: v.optional(v.record(v.string(), v.array(v.string()))),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminPermission(ctx, args.token, "roles", "edit");
    const role = await ctx.db.get(args.id);
    if (!role) {
      throw new Error("Không tìm thấy vai trò");
    }
    if (role.key === "shop_owner") {
      throw new Error("Không thể chỉnh sửa vai trò Chủ shop");
    }
    if (role.isSystem) {
      throw new Error("Không thể chỉnh sửa vai trò hệ thống");
    }
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name && args.name.trim() !== role.name) {
      const exists = await ctx.db
        .query("admin_roles")
        .withIndex("by_name", (q) => q.eq("name", args.name!.trim()))
        .unique();
      if (exists) {
        throw new Error("Tên vai trò đã tồn tại");
      }
      updates.name = args.name.trim();
    }
    if (args.description !== undefined) {
      updates.description = args.description?.trim();
    }
    if (args.permissions) {
      updates.permissions = args.permissions;
    }
    await ctx.db.patch(args.id, updates);
    return null;
  },
  returns: v.null(),
});

export const remove = mutation({
  args: { id: v.id("admin_roles"), token: v.string() },
  handler: async (ctx, args) => {
    await requireAdminPermission(ctx, args.token, "roles", "delete");
    const role = await ctx.db.get(args.id);
    if (!role) {
      throw new Error("Không tìm thấy vai trò");
    }
    if (role.key === "shop_owner") {
      throw new Error("Không thể xóa vai trò Chủ shop");
    }
    if (role.isSystem) {
      throw new Error("Không thể xóa vai trò hệ thống");
    }
    const users = await ctx.db
      .query("admin_users")
      .withIndex("by_role_status", (q) => q.eq("roleId", args.id))
      .collect();
    if (users.length > 0) {
      throw new Error("Vai trò đang được gán cho người dùng");
    }
    await ctx.db.delete(args.id);
    return null;
  },
  returns: v.null(),
});
