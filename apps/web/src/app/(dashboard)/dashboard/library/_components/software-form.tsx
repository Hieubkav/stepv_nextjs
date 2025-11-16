"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { api } from "@dohy/backend/convex/_generated/api";
import { MediaPickerDialog, type MediaItem } from "@/components/media/media-picker-dialog";

export type SoftwareFormValues = {
  name: string;
  slug: string;
  description: string;
  iconImageId: string;
  order: string;
  active: boolean;
};

export type SoftwareFormProps = {
  initialValues: SoftwareFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: SoftwareFormValues) => Promise<void>;
  onCancel?: () => void;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();

export function SoftwareForm({ initialValues, submitting, submitLabel, onSubmit, onCancel }: SoftwareFormProps) {
  const images = useQuery(api.media.list, { kind: "image" }) as any[] | undefined;
  const [pickerOpen, setPickerOpen] = useState(false);

  const [values, setValues] = useState<SoftwareFormValues>(initialValues);

  const selectedIcon = useMemo(() => {
    if (!values.iconImageId) return null;
    const list = Array.isArray(images) ? images : [];
    const found = list.find((img: any) => String(img._id) === String(values.iconImageId));
    return found ?? null;
  }, [images, values.iconImageId]);

  const shouldSlugStayAuto = useMemo(() => {
    const suggested = slugify(initialValues.name || "");
    if (!initialValues.slug) return true;
    return initialValues.slug === suggested;
  }, [initialValues.slug, initialValues.name]);

  const [slugDirty, setSlugDirty] = useState(!shouldSlugStayAuto);

  useEffect(() => {
    setValues(initialValues);
    const suggested = slugify(initialValues.name || "");
    const auto = !initialValues.slug || initialValues.slug === suggested;
    setSlugDirty(!auto);
  }, [initialValues]);

  function update(field: keyof SoftwareFormValues, value: string | boolean) {
    if (field === "slug") {
      setSlugDirty(true);
      setValues((prev) => ({ ...prev, slug: String(value) }));
      return;
    }

    if (field === "name") {
      const nextName = String(value);
      setValues((prev) => {
        const next = { ...prev, name: nextName };
        if (!slugDirty) {
          next.slug = slugify(nextName);
        }
        return next;
      });
      return;
    }

    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  function handleSelectIcon(item: MediaItem) {
    setValues((prev) => ({ ...prev, iconImageId: String(item._id) }));
  }

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Name</label>
          <Input value={values.name} onChange={(e) => update("name", e.target.value)} required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <Textarea value={values.description} onChange={(e) => update("description", e.target.value)} rows={4} />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Icon media ID</label>
            <Input value={values.iconImageId} onChange={(e) => update("iconImageId", e.target.value)} placeholder="media id..." />
            {values.iconImageId && (
              selectedIcon ? (
                <div className="flex items-center gap-3 rounded border bg-muted/20 p-2">
                  {selectedIcon.url ? (
                    <img src={selectedIcon.url} alt={selectedIcon.title || "icon"} className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded border border-dashed text-[10px] text-muted-foreground">No URL</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{selectedIcon.title || "Icon"}</div>
                    <div className="truncate text-xs text-muted-foreground">{values.iconImageId}</div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => update("iconImageId", "")}>
                    Xóa
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 rounded border border-dashed p-2 text-xs text-muted-foreground">
                  <span className="truncate">Không tìm thấy media: {values.iconImageId}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => update("iconImageId", "")}>
                    Xóa
                  </Button>
                </div>
              )
            )}
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
              Chọn từ media
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={values.active} onCheckedChange={(checked) => update("active", !!checked)} />
            Đang hiển thị
          </label>
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

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Chọn icon phần mềm"
        selectedId={values.iconImageId}
        onSelect={handleSelectIcon}
      />
    </>
  );
}


