"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ResourceForm } from "../_components/resource-form";
import type { ResourceFormValues } from "../_components/resource-form";

function buildInitial(values?: Partial<ResourceFormValues>): ResourceFormValues {
  return {
    title: values?.title ?? "",
    slug: values?.slug ?? "",
    description: values?.description ?? "",
    featuresText: values?.featuresText ?? "",
    pricingType: values?.pricingType ?? "free",
    coverImageId: values?.coverImageId ?? "",
    downloadUrl: values?.downloadUrl ?? "",
    isDownloadVisible: values?.isDownloadVisible ?? true,
    active: values?.active ?? true,
    order: values?.order ?? "0",
  };
}

export default function LibraryCreatePage() {
  const router = useRouter();
  const resources = useQuery(api.library.listResources, {}) as { order: number }[] | undefined;
  const createResource = useMutation(api.library.createResource);
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => {
    const order = resources ? resources.length : 0;
    return buildInitial({ order: String(order) });
  }, [resources]);

  async function handleSubmit(values: ResourceFormValues) {
    const title = values.title.trim();
    const slug = values.slug.trim();
    if (!title || !slug) {
      toast.error("Can nhap day du title va slug");
      return;
    }
    const orderNumber = Number.parseInt(values.order, 10);
    const parsedOrder = Number.isFinite(orderNumber) ? orderNumber : resources?.length ?? 0;
    const features = values.featuresText
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      await createResource({
        title,
        slug,
        description: values.description.trim() || undefined,
        features,
        pricingType: values.pricingType,
        coverImageId: values.coverImageId.trim() || undefined,
        downloadUrl: values.downloadUrl.trim() || undefined,
        isDownloadVisible: values.isDownloadVisible,
        order: parsedOrder,
        active: values.active,
      } as any);
      toast.success("Da tao tai nguyen");
      router.push("/dashboard/library");
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the tao tai nguyen");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thêm tài nguyên</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Tao"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/library")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
