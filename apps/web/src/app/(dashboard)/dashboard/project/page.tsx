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

type ProjectDoc = {
  _id: Id<"projects">;
  title: string;
  slug: string;
  thumbnailId?: Id<"media">;
  categoryId?: Id<"project_categories">;
  order: number;
  active: boolean;
};

type CategoryDoc = {
  _id: Id<"project_categories">;
  name: string;
};

type MediaDoc = {
  _id: Id<"media">;
  url?: string;
};

export default function ProjectListPage() {
  const projects = useQuery(api.projects.listProjects, { includeInactive: true }) as
    | ProjectDoc[]
    | undefined;
  const categories = useQuery(api.projects.listCategories, { includeInactive: true }) as
    | CategoryDoc[]
    | undefined;
  const images = useQuery(api.media.list, { kind: "image" }) as MediaDoc[] | undefined;

  const updateProject = useMutation(api.projects.updateProject);
  const setProjectActive = useMutation(api.projects.setProjectActive);
  const deleteProject = useMutation(api.projects.deleteProject);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    (categories ?? []).forEach((cat) => map.set(String(cat._id), cat.name));
    return map;
  }, [categories]);

  const imageMap = useMemo(() => {
    const map = new Map<string, MediaDoc>();
    (images ?? []).forEach((img) => map.set(String(img._id), img));
    return map;
  }, [images]);

  const sorted = useMemo(() => {
    if (!projects) return [] as ProjectDoc[];
    return [...projects].sort((a, b) => a.order - b.order);
  }, [projects]);

  const [rows, setRows] = useState<ProjectDoc[]>(sorted);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    setRows(sorted);
  }, [sorted]);

  async function handleToggleActive(item: ProjectDoc) {
    try {
      await setProjectActive({ id: item._id as any, active: !item.active });
      toast.success(item.active ? "Đã ẩn dự án" : "Đã bật dự án");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function handleDelete(item: ProjectDoc) {
    if (!window.confirm(`Xóa dự án "${item.title}"?`)) return;
    try {
      await deleteProject({ id: item._id as any });
      toast.success("Đã xóa dự án");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa dự án");
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
          updateProject({ id: item._id as any, order: index })
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
        <h1 className="text-xl font-semibold">Dự án</h1>
        <Button asChild>
          <Link href="/dashboard/project/new">
            <Plus className="mr-2 h-4 w-4" />
            Thêm dự án
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
              <div className="w-10" />
              <div className="w-16">Ảnh</div>
              <div className="flex-1">Tiêu đề</div>
              <div className="w-40">Danh mục</div>
              <div className="w-28 text-center">Trạng thái</div>
              <div className="w-40 text-center">Hành động</div>
            </div>

            {projects === undefined ? (
              <div className="p-3 text-sm text-muted-foreground">Đang tải...</div>
            ) : rows.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">Chưa có dự án.</div>
            ) : (
              rows.map((item) => {
                const thumb = item.thumbnailId
                  ? imageMap.get(String(item.thumbnailId)) ?? null
                  : null;
                const categoryName = item.categoryId
                  ? categoryMap.get(String(item.categoryId)) ?? "-"
                  : "-";

                return (
                  <div
                    key={String(item._id)}
                    className="flex items-center gap-3 p-3"
                    draggable
                    onDragStart={() => handleDragStart(String(item._id))}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(String(item._id))}
                  >
                    <div className="w-10 flex justify-center text-muted-foreground cursor-grab">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="w-16">
                      {thumb?.url ? (
                        <img
                          src={thumb.url}
                          alt={item.title}
                          className="h-12 w-16 rounded object-cover border"
                        />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded border border-dashed text-[10px] text-muted-foreground">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.slug}</div>
                    </div>
                    <div className="w-40 text-sm text-muted-foreground truncate">{categoryName}</div>
                    <div className="w-28 text-center">
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
                        title={item.active ? "Ẩn dự án" : "Hiển dự án"}
                      >
                        {item.active ? "Ẩn" : "Hiện"}
                      </Button>
                      <Button size="icon" variant="outline" asChild title="Sửa">
                        <Link href={`/dashboard/project/${item._id}/edit`}>
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
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

