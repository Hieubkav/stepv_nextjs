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
import { MoveUp, MoveDown, Trash2, Image as ImageIcon, Plus } from "lucide-react";

export type ReviewItem = {
  name: string;
  role?: string;
  avatarUrl?: string;
  comment: string;
  rating: number;
};

export type BlockItem = {
  title: string;
  description?: string;
  imageId?: string;
};

export type WebDemoFormValues = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  thumbnailId: string;
  previewUrl: string;
  screenshotLaptopId: string;
  screenshotMobileId: string;
  sections: string;
  pages: string;
  popups: string;
  forms: string;
  features: string; // Chuỗi thô phân tách bằng dòng hoặc dấu phẩy
  tags: string;     // Chuỗi thô phân tách bằng dấu phẩy
  active: boolean;
  reviews: ReviewItem[];
  blocks: BlockItem[];
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
  
  // States cho các Dialog chọn ảnh
  const [thumbPickerOpen, setThumbPickerOpen] = useState(false);
  const [laptopPickerOpen, setLaptopPickerOpen] = useState(false);
  const [mobilePickerOpen, setMobilePickerOpen] = useState(false);
  const [blockPickerOpen, setBlockPickerOpen] = useState(false);
  
  // State lưu index của block đang được chọn ảnh
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);

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

  // Quản lý Reviews động
  function handleAddReview() {
    update("reviews", [
      ...values.reviews,
      { name: "", role: "", comment: "", rating: 5 },
    ]);
  }

  function updateReview(index: number, patch: Partial<ReviewItem>) {
    update(
      "reviews",
      values.reviews.map((rev, idx) => (idx === index ? { ...rev, ...patch } : rev))
    );
  }

  function removeReview(index: number) {
    update("reviews", values.reviews.filter((_, idx) => idx !== index));
  }

  // Quản lý Blocks động
  function handleAddBlock() {
    update("blocks", [
      ...values.blocks,
      { title: "", description: "", imageId: "" },
    ]);
  }

  function updateBlock(index: number, patch: Partial<BlockItem>) {
    update(
      "blocks",
      values.blocks.map((blk, idx) => (idx === index ? { ...blk, ...patch } : blk))
    );
  }

  function removeBlock(index: number) {
    update("blocks", values.blocks.filter((_, idx) => idx !== index));
  }

  function moveBlock(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= values.blocks.length) return;
    const next = values.blocks.slice();
    [next[index], next[target]] = [next[target], next[index]];
    update("blocks", next);
  }

  function openBlockImagePicker(index: number) {
    setActiveBlockIndex(index);
    setBlockPickerOpen(true);
  }

  function handleSelectBlockImage(item: MediaItem) {
    if (activeBlockIndex !== null) {
      updateBlock(activeBlockIndex, { imageId: String(item._id) });
    }
    setBlockPickerOpen(false);
    setActiveBlockIndex(null);
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

        {/* Phần Stats */}
        <div className="border-t pt-4">
          <h3 className="text-base font-semibold mb-3">Chỉ số cấu trúc Theme (Stats)</h3>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Số Sections</label>
              <Input
                type="number"
                min={0}
                value={values.sections}
                onChange={(e) => update("sections", e.target.value)}
                placeholder="11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Số Pages</label>
              <Input
                type="number"
                min={0}
                value={values.pages}
                onChange={(e) => update("pages", e.target.value)}
                placeholder="22"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Số Popups</label>
              <Input
                type="number"
                min={0}
                value={values.popups}
                onChange={(e) => update("popups", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Số Forms</label>
              <Input
                type="number"
                min={0}
                value={values.forms}
                onChange={(e) => update("forms", e.target.value)}
                placeholder="11"
              />
            </div>
          </div>
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
        <div className="border-t pt-4">
          <h3 className="text-base font-semibold mb-4">Hình ảnh giao diện mẫu</h3>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Thumbnail */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Ảnh Card Thumbnail</label>
              {selectedThumb ? (
                <div className="space-y-2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted/40">
                    <img src={selectedThumb.url} alt="Thumbnail" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setThumbPickerOpen(true)}>
                      Đổi ảnh
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => update("thumbnailId", "")}>
                      Xóa
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/20 hover:bg-muted/40"
                  onClick={() => setThumbPickerOpen(true)}
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">Chọn ảnh Card</span>
                </div>
              )}
            </div>

            {/* Laptop Mockup */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Mockup Laptop</label>
              {selectedLaptop ? (
                <div className="space-y-2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted/40">
                    <img src={selectedLaptop.url} alt="Laptop Mockup" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setLaptopPickerOpen(true)}>
                      Đổi ảnh
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => update("screenshotLaptopId", "")}>
                      Xóa
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/20 hover:bg-muted/40"
                  onClick={() => setLaptopPickerOpen(true)}
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">Chọn ảnh Laptop</span>
                </div>
              )}
            </div>

            {/* Mobile Mockup */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Mockup Mobile</label>
              {selectedMobile ? (
                <div className="space-y-2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted/40">
                    <img src={selectedMobile.url} alt="Mobile Mockup" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setMobilePickerOpen(true)}>
                      Đổi ảnh
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => update("screenshotMobileId", "")}>
                      Xóa
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/20 hover:bg-muted/40"
                  onClick={() => setMobilePickerOpen(true)}
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">Chọn ảnh Mobile</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danh sách Blocks */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Các Block giao diện cấu thành</h3>
              <p className="text-xs text-muted-foreground">Các khối sections chính cấu tạo nên giao diện này.</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleAddBlock}>
              <Plus className="mr-1.5 size-4" /> Thêm Block
            </Button>
          </div>

          {values.blocks.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Chưa có block nào. Nhấn nút "Thêm Block" để bắt đầu cấu trúc.
            </div>
          ) : (
            <div className="space-y-3">
              {values.blocks.map((blk, idx) => {
                const blockImage = blk.imageId ? imageMap.get(blk.imageId) ?? null : null;
                return (
                  <div key={idx} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-16 w-24 overflow-hidden rounded border bg-muted/40 flex items-center justify-center cursor-pointer"
                        onClick={() => openBlockImagePicker(idx)}
                      >
                        {blockImage?.url ? (
                          <img src={blockImage.url} alt="Block img" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                    </div>

                    <div className="grid flex-1 gap-2 sm:grid-cols-2">
                      <Input
                        value={blk.title}
                        onChange={(e) => updateBlock(idx, { title: e.target.value })}
                        placeholder="Tiêu đề Block (VD: Hero Section)"
                        required
                      />
                      <Input
                        value={blk.description || ""}
                        onChange={(e) => updateBlock(idx, { description: e.target.value })}
                        placeholder="Mô tả block..."
                      />
                    </div>

                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveBlock(idx, "up")}
                        disabled={idx === 0}
                      >
                        <MoveUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveBlock(idx, "down")}
                        disabled={idx === values.blocks.length - 1}
                      >
                        <MoveDown className="size-4" />
                      </Button>
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeBlock(idx)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Danh sách Reviews */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Phản hồi của khách hàng</h3>
              <p className="text-xs text-muted-foreground">Đánh giá và cảm nhận thực tế của khách dùng giao diện này.</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleAddReview}>
              <Plus className="mr-1.5 size-4" /> Thêm Phản Hồi
            </Button>
          </div>

          {values.reviews.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Chưa có phản hồi nào. Nhấn "Thêm Phản Hồi" để nhập đánh giá.
            </div>
          ) : (
            <div className="space-y-4">
              {values.reviews.map((rev, idx) => (
                <div key={idx} className="rounded-lg border p-4 space-y-3 relative bg-muted/10">
                  <div className="absolute right-3 top-3">
                    <Button type="button" variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => removeReview(idx)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Tên khách hàng</label>
                      <Input
                        value={rev.name}
                        onChange={(e) => updateReview(idx, { name: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Chức danh / Vai trò</label>
                      <Input
                        value={rev.role || ""}
                        onChange={(e) => updateReview(idx, { role: e.target.value })}
                        placeholder="Bác sĩ điều hành"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Đánh giá (1-5 Sao)</label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={rev.rating}
                        onChange={(e) => updateReview(idx, { rating: Number(e.target.value) })}
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value="4">⭐⭐⭐⭐ (4/5)</option>
                        <option value="3">⭐⭐⭐ (3/5)</option>
                        <option value="2">⭐⭐ (2/5)</option>
                        <option value="1">⭐ (1/5)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Link Avatar ảnh đại diện</label>
                      <Input
                        value={rev.avatarUrl || ""}
                        onChange={(e) => updateReview(idx, { avatarUrl: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Nội dung cảm nhận</label>
                      <Input
                        value={rev.comment}
                        onChange={(e) => updateReview(idx, { comment: e.target.value })}
                        placeholder="Giao diện chạy nhanh, thiết kế rất chuyên nghiệp..."
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      <MediaPickerDialog
        open={blockPickerOpen}
        onOpenChange={setBlockPickerOpen}
        title="Chọn ảnh Block minh họa"
        selectedId={activeBlockIndex !== null ? values.blocks[activeBlockIndex]?.imageId : null}
        onSelect={handleSelectBlockImage}
      />
    </>
  );
}
