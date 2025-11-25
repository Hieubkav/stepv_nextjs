"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { VfxForm, type VfxFormValues } from "../_components/vfx-form";

const defaultValues: VfxFormValues = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  category: "other",
  pricingType: "paid",
  price: "0",
  originalPrice: "",
  duration: "1",
  resolution: "1920x1080",
  frameRate: "30",
  format: "MOV",
  hasAlpha: true,
  fileSize: "10",
  order: "0",
  active: true,
  thumbnailId: "",
  previews: [],
  downloads: [],
  tags: "",
};

const toNumber = (value: string, fallback = 0) => {
  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function NewVfxPage() {
  const router = useRouter();
  const createVfx = useMutation(api.vfx.createVfxProduct);
  const createMediaLink = useMutation(api.media.createVideo);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: VfxFormValues) {
    const title = values.title.trim();
    const slug = values.slug.trim().toLowerCase();
    const activePreviews = values.previews.filter((item) => item.active);
    const activeDownloads = values.downloads.filter((item) => item.active);

    if (!title || !slug) {
      toast.error("Vui lòng nhập Title và slug hợp lệ");
      return;
    }

    if (!activePreviews.length || !activeDownloads.length) {
      toast.error("Cần ít nhất 1 preview và 1 file download (đang bật)");
      return;
    }

    setSubmitting(true);
    try {
      const price = values.pricingType === "free" ? 0 : Math.max(0, toNumber(values.price));
      const originalPrice =
        values.pricingType === "free" ? undefined : toNumber(values.originalPrice || "", 0) || undefined;
      const duration = Math.max(0.1, toNumber(values.duration, 1));
      const frameRate = Math.max(1, toNumber(values.frameRate, 30));
      const fileSizeBytes = Math.max(0, toNumber(values.fileSize, 0)) * 1024 * 1024;
      const order = toNumber(values.order, 0);
      const tags = values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      async function ensureMediaId(asset: (typeof values.previews)[number]) {
        if (asset.mediaId) return asset.mediaId as any;
        if (asset.source === "link" && asset.url.trim()) {
          return (await createMediaLink({ externalUrl: asset.url.trim(), title: title || undefined })) as any;
        }
        throw new Error("Thiếu media cho asset");
      }

      const allAssets = [...values.previews, ...values.downloads];
      const assetsPayload = [] as any[];
      for (const asset of allAssets) {
        const mediaId = await ensureMediaId(asset);
        assetsPayload.push({
          id: asset.id ? (asset.id as any) : undefined,
          mediaId,
          kind: asset.kind,
          label: asset.label?.trim() || undefined,
          variant: asset.variant?.trim() || undefined,
          isPrimary: Boolean(asset.isPrimary),
          active: asset.active,
          order: asset.order,
        });
      }

      await createVfx({
        slug,
        title,
        subtitle: values.subtitle.trim() || undefined,
        description: values.description.trim() || undefined,
        category: values.category as any,
        thumbnailId: values.thumbnailId ? (values.thumbnailId as any) : undefined,
        pricingType: values.pricingType,
        priceAmount: price,
        comparePriceAmount: originalPrice,
        duration,
        resolution: values.resolution.trim() || "1920x1080",
        frameRate,
        format: values.format.trim() || "MOV",
        hasAlpha: values.hasAlpha,
        fileSize: fileSizeBytes,
        tags,
        order,
        active: values.active,
        assets: assetsPayload,
      } as any);

      toast.success("Đã tạo VFX mới");
      router.push("/dashboard/vfx");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể tạo VFX");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Thêm VFX mới</h1>
        <p className="text-sm text-muted-foreground">Nhập đầy đủ thông tin để xuất bản hiệu ứng trong store.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin VFX</CardTitle>
        </CardHeader>
        <CardContent>
          <VfxForm
            initialValues={defaultValues}
            submitting={submitting}
            submitLabel="Tạo VFX"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/vfx")}
            mode="new"
          />
        </CardContent>
      </Card>
    </div>
  );
}
