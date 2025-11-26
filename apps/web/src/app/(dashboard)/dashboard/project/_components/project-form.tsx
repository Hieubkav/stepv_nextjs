"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FullRichEditor } from "@/components/ui/full-rich-editor";
import { MediaPickerDialog, type MediaItem } from "@/components/media/media-picker-dialog";
import { Badge } from "@/components/ui/badge";
import { MoveUp, MoveDown, Trash2, Image as ImageIcon, Video } from "lucide-react";

export type ProjectImageForm = {
  id?: string;
  mediaId: string;
  caption: string;
  altText: string;
  order: number;
  active: boolean;
};

export type ProjectFormValues = {
  title: string;
  content: string;
  categoryId: string;
  thumbnailId: string;
  videoMediaId: string;
  videoUrl: string;
  active: boolean;
  images: ProjectImageForm[];
};

export type ProjectFormProps = {
  initialValues: ProjectFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel?: () => void;
  mode?: "new" | "edit";
};

type CategoryOption = {
  _id: Id<"project_categories">;
  name: string;
  active: boolean;
};

const normalizeImages = (list: ProjectImageForm[]) =>
  list
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));

export function ProjectForm({
  initialValues,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  mode = "new",
}: ProjectFormProps) {
  const categories = useQuery(api.projects.listCategories, { includeInactive: true }) as
    | CategoryOption[]
    | undefined;
  const images = useQuery(api.media.list, { kind: "image" }) as MediaItem[] | undefined;
  const videos = useQuery(api.media.list, { kind: "video" }) as MediaItem[] | undefined;

  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const [thumbPickerOpen, setThumbPickerOpen] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const imageMap = useMemo(() => {
    const map = new Map<string, MediaItem>();
    (images ?? []).forEach((img) => map.set(String(img._id), img));
    return map;
  }, [images]);

  const videoMap = useMemo(() => {
    const map = new Map<string, MediaItem>();
    (videos ?? []).forEach((vid) => map.set(String(vid._id), vid));
    return map;
  }, [videos]);

  const selectedThumb = values.thumbnailId ? imageMap.get(values.thumbnailId) ?? null : null;
  const selectedVideo = values.videoMediaId ? videoMap.get(values.videoMediaId) ?? null : null;

  function update(field: keyof ProjectFormValues, value: string | boolean | ProjectImageForm[]) {
    if (field === "images") {
      setValues((prev) => ({ ...prev, images: normalizeImages(value as ProjectImageForm[]) }));
      return;
    }
    setValues((prev) => ({ ...prev, [field]: value } as ProjectFormValues));
  }

  function handleAddImage(item: MediaItem) {
    update("images", [
      ...values.images,
      {
        id: undefined,
        mediaId: String(item._id),
        caption: item.title ?? "",
        altText: "",
        order: values.images.length,
        active: true,
      },
    ]);
    setGalleryPickerOpen(false);
  }

  function updateImage(index: number, patch: Partial<ProjectImageForm>) {
    update(
      "images",
      values.images.map((img, idx) => (idx === index ? { ...img, ...patch } : img)),
    );
  }

  function removeImage(index: number) {
    const next = values.images.filter((_, idx) => idx !== index);
    update("images", next);
  }

  function moveImage(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= values.images.length) return;
    const next = values.images.slice();
    [next[index], next[target]] = [next[target], next[index]];
    update("images", next.map((img, idx) => ({ ...img, order: idx })));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Tiêu đề <span className="text-destructive">*</span>
          </label>
          <Input
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Showreel 2025"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Danh mục</label>
          <Select
            value={values.categoryId || "none"}
            onValueChange={(val) => update("categoryId", val === "none" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Không phân loại —</SelectItem>
              {(categories ?? []).map((cat) => (
                <SelectItem key={String(cat._id)} value={String(cat._id)}>
                  {cat.name}
                  {cat.active ? "" : " (ẩn)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nội dung chi tiết</label>
          <FullRichEditor
            value={values.content}
            onChange={(html) => update("content", html)}
            placeholder="Viết nội dung giới thiệu dự án..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thumbnail</label>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setThumbPickerOpen(true)}>
                Chọn từ media
              </Button>
              {selectedThumb ? (
                <Badge variant="outline" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  {selectedThumb.title || selectedThumb._id}
                </Badge>
              ) : values.thumbnailId ? (
                <span className="text-xs text-muted-foreground">{values.thumbnailId}</span>
              ) : null}
            </div>
            <Input
              value={values.thumbnailId}
              onChange={(e) => update("thumbnailId", e.target.value)}
              placeholder="media id..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Video</label>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setVideoPickerOpen(true)}>
                Chọn video media
              </Button>
              {selectedVideo ? (
                <Badge variant="outline" className="gap-2">
                  <Video className="h-4 w-4" />
                  {selectedVideo.title || selectedVideo._id}
                </Badge>
              ) : values.videoMediaId ? (
                <span className="text-xs text-muted-foreground">{values.videoMediaId}</span>
              ) : null}
            </div>
            <Input
              value={values.videoMediaId}
              onChange={(e) => update("videoMediaId", e.target.value)}
              placeholder="media id video..."
            />
            <Input
              className="mt-2"
              value={values.videoUrl}
              onChange={(e) => update("videoUrl", e.target.value)}
              placeholder="Hoặc link video (YouTube, Vimeo, Drive...)"
            />
            <p className="text-xs text-muted-foreground">
              Ưu tiên video trong media, sau đó đến link ngoài.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Thư viện ảnh</h3>
              <p className="text-sm text-muted-foreground">
                Ảnh sẽ hiển thị ở trang chi tiết. Sắp xếp bằng cách kéo lên/xuống.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => setGalleryPickerOpen(true)}>
              Thêm ảnh
            </Button>
          </div>

          {values.images.length === 0 ? (
            <div className="rounded border border-dashed p-4 text-sm text-muted-foreground">
              Chưa có ảnh nào.
            </div>
          ) : (
            <div className="space-y-3">
              {values.images.map((img, index) => {
                const media = imageMap.get(img.mediaId);
                return (
                  <div
                    key={`${img.mediaId}-${index}`}
                    className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-24 overflow-hidden rounded border bg-muted/40">
                        {media?.url ? (
                          <img
                            src={media.url}
                            alt={img.altText || media.title || "gallery image"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {media?.title || img.caption || img.mediaId}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{img.mediaId}</div>
                      </div>
                    </div>

                    <div className="grid flex-1 gap-2 md:grid-cols-2">
                      <Input
                        value={img.caption}
                        onChange={(e) => updateImage(index, { caption: e.target.value })}
                        placeholder="Caption"
                      />
                      <Input
                        value={img.altText}
                        onChange={(e) => updateImage(index, { altText: e.target.value })}
                        placeholder="Alt text"
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={img.active}
                          onCheckedChange={(checked) => updateImage(index, { active: !!checked })}
                        />
                        <span className="text-sm text-muted-foreground">Hiển thị</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:flex-col">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveImage(index, "up")}
                        disabled={index === 0}
                        title="Lên"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveImage(index, "down")}
                        disabled={index === values.images.length - 1}
                        title="Xuống"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeImage(index)}
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="active"
              checked={values.active}
              onCheckedChange={(checked) => update("active", !!checked)}
            />
            <label htmlFor="active" className="text-sm text-muted-foreground">
              Hiển thị dự án
            </label>
          </div>
          <div className="flex items-center gap-2">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Hủy
              </Button>
            ) : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Đang lưu..." : submitLabel}
            </Button>
          </div>
        </div>
      </form>

      <MediaPickerDialog
        open={thumbPickerOpen}
        onOpenChange={setThumbPickerOpen}
        title="Chọn thumbnail"
        selectedId={values.thumbnailId}
        onSelect={(item) => update("thumbnailId", String(item._id))}
      />

      <MediaPickerDialog
        open={galleryPickerOpen}
        onOpenChange={setGalleryPickerOpen}
        title="Chọn ảnh cho gallery"
        selectedId={null}
        onSelect={handleAddImage}
      />

      <MediaPickerDialog
        open={videoPickerOpen}
        onOpenChange={setVideoPickerOpen}
        title="Chọn video"
        selectedId={values.videoMediaId}
        onSelect={(item) => update("videoMediaId", String(item._id))}
        kind="video"
      />
    </>
  );
}

