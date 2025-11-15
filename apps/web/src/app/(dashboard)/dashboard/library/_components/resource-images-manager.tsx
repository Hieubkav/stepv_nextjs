"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@dohy/backend/convex/_generated/api";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

type ResourceImagesManagerProps = {
  resourceId: string;
};

type ResourceImageDoc = {
  _id: string;
  mediaId: string;
  caption?: string;
  altText?: string;
  order: number;
  active: boolean;
};

export function ResourceImagesManager({ resourceId }: ResourceImagesManagerProps) {
  const images = useQuery(api.library.listResourceImages, {
    resourceId: resourceId as any,
    includeInactive: true,
  }) as ResourceImageDoc[] | undefined;
  const mediaList = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const createImage = useMutation(api.library.createResourceImage);
  const updateImage = useMutation(api.library.updateResourceImage);
  const deleteImage = useMutation(api.library.deleteResourceImage);
  const reorderImages = useMutation(api.library.reorderResourceImages);

  const sortedImages = useMemo(() => {
    const list = Array.isArray(images) ? [...images] : [];
    list.sort((a, b) => a.order - b.order);
    return list;
  }, [images]);

  const mediaMap = useMemo(() => {
    const map = new Map<string, any>();
    const list = Array.isArray(mediaList) ? mediaList : [];
    for (const item of list) {
      map.set(String(item._id), item);
    }
    return map;
  }, [mediaList]);

  const usedMediaIds = useMemo(() => {
    return new Set(sortedImages.map((item) => String(item.mediaId)));
  }, [sortedImages]);

  const availableMedia = useMemo(() => {
    const list = Array.isArray(mediaList) ? mediaList : [];
    return list.filter((item) => !usedMediaIds.has(String(item._id)));
  }, [mediaList, usedMediaIds]);

  useEffect(() => {
    if (!pickerOpen) {
      setSelectedMediaIds([]);
    }
  }, [pickerOpen]);

  function toggleSelect(mediaId: string) {
    setSelectedMediaIds((prev) => {
      if (prev.includes(mediaId)) {
        return prev.filter((id) => id !== mediaId);
      }
      return [...prev, mediaId];
    });
  }

  async function handleAddSelected() {
    if (!selectedMediaIds.length) return;
    setAdding(true);
    try {
      for (const mediaId of selectedMediaIds) {
        await createImage({
          resourceId: resourceId as any,
          mediaId: mediaId as any,
          active: true,
        } as any);
      }
      toast.success("Đã thêm ảnh vào resource");
      setPickerOpen(false);
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể thêm ảnh");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleActive(image: ResourceImageDoc) {
    try {
      await updateImage({ id: image._id as any, active: !image.active } as any);
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái ảnh");
    }
  }

  async function handleDelete(image: ResourceImageDoc) {
    if (!window.confirm("Xóa ảnh khỏi resource?")) return;
    try {
      await deleteImage({ id: image._id as any } as any);
      toast.success("Đã xóa ảnh");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa ảnh");
    }
  }

  async function move(image: ResourceImageDoc, direction: "up" | "down") {
    if (sortedImages.length < 2) return;
    const index = sortedImages.findIndex((item) => item._id === image._id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedImages.length) return;
    const next = [...sortedImages];
    const [removed] = next.splice(index, 1);
    next.splice(targetIndex, 0, removed);
    try {
      await reorderImages({
        resourceId: resourceId as any,
        orderedIds: next.map((item) => item._id as any),
      } as any);
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể sắp xếp ảnh");
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Bộ sưu tập ảnh</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="mr-2 size-4" />
            Thêm ảnh
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {images === undefined && <div className="text-sm text-muted-foreground">Đang tải danh sách ảnh...</div>}
          {images && sortedImages.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Chưa có ảnh nào. Bấm "Thêm ảnh" để chèn ảnh từ media.
            </div>
          )}
          {images && sortedImages.length > 0 && (
            <div className="space-y-3">
              {sortedImages.map((image, index) => {
                const media = mediaMap.get(String(image.mediaId));
                return (
                  <div
                    key={image._id}
                    className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex items-center gap-3 sm:min-w-[240px]">
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded border bg-muted">
                        {media?.url ? (
                          <img src={media.url} alt={media.title || "resource image"} className="h-full w-full object-cover" />
                        ) : (
                          <span className="px-2 text-center text-[11px] text-muted-foreground">No preview</span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">order #{image.order}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${
                            image.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            {image.active ? "Đang hiện" : "Đang ẩn"}
                          </span>
                        </div>
                        {media?.title && (
                          <div className="text-xs text-muted-foreground">Tiêu đề media: {media.title}</div>
                        )}
                        <div className="text-xs text-muted-foreground">Media ID: {String(image.mediaId)}</div>
                        {image.caption && (
                          <div className="text-xs text-muted-foreground">Caption: {image.caption}</div>
                        )}
                        {image.altText && (
                          <div className="text-xs text-muted-foreground">Alt: {image.altText}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 sm:items-end sm:text-right">
                      <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <Checkbox
                          checked={image.active}
                          onCheckedChange={() => handleToggleActive(image)}
                        />
                        <span>{image.active ? "Đang hiện" : "Đang ẩn"}</span>
                      </label>
                      <div className="flex items-center gap-2 self-start sm:self-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => move(image, "up")}
                          disabled={index === 0}
                          title="Lên"
                        >
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => move(image, "down")}
                          disabled={index === sortedImages.length - 1}
                          title="Xuống"
                        >
                          <ChevronDown className="size-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(image)}
                          title="Xóa"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chọn ảnh từ media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Array.isArray(mediaList) ? (
              <>
                <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
                  {availableMedia.map((img: any) => {
                    const id = String(img._id);
                    const checked = selectedMediaIds.includes(id);
                    return (
                      <div
                        key={id}
                        role="button"
                        tabIndex={0}
                        className={`relative flex flex-col items-center gap-2 rounded border p-3 text-sm transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                          checked ? "border-primary ring-2 ring-primary" : ""
                        }`}
                        onClick={() => toggleSelect(id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleSelect(id);
                          }
                        }}
                      >
                        {img.url ? (
                          <img src={img.url} alt={img.title || "media"} className="h-32 w-full rounded object-cover" />
                        ) : (
                          <div className="flex h-32 w-full items-center justify-center rounded border border-dashed text-xs text-muted-foreground">
                            No preview
                          </div>
                        )}
                        <span className="w-full truncate text-xs text-muted-foreground">{img.title || id}</span>
                        <span className="w-full truncate text-[10px] text-muted-foreground/70">{id}</span>
                        <Checkbox
                          className="pointer-events-none absolute right-2 top-2"
                          checked={checked}
                          aria-hidden
                        />
                      </div>
                    );
                  })}
                </div>
                {availableMedia.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Tất cả media đã được sử dụng hoặc chưa có ảnh nào trong thư viện. Hãy tải ảnh mới tại trang Media.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Đang tải danh sách media...</p>
            )}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setPickerOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddSelected} disabled={!selectedMediaIds.length || adding}>
                {adding ? "Đang thêm..." : `Thêm ${selectedMediaIds.length} ảnh`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
