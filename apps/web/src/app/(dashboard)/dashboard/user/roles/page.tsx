"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

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

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
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

  const resetForm = () => {
    setEditingRoleId(null);
    setName("");
    setDescription("");
    setPermissions(emptyPermissions());
  };

  const currentRole = useMemo(
    () => roles.find((role) => role._id === editingRoleId) ?? null,
    [roles, editingRoleId]
  );

  const startEdit = (role: Role) => {
    setEditingRoleId(role._id);
    setName(role.name);
    setDescription(role.description ?? "");
    const next = emptyPermissions();
    Object.entries(role.permissions ?? {}).forEach(([key, values]) => {
      next[key] = [...values];
    });
    setPermissions(next);
  };

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
      if (editingRoleId) {
        const response = await fetch(`/api/admin/roles/${editingRoleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? "Không thể cập nhật vai trò");
        }
        toast.success("Đã cập nhật vai trò");
      } else {
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
      }
      resetForm();
      await loadRoles();
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể lưu vai trò");
    } finally {
      setPending(false);
    }
  };

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
      if (editingRoleId === role._id) resetForm();
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa vai trò");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{editingRoleId ? "Cập nhật vai trò" : "Tạo vai trò"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Tên vai trò</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Biên tập" />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn" />
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
                {pending ? "Đang lưu..." : editingRoleId ? "Lưu thay đổi" : "Tạo vai trò"}
              </Button>
              {editingRoleId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Hủy chỉnh sửa
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

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
                      onClick={() => startEdit(role)}
                      disabled={role.isSystem}
                    >
                      <Pencil className="size-4" />
                    </Button>
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
