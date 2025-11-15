"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@dohy/backend/convex/_generated/api";

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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chọn ảnh cover</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[65vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
            {(images ?? []).map((img: any) => {
              const id = String(img._id);
              const isSelected = id === values.coverImageId;
              return (
                <button
                  key={id}
                  type="button"
                  className={`flex flex-col items-center gap-2 rounded border p-3 text-sm transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                    isSelected ? "border-primary ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectCover(id)}
                >
                  {img.url ? (
                    <img src={img.url} alt={img.title || "cover"} className="h-32 w-full rounded object-cover" />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center rounded border border-dashed text-xs text-muted-foreground">
                      No URL
                    </div>
                  )}
                  <span className="w-full truncate text-xs text-muted-foreground">{img.title || id}</span>
                  <span className="w-full truncate text-[10px] text-muted-foreground/70">{id}</span>
                </button>
              );
            })}
          </div>
          {(images ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa có media nào. Hãy tải ảnh tại trang Media.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}





