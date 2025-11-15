"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@dohy/backend/convex/_generated/api";
import { Image as ImageIcon, X } from "lucide-react";

export type CourseFormValues = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  thumbnailMediaId: string;
  introVideoUrl: string;
  pricingType: "free" | "paid";
  priceAmount: string;
  priceNote: string;
  isPriceVisible: boolean;
  order: string;
  active: boolean;
};

export type CourseFormProps = {
  initialValues: CourseFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: CourseFormValues) => Promise<void>;
  onCancel?: () => void;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[`~!@#$%^&*()_+=\[\]{}|;:'",.<>?/\-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/(^-|-$)/g, "")
    .trim();

const formatCurrency = (input: string) => {
  const number = Number(input);
  if (!Number.isFinite(number)) return input;
  return number.toLocaleString("vi-VN");
};

export function CourseForm({ initialValues, submitting, submitLabel, onSubmit, onCancel }: CourseFormProps) {
  const images = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;
  const [values, setValues] = useState<CourseFormValues>(initialValues);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (values.pricingType === "free" && (values.priceAmount !== "" || values.isPriceVisible)) {
      setValues((prev) => ({
        ...prev,
        priceAmount: "",
        isPriceVisible: false,
      }));
    }
  }, [values.pricingType, values.priceAmount, values.isPriceVisible]);

  const selectedThumbnail = useMemo(() => {
    if (!values.thumbnailMediaId) return null;
    const list = Array.isArray(images) ? images : [];
    return list.find((item) => String(item._id) === String(values.thumbnailMediaId)) ?? null;
  }, [images, values.thumbnailMediaId]);

  const suggestedSlug = useMemo(() => slugify(values.title || ""), [values.title]);

  function update(field: keyof CourseFormValues, value: string | boolean) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tiêu đề</label>
          <Input
            value={values.title}
            onChange={(event) => {
              const title = event.target.value;
              update("title", title);
              if (!values.slug || values.slug === suggestedSlug) {
                update("slug", slugify(title));
              }
            }}
            placeholder="Ví dụ: Figma cho người mới"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Slug</label>
          <Input
            value={values.slug}
            onChange={(event) => update("slug", event.target.value)}
            placeholder="figma-cho-nguoi-moi"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phụ đề</label>
          <Input
            value={values.subtitle}
            onChange={(event) => update("subtitle", event.target.value)}
            placeholder="Mô tả ngắn về khóa học"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Link intro video (YouTube)</label>
          <Input
            value={values.introVideoUrl}
            onChange={(event) => update("introVideoUrl", event.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Mô tả</label>
          <Textarea
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Loại giá</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={values.pricingType}
            onChange={(event) => update("pricingType", event.target.value as CourseFormValues["pricingType"])}
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Giá (VND)</label>
          <Input
            type="number"
            value={values.priceAmount}
            onChange={(event) => update("priceAmount", event.target.value)}
            placeholder="499000"
            disabled={values.pricingType === "free"}
            min="0"
            step="1000"
          />
          {values.pricingType === "paid" && values.priceAmount && (
            <p className="text-xs text-muted-foreground">Hiển thị: {formatCurrency(values.priceAmount)} VND</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Ghi chú về giá</label>
          <Input
            value={values.priceNote}
            onChange={(event) => update("priceNote", event.target.value)}
            placeholder="Ví dụ: Giảm 20% đến 01/10"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Thứ tự</label>
          <Input
            value={values.order}
            onChange={(event) => update("order", event.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Trạng thái khóa học</label>
          <label className="inline-flex items-center gap-2 text-sm">
            <Checkbox
              checked={values.active}
              onCheckedChange={(checked) => update("active", Boolean(checked))}
            />
            <span>{values.active ? "Đang hiện" : "Đang ẩn"}</span>
          </label>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Hiện giá</label>
          <label className="inline-flex items-center gap-2 text-sm">
            <Checkbox
              checked={values.isPriceVisible}
              onCheckedChange={(checked) => update("isPriceVisible", Boolean(checked))}
              disabled={values.pricingType === "free"}
            />
            <span>{values.isPriceVisible ? "Hiện giá" : "Ẩn giá"}</span>
          </label>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Thumbnail (từ media)</div>
              <p className="text-xs text-muted-foreground">Có thể bỏ trống nếu chưa có ảnh.</p>
            </div>
            <div className="flex items-center gap-2">
              {values.thumbnailMediaId && (
                <Button variant="outline" size="sm" type="button" onClick={() => update("thumbnailMediaId", "")}>
                  Xóa ảnh
                </Button>
              )}
              <Button variant="secondary" size="sm" type="button" onClick={() => setPickerOpen(true)}>
                Chọn ảnh
              </Button>
            </div>
          </div>
          {selectedThumbnail && (
            <div className="mt-3 flex items-center gap-3 rounded-md border p-3">
              <img
                src={selectedThumbnail.url ?? ""}
                alt={selectedThumbnail.title ?? "thumbnail"}
                className="h-16 w-16 rounded object-cover"
              />
              <div className="text-sm">
                <div className="font-medium">{selectedThumbnail.title ?? "Không tên"}</div>
                <div className="text-xs text-muted-foreground">ID: {String(selectedThumbnail._id)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : submitLabel}
        </Button>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] md:max-w-6xl lg:max-w-7xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Chọn ảnh thumbnail</DialogTitle>
          </DialogHeader>
          
          <CourseThumbnailPicker
            images={images ?? []}
            selectedId={values.thumbnailMediaId}
            onSelect={(id) => {
              update("thumbnailMediaId", id);
              setPickerOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </form>
  );
}

type CourseThumbnailPickerProps = {
  images: any[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function CourseThumbnailPicker({ images, selectedId, onSelect }: CourseThumbnailPickerProps) {
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
          placeholder="Tìm kiếm ảnh thumbnail..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-8"
          aria-label="Tìm kiếm ảnh thumbnail"
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
              Chưa có ảnh nào trong media. Hãy tải ảnh tại trang Media.
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
            {filteredImages.map((image: any) => {
              const id = String(image._id);
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
                  aria-label={`Chọn ${image.title || "ảnh thumbnail"}`}
                >
                  {image.url ? (
                    <div className="relative h-40 w-full rounded-t-lg overflow-hidden bg-[repeating-conic-gradient(#d4d4d4_0%_25%,_white_0%_50%)] [background-size:20px_20px]">
                      <img 
                        src={image.url} 
                        alt={image.title || "preview"} 
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
                      {image.title || "Không tên"}
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
