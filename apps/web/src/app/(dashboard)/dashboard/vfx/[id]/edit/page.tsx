"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { VfxForm, type VfxFormValues } from "../../_components/vfx-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

const toMb = (bytes?: number) => {
  if (!bytes || bytes <= 0) return "";
  return (bytes / (1024 * 1024)).toFixed(2).replace(/\.0+$/, "");
};

function toInitial(product: any | null): VfxFormValues {
  return {
    title: product?.title ?? "",
    slug: product?.slug ?? "",
    subtitle: product?.subtitle ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "other",
    pricingType: product?.pricingType ?? "paid",
    price: product?.price ? String(product.price) : "",
    originalPrice: product?.originalPrice ? String(product.originalPrice) : "",
    duration: product?.duration ? String(product.duration) : "1",
    resolution: product?.resolution ?? "1920x1080",
    frameRate: product?.frameRate ? String(product.frameRate) : "30",
    format: product?.format ?? "MOV",
    hasAlpha: product?.hasAlpha ?? true,
    fileSize: toMb(product?.fileSize) || "0",
    order: product?.order !== undefined ? String(product.order) : "0",
    active: product?.active ?? true,
    thumbnailId: product?.thumbnailId ? String(product.thumbnailId) : "",
    previewVideoId: product?.previewVideoId ? String(product.previewVideoId) : "",
    downloadFileId: product?.downloadFileId ? String(product.downloadFileId) : "",
    downloadMode: "media",
    downloadLink: "",
    tags: Array.isArray(product?.tags) ? product.tags.join(", ") : "",
  };
}

const toNumber = (value: string, fallback = 0) => {
  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function EditVfxPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const detail = useQuery(api.vfx.getVfxProduct, id ? { id: id as any } : "skip") as any | undefined;
  const updateVfx = useMutation(api.vfx.updateVfxProduct);
  const createMediaLink = useMutation(api.media.createVideo);
  const [submitting, setSubmitting] = useState(false);

  const product = detail ?? null;
  const initialValues = useMemo(() => toInitial(product), [product]);

  if (detail === undefined) {
    return <div className="text-sm text-muted-foreground">Đang tải dữ liệu VFX...</div>;
  }

  if (!product) {
    return <div className="text-sm text-muted-foreground">Không tìm thấy VFX.</div>;
  }

  async function handleSubmit(values: VfxFormValues) {
    const title = values.title.trim();
    const previewVideoId = values.previewVideoId.trim();
    let downloadFileId = values.downloadFileId.trim();

    if (!title || !previewVideoId) {
      toast.error("Vui lòng nhập đầy đủ Title và Preview video");
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
      const comparePrice =
        values.pricingType === "free" ? null : toNumber(values.originalPrice || "", 0) || null;
      const duration = Math.max(0.1, toNumber(values.duration, 1));
      const frameRate = Math.max(1, toNumber(values.frameRate, 30));
      const fileSizeBytes = Math.max(0, toNumber(values.fileSize, 0)) * 1024 * 1024;
      const order = toNumber(values.order, product.order ?? 0);
      const tags = values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await updateVfx({
        id: product._id as any,
        title,
        subtitle: values.subtitle.trim() || null,
        description: values.description.trim() || null,
        category: values.category as any,
        thumbnailId: values.thumbnailId ? (values.thumbnailId as any) : null,
        previewVideoId: previewVideoId as any,
        downloadFileId: downloadFileId as any,
        pricingType: values.pricingType,
        priceAmount: price,
        comparePriceAmount: comparePrice,
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

      toast.success("Đã cập nhật VFX");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật VFX");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chỉnh sửa VFX</h1>
        <p className="text-sm text-muted-foreground">
          Cập nhật thông tin, media và thông số kỹ thuật của hiệu ứng.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{product.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <VfxForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Lưu thay đổi"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/vfx")}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
