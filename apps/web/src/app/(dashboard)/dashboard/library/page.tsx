"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type ResourceDoc = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  features?: string[];
  pricingType: "free" | "paid";
  price?: number | null;
  originalPrice?: number | null;
  coverImageId?: string;
  downloadUrl?: string;
  isDownloadVisible: boolean;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

type SortColumn = "title" | "pricingType" | "price" | "order" | "createdAt" | null;
type SortDirection = "asc" | "desc";
type FilterPricingType = "all" | "free" | "paid";

export default function LibraryListPage() {
  const resources = useQuery(api.library.listResources, {}) as ResourceDoc[] | undefined;
  const media = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;
  const convex = useConvex();
  const updateResource = useMutation(api.library.updateResource);
  const setResourceActive = useMutation(api.library.setResourceActive);
  const deleteResource = useMutation(api.library.deleteResource);

  const [selected, setSelected] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterPricingType, setFilterPricingType] = useState<FilterPricingType>("all");
  const [previewIds, setPreviewIds] = useState<Record<string, string | undefined>>({});
  const loadedPreviewVersions = useRef(new Map<string, number>());

  const items = resources ?? [];
  
  const mediaMap = useMemo(() => {
    const map = new Map<string, any>();
    if (Array.isArray(media)) {
      for (const item of media) {
        map.set(String(item._id), item);
      }
    }
    return map;
  }, [media]);

  useEffect(() => {
    if (!resources) return;

    const pending = resources.filter((r) => {
      const id = String(r._id);
      const known = loadedPreviewVersions.current.get(id);
      return known !== r.updatedAt;
    });

    if (pending.length === 0) return;

    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        pending.map(async (resource) => {
          try {
            const detail = await convex.query(api.library.getResourceDetail, {
              id: resource._id as any,
              includeInactive: false,
            });
            const first = detail?.images?.[0];
            return {
              id: String(resource._id),
              mediaId: first ? String(first.mediaId) : undefined,
              updatedAt: resource.updatedAt,
            };
          } catch (error) {
            console.error("Không thể tải ảnh thư viện", error);
            return { id: String(resource._id), mediaId: undefined, updatedAt: resource.updatedAt };
          }
        }),
      );

      if (cancelled) return;

      setPreviewIds((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const { id, mediaId, updatedAt } of results) {
          loadedPreviewVersions.current.set(id, updatedAt);
          if (next[id] !== mediaId) {
            next[id] = mediaId;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [convex, resources]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (filterPricingType !== "all") {
      result = result.filter((r) => r.pricingType === filterPricingType);
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
          case "price":
            aVal = typeof a.price === "number" ? a.price : 0;
            bVal = typeof b.price === "number" ? b.price : 0;
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
    if (!window.confirm(`Xóa ${selected.length} tài nguyên đã chọn?`)) return;
    try {
      await Promise.all(selected.map((id) => deleteResource({ id: id as any })));
      setSelected([]);
      toast.success("Đã xóa các mục đã chọn");
    } catch (e: any) {
      toast.error(e?.message ?? "Lỗi xóa hàng loạt");
    }
  }

  async function handleToggleActive(resource: ResourceDoc) {
    try {
      await setResourceActive({ id: resource._id as any, active: !resource.active });
      toast.success(resource.active ? "Đã ẩn tài nguyên" : "Đã hiện tài nguyên");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function handleToggleDownload(resource: ResourceDoc) {
    try {
      await updateResource({ id: resource._id as any, isDownloadVisible: !resource.isDownloadVisible });
      toast.success(resource.isDownloadVisible ? "Đã ẩn link tải" : "Đã hiện link tải");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật link tải");
    }
  }

  async function handleDelete(resource: ResourceDoc) {
    if (!window.confirm(`Xóa tài nguyên "${resource.title}"?`)) return;
    try {
      await deleteResource({ id: resource._id as any });
      toast.success("Đã xóa tài nguyên");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa tài nguyên");
    }
  }

  function formatDate(timestamp?: number) {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleDateString("vi-VN");
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Thư viện - Tài nguyên</h1>
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
            <Link href="/dashboard/library/new">
              <Plus className="mr-2 size-4" />
              Thêm tài nguyên
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
                onClick={() => handleSort("price")}
                className="w-32 text-left hover:text-foreground transition-colors cursor-pointer"
              >
                Giá
                <SortIcon column="price" />
              </button>
              <div className="w-24">Trạng thái</div>
              <div className="w-28">Link tải</div>
              <button
                onClick={() => handleSort("createdAt")}
                className="w-28 text-left hover:text-foreground transition-colors cursor-pointer"
              >
                Ngày tạo
                <SortIcon column="createdAt" />
              </button>
              <div className="w-32">Hành động</div>
            </div>

            {filteredAndSortedItems.map((r) => {
              const previewMediaId = previewIds[String(r._id)];
              const coverUrl = previewMediaId
                ? mediaMap.get(previewMediaId)?.url
                : r.coverImageId
                  ? mediaMap.get(String(r.coverImageId))?.url
                  : null;
              return (
              <div key={String(r._id)} className="flex items-center gap-3 p-3">
                <div className="w-8 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(String(r._id))}
                    onChange={(e) => toggleSelect(String(r._id), e.currentTarget.checked)}
                  />
                </div>
                <div className="w-20">
                  {coverUrl ? (
                    <img src={coverUrl} alt={r.title} className="w-16 h-12 object-cover rounded border" />
                  ) : (
                    <div className="w-16 h-12 bg-muted rounded border flex items-center justify-center text-[10px] text-muted-foreground">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex-1 truncate font-medium">{r.title}</div>
                <div className="w-32 text-sm">
                  {r.pricingType === "free" ? (
                    <span
                      className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      Miễn phí
                    </span>
                  ) : (
                    <div className="space-y-0.5">
                      <div className="font-semibold">
                        {formatPrice(typeof r.price === "number" ? r.price : 0)}
                      </div>
                      {r.originalPrice && r.originalPrice > (r.price ?? 0) ? (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatPrice(r.originalPrice)}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className="w-24">
                  <button
                    onClick={() => handleToggleActive(r)}
                    className={`text-xs px-2 py-1 rounded ${
                      r.active 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                    title={r.active ? "Click để ẩn" : "Click để hiện"}
                  >
                    {r.active ? "Đang hiện" : "Đang ẩn"}
                  </button>
                </div>
                <div className="w-28">
                  <button
                    onClick={() => handleToggleDownload(r)}
                    className={`text-xs px-2 py-1 rounded ${
                      r.isDownloadVisible 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                    title={r.isDownloadVisible ? "Click để ẩn" : "Click để hiện"}
                  >
                    {r.isDownloadVisible ? "Hiện" : "Ẩn"}
                  </button>
                </div>
                <div className="w-28 text-sm text-muted-foreground">{formatDate(r.createdAt)}</div>
                <div className="w-32 flex items-center gap-1.5">
                  <Button size="icon" variant="outline" title="Sửa" aria-label="Sửa" asChild>
                    <Link href={`/dashboard/library/${r._id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    title="Xóa" 
                    aria-label="Xóa" 
                    onClick={() => handleDelete(r)}
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
