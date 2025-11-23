"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FullRichEditor } from "@/components/ui/full-rich-editor";

export type ResourceFormValues = {
  title: string;
  slug: string;
  description: string;
  pricingType: "free" | "paid";
  price: string;
  originalPrice: string;
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

    if (field === "pricingType") {
      const nextType = value as ResourceFormValues["pricingType"];
      setValues((prev) => ({
        ...prev,
        pricingType: nextType,
        price: nextType === "free" ? "0" : prev.price,
        originalPrice: nextType === "free" ? "" : prev.originalPrice,
      }));
      return;
    }

    setValues((prev) => ({ ...prev, [field]: value }));
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
            <label className="text-sm font-medium">Link tải xuống</label>
            <Input
              value={values.downloadUrl}
              onChange={(e) => update("downloadUrl", e.target.value)}
              placeholder="https://example.com/download"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Hệ thống tự dùng ảnh thư viện có order nhỏ nhất làm thumbnail.
            </p>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá bán (VND)</label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={values.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="100000"
                disabled={values.pricingType === "free"}
                required={values.pricingType === "paid"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá gốc (tuỳ chọn)</label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={values.originalPrice}
                onChange={(e) => update("originalPrice", e.target.value)}
                placeholder="150000"
                disabled={values.pricingType === "free"}
              />
              <p className="text-xs text-muted-foreground">Chỉ hiển thị nếu lớn hơn giá bán.</p>
            </div>
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

    </>
  );
}
