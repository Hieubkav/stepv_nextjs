"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";

type ResourceDoc = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  features?: string[];
  pricingType: "free" | "paid";
  coverImageId?: string;
  downloadUrl?: string;
  isDownloadVisible: boolean;
  order: number;
  active: boolean;
};

export default function LibraryListPage() {
  const resources = useQuery(api.library.listResources, {}) as ResourceDoc[] | undefined;
  const updateResource = useMutation(api.library.updateResource);
  const setResourceActive = useMutation(api.library.setResourceActive);
  const deleteResource = useMutation(api.library.deleteResource);

  const sorted = useMemo(() => {
    if (!resources) return [] as ResourceDoc[];
    return [...resources].sort((a, b) => a.order - b.order);
  }, [resources]);

  async function handleToggleActive(resource: ResourceDoc) {
    try {
      await setResourceActive({ id: resource._id as any, active: !resource.active });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function handleToggleDownload(resource: ResourceDoc) {
    try {
      await updateResource({ id: resource._id as any, isDownloadVisible: !resource.isDownloadVisible });
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

  async function move(resource: ResourceDoc, direction: "up" | "down") {
    const index = sorted.findIndex((item) => item._id === resource._id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const target = sorted[targetIndex];
    try {
      await updateResource({ id: resource._id as any, order: target.order });
      await updateResource({ id: target._id as any, order: resource.order });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể đổi thứ tự");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Thư viện - Tài nguyên</h1>
          <p className="text-sm text-muted-foreground">Quản lý danh sách resource hiển thị ở trang /thu-vien.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/library/new">
            <Plus className="mr-2 size-4" />
            Thêm tài nguyên
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài nguyên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!resources && <div className="text-sm text-muted-foreground">Đang tải...</div>}
          {resources && sorted.length === 0 && (
            <div className="text-sm text-muted-foreground">Chưa có tài nguyên nào.</div>
          )}
          {resources && sorted.length > 0 && (
            <div className="space-y-3">
              {sorted.map((resource, index) => (
                <div
                  key={resource._id}
                  className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{resource.title}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                        {resource.pricingType}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        order #{resource.order}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Slug: {resource.slug}</div>
                    {resource.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">{resource.description}</div>
                    )}
                    {resource.features && resource.features.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Tính năng: {resource.features.join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-start gap-2 text-xs text-muted-foreground">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox checked={resource.active} onCheckedChange={() => handleToggleActive(resource)} />
                        <span>{resource.active ? "Đang hiện" : "Đang ẩn"}</span>
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                          checked={resource.isDownloadVisible}
                          onCheckedChange={() => handleToggleDownload(resource)}
                        />
                        <span>Link tải {resource.isDownloadVisible ? "hiện" : "ẩn"}</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/library/${resource._id}/edit`}>
                          <Pencil className="mr-2 size-4" />
                          Sua
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => move(resource, "up")}
                        disabled={index === 0}
                        title="Lên"
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => move(resource, "down")}
                        disabled={index === sorted.length - 1}
                        title="Xuống"
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(resource)}
                        title="Xóa"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
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
