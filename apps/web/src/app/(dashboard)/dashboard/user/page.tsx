"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Plus, Trash2 } from "lucide-react";

type AdminUser = {
  _id: string;
  email: string;
  name: string;
  status: "Active" | "Inactive";
  roleName?: string;
  roleKey?: string;
  isSuperAdmin: boolean;
  lastLogin?: number;
  createdAt: number;
};

type SortColumn = "name" | "email" | "role" | "createdAt" | null;
type SortDirection = "asc" | "desc";
type FilterStatus = "all" | "Active" | "Inactive";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filterStatus !== "all") params.set("status", filterStatus);
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Không thể tải danh sách");
      }
      setUsers(payload.users ?? []);
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, [search, filterStatus]);

  const items = useMemo(() => {
    const list = [...users];
    if (sortColumn) {
      list.sort((a, b) => {
        let aVal: string | number = "";
        let bVal: string | number = "";
        switch (sortColumn) {
          case "name":
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case "email":
            aVal = a.email.toLowerCase();
            bVal = b.email.toLowerCase();
            break;
          case "role":
            aVal = (a.roleName ?? "").toLowerCase();
            bVal = (b.roleName ?? "").toLowerCase();
            break;
          case "createdAt":
            aVal = a.createdAt;
            bVal = b.createdAt;
            break;
          default:
            return 0;
        }
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [users, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 inline size-3.5" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 inline size-3.5" />
    ) : (
      <ArrowDown className="ml-1 inline size-3.5" />
    );
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("vi-VN");
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const nextStatus = user.status === "Active" ? "Inactive" : "Active";
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Không thể cập nhật trạng thái");
      }
      toast.success(nextStatus === "Active" ? "Đã mở tài khoản" : "Đã khóa tài khoản");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (user.roleKey === "shop_owner") {
      toast.error("Không thể xóa tài khoản Chủ shop");
      return;
    }
    if (!window.confirm(`Xóa người dùng "${user.name}"?`)) return;
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Không thể xóa người dùng");
      }
      toast.success("Đã xóa người dùng");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa người dùng");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Người dùng quản trị</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tài khoản admin và phân quyền theo vai trò.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Input
            placeholder="Tìm theo tên, email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:w-72"
          />
          <Button asChild>
            <Link href="/dashboard/user/new">
              <Plus className="mr-2 size-4" />
              Thêm người dùng
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("all")}
        >
          Tất cả
        </Button>
        <Button
          variant={filterStatus === "Active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("Active")}
        >
          Đang hoạt động
        </Button>
        <Button
          variant={filterStatus === "Inactive" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("Inactive")}
        >
          Đang khóa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <div className="p-6 text-sm text-muted-foreground">Đang tải...</div>}
          {!loading && items.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">Chưa có người dùng nào.</div>
          )}
          {!loading && items.length > 0 && (
            <div className="divide-y rounded-md border">
              <div className="flex items-center gap-3 bg-muted/30 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <button
                  onClick={() => handleSort("name")}
                  className="flex-[1.2] text-left transition-colors hover:text-foreground"
                >
                  Họ tên
                  <SortIcon column="name" />
                </button>
                <button
                  onClick={() => handleSort("email")}
                  className="flex-[1.3] text-left transition-colors hover:text-foreground"
                >
                  Email
                  <SortIcon column="email" />
                </button>
                <button
                  onClick={() => handleSort("role")}
                  className="flex-1 text-left transition-colors hover:text-foreground"
                >
                  Vai trò
                  <SortIcon column="role" />
                </button>
                <button
                  onClick={() => handleSort("createdAt")}
                  className="w-40 text-left transition-colors hover:text-foreground"
                >
                  Tạo & đăng nhập
                  <SortIcon column="createdAt" />
                </button>
                <div className="w-28 text-right">Hành động</div>
              </div>

              {items.map((user) => {
                const isShopOwner = user.roleKey === "shop_owner";
                return (
                  <div key={user._id} className="flex items-center gap-3 p-3">
                    <div className="flex-[1.2] space-y-1">
                      <div className="font-medium leading-tight">{user.name}</div>
                      {user.isSuperAdmin && (
                        <span className="text-xs text-red-500">Super Admin</span>
                      )}
                    </div>
                    <div className="flex-[1.3] text-sm text-muted-foreground">{user.email}</div>
                    <div className="flex-1 text-sm">{user.roleName ?? "-"}</div>
                    <div className="w-40 text-xs text-muted-foreground">
                      <div>Tạo: {formatDate(user.createdAt)}</div>
                      <div>Login: {formatDate(user.lastLogin)}</div>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`mt-1 inline-flex items-center rounded px-2 py-0.5 text-xs ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {user.status === "Active" ? "Đang hoạt động" : "Đang khóa"}
                      </button>
                    </div>
                    <div className="flex w-28 items-center justify-end gap-1.5">
                      <Button size="icon" variant="outline" title="Sửa" aria-label="Sửa" asChild>
                        <Link href={`/dashboard/user/${user._id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      {!isShopOwner && (
                        <Button
                          size="icon"
                          variant="destructive"
                          title="Xóa"
                          aria-label="Xóa"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
