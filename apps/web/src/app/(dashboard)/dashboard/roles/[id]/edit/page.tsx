"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Role = {
  _id: string;
  name: string;
  key: string;
  description?: string;
  isSystem: boolean;
  isSuperAdmin: boolean;
  permissions: Record<string, string[]>;
};

const modules = [
  { key: "dashboard", label: "Tổng quan" },
  { key: "media", label: "Media" },
  { key: "courses", label: "Khóa học" },
  { key: "customers", label: "Khách hàng" },
  { key: "students", label: "Học viên" },
  { key: "orders", label: "Đơn hàng" },
  { key: "post", label: "Bài viết" },
  { key: "project", label: "Dự án" },
  { key: "project_category", label: "Danh mục dự án" },
  { key: "library", label: "Thư viện" },
  { key: "library_software", label: "Phần mềm" },
  { key: "vfx", label: "VFX" },
  { key: "notifications", label: "Thông báo" },
  { key: "home_blocks", label: "Home blocks" },
  { key: "about_blocks", label: "About blocks" },
  { key: "settings", label: "Cài đặt" },
  { key: "users", label: "Người dùng" },
  { key: "roles", label: "Vai trò" },
];

const actions = [
  { key: "read", label: "Xem" },
  { key: "create", label: "Tạo" },
  { key: "edit", label: "Sửa" },
  { key: "delete", label: "Xóa" },
];

const emptyPermissions = () =>
  Object.fromEntries(modules.map((module) => [module.key, [] as string[]]));

export default function AdminRoleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isReadonlyShopOwnerRole, setIsReadonlyShopOwnerRole] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Record<string, string[]>>(emptyPermissions());
  const [pending, setPending] = useState(false);

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

  const currentRole = useMemo(() => roles.find((role) => role._id === id) ?? null, [roles, id]);

  useEffect(() => {
    if (!currentRole) return;
    setIsReadonlyShopOwnerRole(currentRole.key === "shop_owner");
    setName(currentRole.name);
    setDescription(currentRole.description ?? "");
    const next = emptyPermissions();
    Object.entries(currentRole.permissions ?? {}).forEach(([key, values]) => {
      next[key] = [...values];
    });
    setPermissions(next);
  }, [currentRole]);

  const togglePermission = (moduleKey: string, action: string) => {
    setPermissions((prev) => {
      const current = new Set(prev[moduleKey] ?? []);
      if (current.has(action)) {
        current.delete(action);
      } else {
        current.add(action);
      }
      return { ...prev, [moduleKey]: Array.from(current) };
    });
  };

  const isAllModuleActionsSelected = (moduleKey: string) =>
    actions.every((action) => (permissions[moduleKey] ?? []).includes(action.key));

  const toggleAllPermissions = (moduleKey: string) => {
    setPermissions((prev) => {
      const hasAll = actions.every((action) => (prev[moduleKey] ?? []).includes(action.key));
      return {
        ...prev,
        [moduleKey]: hasAll ? [] : actions.map((action) => action.key),
      };
    });
  };

  const hasAnyReadAccess = () =>
    Object.values(permissions).some((moduleActions) => moduleActions.includes("read"));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên vai trò");
      return;
    }
    if (!hasAnyReadAccess()) {
      toast.error("Vai trò phải có ít nhất 1 quyền xem");
      return;
    }
    setPending(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        permissions,
      };
      const response = await fetch(`/api/admin/roles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Không thể cập nhật vai trò");
      }
      toast.success("Đã cập nhật vai trò");
      router.push("/dashboard/roles");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể lưu vai trò");
    } finally {
      setPending(false);
    }
  };

  if (!currentRole) {
    return <div className="p-6 text-sm text-muted-foreground">Đang tải...</div>;
  }

  if (currentRole.isSystem && currentRole.key !== "shop_owner") {
    return (
      <div className="space-y-4 p-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Không thể chỉnh sửa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Vai trò hệ thống không thể chỉnh sửa.
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Cập nhật vai trò</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Tên vai trò</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Biên tập"
                disabled={isReadonlyShopOwnerRole}
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn"
                disabled={isReadonlyShopOwnerRole}
              />
            </div>
            <div className="space-y-2">
              <Label>Phân quyền</Label>
              <div className="space-y-3 rounded-md border p-3">
                {modules.map((module) => (
                  <div key={module.key} className="flex flex-wrap items-center gap-3">
                    <span className="w-40 text-sm font-medium">{module.label}</span>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isAllModuleActionsSelected(module.key)}
                        onChange={() => toggleAllPermissions(module.key)}
                        disabled={isReadonlyShopOwnerRole}
                      />
                      Toàn bộ
                    </label>
                    {actions.map((action) => (
                      <label key={`${module.key}-${action.key}`} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(permissions[module.key] ?? []).includes(action.key)}
                          onChange={() => togglePermission(module.key, action.key)}
                          disabled={isReadonlyShopOwnerRole}
                        />
                        {action.label}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {!isReadonlyShopOwnerRole && (
                <Button type="submit" disabled={pending}>
                  {pending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {isReadonlyShopOwnerRole ? "Đóng" : "Hủy chỉnh sửa"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
