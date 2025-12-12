"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FullRichEditor } from "@/components/ui/full-rich-editor";
import { api } from "@dohy/backend/convex/_generated/api";
import { Image as ImageIcon, X, Play, Package } from "lucide-react";
import { extractYoutubeVideoId, getYoutubeThumbnailUrl } from "@/lib/youtube";
import { normalizeSlug } from "@/lib/slug";

export type CourseFormValues = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  thumbnailMediaId: string;
  introVideoUrl: string;
  pricingType: "free" | "paid";
  priceAmount: string;
  comparePriceAmount: string;
  priceNote: string;
  isPriceVisible: boolean;
  order: string;
  active: boolean;
  softwareIds: string[];
};

export type CourseFormProps = {
  initialValues: CourseFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: CourseFormValues) => Promise<void>;
  onCancel?: () => void;
};

const slugify = normalizeSlug;

const formatCurrency = (input: string) => {
  const number = Number(input);
  if (!Number.isFinite(number)) return input;
  return number.toLocaleString("vi-VN");
};

export function CourseForm({ initialValues, submitting, submitLabel, onSubmit, onCancel }: CourseFormProps) {
  const images = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;
  const softwares = useQuery(api.library.listSoftwares, { activeOnly: false }) as any[] | undefined;
  const [values, setValues] = useState<CourseFormValues>(initialValues);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [softwarePickerOpen, setSoftwarePickerOpen] = useState(false);

  useEffect(() => {
    if (values.pricingType === "free" && (values.priceAmount !== "" || values.comparePriceAmount !== "" || values.isPriceVisible)) {
      setValues((prev) => ({
        ...prev,
        priceAmount: "",
        comparePriceAmount: "",
        isPriceVisible: false,
      }));
    }
  }, [values.pricingType, values.priceAmount, values.comparePriceAmount, values.isPriceVisible]);

  const selectedThumbnail = useMemo(() => {
    if (!values.thumbnailMediaId) return null;
    const list = Array.isArray(images) ? images : [];
    return list.find((item) => String(item._id) === String(values.thumbnailMediaId)) ?? null;
  }, [images, values.thumbnailMediaId]);

  const selectedSoftwares = useMemo(() => {
    if (!values.softwareIds?.length || !softwares) return [];
    const softwareMap = new Map(softwares.map((s: any) => [String(s._id), s]));
    return values.softwareIds.map((id) => softwareMap.get(id)).filter(Boolean);
  }, [values.softwareIds, softwares]);

  useEffect(() => {
    const slugSource = initialValues.slug || initialValues.title || "";
    const sanitizedSlug = slugify(slugSource);
    setValues({
      ...initialValues,
      slug: sanitizedSlug || initialValues.slug || "",
    });
  }, [initialValues]);

  function update(field: keyof CourseFormValues, value: string | boolean | string[]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSoftware(softwareId: string) {
    setValues((prev) => {
      const currentIds = prev.softwareIds || [];
      const exists = currentIds.includes(softwareId);
      const newIds = exists
        ? currentIds.filter((id) => id !== softwareId)
        : [...currentIds, softwareId];
      return { ...prev, softwareIds: newIds };
    });
  }

  function removeSoftware(softwareId: string) {
    setValues((prev) => ({
      ...prev,
      softwareIds: (prev.softwareIds || []).filter((id) => id !== softwareId),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  const youtubeThumbUrl = useMemo(() => getYoutubeThumbnailUrl(values.introVideoUrl, "max"), [values.introVideoUrl]);
  const youtubePreviewUrl = useMemo(() => {
    const videoId = extractYoutubeVideoId(values.introVideoUrl);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }, [values.introVideoUrl]);

  useEffect(() => {
    if (!youtubePreviewUrl) {
      setPreviewOpen(false);
    }
  }, [youtubePreviewUrl]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Thông tin cơ bản</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tiêu đề</label>
            <Input
              value={values.title}
              onChange={(event) => {
                const title = event.target.value;
                update("title", title);
                update("slug", slugify(title));
              }}
              placeholder="Ví dụ: Figma cho người mới"
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
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Link intro video (YouTube)</label>
            <Input
              value={values.introVideoUrl}
              onChange={(event) => update("introVideoUrl", event.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            {youtubeThumbUrl && (
              <div className="mt-2 flex items-center gap-3 rounded-md border border-dashed border-muted-foreground/50 bg-background/80 p-2 text-xs text-muted-foreground">
                <img
                  src={youtubeThumbUrl}
                  alt="YouTube thumbnail"
                  className="h-16 w-28 rounded object-cover"
                />
                <div className="space-y-1 text-left">
                  <button
                    type="button"
                    onClick={() => youtubePreviewUrl && setPreviewOpen(true)}
                    className="flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    <Play className="h-3 w-3" />
                    Xem preview
                  </button>
                  <a
                    href={values.introVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline"
                  >
                    Mở video trên YouTube
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-base font-semibold">Mô tả</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Nội dung mô tả</label>
          <FullRichEditor
            value={values.description}
            onChange={(html) => update("description", html)}
            placeholder="Giới thiệu chi tiết về khóa học này..."
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-base font-semibold">Giá cả</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại giá</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={values.pricingType}
              onChange={(event) => update("pricingType", event.target.value as CourseFormValues["pricingType"])}
            >
              <option value="free">Miễn phí</option>
              <option value="paid">Trả phí</option>
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
            <label className="text-sm font-medium">Giá gốc (để so sánh)</label>
            <Input
              type="number"
              value={values.comparePriceAmount}
              onChange={(event) => update("comparePriceAmount", event.target.value)}
              placeholder="599000"
              disabled={values.pricingType === "free"}
              min="0"
              step="1000"
            />
            {values.pricingType === "paid" && values.comparePriceAmount && (
              <p className="text-xs text-muted-foreground">Hiển thị: {formatCurrency(values.comparePriceAmount)} VND</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Ghi chú về chương trình khuyến mãi</label>
            <Input
              value={values.priceNote}
              onChange={(event) => update("priceNote", event.target.value)}
              placeholder="Ví dụ: Giảm 20% đến 01/10"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={values.isPriceVisible}
              onCheckedChange={(checked) => update("isPriceVisible", Boolean(checked))}
              disabled={values.pricingType === "free"}
            />
            <span>{values.isPriceVisible ? "Hiện giá" : "Ẩn giá"}</span>
          </label>
        </div>
      </div>

      {/* Media */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-base font-semibold">Hình ảnh</h3>
        <div className="space-y-2">
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

      {/* Software */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-base font-semibold">Phần mềm liên quan</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Chọn phần mềm</div>
              <p className="text-xs text-muted-foreground">
                Liên kết khóa học với các phần mềm được sử dụng.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setSoftwarePickerOpen(true)}
            >
              <Package className="mr-2 h-4 w-4" />
              Chọn phần mềm
            </Button>
          </div>
          {selectedSoftwares.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedSoftwares.map((software: any) => (
                <div
                  key={String(software._id)}
                  className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-sm"
                >
                  {software.iconImageId && (
                    <SoftwareIcon iconImageId={software.iconImageId} />
                  )}
                  <span className="font-medium">{software.name}</span>
                  <button
                    type="button"
                    className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                    onClick={() => removeSoftware(String(software._id))}
                    aria-label={`Xóa ${software.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-base font-semibold">Cài đặt</h3>
        <div className="space-y-3">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={values.active}
              onCheckedChange={(checked) => update("active", Boolean(checked))}
            />
            <span>{values.active ? "Khóa học đang hiện" : "Khóa học đang ẩn"}</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : submitLabel}
        </Button>
      </div>

      <Dialog open={previewOpen && Boolean(youtubePreviewUrl)} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Xem intro video</DialogTitle>
          </DialogHeader>
          {youtubePreviewUrl ? (
            <div className="aspect-video overflow-hidden rounded-md bg-black">
              <iframe
                title="Intro video preview"
                src={`${youtubePreviewUrl}?rel=0`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Không thể hiển thị preview. Hãy kiểm tra URL.</p>
          )}
        </DialogContent>
      </Dialog>

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

      <Dialog open={softwarePickerOpen} onOpenChange={setSoftwarePickerOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] md:max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Chọn phần mềm</DialogTitle>
          </DialogHeader>
          
          <CourseSoftwarePicker
            softwares={softwares ?? []}
            selectedIds={values.softwareIds || []}
            onToggle={toggleSoftware}
          />

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSoftwarePickerOpen(false)}
            >
              Đóng
            </Button>
          </div>
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

type CourseSoftwarePickerProps = {
  softwares: any[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

function CourseSoftwarePicker({ softwares, selectedIds, onToggle }: CourseSoftwarePickerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSoftwares = useMemo(() => {
    if (!searchQuery.trim()) return softwares;
    const query = searchQuery.toLowerCase();
    return softwares.filter((software: any) => {
      const name = software.name || "";
      const description = software.description || "";
      return name.toLowerCase().includes(query) || description.toLowerCase().includes(query);
    });
  }, [softwares, searchQuery]);

  const isEmpty = softwares.length === 0;
  const hasNoResults = filteredSoftwares.length === 0 && searchQuery;

  return (
    <div className="space-y-4 flex-1 min-h-0 flex flex-col">
      {/* Search Bar */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Tìm kiếm phần mềm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-8"
          aria-label="Tìm kiếm phần mềm"
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

      {/* Selected count */}
      {selectedIds.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Đã chọn {selectedIds.length} phần mềm
        </p>
      )}

      {/* Softwares List */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Chưa có phần mềm nào
            </p>
            <p className="text-sm text-muted-foreground">
              Hãy tạo phần mềm tại trang Library &gt; Software.
            </p>
          </div>
        ) : hasNoResults ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground/40 mb-4" />
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
          <div className="space-y-2">
            {filteredSoftwares.map((software: any) => {
              const id = String(software._id);
              const isSelected = selectedIds.includes(id);
              return (
                <div
                  key={id}
                  role="button"
                  tabIndex={0}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer
                    hover:border-primary hover:bg-muted/50
                    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                    ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : ""}
                  `}
                  onClick={() => onToggle(id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggle(id);
                    }
                  }}
                  aria-label={`${isSelected ? "Bỏ chọn" : "Chọn"} ${software.name}`}
                  aria-pressed={isSelected}
                >
                  <div className="shrink-0 pointer-events-none">
                    <div className={`size-4 rounded border ${isSelected ? "bg-primary border-primary" : "border-input"} flex items-center justify-center`}>
                      {isSelected && (
                        <svg className="size-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {software.iconImageId && (
                    <SoftwareIcon iconImageId={software.iconImageId} size="md" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{software.name}</p>
                    {software.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {software.description}
                      </p>
                    )}
                  </div>
                  {!software.active && (
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Ẩn
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!isEmpty && (
        <div className="text-sm text-muted-foreground text-center pt-2 border-t">
          Hiển thị {filteredSoftwares.length} phần mềm
          {searchQuery && ` (từ ${softwares.length} tổng cộng)`}
        </div>
      )}
    </div>
  );
}

function SoftwareIcon({ iconImageId, size = "sm" }: { iconImageId: string; size?: "sm" | "md" }) {
  const media = useQuery(api.media.getById, { id: iconImageId as any }) as { url?: string } | null;
  const sizeClass = size === "md" ? "h-10 w-10" : "h-5 w-5";

  if (!media || !media.url) {
    return <Package className={`${sizeClass} text-muted-foreground/40`} />;
  }

  return (
    <img
      src={media.url}
      alt=""
      className={`${sizeClass} rounded object-contain`}
    />
  );
}
