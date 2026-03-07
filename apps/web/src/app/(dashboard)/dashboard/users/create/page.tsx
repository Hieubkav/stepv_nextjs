"use client";

import { useEffect, useState } from "react";
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
  isSystem: boolean;
  isSuperAdmin: boolean;
};

export default function AdminUserCreatePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [pending, setPending] = useState(false);

  const assignableRoles = roles.filter((role) => role.key !== "shop_owner");
  const hasAssignableRole = assignableRoles.length > 0;

  const loadRoles = async () => {
    const response = await fetch("/api/admin/roles");
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload?.error ?? "Không thể tải vai trò");
      return;
    }
    setRoles(payload.roles ?? []);
    const nextAssignable = (payload.roles ?? []).filter((role: Role) => role.key !== "shop_owner");
    if (!roleId && nextAssignable.length) {
      setRoleId(nextAssignable[0]._id);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasAssignableRole) {
      toast.error("Không có vai trò hợp lệ để gán");
      return;
    }
    if (!email.trim() || !name.trim() || !password.trim() || !roleId) {
      toast.error("Vui lòng nhập đủ thông tin");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          password: password.trim(),
          roleId,
          status,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Không thể tạo người dùng");
      }
      toast.success("Đã tạo người dùng");
      router.push("/dashboard/users");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể tạo người dùng");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thêm người dùng quản trị</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Tên đăng nhập</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin.dohy" />
            </div>
            <div className="space-y-2">
              <Label>Họ tên</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={!hasAssignableRole}
              >
                {hasAssignableRole ? (
                  assignableRoles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                      {role.isSuperAdmin ? " (Super)" : ""}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Không có vai trò hợp lệ để gán
                  </option>
                )}
              </select>
              {!hasAssignableRole && (
                <p className="text-xs text-muted-foreground">Không có vai trò hợp lệ để gán.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
              >
                <option value="Active">Đang hoạt động</option>
                <option value="Inactive">Đang khóa</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={pending || !hasAssignableRole}>
                {pending ? "Đang lưu..." : "Tạo người dùng"}
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
