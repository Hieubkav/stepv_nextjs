"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

export default function AdminRoleCreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Record<string, string[]>>(emptyPermissions());
  const [pending, setPending] = useState(false);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên vai trò");
      return;
    }
    setPending(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        permissions,
      };
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Không thể tạo vai trò");
      }
      toast.success("Đã tạo vai trò");
      router.push("/dashboard/roles");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể lưu vai trò");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Tạo vai trò</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Tên vai trò</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Biên tập" />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn"
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
                      />
                      Toàn bộ
                    </label>
                    {actions.map((action) => (
                      <label key={`${module.key}-${action.key}`} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(permissions[module.key] ?? []).includes(action.key)}
                          onChange={() => togglePermission(module.key, action.key)}
                        />
                        {action.label}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Đang lưu..." : "Tạo vai trò"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
