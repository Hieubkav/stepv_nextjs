"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaPickerDialog, type MediaItem } from "@/components/media/media-picker-dialog";
import { Trash2, Plus } from "lucide-react";
import { WebDemoImageUploader } from "./web-demo-image-uploader";
import { AiWebDemoImportDialog } from "./ai-web-demo-import-dialog";



export type WebDemoFormValues = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  thumbnailId: string;
  previewUrl: string;
  screenshotLaptopId: string;
  screenshotMobileId: string;
  features: string;
  tags: string;
  active: boolean;
  stats: { label: string; value: string }[];
};

export type WebDemoFormProps = {
  initialValues: WebDemoFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: WebDemoFormValues) => Promise<void>;
  onCancel?: () => void;
  mode?: "new" | "edit";
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();

export function WebDemoForm({
  initialValues,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  mode = "new",
}: WebDemoFormProps) {
  const images = useQuery(api.media.list, { kind: "image" }) as MediaItem[] | undefined;

  const [values, setValues] = useState<WebDemoFormValues>(initialValues);

  function handleAiApply(aiValues: Partial<WebDemoFormValues>) {
    setValues((prev) => ({
      ...prev,
      ...aiValues,
    }));
    if (aiValues.title && mode === "new" && !slugDirty) {
      setValues((prev) => ({
        ...prev,
        slug: slugify(aiValues.title!),
      }));
    }
  }
  
  // States cho các Dialog chọn ảnh
  const [thumbPickerOpen, setThumbPickerOpen] = useState(false);
  const [laptopPickerOpen, setLaptopPickerOpen] = useState(false);
  const [mobilePickerOpen, setMobilePickerOpen] = useState(false);

  // Ghi nhận sự thay đổi của name để sinh slug tự động nếu ở chế độ tạo mới
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

  // Tạo map O(1) để lấy url ảnh từ mediaId
  const imageMap = useMemo(() => {
    const map = new Map<string, MediaItem>();
    (images ?? []).forEach((img) => map.set(String(img._id), img));
    return map;
  }, [images]);

  const selectedThumb = values.thumbnailId ? imageMap.get(values.thumbnailId) ?? null : null;
  const selectedLaptop = values.screenshotLaptopId ? imageMap.get(values.screenshotLaptopId) ?? null : null;
  const selectedMobile = values.screenshotMobileId ? imageMap.get(values.screenshotMobileId) ?? null : null;

  function update(field: keyof WebDemoFormValues, value: any) {
    if (field === "slug") {
      setSlugDirty(true);
      setValues((prev) => ({ ...prev, slug: String(value) }));
      return;
    }

    if (field === "title") {
      const nextTitle = String(value);
      setValues((prev) => {
        const next = { ...prev, title: nextTitle };
        if (!slugDirty && mode === "new") {
          next.slug = slugify(nextTitle);
        }
        return next;
      });
      return;
    }

    setValues((prev) => ({ ...prev, [field]: value }));
  }


  // Render preview các tag badge từ chuỗi tags
  const tagsList = useMemo(() => {
    return values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [values.tags]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b pb-4 bg-muted/5 p-3 rounded-lg border border-border">
          <div>
            <h3 className="text-sm font-semibold">Cấu hình thông tin giao diện</h3>
            <p className="text-xs text-muted-foreground">Tự động soạn thảo dữ liệu bằng AI hoặc điền các trường bên dưới.</p>
          </div>
          <AiWebDemoImportDialog onApply={handleAiApply} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tiêu đề giao diện <span className="text-destructive">*</span>
            </label>
            <Input
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Ví dụ: Dr. Thoang DermaCos Cần Thơ"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Slug <span className="text-destructive">*</span>
            </label>
            <Input
              value={values.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="vi-du-dr-thoang-dermacos"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mô tả ngắn (Summary)</label>
          <Textarea
            value={values.summary}
            onChange={(e) => update("summary", e.target.value)}
            placeholder="Mô tả ngắn gọn hiển thị ngoài danh sách..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mô tả chi tiết (Description)</label>
          <Textarea
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Mô tả đầy đủ chi tiết các tính năng, điểm nhấn giao diện..."
            rows={4}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Link xem demo trực tiếp (Preview URL)</label>
            <Input
              value={values.previewUrl}
              onChange={(e) => update("previewUrl", e.target.value)}
              placeholder="https://drthoang.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (cách nhau bởi dấu phẩy)</label>
            <Input
              value={values.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="Spa & Làm đẹp, Nha khoa & Y tế"
            />
            {tagsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tagsList.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Phần Stats động */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold">Chỉ số cấu trúc Theme (Stats)</h3>
              <p className="text-xs text-muted-foreground">Tối đa 4 chỉ số. Tự đết label (VD: Sections, Trang mẫu, Popup...).</p>
            </div>
            {values.stats.length < 4 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => update("stats", [...values.stats, { label: "", value: "" }])}
              >
                <Plus className="mr-1 size-3.5" /> Thêm chỉ số
              </Button>
            )}
          </div>
          {values.stats.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
              Chưa có chỉ số nào. Nhấn "Thêm chỉ số" để bắt đầu.
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              {values.stats.map((stat, idx) => (
                <div key={idx} className="space-y-1.5 rounded-lg border p-3 relative bg-muted/20">
                  <button
                    type="button"
                    onClick={() => update("stats", values.stats.filter((_, i) => i !== idx))}
                    className="absolute right-1.5 top-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                  <Input
                    value={stat.label}
                    onChange={(e) => update("stats", values.stats.map((s, i) => i === idx ? { ...s, label: e.target.value } : s))}
                    placeholder="Sections"
                    className="h-7 text-xs"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={stat.value}
                    onChange={(e) => update("stats", values.stats.map((s, i) => i === idx ? { ...s, value: e.target.value } : s))}
                    placeholder="12"
                    className="h-7 text-xs font-bold"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Đặc điểm nổi bật */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Đặc điểm nổi bật (mỗi dòng 1 đặc điểm)</label>
          <Textarea
            value={values.features}
            onChange={(e) => update("features", e.target.value)}
            placeholder="Tương thích 100% Mobile&#10;Chuẩn SEO Google&#10;Tốc độ load cực nhanh"
            rows={3}
          />
        </div>

        {/* Mockup & Media */}
        <div className="border-t pt-6">
          <h3 className="text-base font-semibold mb-4">Hình ảnh giao diện mẫu</h3>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Thumbnail */}
            <WebDemoImageUploader
              label="Ảnh Card Thumbnail"
              value={values.thumbnailId}
              imageUrl={selectedThumb?.url}
              onChange={(id) => update("thumbnailId", id)}
              onRemove={() => update("thumbnailId", "")}
              onOpenPicker={() => setThumbPickerOpen(true)}
              aspectRatio={4 / 3}
            />

            {/* Laptop Mockup */}
            <WebDemoImageUploader
              label="Mockup Laptop"
              value={values.screenshotLaptopId}
              imageUrl={selectedLaptop?.url}
              onChange={(id) => update("screenshotLaptopId", id)}
              onRemove={() => update("screenshotLaptopId", "")}
              onOpenPicker={() => setLaptopPickerOpen(true)}
              aspectRatio={16 / 9}
            />

            {/* Mobile Mockup */}
            <WebDemoImageUploader
              label="Mockup Mobile"
              value={values.screenshotMobileId}
              imageUrl={selectedMobile?.url}
              onChange={(id) => update("screenshotMobileId", id)}
              onRemove={() => update("screenshotMobileId", "")}
              onOpenPicker={() => setMobilePickerOpen(true)}
              aspectRatio={9 / 16}
            />
          </div>
        </div>


        {/* Buttons lưu */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="active"
              checked={values.active}
              onCheckedChange={(checked) => update("active", !!checked)}
            />
            <label htmlFor="active" className="text-sm font-medium text-muted-foreground">
              Đang hiển thị mẫu giao diện này
            </label>
          </div>
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Hủy
              </Button>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Đang lưu..." : submitLabel}
            </Button>
          </div>
        </div>
      </form>

      {/* dialogs */}
      <MediaPickerDialog
        open={thumbPickerOpen}
        onOpenChange={setThumbPickerOpen}
        title="Chọn ảnh Card Thumbnail"
        selectedId={values.thumbnailId}
        onSelect={(item) => update("thumbnailId", String(item._id))}
      />

      <MediaPickerDialog
        open={laptopPickerOpen}
        onOpenChange={setLaptopPickerOpen}
        title="Chọn ảnh Mockup Laptop"
        selectedId={values.screenshotLaptopId}
        onSelect={(item) => update("screenshotLaptopId", String(item._id))}
      />

      <MediaPickerDialog
        open={mobilePickerOpen}
        onOpenChange={setMobilePickerOpen}
        title="Chọn ảnh Mockup Mobile"
        selectedId={values.screenshotMobileId}
        onSelect={(item) => update("screenshotMobileId", String(item._id))}
      />

    </>
  );
}
