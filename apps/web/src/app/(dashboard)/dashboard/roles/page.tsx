"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

type Role = {
  _id: string;
  name: string;
  key: string;
  description?: string;
  isSystem: boolean;
  isSuperAdmin: boolean;
  permissions: Record<string, string[]>;
};

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);

  const loadRoles = async () => {
    const response = await fetch("/api/admin/roles");
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload?.error ?? "Không thể tải vai trò");
      return;
    }
    setRoles(payload.roles ?? []);
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const handleDelete = async (role: Role) => {
    if (!window.confirm(`Xóa vai trò "${role.name}"?`)) return;
    try {
      const response = await fetch(`/api/admin/roles/${role._id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Không thể xóa vai trò");
      }
      toast.success("Đã xóa vai trò");
      await loadRoles();
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa vai trò");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            <Link href="/dashboard/users" className="transition-colors hover:text-foreground">
              Người dùng
            </Link>
            <span className="px-1">/</span>
            <span className="text-foreground">Vai trò</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Vai trò quản trị</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard/roles/create">
            <Plus className="mr-2 size-4" />
            Tạo vai trò
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách vai trò</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {roles.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">Chưa có vai trò nào.</div>
          )}
          {roles.length > 0 && (
            <div className="divide-y rounded-md border">
              <div className="flex items-center gap-3 bg-muted/30 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <div className="flex-[1.4]">Tên vai trò</div>
                <div className="flex-1">Mô tả</div>
                <div className="w-28 text-right">Hành động</div>
              </div>
              {roles.map((role) => (
                <div key={role._id} className="flex items-center gap-3 p-3">
                  <div className="flex-[1.4]">
                    <div className="font-medium">{role.name}</div>
                    {role.isSystem && (
                      <span className="text-xs text-muted-foreground">Vai trò hệ thống</span>
                    )}
                  </div>
                  <div className="flex-1 text-sm text-muted-foreground">{role.description ?? "-"}</div>
                  <div className="flex w-28 items-center justify-end gap-1.5">
                    <Button
                      size="icon"
                      variant="outline"
                      title="Sửa"
                      aria-label="Sửa"
                      asChild
                      disabled={role.isSystem && role.key !== "shop_owner"}
                    >
                      <Link href={`/dashboard/roles/${role._id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    {role.key !== "shop_owner" && (
                      <Button
                        size="icon"
                        variant="destructive"
                        title="Xóa"
                        aria-label="Xóa"
                        onClick={() => handleDelete(role)}
                        disabled={role.isSystem}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
