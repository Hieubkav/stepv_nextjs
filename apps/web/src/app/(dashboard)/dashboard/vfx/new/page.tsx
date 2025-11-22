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
  previewVideoId: "",
  downloadFileId: "",
  downloadMode: "media",
  downloadLink: "",
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
    const previewVideoId = values.previewVideoId.trim();
    let downloadFileId = values.downloadFileId.trim();

    if (!title || !slug || !previewVideoId) {
      toast.error("Vui lòng nhập Title và preview video (slug tự sinh)");
      return;
    }

    if (values.downloadMode === "media") {
      if (!downloadFileId) {
        toast.error("Vui lòng chọn file download từ Media");
        return;
      }
    } else {
      const link = values.downloadLink.trim();
      if (!link) {
        toast.error("Nhập link download ngoài");
        return;
      }
      try {
        downloadFileId = (await createMediaLink({ externalUrl: link, title: title || undefined })) as any;
      } catch (error: any) {
        toast.error(error?.message ?? "Không tạo được media cho link download");
        return;
      }
    }

    if (!downloadFileId) {
      toast.error("Thiếu file download");
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

      await createVfx({
        slug,
        title,
        subtitle: values.subtitle.trim() || undefined,
        description: values.description.trim() || undefined,
        category: values.category as any,
        thumbnailId: values.thumbnailId ? (values.thumbnailId as any) : undefined,
        previewVideoId: previewVideoId as any,
        downloadFileId: downloadFileId as any,
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
