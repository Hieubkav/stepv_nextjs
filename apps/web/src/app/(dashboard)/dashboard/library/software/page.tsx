"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";

type SoftwareDoc = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  iconImageId?: string;
  order: number;
  active: boolean;
};

export default function LibrarySoftwareListPage() {
  const softwares = useQuery(api.library.listSoftwares, { activeOnly: false }) as SoftwareDoc[] | undefined;
  const updateSoftware = useMutation(api.library.updateSoftware);
  const setSoftwareActive = useMutation(api.library.setSoftwareActive);
  const deleteSoftware = useMutation(api.library.deleteSoftware);
  const iconImages = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;

  const [selected, setSelected] = useState<string[]>([]);

  const iconLookup = useMemo(() => {
    const lookup: Record<string, any> = {};
    (iconImages ?? []).forEach((img: any) => {
      lookup[String(img._id)] = img;
    });
    return lookup;
  }, [iconImages]);

  const sorted = useMemo(() => {
    if (!softwares) return [] as SoftwareDoc[];
    return [...softwares].sort((a, b) => a.order - b.order);
  }, [softwares]);

  const allIdsOnPage = useMemo(() => sorted.map((x) => String(x._id)), [sorted]);

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
  }

  async function handleToggleActive(item: SoftwareDoc) {
    try {
      await setSoftwareActive({ id: item._id as any, active: !item.active });
      toast.success(item.active ? "Đã ẩn phần mềm" : "Đã hiện phần mềm");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function onBulkDelete() {
    if (selected.length === 0) return;
    if (!window.confirm(`Xóa ${selected.length} phần mềm đã chọn?`)) return;
    try {
      await Promise.all(selected.map((id) => deleteSoftware({ id: id as any })));
      setSelected([]);
      toast.success("Đã xóa các mục đã chọn");
    } catch (e: any) {
      toast.error(e?.message ?? "Lỗi xóa hàng loạt");
    }
  }

  async function handleDelete(item: SoftwareDoc) {
    if (!window.confirm(`Xóa phần mềm "${item.name}"?`)) return;
    try {
      await deleteSoftware({ id: item._id as any });
      toast.success("Đã xóa phần mềm");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa phần mềm");
    }
  }

  async function move(item: SoftwareDoc, direction: "up" | "down") {
    const index = sorted.findIndex((row) => row._id === item._id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const target = sorted[targetIndex];
    try {
      await updateSoftware({ id: item._id as any, order: target.order });
      await updateSoftware({ id: target._id as any, order: item.order });
      toast.success("Đã cập nhật thứ tự");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể đổi thứ tự");
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Thư viện - Phần mềm</h1>
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
            <Link href="/dashboard/library/software/new">
              <Plus className="mr-2 size-4" />
              Thêm phần mềm
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            <div className="flex items-center gap-3 p-3 bg-muted/30 text-sm text-muted-foreground">
              <div className="w-8" />
              <div className="w-16">Hình ảnh</div>
              <div className="flex-1">Tên</div>
              <div className="w-20">Trạng thái</div>
              <div className="w-48">Hành động</div>
            </div>

            {!softwares && (
              <div className="p-3 text-sm text-muted-foreground">Đang tải...</div>
            )}
            {softwares && sorted.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">Chưa có phần mềm nào.</div>
            )}
            {softwares && sorted.length > 0 && sorted.map((item, index) => {
              const icon = item.iconImageId ? iconLookup[String(item.iconImageId)] ?? null : null;
              return (
                <div key={String(item._id)} className="flex items-center gap-3 p-3">
                  <div className="w-8 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(String(item._id))}
                      onChange={(e) => toggleSelect(String(item._id), e.currentTarget.checked)}
                    />
                  </div>
                  <div className="w-16">
                    {icon?.url ? (
                      <img src={icon.url} alt={item.name} className="w-14 h-14 object-cover rounded border" />
                    ) : (
                      <div className="w-14 h-14 bg-muted rounded border flex items-center justify-center text-[10px] text-muted-foreground">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.slug}</div>
                  </div>
                  <div className="w-20">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`text-xs px-2 py-1 rounded ${
                        item.active 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                      title={item.active ? "Click để ẩn" : "Click để hiện"}
                    >
                      {item.active ? "Hiện" : "Ẩn"}
                    </button>
                  </div>
                  <div className="w-48 flex items-center gap-1.5">
                    <Button size="icon" variant="outline" title="Sửa" aria-label="Sửa" asChild>
                      <Link href={`/dashboard/library/software/${item._id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => move(item, "up")}
                      disabled={index === 0}
                      title="Lên"
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => move(item, "down")}
                      disabled={index === sorted.length - 1}
                      title="Xuống"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      title="Xóa" 
                      aria-label="Xóa" 
                      onClick={() => handleDelete(item)}
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
