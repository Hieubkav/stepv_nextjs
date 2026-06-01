"use client";

import Link from "next/link";
import { type DragEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical, Pencil, Plus, Trash2, Globe } from "lucide-react";

type WebDemoDoc = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  thumbnailId?: string;
  previewUrl?: string;
  sections?: number;
  pages?: number;
  popups?: number;
  forms?: number;
  tags?: string[];
  order: number;
  active: boolean;
};

type SortColumn = "title" | "order" | null;
type SortDirection = "asc" | "desc";
type FilterStatus = "all" | "active" | "inactive";

export default function WebDemoListPage() {
  const demos = useQuery(api.web_demos.list, {}) as { items: any[]; total: number } | undefined;
  const media = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;
  const deleteDemo = useMutation(api.web_demos.remove);
  const setActive = useMutation(api.web_demos.setActive);
  const reorder = useMutation(api.web_demos.reorder);

  const [selected, setSelected] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  
  // Drag & Drop states
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const items = useMemo(() => {
    return (demos?.items ?? []) as WebDemoDoc[];
  }, [demos]);

  const mediaMap = useMemo(() => {
    const map = new Map<string, any>();
    if (Array.isArray(media)) {
      for (const item of media) {
        map.set(String(item._id), item);
      }
    }
    return map;
  }, [media]);

  const filtered = useMemo(() => {
    let list = [...items];

    if (statusFilter !== "all") {
      list = list.filter((i) => (statusFilter === "active" ? i.active : !i.active));
    }

    if (!sortColumn) return list;

    list.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortColumn) {
        case "title":
          return a.title.localeCompare(b.title) * dir;
        case "order":
          return (a.order - b.order) * dir;
        default:
          return 0;
      }
    });

    return list;
  }, [items, statusFilter, sortColumn, sortDirection]);

  const allOnPage = useMemo(() => filtered.map((i) => String(i._id)), [filtered]);

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
  }

  function toggleSelectAll() {
    const on = selected.length < allOnPage.length;
    setSelected(on ? allOnPage : []);
  }

  async function handleBulkDelete() {
    if (selected.length === 0) return;
    if (!window.confirm(`Xóa ${selected.length} giao diện mẫu đã chọn?`)) return;
    try {
      await Promise.all(selected.map((id) => deleteDemo({ id: id as any })));
      setSelected([]);
      toast.success("Đã xóa các mục đã chọn");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Xóa giao diện mẫu này?")) return;
    try {
      await deleteDemo({ id: id as any });
      setSelected((prev) => prev.filter((x) => x !== id));
      toast.success("Đã xóa thành công");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa");
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    try {
      await setActive({ id: id as any, active });
      toast.success(active ? "Đã bật hiển thị" : "Đã ẩn giao diện");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật");
    }
  }

  // Sắp xếp kéo thả
  function handleDragStart(event: DragEvent, id: string) {
    setDraggingId(id);
    setDragOverId(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function handleDragEnter(id: string) {
    if (draggingId && draggingId !== id) {
      setDragOverId(id);
    }
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverId(null);
  }

  async function handleDrop(onId: string) {
    if (!draggingId || draggingId === onId) {
      handleDragEnd();
      return;
    }

    const currentIndex = filtered.findIndex((i) => String(i._id) === draggingId);
    const targetIndex = filtered.findIndex((i) => String(i._id) === onId);
    if (currentIndex < 0 || targetIndex < 0) {
      handleDragEnd();
      return;
    }

    const next = [...filtered];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    
    try {
      await reorder({ orderedIds: next.map((i) => i._id as any) });
      toast.success("Đã sắp xếp lại thứ tự hiển thị");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể sắp xếp");
    } finally {
      handleDragEnd();
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Giao diện Web Demo</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selected.length < allOnPage.length ? "Chọn tất cả" : "Bỏ chọn"}
          </Button>
          <Button variant="destructive" size="sm" disabled={selected.length === 0} onClick={handleBulkDelete}>
            Xóa đã chọn
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/theme-demo" target="_blank" rel="noopener noreferrer">
              <Globe className="mr-2 size-4 text-primary" />
              Xem trang Public
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/web-demo/new">
              <Plus className="mr-2 size-4" />
              Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Danh sách Web Demo</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-md border p-1 bg-muted/20">
              {["all", "active", "inactive"].map((key) => (
                <Button
                  key={key}
                  variant={statusFilter === key ? "default" : "ghost"}
                  size="sm"
                  className="px-3"
                  onClick={() => setStatusFilter(key as FilterStatus)}
                >
                  {key === "all" ? "Tất cả" : key === "active" ? "Đang hiển thị" : "Đang ẩn"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            {/* Header */}
            <div className="flex items-center gap-3 bg-muted/40 p-3 text-xs font-medium uppercase text-muted-foreground">
              <div className="w-14" />
              <div className="w-20">Ảnh</div>
              <div className="flex-1 text-left">Tiêu đề</div>
              <div className="w-48 text-left">Tags</div>
              <div className="w-32 text-left">Cấu trúc</div>
              <div className="w-28 text-left">Trạng thái</div>
              <div className="w-32 text-right">Thao tác</div>
            </div>

            {/* List */}
            {filtered.map((item) => {
              const id = String(item._id);
              const thumb = item.thumbnailId ? mediaMap.get(String(item.thumbnailId)) : null;
              const isSelected = selected.includes(id);
              const isOver = dragOverId === id && draggingId !== id;
              
              return (
                <div
                  key={id}
                  className={`flex items-center gap-3 p-3 text-sm transition-colors ${
                    isOver ? "bg-primary/5 ring-1 ring-primary/40" : ""
                  }`}
                  onDragEnter={() => handleDragEnter(id)}
                  onDragOver={(e) => {
                    if (draggingId) e.preventDefault();
                  }}
                  onDrop={() => handleDrop(id)}
                >
                  {/* drag handle & checkbox */}
                  <div className="w-14 flex flex-col items-center gap-2 text-muted-foreground">
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => handleDragStart(e, id)}
                      onDragEnd={handleDragEnd}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border border-dashed bg-background hover:bg-muted ${
                        draggingId === id ? "border-primary/60 ring-1 ring-primary/30" : ""
                      }`}
                      aria-label="Kéo để sắp xếp"
                    >
                      <GripVertical className="size-4" />
                    </button>
                    <Checkbox checked={isSelected} onCheckedChange={(v) => toggleSelect(id, Boolean(v))} />
                  </div>

                  {/* Thumbnail */}
                  <div className="w-20">
                    {thumb?.url ? (
                      <img src={thumb.url} alt={item.title} className="h-12 w-16 rounded border object-cover" />
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded border bg-muted text-[10px] text-muted-foreground">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Title & Preview Link */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">
                      <Link href={`/dashboard/web-demo/${id}/edit`} className="hover:text-primary transition-colors">
                        {item.title}
                      </Link>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                      {item.previewUrl ? (
                        <>
                          <Globe className="size-3" />
                          <a href={item.previewUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {item.previewUrl}
                          </a>
                        </>
                      ) : (
                        <span>Chưa có preview link</span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="w-48 flex flex-wrap gap-1">
                    {item.tags && item.tags.length > 0 ? (
                      item.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] py-0 px-1.5">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Cấu trúc Theme */}
                  <div className="w-32 text-xs text-muted-foreground space-y-0.5">
                    <div>{item.sections ?? 0} Blocks</div>
                    <div>{item.pages ?? 0} Pages</div>
                  </div>

                  {/* Trạng thái active */}
                  <div className="w-28">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(id, !item.active)}
                      className={item.active ? "border-emerald-300 text-emerald-700 hover:text-emerald-700 bg-emerald-50/30" : ""}
                    >
                      {item.active ? (
                        <>
                          <EyeOff className="mr-1 size-4" /> Ẩn đi
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1 size-4" /> Hiển thị
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Action buttons */}
                  <div className="w-32 flex items-center justify-end gap-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/dashboard/web-demo/${id}/edit`} className="inline-flex items-center gap-2">
                        <Pencil className="size-4" /> Sửa
                      </Link>
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDelete(id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">Chưa có giao diện Web Demo nào được tạo.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
