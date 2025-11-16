"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ResourceForm } from "../../_components/resource-form";
import type { ResourceFormValues } from "../../_components/resource-form";
import { ResourceImagesManager } from "../../_components/resource-images-manager";

type PageProps = {
  params: Promise<{ id: string }>;
};

function toInitial(resource: any | null): ResourceFormValues {
  return {
    title: resource?.title ?? "",
    slug: resource?.slug ?? "",
    description: resource?.description ?? "",
    pricingType: resource?.pricingType ?? "free",
    coverImageId: resource?.coverImageId ?? "",
    downloadUrl: resource?.downloadUrl ?? "",
    isDownloadVisible: resource?.isDownloadVisible ?? true,
    active: resource?.active ?? true,
    order: String(resource?.order ?? 0),
  };
}

export default function LibraryEditPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const detail = useQuery(
    api.library.getResourceDetail,
    id ? { id: id as any, includeInactive: true } : "skip"
  ) as { resource: any } | null | undefined;

  const updateResource = useMutation(api.library.updateResource);
  const [submitting, setSubmitting] = useState(false);

  const resource = detail?.resource ?? null;

  const initialValues = useMemo(() => toInitial(resource), [resource]);

  if (detail === undefined) {
    return <div className="text-sm text-muted-foreground">Đang tải...</div>;
  }

  if (!resource) {
    return <div className="text-sm text-muted-foreground">Không tìm thấy tài nguyên.</div>;
  }

  async function handleSubmit(values: ResourceFormValues) {
    const title = values.title.trim();
    const slug = values.slug.trim();
    if (!title || !slug) {
      toast.error("Cần nhập đầy đủ title và slug");
      return;
    }
    const orderNumber = Number.parseInt(values.order, 10);
    const parsedOrder = Number.isFinite(orderNumber) ? orderNumber : resource.order;

    setSubmitting(true);
    try {
      await updateResource({
        id: resource._id as any,
        title,
        slug,
        description: values.description.trim() || undefined,
        pricingType: values.pricingType,
        coverImageId: values.coverImageId.trim() || undefined,
        downloadUrl: values.downloadUrl.trim() || undefined,
        isDownloadVisible: values.isDownloadVisible,
        order: parsedOrder,
        active: values.active,
      } as any);
      toast.success("Đã cập nhật tài nguyên");
      router.push("/dashboard/library");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật tài nguyên");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa tài nguyên</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Lưu"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/library")}
            mode="edit"
          />
        </CardContent>
      </Card>
      <ResourceImagesManager resourceId={String(resource._id)} />
    </div>
  );
}








