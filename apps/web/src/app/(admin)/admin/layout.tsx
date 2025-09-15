"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideListTodo, PanelsTopLeft, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useEffect, useState } from "react";

const nav = [
  { href: "/admin/todos", label: "Công việc", icon: LucideListTodo },
] as const;

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [collapsed, setCollapsed] = useState(false);
  // Lưu trạng thái sidebar vào localStorage cho tiện dụng
  useEffect(() => {
    const raw = localStorage.getItem("admin.sidebar.collapsed");
    if (raw) setCollapsed(raw === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("admin.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className="flex min-h-svh">
      <aside
        className={cn(
          "border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="h-14 flex items-center justify-between gap-2 px-3 border-b">
          <div className="flex items-center gap-2 overflow-hidden">
            <PanelsTopLeft className="size-5 shrink-0" />
            <span className={cn("font-semibold", collapsed && "hidden")}>Bảng điều khiển</span>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </button>
        </div>
        <nav className="px-2 py-3 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              <span className={cn(collapsed && "hidden")}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
