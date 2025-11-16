"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FullRichEditor } from "@/components/ui/full-rich-editor";
import { api } from "@dohy/backend/convex/_generated/api";
import { MediaPickerDialog, type MediaItem } from "@/components/media/media-picker-dialog";

export type ResourceFormValues = {
  title: string;
  slug: string;
  description: string;
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
  mode?: "new" | "edit";
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

export function ResourceForm({ initialValues, submitting, submitLabel, onSubmit, onCancel, mode = "new" }: ResourceFormProps) {
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

  function handleSelectCover(item: MediaItem) {
    setValues((prev) => ({ ...prev, coverImageId: String(item._id) }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Thông tin cơ bản</h3>
          <div className={`grid gap-4 ${mode === "edit" ? "" : "sm:grid-cols-2"}`}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
              <Input value={values.title} onChange={(e) => update("title", e.target.value)} required />
            </div>
            {mode !== "edit" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug <span className="text-destructive">*</span></label>
                <Input value={values.slug} onChange={(e) => update("slug", e.target.value)} required />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả</label>
            <FullRichEditor
              value={values.description}
              onChange={(html) => update("description", html)}
              placeholder="Giới thiệu về tài nguyên này..."
            />
          </div>
        </div>

        {/* Media & Downloads */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-base font-semibold">Hình ảnh & Tải xuống</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Ảnh cover</label>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Input
                  value={values.coverImageId}
                  onChange={(e) => update("coverImageId", e.target.value)}
                  placeholder="Media ID..."
                  className="font-mono text-xs"
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
                      <span className="truncate">Không tìm thấy: {values.coverImageId}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => update("coverImageId", "")}>
                        Xóa
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="rounded border border-dashed p-3 text-xs text-muted-foreground text-center">
                    Chưa chọn ảnh cover
                  </div>
                )}
              </div>
              <div className="flex items-start">
                <Button type="button" variant="outline" onClick={() => setPickerOpen(true)} className="whitespace-nowrap">
                  Chọn ảnh
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Link tải xuống</label>
            <Input 
              value={values.downloadUrl} 
              onChange={(e) => update("downloadUrl", e.target.value)} 
              placeholder="https://example.com/download"
              type="url"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-base font-semibold">Cài đặt</h3>
          
          <div className={`grid gap-4 ${mode === "edit" ? "" : "sm:grid-cols-2"}`}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại giá</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={values.pricingType}
                onChange={(e) => update("pricingType", e.target.value as ResourceFormValues["pricingType"])}
              >
                {pricingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label === "free" ? "Miễn phí" : "Trả phí"}
                  </option>
                ))}
              </select>
            </div>
            {mode !== "edit" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Thứ tự hiển thị</label>
                <Input type="number" value={values.order} onChange={(e) => update("order", e.target.value)} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={values.isDownloadVisible}
                onCheckedChange={(checked) => update("isDownloadVisible", !!checked)}
              />
              <span>Hiển thị nút tải xuống</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={values.active} onCheckedChange={(checked) => update("active", !!checked)} />
              <span>Kích hoạt (hiển thị công khai)</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
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

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Chọn ảnh cover"
        selectedId={values.coverImageId}
        onSelect={handleSelectCover}
      />
    </>
  );
}


