"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FullRichEditor } from "@/components/ui/full-rich-editor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@dohy/backend/convex/_generated/api";
import { Image as ImageIcon, X, Plus } from "lucide-react";
import { toast } from "sonner";

export type PostFormValues = {
  title: string;
  slug: string;
  content: string;
  author: string;
  thumbnailId: string;
  categoryId: string;
  active: boolean;
  order: string;
};

export type PostFormProps = {
  initialValues: PostFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: PostFormValues) => Promise<void>;
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

export function PostForm({ initialValues, submitting, submitLabel, onSubmit, onCancel, mode = "new" }: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>(initialValues);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const images = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;
  const categories = useQuery(api.posts.listPostCategories, { activeOnly: false }) as any[] | undefined;
  const createCategory = useMutation(api.posts.createPostCategory);

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

  const selectedThumbnail = useMemo(() => {
    if (!values.thumbnailId) return null;
    const list = Array.isArray(images) ? images : [];
    return list.find((item) => String(item._id) === String(values.thumbnailId)) ?? null;
  }, [images, values.thumbnailId]);

  function update(field: keyof PostFormValues, value: string | boolean) {
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.thumbnailId) {
      alert("Vui lòng chọn ảnh đại diện cho bài viết");
      return;
    }
    await onSubmit(values);
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setCreatingCategory(true);
    try {
      const nextOrder = categories ? Math.max(0, ...categories.map((c: any) => c.order ?? 0)) + 1 : 0;
      const result = await createCategory({
        name: newCategoryName.trim(),
        slug: slugify(newCategoryName.trim()),
        order: nextOrder,
        active: true,
      });

      if (result?._id) {
        update("categoryId", result._id);
        toast.success("Đã tạo danh mục mới");
      }

      setNewCategoryName("");
      setCategoryDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể tạo danh mục");
    } finally {
      setCreatingCategory(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Thông tin cơ bản</h3>
        <div className={`grid gap-4 ${mode === "edit" ? "" : "sm:grid-cols-2"}`}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tiêu đề <span className="text-destructive">*</span></label>
            <Input value={values.title} onChange={(e) => update("title", e.target.value)} required />
          </div>
          {mode !== "edit" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug <span className="text-destructive">*</span></label>
              <Input value={values.slug} onChange={(e) => update("slug", e.target.value)} required />
            </div>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Danh mục</label>
          <div className="flex gap-2">
            <select
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={values.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCategoryDialogOpen(true)}
              title="Tạo danh mục mới"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ảnh đại diện <span className="text-destructive">*</span></label>
          <div className="flex flex-col gap-2">
            {selectedThumbnail ? (
              <div className="relative w-fit group">
                <img
                  src={selectedThumbnail.url}
                  alt="Thumbnail"
                  className="h-32 rounded-md object-cover border"
                />
                <button
                  type="button"
                  onClick={() => update("thumbnailId", "")}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-fit"
                onClick={() => setPickerOpen(true)}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Chọn ảnh đại diện
              </Button>
            )}
            {selectedThumbnail && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit text-xs"
                onClick={() => setPickerOpen(true)}
              >
                Đổi ảnh khác
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nội dung <span className="text-destructive">*</span></label>
          <FullRichEditor
            value={values.content}
            onChange={(html) => update("content", html)}
            placeholder="Viết nội dung bài viết..."
          />
        </div>
      </div>

      {/* Author */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-base font-semibold">Tác giả</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tên tác giả</label>
          <Input
            value={values.author}
            onChange={(e) => update("author", e.target.value)}
            placeholder="Tên tác giả"
          />
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-base font-semibold">Cài đặt</h3>

        {mode !== "edit" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Thứ tự hiển thị</label>
            <Input type="number" value={values.order} onChange={(e) => update("order", e.target.value)} />
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={values.active} onCheckedChange={(checked) => update("active", !!checked)} />
            <span>Xuất bản (hiển thị công khai)</span>
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

      {/* Image Picker Dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chọn ảnh đại diện</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
            {images?.map((image) => (
              <button
                key={image._id}
                type="button"
                onClick={() => {
                  update("thumbnailId", image._id);
                  setPickerOpen(false);
                }}
                className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${
                  values.thumbnailId === image._id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.title || "Image"}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {(!images || images.length === 0) && (
              <p className="col-span-full text-center text-muted-foreground py-8">
                Chưa có ảnh nào. Hãy tải ảnh lên trong phần Media.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo danh mục mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên danh mục <span className="text-destructive">*</span></label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ví dụ: Tin tức, Hướng dẫn..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
              />
              {newCategoryName && (
                <p className="text-xs text-muted-foreground">
                  Slug: {slugify(newCategoryName)}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewCategoryName("");
                  setCategoryDialogOpen(false);
                }}
                disabled={creatingCategory}
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
              >
                {creatingCategory ? "Đang tạo..." : "Tạo danh mục"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
