import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword, verifyPassword } from "./lib/password";
import { buildFullModulePermissions } from "./lib/adminPermissions";

const SESSION_TTL_HOURS = Number(process.env.ADMIN_SESSION_TTL_HOURS ?? 8);

type BootstrapResult = {
  message: string;
  success: boolean;
};

async function resolveRole(
  ctx: MutationCtx,
  key: string,
  name: string,
  isSuperAdmin: boolean,
  permissions: Record<string, string[]>
) {
  const existing = await ctx.db
    .query("admin_roles")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      name,
      isSuperAdmin,
      permissions,
      updatedAt: Date.now(),
    });
    return existing._id;
  }

  return await ctx.db.insert("admin_roles", {
    key,
    name,
    description: isSuperAdmin ? "Quản trị viên cao nhất" : "Chủ shop",
    isSystem: true,
    isSuperAdmin,
    permissions,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

async function upsertAdminUser(
  ctx: MutationCtx,
  payload: { email: string; name: string; password: string; roleId: string }
) {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const existing = await ctx.db
    .query("admin_users")
    .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
    .unique();

  const passwordHash = hashPassword(payload.password.trim());
  if (existing) {
    await ctx.db.patch(existing._id, {
      email: normalizedEmail,
      name: payload.name.trim() || existing.name,
      passwordHash,
      roleId: payload.roleId as any,
      status: "Active",
      updatedAt: Date.now(),
    });
    return existing._id;
  }

  return await ctx.db.insert("admin_users", {
    email: normalizedEmail,
    name: payload.name.trim() || normalizedEmail,
    passwordHash,
    roleId: payload.roleId as any,
    status: "Active",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export const ensureBootstrapAdminsFromEnv = mutation({
  args: {},
  handler: async (ctx): Promise<BootstrapResult> => {
    const superEmail = process.env.ADMIN_SUPER_EMAIL;
    const superPassword = process.env.ADMIN_SUPER_PASSWORD;
    const superName = process.env.ADMIN_SUPER_NAME ?? "Super Admin";
    const ownerEmail = process.env.ADMIN_OWNER_EMAIL;
    const ownerPassword = process.env.ADMIN_OWNER_PASSWORD;
    const ownerName = process.env.ADMIN_OWNER_NAME ?? "Chủ shop";

    if (!superEmail || !superPassword || !ownerEmail || !ownerPassword) {
      return { message: "Thiếu cấu hình tài khoản admin trong env", success: false };
    }

    const superRoleId = await resolveRole(
      ctx,
      "super_admin",
      "Super Admin",
      true,
      { "*": ["*"] }
    );

    const ownerRoleId = await resolveRole(
      ctx,
      "shop_owner",
      "Chủ Shop",
      false,
      buildFullModulePermissions()
    );

    await upsertAdminUser(ctx, {
      email: superEmail,
      name: superName,
      password: superPassword,
      roleId: superRoleId,
    });

    await upsertAdminUser(ctx, {
      email: ownerEmail,
      name: ownerName,
      password: ownerPassword,
      roleId: ownerRoleId,
    });

    return { message: "Đã đồng bộ tài khoản admin từ env", success: true };
  },
});

export const loginWithPassword = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (!user || user.status !== "Active") {
      return { message: "Email hoặc mật khẩu không đúng", success: false };
    }

    const isValid = verifyPassword(args.password, user.passwordHash);
    if (!isValid) {
      return { message: "Email hoặc mật khẩu không đúng", success: false };
    }

    const role = await ctx.db.get(user.roleId);
    if (!role) {
      return { message: "Vai trò không tồn tại", success: false };
    }

    const token = `adm_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const ttlHours = Number.isFinite(SESSION_TTL_HOURS) && SESSION_TTL_HOURS > 0
      ? SESSION_TTL_HOURS
      : 8;

    await ctx.db.insert("admin_sessions", {
      token,
      userId: user._id,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlHours * 60 * 60 * 1000,
    });

    await ctx.db.patch(user._id, { lastLogin: Date.now() });

    return {
      message: "Đăng nhập thành công",
      success: true,
      token,
      user: {
        email: user.email,
        id: user._id,
        isSuperAdmin: role.isSuperAdmin,
        name: user.name,
        permissions: role.permissions ?? {},
        roleId: user.roleId,
      },
    };
  },
  returns: v.object({
    message: v.string(),
    success: v.boolean(),
    token: v.optional(v.string()),
    user: v.optional(v.object({
      email: v.string(),
      id: v.id("admin_users"),
      isSuperAdmin: v.boolean(),
      name: v.string(),
      permissions: v.record(v.string(), v.array(v.string())),
      roleId: v.id("admin_roles"),
    })),
  }),
});

export const verifySession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session) {
      return { message: "Session không tồn tại", valid: false };
    }

    if (session.expiresAt < Date.now()) {
      return { message: "Session đã hết hạn", valid: false };
    }

    const user = await ctx.db.get(session.userId);
    if (!user || user.status !== "Active") {
      return { message: "Tài khoản không hợp lệ", valid: false };
    }

    const role = await ctx.db.get(user.roleId);
    if (!role) {
      return { message: "Vai trò không tồn tại", valid: false };
    }

    return {
      message: "Session hợp lệ",
      valid: true,
      user: {
        email: user.email,
        id: user._id,
        isSuperAdmin: role.isSuperAdmin,
        name: user.name,
        permissions: role.permissions ?? {},
        roleId: user.roleId,
      },
    };
  },
  returns: v.object({
    message: v.string(),
    valid: v.boolean(),
    user: v.optional(v.object({
      email: v.string(),
      id: v.id("admin_users"),
      isSuperAdmin: v.boolean(),
      name: v.string(),
      permissions: v.record(v.string(), v.array(v.string())),
      roleId: v.id("admin_roles"),
    })),
  }),
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
    return null;
  },
  returns: v.null(),
});
