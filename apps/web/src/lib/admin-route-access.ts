export type AdminPermissionUser = {
  isSuperAdmin: boolean;
  permissions: Record<string, string[]>;
};

const PATH_MODULE_RULES: Array<{ prefix: string; moduleKey: string }> = [
  { prefix: "/dashboard/library/software", moduleKey: "library_software" },
  { prefix: "/dashboard/library", moduleKey: "library" },
  { prefix: "/dashboard/project-category", moduleKey: "project_category" },
  { prefix: "/dashboard/project", moduleKey: "project" },
  { prefix: "/dashboard/orders", moduleKey: "orders" },
  { prefix: "/dashboard/order", moduleKey: "orders" },
  { prefix: "/dashboard/notifications", moduleKey: "notifications" },
  { prefix: "/dashboard/students", moduleKey: "students" },
  { prefix: "/dashboard/customers", moduleKey: "customers" },
  { prefix: "/dashboard/courses", moduleKey: "courses" },
  { prefix: "/dashboard/post", moduleKey: "post" },
  { prefix: "/dashboard/vfx", moduleKey: "vfx" },
  { prefix: "/dashboard/home-blocks", moduleKey: "home_blocks" },
  { prefix: "/dashboard/about-blocks", moduleKey: "about_blocks" },
  { prefix: "/dashboard/settings", moduleKey: "settings" },
  { prefix: "/dashboard/media", moduleKey: "media" },
  { prefix: "/dashboard/users", moduleKey: "users" },
  { prefix: "/dashboard/roles", moduleKey: "roles" },
  { prefix: "/dashboard", moduleKey: "dashboard" },
];

const DASHBOARD_PATHS_IN_ORDER: Array<{ path: string; moduleKey: string }> = [
  { path: "/dashboard", moduleKey: "dashboard" },
  { path: "/dashboard/media", moduleKey: "media" },
  { path: "/dashboard/courses", moduleKey: "courses" },
  { path: "/dashboard/customers", moduleKey: "customers" },
  { path: "/dashboard/users", moduleKey: "users" },
  { path: "/dashboard/roles", moduleKey: "roles" },
  { path: "/dashboard/orders", moduleKey: "orders" },
  { path: "/dashboard/post", moduleKey: "post" },
  { path: "/dashboard/project", moduleKey: "project" },
  { path: "/dashboard/project-category", moduleKey: "project_category" },
  { path: "/dashboard/library", moduleKey: "library" },
  { path: "/dashboard/library/software", moduleKey: "library_software" },
  { path: "/dashboard/vfx", moduleKey: "vfx" },
  { path: "/dashboard/home-blocks", moduleKey: "home_blocks" },
  { path: "/dashboard/about-blocks", moduleKey: "about_blocks" },
  { path: "/dashboard/settings", moduleKey: "settings" },
];

export function resolveModuleKeyFromPath(pathname: string) {
  const matched = PATH_MODULE_RULES.find((rule) => pathname.startsWith(rule.prefix));
  return matched?.moduleKey ?? "dashboard";
}

export function hasPermission(
  user: AdminPermissionUser | null | undefined,
  moduleKey: string,
  action: string
) {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  const permissions = user.permissions ?? {};
  if (permissions["*"]?.includes("*") || permissions["*"]?.includes(action)) return true;
  if (permissions[moduleKey]?.includes("*") || permissions[moduleKey]?.includes(action)) return true;
  return false;
}

export function canAccessPath(user: AdminPermissionUser | null | undefined, pathname: string) {
  const moduleKey = resolveModuleKeyFromPath(pathname);
  return hasPermission(user, moduleKey, "read");
}

export function hasAnyReadPermission(user: AdminPermissionUser | null | undefined) {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  const permissions = user.permissions ?? {};
  if (permissions["*"]?.includes("*") || permissions["*"]?.includes("read")) return true;
  return Object.values(permissions).some((actions) => actions.includes("read") || actions.includes("*"));
}

export function getFirstAccessibleDashboardPath(user: AdminPermissionUser | null | undefined) {
  if (!user) return null;
  if (user.isSuperAdmin) return "/dashboard";
  for (const entry of DASHBOARD_PATHS_IN_ORDER) {
    if (hasPermission(user, entry.moduleKey, "read")) {
      return entry.path;
    }
  }
  return null;
}
