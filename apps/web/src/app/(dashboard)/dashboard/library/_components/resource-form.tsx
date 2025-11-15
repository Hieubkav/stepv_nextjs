"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@dohy/backend/convex/_generated/api";
import { Image as ImageIcon, X } from "lucide-react";

export type ResourceFormValues = {
  title: string;
  slug: string;
  description: string;
  featuresText: string;
  pricingType: "free" | "paid";
  coverImageId: string;
  downloadUrl: string;
  isDownloadVisible: boolean;
  active: boolean;
  order: string;
};

export type ResourceFormProps = {
  initialValues: ResourceFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: ResourceFormValues) => Promise<void>;
  onCancel?: () => void;
};

const pricingOptions: { label: string; value: "free" | "paid" }[] = [
  { label: "free", value: "free" },
  { label: "paid", value: "paid" },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();

export function ResourceForm({ initialValues, submitting, submitLabel, onSubmit, onCancel }: ResourceFormProps) {
  const [values, setValues] = useState<ResourceFormValues>(initialValues);
  const images = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedCover = useMemo(() => {
    if (!values.coverImageId) return null;
    const list = Array.isArray(images) ? images : [];
    const found = list.find((img: any) => String(img._id) === String(values.coverImageId));
    return found ?? null;
  }, [images, values.coverImageId]);

  const shouldSlugStayAuto = useMemo(() => {
    const suggested = slugify(initialValues.title || "");
    if (!initialValues.slug) return true;
    return initialValues.slug === suggested;
  }, [initialValues.slug, initialValues.title]);

  const [slugDirty, setSlugDirty] = useState(!shouldSlugStayAuto);

  useEffect(() => {
    setValues(initialValues);
    const suggested = slugify(initialValues.title || "");
    const auto = !initialValues.slug || initialValues.slug === suggested;
    setSlugDirty(!auto);
  }, [initialValues]);

  function update(field: keyof ResourceFormValues, value: string | boolean) {
    if (field === "slug") {
      setSlugDirty(true);
      setValues((prev) => ({ ...prev, slug: String(value) }));
      return;
    }

    if (field === "title") {
      const nextTitle = String(value);
      setValues((prev) => {
        const next = { ...prev, title: nextTitle };
        if (!slugDirty) {
          next.slug = slugify(nextTitle);
        }
        return next;
      });
      return;
    }

    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSelectCover(id: string) {
    setValues((prev) => ({ ...prev, coverImageId: id }));
    setPickerOpen(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Title</label>
          <Input value={values.title} onChange={(e) => update("title", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Slug</label>
          <Input value={values.slug} onChange={(e) => update("slug", e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Description</label>
        <Textarea value={values.description} onChange={(e) => update("description", e.target.value)} rows={4} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Features (mỗi dòng một mục)</label>
        <Textarea value={values.featuresText} onChange={(e) => update("featuresText", e.target.value)} rows={4} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Pricing type</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={values.pricingType}
            onChange={(e) => update("pricingType", e.target.value as ResourceFormValues["pricingType"])}
          >
            {pricingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Order</label>
          <Input type="number" value={values.order} onChange={(e) => update("order", e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Cover media</label>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-2">
              <Input
                value={values.coverImageId}
                onChange={(e) => update("coverImageId", e.target.value)}
                placeholder="media id..."
              />
              {values.coverImageId ? (
                selectedCover ? (
                  <div className="flex items-center gap-3 rounded border bg-muted/20 p-2">
                    {selectedCover.url ? (
                      <img
                        src={selectedCover.url}
                        alt={selectedCover.title || "cover"}
                        className="h-16 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed text-[10px] text-muted-foreground">
                        No URL
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{selectedCover.title || "Cover"}</div>
                      <div className="truncate text-xs text-muted-foreground">{values.coverImageId}</div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => update("coverImageId", "")}>
                      Xóa
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 rounded border border-dashed p-2 text-xs text-muted-foreground">
                    <span className="truncate">Không tìm thấy media: {values.coverImageId}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => update("coverImageId", "")}>
                      Xóa
                    </Button>
                  </div>
                )
              ) : (
                <div className="rounded border border-dashed p-2 text-xs text-muted-foreground">
                  Chưa chọn ảnh cover. Hãy nhập media id hoặc chọn từ thư viện.
                </div>
              )}
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
                Chọn từ media
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Download URL</label>
          <Input value={values.downloadUrl} onChange={(e) => update("downloadUrl", e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={values.isDownloadVisible}
            onCheckedChange={(checked) => update("isDownloadVisible", !!checked)}
          />
          Hiện nút tải
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={values.active} onCheckedChange={(checked) => update("active", !!checked)} />
          Đang hiển thị
        </label>
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : submitLabel}
        </Button>
      </div>
      </form>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] md:max-w-6xl lg:max-w-7xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Chọn ảnh cover</DialogTitle>
          </DialogHeader>
          
          <ResourceCoverPicker 
            images={images ?? []}
            selectedId={values.coverImageId}
            onSelect={handleSelectCover}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

type ResourceCoverPickerProps = {
  images: any[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function ResourceCoverPicker({ images, selectedId, onSelect }: ResourceCoverPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    const query = searchQuery.toLowerCase();
    return images.filter((img: any) => {
      const title = img.title || "";
      const id = String(img._id);
      return title.toLowerCase().includes(query) || id.toLowerCase().includes(query);
    });
  }, [images, searchQuery]);

  const isEmpty = images.length === 0;
  const hasNoResults = filteredImages.length === 0 && searchQuery;

  return (
    <div className="space-y-4 flex-1 min-h-0 flex flex-col">
      {/* Search Bar */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Tìm kiếm ảnh cover..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-8"
          aria-label="Tìm kiếm ảnh cover"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setSearchQuery("")}
            aria-label="Xóa tìm kiếm"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Images Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Chưa có ảnh nào
            </p>
            <p className="text-sm text-muted-foreground">
              Hãy tải ảnh tại trang Media
            </p>
          </div>
        ) : hasNoResults ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Không tìm thấy kết quả
            </p>
            <p className="text-sm text-muted-foreground">
              Thử tìm kiếm với từ khóa khác
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setSearchQuery("")}
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img: any) => {
              const id = String(img._id);
              const isSelected = id === selectedId;
              return (
                <button
                  key={id}
                  type="button"
                  className={`
                    group
                    rounded-lg border bg-card
                    text-left transition-all
                    hover:border-primary
                    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                    min-h-[44px] min-w-[44px]
                    ${isSelected ? "border-primary ring-2 ring-primary" : ""}
                  `}
                  onClick={() => onSelect(id)}
                  aria-label={`Chọn ${img.title || "ảnh cover"}`}
                >
                  {img.url ? (
                    <div className="relative h-40 w-full rounded-t-lg overflow-hidden bg-[repeating-conic-gradient(#d4d4d4_0%_25%,_white_0%_50%)] [background-size:20px_20px]">
                      <img 
                        src={img.url} 
                        alt={img.title || "cover"} 
                        className="h-full w-full object-contain p-2"
                        loading="lazy"
                      />
                      <div className={`
                        absolute inset-0 transition-colors
                        ${isSelected ? "bg-primary/20" : "bg-black/0 group-hover:bg-black/10"}
                      `} />
                    </div>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-t-lg bg-muted">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {img.title || id}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {id}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!isEmpty && (
        <div className="text-sm text-muted-foreground text-center pt-2 border-t">
          Hiển thị {filteredImages.length} ảnh
          {searchQuery && ` (từ ${images.length} tổng cộng)`}
        </div>
      )}
    </div>
  );
}





