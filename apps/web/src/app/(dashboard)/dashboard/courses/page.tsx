"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import type { Id } from "@dohy/backend/convex/_generated/dataModel";

type CourseDoc = {
  _id: Id<"courses">;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  introVideoUrl?: string;
  thumbnailMediaId?: string;
  pricingType: "free" | "paid";
  priceAmount?: number;
  priceNote?: string;
  isPriceVisible: boolean;
  order: number;
  active: boolean;
  createdAt?: number;
};

type SortColumn = "title" | "pricingType" | "order" | "createdAt" | null;
type SortDirection = "asc" | "desc";
type FilterPricingType = "all" | "free" | "paid";

export default function CoursesListPage() {
  const courses = useQuery(api.courses.listCourses, { includeInactive: true }) as CourseDoc[] | undefined;
  const media = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;
  const updateCourse = useMutation(api.courses.updateCourse);
  const setCourseActive = useMutation(api.courses.setCourseActive);
  const deleteCourse = useMutation(api.courses.deleteCourse);

  const [selected, setSelected] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterPricingType, setFilterPricingType] = useState<FilterPricingType>("all");

  const items = courses ?? [];

  const mediaMap = useMemo(() => {
    const map = new Map<string, any>();
    if (Array.isArray(media)) {
      for (const item of media) {
        map.set(String(item._id), item);
      }
    }
    return map;
  }, [media]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (filterPricingType !== "all") {
      result = result.filter((c) => c.pricingType === filterPricingType);
    }

    if (sortColumn) {
      result.sort((a: any, b: any) => {
        let aVal: any;
        let bVal: any;

        switch (sortColumn) {
          case "title":
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          case "pricingType":
            aVal = a.pricingType;
            bVal = b.pricingType;
            break;
          case "order":
            aVal = a.order || 0;
            bVal = b.order || 0;
            break;
          case "createdAt":
            aVal = a.createdAt || 0;
            bVal = b.createdAt || 0;
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
  }, [items, filterPricingType, sortColumn, sortDirection]);

  const allIdsOnPage = useMemo(() => filteredAndSortedItems.map((x) => String(x._id)), [filteredAndSortedItems]);

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
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
      return <ArrowUpDown className="size-3.5 ml-1 inline" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="size-3.5 ml-1 inline" />
    ) : (
      <ArrowDown className="size-3.5 ml-1 inline" />
    );
  }

  async function onBulkDelete() {
    if (selected.length === 0) return;
    if (!window.confirm(`Xóa ${selected.length} khóa học đã chọn?`)) return;
    try {
      await Promise.all(selected.map((id) => deleteCourse({ id: id as any })));
      setSelected([]);
      toast.success("Đã xóa các khóa học đã chọn");
    } catch (e: any) {
      toast.error(e?.message ?? "Lỗi xóa hàng loạt");
    }
  }

  async function handleToggleActive(course: CourseDoc) {
    try {
      await setCourseActive({ id: course._id, active: !course.active });
      toast.success(course.active ? "Đã ẩn khóa học" : "Đã hiện khóa học");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function handleDelete(course: CourseDoc) {
    if (!window.confirm(`Xóa khóa học "${course.title}"?`)) return;
    try {
      await deleteCourse({ id: course._id });
      toast.success("Đã xóa khóa học");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa khóa học");
    }
  }

  function formatDate(timestamp?: number) {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleDateString("vi-VN");
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Khóa học</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const on = selected.length < allIdsOnPage.length;
            setSelected(on ? allIdsOnPage : []);
          }}>
            {selected.length < allIdsOnPage.length ? "Chọn tất cả" : "Bỏ chọn tất cả"}
          </Button>
          <Button variant="destructive" disabled={selected.length === 0} onClick={onBulkDelete}>
            Xóa đã chọn
          </Button>
          <Button asChild>
            <Link href="/dashboard/courses/new">
              <Plus className="mr-2 size-4" />
              Thêm khóa học
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={filterPricingType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPricingType("all")}
              >
                Tất cả
              </Button>
              <Button
                variant={filterPricingType === "free" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPricingType("free")}
              >
                Miễn phí
              </Button>
              <Button
                variant={filterPricingType === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPricingType("paid")}
              >
                Trả phí
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            <div className="flex items-center gap-3 p-3 bg-muted/30 text-sm text-muted-foreground">
              <div className="w-8" />
              <div className="w-20">Hình ảnh</div>
              <button
                onClick={() => handleSort("title")}
                className="flex-1 text-left hover:text-foreground transition-colors cursor-pointer"
              >
                Tiêu đề
                <SortIcon column="title" />
              </button>
              <button
                onClick={() => handleSort("pricingType")}
                className="w-24 text-left hover:text-foreground transition-colors cursor-pointer"
              >
                Giá
                <SortIcon column="pricingType" />
              </button>
              <div className="w-24">Trạng thái</div>
              <div className="w-32">Hành động</div>
            </div>

            {filteredAndSortedItems.map((course) => {
              const thumbnailUrl = course.thumbnailMediaId ? mediaMap.get(String(course.thumbnailMediaId))?.url : null;
              return (
              <div key={String(course._id)} className="flex items-center gap-3 p-3">
                <div className="w-8 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(String(course._id))}
                    onChange={(e) => toggleSelect(String(course._id), e.currentTarget.checked)}
                  />
                </div>
                <div className="w-20">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={course.title} className="w-16 h-12 object-cover rounded border" />
                  ) : (
                    <div className="w-16 h-12 bg-muted rounded border flex items-center justify-center text-[10px] text-muted-foreground">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex-1 truncate font-medium">{course.title}</div>
                <div className="w-24 text-sm capitalize">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                    course.pricingType === "free" 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {course.pricingType === "free" ? "Miễn phí" : "Trả phí"}
                  </span>
                </div>
                <div className="w-24">
                  <button
                    onClick={() => handleToggleActive(course)}
                    className={`text-xs px-2 py-1 rounded ${
                      course.active 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                    title={course.active ? "Click để ẩn" : "Click để hiện"}
                  >
                    {course.active ? "Đang hiện" : "Đang ẩn"}
                  </button>
                </div>
                <div className="w-32 flex items-center gap-1.5">
                  <Button size="icon" variant="outline" title="Sửa" aria-label="Sửa" asChild>
                    <Link href={`/dashboard/courses/${course._id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    title="Xóa" 
                    aria-label="Xóa" 
                    onClick={() => handleDelete(course)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
