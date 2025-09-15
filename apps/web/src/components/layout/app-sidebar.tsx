"use client";

import Link from "next/link";
import { useLayout } from "@/context/layout-provider";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { sidebarData } from "./data/sidebar-data";
import { NavGroup } from "./nav-group";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        {/* Icon xem trang chu (mo tab moi) */}
        <div className="px-2 py-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" size="icon" aria-label="Xem trang chu">
                <Link href="/" target="_blank" rel="noopener noreferrer">
                  <Eye className="size-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Xem trang chu</TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>{/* Footer optional */}</SidebarFooter>
    </Sidebar>
  );
}

