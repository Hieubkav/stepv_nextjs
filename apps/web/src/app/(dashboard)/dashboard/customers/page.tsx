"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Plus, Trash2 } from "lucide-react";

type CustomerDoc = {
  _id: Id<"customers">;
  account: string;
  email: string;
  fullName: string;
  phone?: string;
  notes?: string;
  order: number;
  active: boolean;
  createdAt?: number;
};

type SortColumn = "fullName" | "account" | "email" | "createdAt" | null;
type SortDirection = "asc" | "desc";
type FilterActive = "all" | "active" | "inactive";

export default function CustomersListPage() {
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterActive, setFilterActive] = useState<FilterActive>("all");

  const searchTerm = search.trim();
  const customers = useQuery(api.customers.listCustomers, {
    search: searchTerm ? searchTerm : undefined,
  }) as CustomerDoc[] | undefined;

  const setCustomerActive = useMutation(api.customers.setCustomerActive);
  const deleteCustomer = useMutation(api.customers.deleteCustomer);

  const items = customers ?? [];

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (filterActive === "active") {
      result = result.filter((item) => item.active);
    } else if (filterActive === "inactive") {
      result = result.filter((item) => !item.active);
    }

    if (sortColumn) {
      result.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortColumn) {
          case "fullName":
            aVal = a.fullName.toLowerCase();
            bVal = b.fullName.toLowerCase();
            break;
          case "account":
            aVal = a.account.toLowerCase();
            bVal = b.account.toLowerCase();
            break;
          case "email":
            aVal = a.email.toLowerCase();
            bVal = b.email.toLowerCase();
            break;
          case "createdAt":
            aVal = a.createdAt ?? 0;
            bVal = b.createdAt ?? 0;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, filterActive, sortColumn, sortDirection]);

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  function SortIcon({ column }: { column: SortColumn }) {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 inline size-3.5" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 inline size-3.5" />
    ) : (
      <ArrowDown className="ml-1 inline size-3.5" />
    );
  }

  async function handleToggleActive(customer: CustomerDoc) {
    try {
      await setCustomerActive({ id: customer._id, active: !customer.active });
      toast.success(customer.active ? "Đã khóa khách hàng" : "Đã mở khách hàng");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function handleDelete(customer: CustomerDoc) {
    if (!window.confirm(`Xóa khách hàng "${customer.fullName}"?`)) return;
    try {
      const result = await deleteCustomer({ id: customer._id });
      if (!result?.ok) {
        toast.error("Không thể xóa khách hàng");
        return;
      }
      toast.success("Đã xóa khách hàng");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa khách hàng");
    }
  }

  function formatDate(timestamp?: number) {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("vi-VN");
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Khách hàng</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý account đăng nhập cho mọi sản phẩm (course, VFX, thư viện).
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Input
            placeholder="Tìm kiếm tên, email, phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:w-72"
          />
          <Button asChild>
            <Link href="/dashboard/customers/new">
              <Plus className="mr-2 size-4" />
              Thêm khách hàng
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filterActive === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterActive("all")}
        >
          Tất cả
        </Button>
        <Button
          variant={filterActive === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterActive("active")}
        >
          Đang hoạt động
        </Button>
        <Button
          variant={filterActive === "inactive" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterActive("inactive")}
        >
          Đang khóa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!customers && <div className="p-6 text-sm text-muted-foreground">Đang tải...</div>}
          {customers && filteredAndSortedItems.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">Chưa có khách hàng nào.</div>
          )}
          {customers && filteredAndSortedItems.length > 0 && (
            <div className="divide-y rounded-md border">
              <div className="flex items-center gap-3 bg-muted/30 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <button
                  onClick={() => handleSort("fullName")}
                  className="flex-[1.4] text-left transition-colors hover:text-foreground"
                >
                  Họ tên
                  <SortIcon column="fullName" />
                </button>
                <button
                  onClick={() => handleSort("account")}
                  className="flex-1 text-left transition-colors hover:text-foreground"
                >
                  Account
                  <SortIcon column="account" />
                </button>
                <button
                  onClick={() => handleSort("email")}
                  className="flex-[1.3] text-left transition-colors hover:text-foreground"
                >
                  Email
                  <SortIcon column="email" />
                </button>
                <div className="w-36">Điện thoại</div>
                <div className="flex-1">Ghi chú</div>
                <button
                  onClick={() => handleSort("createdAt")}
                  className="w-36 text-left transition-colors hover:text-foreground"
                >
                  Tạo & trạng thái
                  <SortIcon column="createdAt" />
                </button>
                <div className="w-28 text-right">Hành động</div>
              </div>

              {filteredAndSortedItems.map((customer) => (
                <div key={String(customer._id)} className="flex items-center gap-3 p-3">
                  <div className="flex-[1.4] space-y-1">
                    <div className="font-medium leading-tight">{customer.fullName}</div>
                  </div>
                  <div className="flex-1 font-mono text-sm">{customer.account}</div>
                  <div className="flex-[1.3] text-sm">{customer.email}</div>
                  <div className="w-36 text-sm text-muted-foreground">{customer.phone ?? "-"}</div>
                  <div className="flex-1 text-xs text-muted-foreground">
                    {customer.notes ? <span className="line-clamp-2">{customer.notes}</span> : "-"}
                  </div>
                  <div className="w-36 text-xs text-muted-foreground">
                    <div>{formatDate(customer.createdAt)}</div>
                    <button
                      onClick={() => handleToggleActive(customer)}
                      className={`mt-1 inline-flex items-center rounded px-2 py-0.5 text-xs ${
                        customer.active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {customer.active ? "Đang hoạt động" : "Đang khóa"}
                    </button>
                  </div>
                  <div className="flex w-28 items-center justify-end gap-1.5">
                    <Button size="icon" variant="outline" title="Sửa" aria-label="Sửa" asChild>
                      <Link href={`/dashboard/customers/${customer._id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      title="Xóa"
                      aria-label="Xóa"
                      onClick={() => handleDelete(customer)}
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
