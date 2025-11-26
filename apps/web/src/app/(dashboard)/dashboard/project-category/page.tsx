"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

type CategoryDoc = {
  _id: Id<"project_categories">;
  name: string;
  slug: string;
  description?: string;
  order: number;
  active: boolean;
};

export default function ProjectCategoryPage() {
  const categories = useQuery(api.projects.listCategories, { includeInactive: true }) as
    | CategoryDoc[]
    | undefined;

  const updateCategory = useMutation(api.projects.updateCategory);
  const deleteCategory = useMutation(api.projects.deleteCategory);

  const sorted = useMemo(() => {
    if (!categories) return [] as CategoryDoc[];
    return [...categories].sort((a, b) => a.order - b.order);
  }, [categories]);

  const [rows, setRows] = useState<CategoryDoc[]>(sorted);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    setRows(sorted);
  }, [sorted]);

  async function handleToggleActive(item: CategoryDoc) {
    try {
      await updateCategory({ id: item._id as any, active: !item.active });
      toast.success(item.active ? "Đã ẩn danh mục" : "Đã bật danh mục");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function handleDelete(item: CategoryDoc) {
    if (!window.confirm(`Xóa danh mục "${item.name}"?`)) return;
    try {
      await deleteCategory({ id: item._id as any });
      toast.success("Đã xóa danh mục");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa danh mục");
    }
  }

  function handleDragStart(id: string) {
    setDraggingId(id);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  async function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const current = rows.findIndex((r) => String(r._id) === draggingId);
    const target = rows.findIndex((r) => String(r._id) === targetId);
    if (current === -1 || target === -1) return;

    const next = [...rows];
    const [moved] = next.splice(current, 1);
    next.splice(target, 0, moved);
    const reordered = next.map((item, index) => ({ ...item, order: index }));
    setRows(reordered);

    try {
      await Promise.all(
        reordered.map((item, index) =>
          updateCategory({ id: item._id as any, order: index })
        )
      );
      toast.success("Đã cập nhật thứ tự");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể đổi thứ tự");
      setRows(sorted);
    } finally {
      setDraggingId(null);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Danh mục dự án</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý nhóm dự án, dùng cho tab tại trang /project.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/project-category/new">
            <Plus className="mr-2 h-4 w-4" />
            Thêm danh mục
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            <div className="flex items-center gap-3 bg-muted/40 p-3 text-sm font-medium text-muted-foreground">
              <div className="w-8" />
              <div className="flex-1">Tên</div>
              <div className="w-24 text-center">Trạng thái</div>
              <div className="w-40 text-center">Hành động</div>
            </div>

            {categories === undefined ? (
              <div className="p-3 text-sm text-muted-foreground">Đang tải...</div>
            ) : rows.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">Chưa có danh mục.</div>
            ) : (
              rows.map((item) => (
                <div
                  key={String(item._id)}
                  className="flex items-center gap-3 p-3"
                  draggable
                  onDragStart={() => handleDragStart(String(item._id))}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(String(item._id))}
                >
                  <div className="w-8 flex justify-center text-muted-foreground cursor-grab">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {item.description || "-"}
                    </div>
                  </div>
                  <div className="w-24 text-center">
                    <Badge
                      variant={item.active ? "default" : "outline"}
                      className={item.active ? "bg-green-600 text-white" : ""}
                    >
                      {item.active ? "Hiển thị" : "Ẩn"}
                    </Badge>
                  </div>
                  <div className="w-40 flex items-center justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleToggleActive(item)}
                      title={item.active ? "Ẩn danh mục" : "Hiện danh mục"}
                    >
                      {item.active ? "Ẩn" : "Hiện"}
                    </Button>
                    <Button size="icon" variant="outline" title="Sửa" asChild>
                      <Link href={`/dashboard/project-category/${item._id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(item)}
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

