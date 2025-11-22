"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaPickerDialog, type MediaItem } from "@/components/media/media-picker-dialog";
import { Badge } from "@/components/ui/badge";
import { Video, Image as ImageIcon, UploadCloud, Trash2 } from "lucide-react";

export type VfxFormValues = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string;
  pricingType: "free" | "paid";
  price: string;
  originalPrice: string;
  duration: string;
  resolution: string;
  frameRate: string;
  format: string;
  hasAlpha: boolean;
  fileSize: string;
  order: string;
  active: boolean;
  thumbnailId: string;
  previewVideoId: string;
  downloadFileId: string;
  downloadMode: "media" | "link";
  downloadLink: string;
  tags: string;
};

export type VfxFormProps = {
  initialValues: VfxFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: VfxFormValues) => Promise<void>;
  onCancel?: () => void;
  mode?: "new" | "edit";
};

const categoryOptions = [
  { label: "Explosion", value: "explosion" },
  { label: "Fire", value: "fire" },
  { label: "Smoke", value: "smoke" },
  { label: "Water", value: "water" },
  { label: "Magic", value: "magic" },
  { label: "Particle", value: "particle" },
  { label: "Transition", value: "transition" },
  { label: "Other", value: "other" },
];

const pricingOptions: { label: string; value: "free" | "paid" }[] = [
  { label: "Miễn phí", value: "free" },
  { label: "Trả phí", value: "paid" },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[`\-?]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();

const digitsOnly = (value: string) => value.replace(/\D/g, "");
const formatCurrency = (value: string) => {
  if (value === "") return "";
  const num = Number(digitsOnly(value) || "0");
  return num.toLocaleString("vi-VN");
};

export function VfxForm({ initialValues, submitting, submitLabel, onSubmit, onCancel, mode = "new" }: VfxFormProps) {
  const [values, setValues] = useState<VfxFormValues>(initialValues);
  const [thumbPickerOpen, setThumbPickerOpen] = useState(false);
  const [previewPickerOpen, setPreviewPickerOpen] = useState(false);
  const [downloadPickerOpen, setDownloadPickerOpen] = useState(false);

  const images = useQuery(api.media.list, { kind: "image" }) as MediaItem[] | undefined;
  const videos = useQuery(api.media.list, { kind: "video" }) as MediaItem[] | undefined;
  const allMedia = useQuery(api.media.list, {}) as MediaItem[] | undefined;

  const selectedThumb = useMemo(() => {
    if (!values.thumbnailId || !Array.isArray(images)) return null;
    return images.find((img) => String(img._id) === values.thumbnailId) ?? null;
  }, [images, values.thumbnailId]);

  const selectedPreview = useMemo(() => {
    if (!values.previewVideoId || !Array.isArray(videos)) return null;
    return videos.find((m) => String(m._id) === values.previewVideoId) ?? null;
  }, [videos, values.previewVideoId]);

  const selectedDownload = useMemo(() => {
    if (!values.downloadFileId || !Array.isArray(allMedia)) return null;
    return allMedia.find((m) => String(m._id) === values.downloadFileId) ?? null;
  }, [allMedia, values.downloadFileId]);

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

  function update(field: keyof VfxFormValues, value: string | boolean) {
    if (field === "slug") {
      setSlugDirty(true);
      setValues((prev) => ({ ...prev, slug: String(value) }));
      return;
    }

    if (field === "title") {
      const nextTitle = String(value);
      setValues((prev) => {
        const next = { ...prev, title: nextTitle } as VfxFormValues;
        if (!slugDirty) {
          next.slug = slugify(nextTitle);
        }
        return next;
      });
      return;
    }

    setValues((prev) => ({ ...prev, [field]: value } as VfxFormValues));
  }

  function handleSelectThumb(item: MediaItem) {
    setValues((prev) => ({ ...prev, thumbnailId: String(item._id) }));
  }

  function handleSelectPreview(item: MediaItem) {
    setValues((prev) => ({ ...prev, previewVideoId: String(item._id) }));
  }

  function handleSelectDownload(item: MediaItem) {
    setValues((prev) => ({ ...prev, downloadFileId: String(item._id), downloadMode: "media", downloadLink: "" }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  function handleMoneyChange(field: "price" | "originalPrice") {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const digits = digitsOnly(event.target.value);
      setValues((prev) => ({ ...prev, [field]: digits }));
    };
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-4">
          <h3 className="text-base font-semibold">Thông tin cơ bản</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tên VFX <span className="text-destructive">*</span>
              </label>
              <Input value={values.title} onChange={(e) => update("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Danh mục</label>
              <Select value={values.category} onValueChange={(val) => update("category", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subtitle</label>
            <Input value={values.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả</label>
            <Textarea
              rows={4}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Mô tả ngắn gọn về hiệu ứng..."
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-semibold">Media</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-medium">Thumbnail</label>
              <div className="flex flex-col gap-3 rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setThumbPickerOpen(true)}>
                    Chọn ảnh
                  </Button>
                  {values.thumbnailId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => update("thumbnailId", "")}
                      className="text-muted-foreground"
                    >
                      Bỏ chọn
                    </Button>
                  )}
                </div>
                {selectedThumb ? (
                  <div className="flex items-center gap-3 rounded border p-2 text-xs">
                    <img
                      src={selectedThumb.url}
                      alt={selectedThumb.title ?? "Thumbnail"}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium">{selectedThumb.title ?? "Không tên"}</p>
                      <p className="text-muted-foreground">{selectedThumb._id}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Chưa chọn thumbnail.</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Preview video</label>
              <div className="flex flex-col gap-3 rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setPreviewPickerOpen(true)}>
                    Chọn video
                  </Button>
                  {values.previewVideoId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => update("previewVideoId", "")}
                      className="text-muted-foreground"
                    >
                      Bỏ chọn
                    </Button>
                  )}
                </div>
                {selectedPreview ? (
                  <div className="flex items-center gap-3 rounded border p-2 text-xs">
                    <div className="h-12 w-20 overflow-hidden rounded bg-black/80 text-white">
                      {selectedPreview.url ? (
                        <video src={selectedPreview.url} className="h-full w-full object-cover" preload="metadata" muted />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center gap-1 text-[11px]">
                          <Video className="h-4 w-4" /> Link
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{selectedPreview.title ?? "Không tên"}</p>
                      <p className="text-muted-foreground break-all">{selectedPreview._id}</p>
                    </div>
                    {selectedPreview.externalUrl && (
                      <Badge variant="outline" className="text-[11px]">
                        Link ngoài
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Chưa chọn video preview (bắt buộc).</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">File download</label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={values.downloadMode === "media" ? "default" : "outline"}
                onClick={() => setValues((prev) => ({ ...prev, downloadMode: "media" }))}
              >
                Chọn từ Media
              </Button>
              <Button
                type="button"
                size="sm"
                variant={values.downloadMode === "link" ? "default" : "outline"}
                onClick={() => setValues((prev) => ({ ...prev, downloadMode: "link", downloadFileId: "" }))}
              >
                Link riêng
              </Button>
            </div>

            {values.downloadMode === "media" ? (
              <div className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setDownloadPickerOpen(true)}>
                    <UploadCloud className="h-4 w-4 mr-1" />
                    Chọn media
                  </Button>
                  {values.downloadFileId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => update("downloadFileId", "")}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Bỏ chọn
                    </Button>
                  )}
                </div>
                {selectedDownload ? (
                  <div className="flex items-center gap-3 rounded border p-2 text-xs">
                    <div className="h-12 w-16 rounded bg-muted/60 text-muted-foreground flex items-center justify-center overflow-hidden">
                      {selectedDownload.kind === "image" && selectedDownload.url ? (
                        <img src={selectedDownload.url} alt="download" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex items-center gap-1 text-[11px]">
                          {selectedDownload.kind === "video" ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                          <span>{selectedDownload.kind ?? "file"}</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{selectedDownload.title ?? "Không tên"}</p>
                      <p className="text-muted-foreground break-all">{selectedDownload._id}</p>
                    </div>
                    {selectedDownload.externalUrl && (
                      <Badge variant="outline" className="text-[11px]">
                        Link
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Chưa chọn file download. Hãy chọn video/file từ Media.</p>
                )}
              </div>
            ) : (
              <div className="space-y-2 rounded-lg border p-3">
                <Input
                  type="url"
                  placeholder="https://... (Google Drive, S3, v.v.)"
                  value={values.downloadLink}
                  onChange={(e) => setValues((prev) => ({ ...prev, downloadLink: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Link ngoài. Khi lưu hệ thống sẽ tạo bản ghi Media (video/link) và gán tự động.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-semibold">Giá & hiển thị</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại giá</label>
              <Select value={values.pricingType} onValueChange={(val) => update("pricingType", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn" />
                </SelectTrigger>
                <SelectContent>
                  {pricingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá bán</label>
              <Input
                inputMode="numeric"
                value={formatCurrency(values.price)}
                onChange={handleMoneyChange("price")}
                disabled={values.pricingType === "free"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá gốc (tuỳ chọn)</label>
              <Input
                inputMode="numeric"
                value={formatCurrency(values.originalPrice)}
                onChange={handleMoneyChange("originalPrice")}
                disabled={values.pricingType === "free"}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Checkbox id="active" checked={values.active} onCheckedChange={(checked) => update("active", Boolean(checked))} />
            <label htmlFor="active" className="text-sm font-medium">
              Hiển thị (active)
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-semibold">Thông số kỹ thuật</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Độ phân giải</label>
              <Input value={values.resolution} onChange={(e) => update("resolution", e.target.value)} placeholder="Ví dụ: 1920x1080" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kích thước file (MB)</label>
              <Input type="number" min="0" step="0.1" value={values.fileSize} onChange={(e) => update("fileSize", e.target.value)} />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitLabel}
          </Button>
        </div>
      </form>

      <MediaPickerDialog
        open={thumbPickerOpen}
        onOpenChange={setThumbPickerOpen}
        onSelect={handleSelectThumb}
        selectedId={values.thumbnailId}
        title="Chọn thumbnail"
      />
      <MediaPickerDialog
        open={previewPickerOpen}
        onOpenChange={setPreviewPickerOpen}
        onSelect={handleSelectPreview}
        selectedId={values.previewVideoId}
        title="Chọn video preview"
        kind="video"
      />
      <MediaPickerDialog
        open={downloadPickerOpen}
        onOpenChange={setDownloadPickerOpen}
        onSelect={handleSelectDownload}
        selectedId={values.downloadFileId}
        title="Chọn file download"
        kind="all"
      />
    </>
  );
}

