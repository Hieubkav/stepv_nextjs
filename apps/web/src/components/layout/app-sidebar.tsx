"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayout } from "@/context/layout-provider";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { sidebarData } from "./data/sidebar-data";
import { NavGroup } from "./nav-group";
import { Button } from "@/components/ui/button";
import { Eye, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdminAuth } from "@/features/admin/auth/admin-auth-context";

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  const router = useRouter();
  const { hasPermission, isLoading, user } = useAdminAuth();

  const resolveModuleKey = (url: string) => {
    if (url.startsWith("/dashboard/roles")) return "roles";
    if (url.startsWith("/dashboard/users")) return "users";
    if (url.startsWith("/dashboard/library/software")) return "library_software";
    if (url.startsWith("/dashboard/library")) return "library";
    if (url.startsWith("/dashboard/project-category")) return "project_category";
    if (url.startsWith("/dashboard/project")) return "project";
    if (url.startsWith("/dashboard/orders") || url.startsWith("/dashboard/order")) return "orders";
    if (url.startsWith("/dashboard/notifications")) return "notifications";
    if (url.startsWith("/dashboard/students")) return "students";
    if (url.startsWith("/dashboard/customers")) return "customers";
    if (url.startsWith("/dashboard/courses")) return "courses";
    if (url.startsWith("/dashboard/post")) return "post";
    if (url.startsWith("/dashboard/vfx")) return "vfx";
    if (url.startsWith("/dashboard/home-blocks")) return "home_blocks";
    if (url.startsWith("/dashboard/about-blocks")) return "about_blocks";
    if (url.startsWith("/dashboard/settings")) return "settings";
    if (url.startsWith("/dashboard/media")) return "media";
    return "dashboard";
  };

  const canAccess = (url?: string) => {
    if (!url) return true;
    if (isLoading || !user) return true;
    const moduleKey = resolveModuleKey(url);
    return hasPermission(moduleKey, "read");
  };

  const filteredGroups = sidebarData.navGroups
    .map((group) => {
      const items = group.items
        .map((item) => {
          if (item.items) {
            const subItems = item.items.filter((subItem) => canAccess(subItem.url));
            if (subItems.length === 0) return null;
            return { ...item, items: subItems };
          }
          return canAccess(item.url) ? item : null;
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin-login" as any);
  };

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        {/* Icon Xem trang chủ (mo tab moi) */
        }
        <div className="px-2 py-2 flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" size="icon" aria-label="Xem trang chủ">
                <Link href="/" target="_blank" rel="noopener noreferrer">
                  <Eye className="size-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Xem trang chủ</TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {filteredGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleLogout} variant="ghost" size="icon" aria-label="Đăng xuất">
                <LogOut className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Đăng xuất</TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
