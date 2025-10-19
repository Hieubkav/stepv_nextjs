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
              <div className="text-sm font-medium">Thumbnail (tu media)</div>
              <p className="text-xs text-muted-foreground">Có thể bỏ trống nếu chưa có ảnh.</p>
            </div>
            <div className="flex items-center gap-2">
              {values.thumbnailMediaId && (
                <Button variant="outline" size="sm" type="button" onClick={() => update("thumbnailMediaId", "")}>
                  Xoa anh
                </Button>
              )}
              <Button variant="secondary" size="sm" type="button" onClick={() => setPickerOpen(true)}>
                Chon anh
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
                <div className="font-medium">{selectedThumbnail.title ?? "Khong ten"}</div>
                <div className="text-xs text-muted-foreground">ID: {String(selectedThumbnail._id)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>
            Huy
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Dang luu..." : submitLabel}
        </Button>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chọn ảnh thumbnail</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[65vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
            {(images ?? []).map((image) => {
              const id = String(image._id);
              const isSelected = id === values.thumbnailMediaId;
              return (
                <button
                  key={id}
                  type="button"
                  className={`flex flex-col items-center gap-2 rounded border border-input bg-background p-3 text-sm transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                    isSelected ? "border-primary ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    update("thumbnailMediaId", id);
                    setPickerOpen(false);
                  }}
                >
                  {image.url ? (
                    <img src={image.url} alt={image.title || "preview"} className="h-32 w-full object-cover" />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center rounded border border-dashed text-xs text-muted-foreground">
                      No URL
                    </div>
                  )}
                  <span className="w-full truncate text-xs text-muted-foreground">{image.title || "Khong ten"}</span>
                  <span className="w-full truncate text-[10px] text-muted-foreground/70">{id}</span>
                </button>
              );
            })}
            {(images ?? []).length === 0 && (
              <div className="col-span-full rounded border border-dashed p-4 text-sm text-muted-foreground">
                Chưa có ảnh nào trong media. Hãy tải ảnh tại trang Media.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
