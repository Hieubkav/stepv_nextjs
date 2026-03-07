"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Role = {
  _id: string;
  name: string;
  isSuperAdmin: boolean;
};

type AdminUser = {
  _id: string;
  email: string;
  name: string;
  roleId: string;
  roleKey?: string;
  status: "Active" | "Inactive";
};

export default function AdminUserEditPage({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter();
  const { userId } = use(params);
  const [roles, setRoles] = useState<Role[]>([]);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [newPassword, setNewPassword] = useState("");
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

  const loadUser = async () => {
    const response = await fetch(`/api/admin/users/${userId}`);
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload?.error ?? "Không thể tải người dùng");
      return;
    }
    const data = payload.user as AdminUser | null;
    if (!data) {
      toast.error("Không tìm thấy người dùng");
      return;
    }
    setUser(data);
    setEmail(data.email);
    setName(data.name);
    setRoleId(data.roleId);
    setStatus(data.status);
  };

  useEffect(() => {
    void loadRoles();
    void loadUser();
  }, [userId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !name.trim()) {
      toast.error("Vui lòng nhập đủ thông tin");
      return;
    }
    setPending(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          roleId,
          status,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Không thể cập nhật người dùng");
      }
      toast.success("Đã cập nhật người dùng");
      router.push("/dashboard/user");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật người dùng");
    } finally {
      setPending(false);
    }
  };

  const handleChangePassword = async () => {
    if (user?.roleKey === "shop_owner") {
      toast.error("Không thể đổi mật khẩu tài khoản Chủ shop");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }
    try {
      const response = await fetch(`/api/admin/users/${userId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword.trim() }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Không thể đổi mật khẩu");
      }
      toast.success("Đã cập nhật mật khẩu");
      setNewPassword("");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể đổi mật khẩu");
    }
  };

  if (!user) {
    return <div className="p-6 text-sm text-muted-foreground">Đang tải...</div>;
  }

  const isShopOwner = user.roleKey === "shop_owner";

  return (
    <div className="space-y-4 p-4">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Cập nhật người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Họ tên</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                    {role.isSuperAdmin ? " (Super)" : ""}
                  </option>
                ))}
              </select>
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
              <Button type="submit" disabled={pending}>
                {pending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mật khẩu mới"
          />
          {isShopOwner && (
            <p className="text-sm text-muted-foreground">
              Tài khoản Chủ shop không được đổi mật khẩu tại đây.
            </p>
          )}
          <Button
            variant="secondary"
            onClick={handleChangePassword}
            disabled={isShopOwner}
            title={isShopOwner ? "Không thể đổi mật khẩu tài khoản Chủ shop" : "Cập nhật mật khẩu"}
          >
            Cập nhật mật khẩu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
