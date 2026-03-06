import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export const ADMIN_MODULE_KEYS = [
  "dashboard",
  "media",
  "courses",
  "customers",
  "orders",
  "students",
  "post",
  "project",
  "project_category",
  "library",
  "library_software",
  "vfx",
  "notifications",
  "home_blocks",
  "about_blocks",
  "settings",
  "users",
  "roles",
] as const;

export type AdminAction = "read" | "create" | "edit" | "delete";

export function buildFullModulePermissions(): Record<string, AdminAction[]> {
  return Object.fromEntries(
    ADMIN_MODULE_KEYS.map((key) => [key, ["read", "create", "edit", "delete"]])
  ) as Record<string, AdminAction[]>;
}

type AnyCtx = MutationCtx | QueryCtx;

export async function requireAdminPermission(
  ctx: AnyCtx,
  token: string,
  moduleKey: string,
  action: AdminAction
) {
  if (!token) {
    throw new Error("Thiếu token xác thực");
  }

  const session = await ctx.db
    .query("admin_sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Session không hợp lệ");
  }

  const user = await ctx.db.get(session.userId as Doc<"admin_users">["_id"]);
  if (!user || user.status !== "Active") {
    throw new Error("Tài khoản không hợp lệ");
  }

  const role = await ctx.db.get(user.roleId as Doc<"admin_roles">["_id"]);
  if (!role) {
    throw new Error("Vai trò không tồn tại");
  }

  if (role.isSuperAdmin) {
    return { role, user };
  }

  const permissions = role.permissions ?? {};
  if (permissions["*"]?.includes("*") || permissions["*"]?.includes(action)) {
    return { role, user };
  }
  if (permissions[moduleKey]?.includes("*") || permissions[moduleKey]?.includes(action)) {
    return { role, user };
  }

  throw new Error("Không có quyền thực hiện");
}
