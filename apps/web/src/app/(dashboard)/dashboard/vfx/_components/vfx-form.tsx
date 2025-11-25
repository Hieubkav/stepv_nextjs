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
import {
  Video,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Link as LinkIcon,
  MoveUp,
  MoveDown,
  Star,
} from "lucide-react";

export type VfxAssetForm = {
  id?: string;
  mediaId?: string;
  source: "media" | "link";
  url: string;
  label: string;
  variant: string;
  isPrimary: boolean;
  active: boolean;
  order: number;
  kind: "preview" | "download";
};

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
  previews: VfxAssetForm[];
  downloads: VfxAssetForm[];
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

const emptyAsset = (kind: "preview" | "download"): VfxAssetForm => ({
  id: undefined,
  mediaId: "",
  source: "media",
  url: "",
  label: "",
  variant: "",
  isPrimary: false,
  active: true,
  order: 0,
  kind,
});

const normalizeAssetList = (list: VfxAssetForm[]) => {
  if (!list.length) return list;
  const sorted = list
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));
  const primaryIdx = sorted.findIndex((item) => item.isPrimary && item.active);
  const activeIdx = sorted.findIndex((item) => item.active);
  const target = primaryIdx !== -1 ? primaryIdx : activeIdx !== -1 ? activeIdx : 0;
  return sorted.map((item, index) => ({ ...item, isPrimary: index === target }));
};

function AssetBadge({ children }: { children: string }) {
  return <Badge variant="outline" className="text-[11px] px-2 py-0.5">{children}</Badge>;
}

