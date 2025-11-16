"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";

type StudentDoc = {
  _id: Id<"students">;
  account: string;
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  order: number;
  active: boolean;
  createdAt?: number;
  courseCount?: number;
};

type SortColumn = "fullName" | "account" | "createdAt" | null;
type SortDirection = "asc" | "desc";
type FilterActive = "all" | "active" | "inactive";

export default function StudentsListPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterActive, setFilterActive] = useState<FilterActive>("all");

  const searchTerm = search.trim();
  const students = useQuery(api.students.listStudents, {
    search: searchTerm ? searchTerm : undefined,
    withCourseCount: true,
  }) as StudentDoc[] | undefined;
  const updateStudent = useMutation(api.students.updateStudent);
  const setStudentActive = useMutation(api.students.setStudentActive);
  const deleteStudent = useMutation(api.students.deleteStudent);

  const items = students ?? [];

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

  const allIdsOnPage = useMemo(
    () => filteredAndSortedItems.map((item) => String(item._id)),
    [filteredAndSortedItems],
  );

  const canReorder = !sortColumn;

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((item) => item !== id)));
  }

  function toggleSelectAll() {
    if (filteredAndSortedItems.length === 0) return;
    const shouldSelectAll = selected.length < allIdsOnPage.length;
    setSelected(shouldSelectAll ? allIdsOnPage : []);
  }

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

  async function onBulkDelete() {
    if (selected.length === 0) return;
    if (!window.confirm(`Xóa ${selected.length} học viên?`)) return;
    try {
      await Promise.all(selected.map((id) => deleteStudent({ id: id as Id<"students"> })));
      setSelected([]);
      toast.success("Đã xóa học viên đã chọn");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa học viên");
    }
  }

  async function handleToggleActive(student: StudentDoc) {
    try {
      await setStudentActive({ id: student._id, active: !student.active });
      toast.success(student.active ? "Đã ẩn học viên" : "Đã hiện học viên");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function handleDelete(student: StudentDoc) {
    if (!window.confirm(`Xóa học viên "${student.fullName}"?`)) return;
    try {
      const result = await deleteStudent({ id: student._id });
      if (!result?.ok) {
        toast.error("Không thể xóa học viên");
        return;
      }
      setSelected((prev) => prev.filter((id) => id !== String(student._id)));
      toast.success("Đã xóa học viên");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa học viên");
    }
  }

  async function swapOrder(current: StudentDoc, target: StudentDoc) {
    await updateStudent({ id: current._id, order: target.order });
    await updateStudent({ id: target._id, order: current.order });
  }

  async function handleReorder(direction: "up" | "down", student: StudentDoc) {
    if (!canReorder) return;
    const index = filteredAndSortedItems.findIndex((item) => item._id === student._id);
    if (index === -1) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= filteredAndSortedItems.length) return;
    try {
      await swapOrder(student, filteredAndSortedItems[nextIndex]);
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể đổi thứ tự");
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
          <h1 className="text-2xl font-semibold tracking-tight">Học viên</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý account học viên + thông tin liên hệ, phục vụ cấp quyền khóa học.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Input
            placeholder="Tìm kiếm tên, email, tags..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:w-72"
          />
          <Button asChild>
            <Link href="/dashboard/students/new">
              <Plus className="mr-2 size-4" />
              Thêm học viên
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleSelectAll} disabled={filteredAndSortedItems.length === 0}>
            {selected.length < allIdsOnPage.length ? "Chọn tất cả" : "Bỏ chọn"}
          </Button>
          <Button variant="destructive" size="sm" disabled={selected.length === 0} onClick={onBulkDelete}>
            Xóa đã chọn
          </Button>
          <span className="text-xs text-muted-foreground">{selected.length} đã chọn</span>
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
            Đang hiện
          </Button>
          <Button
            variant={filterActive === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterActive("inactive")}
          >
            Đang ẩn
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!students && <div className="p-6 text-sm text-muted-foreground">Đang tải...</div>}
          {students && filteredAndSortedItems.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">Chưa có học viên nào.</div>
          )}
          {students && filteredAndSortedItems.length > 0 && (
            <div className="divide-y rounded-md border">
              <div className="flex items-center gap-3 bg-muted/30 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <div className="w-8" />
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
                <div className="flex-[1.3]">Liên hệ</div>
                <div className="flex-1">Tags</div>
                <div className="w-24 text-center">Khóa học</div>
                <button
                  onClick={() => handleSort("createdAt")}
                  className="w-32 text-left transition-colors hover:text-foreground"
                >
                  Tạo & trạng thái
                  <SortIcon column="createdAt" />
                </button>
                <div className="w-32 text-right">Hành động</div>
              </div>

              {filteredAndSortedItems.map((student, index) => (
                <div key={String(student._id)} className="flex items-center gap-3 p-3">
                  <div className="flex w-8 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(String(student._id))}
                      onChange={(event) => toggleSelect(String(student._id), event.currentTarget.checked)}
                    />
                  </div>
                  <div className="flex-[1.4] space-y-1">
                    <div className="font-medium leading-tight">{student.fullName}</div>
                    {student.notes && <div className="text-xs text-muted-foreground line-clamp-2">{student.notes}</div>}
                  </div>
                  <div className="flex-1 font-mono text-sm">{student.account}</div>
                  <div className="flex-[1.3] space-y-1 text-xs text-muted-foreground">
                    {student.email && <div>Email: {student.email}</div>}
                    {student.phone && <div>Phone: {student.phone}</div>}
                    {!student.email && !student.phone && <div>-</div>}
                  </div>
                  <div className="flex-1">
                    {student.tags && student.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.tags.map((tag) => (
                          <Badge key={`${student._id}-${tag}`} variant="outline" className="uppercase tracking-tight">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="w-24 text-center text-sm font-semibold">{student.courseCount ?? 0}</div>
                  <div className="w-32 text-xs text-muted-foreground">
                    <div>{formatDate(student.createdAt)}</div>
                    <button
                      onClick={() => handleToggleActive(student)}
                      className={`mt-1 inline-flex items-center rounded px-2 py-0.5 text-xs ${
                        student.active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {student.active ? "Đang hiện" : "Đang ẩn"}
                    </button>
                  </div>
                  <div className="flex w-32 items-center justify-end gap-1.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Lên"
                      aria-label="Lên"
                      disabled={!canReorder || index === 0}
                      onClick={() => handleReorder("up", student)}
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Xuống"
                      aria-label="Xuống"
                      disabled={!canReorder || index === filteredAndSortedItems.length - 1}
                      onClick={() => handleReorder("down", student)}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button size="icon" variant="outline" title="Sửa" aria-label="Sửa" asChild>
                      <Link href={`/dashboard/students/${student._id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      title="Xóa"
                      aria-label="Xóa"
                      onClick={() => handleDelete(student)}
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
