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
  const { canAccessPath, isLoading, user } = useAdminAuth();

  const canAccess = (url?: string) => {
    if (!url) return true;
    if (isLoading || !user) return false;
    return canAccessPath(url);
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