export function VfxForm({ initialValues, submitting, submitLabel, onSubmit, onCancel, mode = "new" }: VfxFormProps) {
  const [values, setValues] = useState<VfxFormValues>(initialValues);
  const [thumbPickerOpen, setThumbPickerOpen] = useState(false);
  const [assetPickerKind, setAssetPickerKind] = useState<"preview" | "download" | null>(null);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState({ preview: "", download: "" });

  const images = useQuery(api.media.list, { kind: "image" }) as MediaItem[] | undefined;
  const videos = useQuery(api.media.list, { kind: "video" }) as MediaItem[] | undefined;
  const allMedia = useQuery(api.media.list, {}) as MediaItem[] | undefined;

  const mediaMap = useMemo(() => {
    const map = new Map<string, MediaItem>();
    (allMedia ?? []).forEach((item) => map.set(String(item._id), item));
    return map;
  }, [allMedia]);

  const selectedThumb = useMemo(() => {
    if (!values.thumbnailId || !Array.isArray(images)) return null;
    return images.find((img) => String(img._id) === values.thumbnailId) ?? null;
  }, [images, values.thumbnailId]);

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

  function update(field: keyof VfxFormValues, value: string | boolean | VfxAssetForm[]) {
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

  function setAssets(kind: "preview" | "download", updater: (list: VfxAssetForm[]) => VfxAssetForm[]) {
    setValues((prev) => {
      const list = kind === "preview" ? prev.previews : prev.downloads;
      const next = normalizeAssetList(updater(list));
      return { ...prev, [kind === "preview" ? "previews" : "downloads"]: next } as VfxFormValues;
    });
  }

  function handleSelectThumb(item: MediaItem) {
    setValues((prev) => ({ ...prev, thumbnailId: String(item._id) }));
  }

  function handleAddMediaAsset(kind: "preview" | "download", item: MediaItem) {
    setAssets(kind, (list) => {
      const next = [
        ...list,
        {
          ...emptyAsset(kind),
          mediaId: String(item._id),
          label: item.title || "",
          source: "media" as const,
          isPrimary: list.length === 0,
        },
      ];
      return next;
    });
  }

  function handleAddLinkAsset(kind: "preview" | "download") {
    const value = linkDraft[kind] || "";
    if (!value.trim()) return;
    setAssets(kind, (list) => {
      const next = [
        ...list,
        { ...emptyAsset(kind), source: "link" as const, url: value.trim(), isPrimary: list.length === 0 },
      ];
      return next;
    });
    setLinkDraft((prev) => ({ ...prev, [kind]: "" }));
  }

  function handleRemoveAsset(kind: "preview" | "download", index: number) {
    setAssets(kind, (list) => list.filter((_, i) => i !== index));
  }

  function handleSetPrimary(kind: "preview" | "download", index: number) {
    setAssets(kind, (list) => list.map((item, i) => ({ ...item, isPrimary: i === index })));
  }

  function handleMove(kind: "preview" | "download", index: number, delta: number) {
    setAssets(kind, (list) => {
      const target = index + delta;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleAssetField(
    kind: "preview" | "download",
    index: number,
    field: keyof Pick<VfxAssetForm, "label" | "variant" | "url">,
    value: string,
  ) {
    setAssets(kind, (list) => list.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function handleToggleActive(kind: "preview" | "download", index: number, checked: boolean) {
    setAssets(kind, (list) => list.map((item, i) => (i === index ? { ...item, active: checked } : item)));
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

  function renderAssetList(kind: "preview" | "download", list: VfxAssetForm[]) {
    if (!list.length) {
      return <p className="text-xs text-muted-foreground">Chưa có {kind === "preview" ? "preview" : "file download"} nào.</p>;
    }

    return (
      <div className="space-y-3">
        {list.map((asset, index) => {
          const media = asset.mediaId ? mediaMap.get(asset.mediaId) : undefined;
          const displayUrl = media?.url || media?.externalUrl || asset.url;
          const kindLabel = kind === "preview" ? "Preview" : "Download";
          return (
            <div key={asset.id ?? `${kind}-${index}`} className="rounded-lg border p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <AssetBadge>{kindLabel}</AssetBadge>
                  {asset.isPrimary && (
                    <Badge className="text-[11px] px-2 py-0.5 bg-amber-500/15 text-amber-600 border border-amber-400/50" variant="outline">
                      <Star className="h-3 w-3 mr-1" /> Mặc định
                    </Badge>
                  )}
                  {!asset.active && <AssetBadge>Ẩn</AssetBadge>}
                  <AssetBadge>{asset.source === "link" ? "Link" : "Media"}</AssetBadge>
                  {media?.externalUrl && <AssetBadge>External</AssetBadge>}
                </div>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleMove(kind, index, -1)} disabled={index === 0}>
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMove(kind, index, 1)}
                    disabled={index === list.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAsset(kind, index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-16 rounded bg-muted/60 text-muted-foreground flex items-center justify-center overflow-hidden">
                  {media?.kind === "image" && media.url ? (
                    <img src={media.url} alt={media.title ?? "asset"} className="h-full w-full object-cover" />
                  ) : media?.kind === "video" && media.url ? (
                    <video src={media.url} className="h-full w-full object-cover" preload="metadata" muted />
                  ) : media?.externalUrl || asset.url ? (
                    <div className="flex items-center gap-1 text-[11px]">
                      <LinkIcon className="h-4 w-4" /> Link
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px]">
                      <ImageIcon className="h-4 w-4" /> --
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <Input
                    placeholder="Nhãn hiển thị (ví dụ: 4K ProRes)"
                    value={asset.label}
                    onChange={(e) => handleAssetField(kind, index, "label", e.target.value)}
                  />
                  <Input
                    placeholder="Biến thể / codec / fps"
                    value={asset.variant}
                    onChange={(e) => handleAssetField(kind, index, "variant", e.target.value)}
                  />
                  {asset.source === "link" && (
                    <Input
                      placeholder="https://..."
                      value={asset.url}
                      onChange={(e) => handleAssetField(kind, index, "url", e.target.value)}
                    />
                  )}
                  {displayUrl && (
                    <a
                      href={displayUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <LinkIcon className="h-3 w-3" /> Mở link
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant={asset.isPrimary ? "default" : "outline"} size="sm" onClick={() => handleSetPrimary(kind, index)}>
                  Đặt làm mặc định
                </Button>
                <div className="flex items-center gap-2 text-sm">
                  <Checkbox checked={asset.active} id={`${kind}-active-${index}`} onCheckedChange={(checked) => handleToggleActive(kind, index, Boolean(checked))} />
                  <label htmlFor={`${kind}-active-${index}`}>Hiển thị</label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
            <Textarea rows={4} value={values.description} onChange={(e) => update("description", e.target.value)} placeholder="Mô tả ngắn gọn về hiệu ứng..." />
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
                    <Button type="button" variant="ghost" size="sm" onClick={() => update("thumbnailId", "")} className="text-muted-foreground">
                      Bỏ chọn
                    </Button>
                  )}
                </div>
                {selectedThumb ? (
                  <div className="flex items-center gap-3 rounded border p-2 text-xs">
                    <img src={selectedThumb.url} alt={selectedThumb.title ?? "Thumbnail"} className="h-12 w-12 rounded object-cover" />
                    <div>
                      <p className="font-medium">{selectedThumb.title ?? "Không tên"}</p>
                      <p className="text-muted-foreground break-all">{selectedThumb._id}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Chưa chọn thumbnail.</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Preview</label>
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAssetPickerKind("preview");
                      setAssetPickerOpen(true);
                    }}
                  >
                    <UploadCloud className="h-4 w-4 mr-1" /> Thêm preview từ Media
                  </Button>
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      placeholder="https://... (Drive, S3, Vimeo)"
                      value={linkDraft.preview}
                      onChange={(e) => setLinkDraft((prev) => ({ ...prev, preview: e.target.value }))}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={() => handleAddLinkAsset("preview")}>
                      Thêm link
                    </Button>
                  </div>
                </div>
                {renderAssetList("preview", values.previews)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">File download</label>
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAssetPickerKind("download");
                    setAssetPickerOpen(true);
                  }}
                >
                  <UploadCloud className="h-4 w-4 mr-1" /> Thêm từ Media
                </Button>
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    placeholder="https://... (Drive, S3, v.v.)"
                    value={linkDraft.download}
                    onChange={(e) => setLinkDraft((prev) => ({ ...prev, download: e.target.value }))}
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => handleAddLinkAsset("download")}>
                    Thêm link
                  </Button>
                </div>
              </div>
              {renderAssetList("download", values.downloads)}
            </div>
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
              <Input inputMode="numeric" value={formatCurrency(values.price)} onChange={handleMoneyChange("price")} disabled={values.pricingType === "free"} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá gốc (tuỳ chọn)</label>
              <Input inputMode="numeric" value={formatCurrency(values.originalPrice)} onChange={handleMoneyChange("originalPrice")} disabled={values.pricingType === "free"} />
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
              Huỷ
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
        kind="image"
      />

      <MediaPickerDialog
        open={assetPickerOpen}
        onOpenChange={(open) => {
          setAssetPickerOpen(open);
          if (!open) setAssetPickerKind(null);
        }}
        onSelect={(item) => {
          if (assetPickerKind) {
            handleAddMediaAsset(assetPickerKind, item);
          }
        }}
        selectedId={""}
        title={assetPickerKind === "preview" ? "Chọn preview" : "Chọn file download"}
        kind={assetPickerKind === "preview" ? "video" : "all"}
      />
    </>
  );
}
