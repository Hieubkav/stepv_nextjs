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
import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

type VfxDoc = {
  _id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  pricingType: "free" | "paid";
  price?: number;
  originalPrice?: number;
  duration: number;
  resolution: string;
  frameRate: number;
  format: string;
  hasAlpha: boolean;
  fileSize: number;
  thumbnailId?: string;
  downloadCount?: number;
  tags?: string[];
  order: number;
  active: boolean;
  updatedAt: number;
};

type SortColumn = "title" | "category" | "pricingType" | "downloadCount" | null;
type SortDirection = "asc" | "desc";
type FilterPricing = "all" | "free" | "paid";
type FilterStatus = "all" | "active" | "inactive";

const categoryLabels: Record<string, string> = {
  explosion: "Explosion",
  fire: "Fire",
  smoke: "Smoke",
  water: "Water",
  magic: "Magic",
  particle: "Particle",
  transition: "Transition",
  other: "Other",
};

export default function VfxListPage() {
  const products = useQuery(api.vfx.listVfxProducts, {}) as VfxDoc[] | undefined;
  const media = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;
  const deleteProduct = useMutation(api.vfx.deleteVfxProduct);
  const setActive = useMutation(api.vfx.setVfxProductActive);
  const reorder = useMutation(api.vfx.reorderVfxProducts);

  const [selected, setSelected] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [pricingFilter, setPricingFilter] = useState<FilterPricing>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const items = products ?? [];

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

    if (pricingFilter !== "all") {
      list = list.filter((i) => i.pricingType === pricingFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((i) => (statusFilter === "active" ? i.active : !i.active));
    }

    if (!sortColumn) return list;

    list.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortColumn) {
        case "title":
          return a.title.localeCompare(b.title) * dir;
        case "category":
          return a.category.localeCompare(b.category) * dir;
        case "pricingType":
          return a.pricingType.localeCompare(b.pricingType) * dir;
        case "downloadCount":
          return ((a.downloadCount ?? 0) - (b.downloadCount ?? 0)) * dir;
        default:
          return 0;
      }
    });

    return list;
  }, [items, pricingFilter, statusFilter, sortColumn, sortDirection]);

  const allOnPage = useMemo(() => filtered.map((i) => String(i._id)), [filtered]);

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
  }

  function toggleSelectAll() {
    const on = selected.length < allOnPage.length;
    setSelected(on ? allOnPage : []);
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
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="size-4 text-muted-foreground" />
    ) : (
      <ChevronDown className="size-4 text-muted-foreground" />
    );
  }

  async function handleBulkDelete() {
    if (selected.length === 0) return;
    if (!window.confirm(`Xóa ${selected.length} VFX đã chọn?`)) return;
    try {
      await Promise.all(selected.map((id) => deleteProduct({ id: id as any })));
      setSelected([]);
      toast.success("Đã xóa");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Xóa VFX này?")) return;
    try {
      await deleteProduct({ id: id as any });
      setSelected((prev) => prev.filter((x) => x !== id));
      toast.success("Đã xóa");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa");
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    try {
      await setActive({ id: id as any, active });
      toast.success(active ? "Đã bật" : "Đã tắt");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật");
    }
  }

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
      toast.success("Đã sắp xếp");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể sắp xếp");
    } finally {
      handleDragEnd();
    }
  }

  function formatFileSize(bytes: number) {
    if (!bytes) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">VFX Store</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selected.length < allOnPage.length ? "Chọn tất cả" : "Bỏ chọn"}
          </Button>
          <Button variant="destructive" size="sm" disabled={selected.length === 0} onClick={handleBulkDelete}>
            Xóa đã chọn
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/vfx/new">
              <Plus className="mr-2 size-4" />
              Thêm VFX
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Danh sách</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-md border p-1">
              {["all", "free", "paid"].map((key) => (
                <Button
                  key={key}
                  variant={pricingFilter === key ? "default" : "ghost"}
                  size="sm"
                  className="px-3"
                  onClick={() => setPricingFilter(key as FilterPricing)}
                >
                  {key === "all" ? "Tất cả" : key === "free" ? "Miễn phí" : "Trả phí"}
                </Button>
              ))}
            </div>
            <div className="flex rounded-md border p-1">
              {["all", "active", "inactive"].map((key) => (
                <Button
                  key={key}
                  variant={statusFilter === key ? "default" : "ghost"}
                  size="sm"
                  className="px-3"
                  onClick={() => setStatusFilter(key as FilterStatus)}
                >
                  {key === "all" ? "Trạng thái" : key === "active" ? "Đang bán" : "Ẩn"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            <div className="flex items-center gap-3 bg-muted/40 p-3 text-xs font-medium uppercase text-muted-foreground">
              <div className="w-14" />
              <div className="w-20">Ảnh</div>
              <button
                type="button"
                className="flex-1 text-left inline-flex items-center gap-1"
                onClick={() => handleSort("title")}
              >
                Tiêu đề
                <SortIcon column="title" />
              </button>
              <button
                type="button"
                className="w-28 text-left inline-flex items-center gap-1"
                onClick={() => handleSort("category")}
              >
                Danh mục
                <SortIcon column="category" />
              </button>
              <button
                type="button"
                className="w-24 text-left inline-flex items-center gap-1"
                onClick={() => handleSort("pricingType")}
              >
                Giá
                <SortIcon column="pricingType" />
              </button>
              <button
                type="button"
                className="w-24 text-left inline-flex items-center gap-1"
                onClick={() => handleSort("downloadCount")}
              >
                Tải xuống
                <SortIcon column="downloadCount" />
              </button>
              <div className="w-28 text-left">Trạng thái</div>
              <div className="w-32 text-right">Thao tác</div>
            </div>

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
                  <div className="w-20">
                    {thumb?.url ? (
                      <img src={thumb.url} alt={item.title} className="h-12 w-16 rounded border object-cover" />
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded border bg-muted text-[10px] text-muted-foreground">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/dashboard/vfx/${id}/edit`} className="font-semibold hover:text-primary">
                      {item.title}
                    </Link>
                  </div>
                  <div className="w-28 text-sm">
                    <Badge variant="outline">{categoryLabels[item.category] ?? item.category}</Badge>
                  </div>
                  <div className="w-24 text-sm">
                    {item.pricingType === "free" ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        Miễn phí
                      </span>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="font-semibold">{item.price?.toLocaleString("vi-VN")}₫</span>
                        {item.originalPrice && (
                          <div className="text-[11px] text-muted-foreground line-through">
                            {item.originalPrice.toLocaleString("vi-VN")}₫
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="w-24 text-sm text-muted-foreground">{item.downloadCount ?? 0}</div>
                  <div className="w-28">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(id, !item.active)}
                      className={item.active ? "border-emerald-300 text-emerald-700" : ""}
                    >
                      {item.active ? (
                        <>
                          <EyeOff className="mr-1 size-4" /> Ẩn
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1 size-4" /> Bán
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="w-32 flex items-center justify-end gap-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/dashboard/vfx/${id}/edit`} className="inline-flex items-center gap-2">
                        <Pencil className="size-4" />
                        Sửa
                      </Link>
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDelete(id)}>
                      <Trash2 className="size-4" />
                      Xóa
                    </Button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">Không có VFX nào.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


