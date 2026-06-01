"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { WebDemoForm, type WebDemoFormValues } from "../../_components/web-demo-form";

export default function EditWebDemoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const data = useQuery(api.web_demos.getById, { id: id as any });
  const updateDemo = useMutation(api.web_demos.update);
  
  const [submitting, setSubmitting] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState<WebDemoFormValues | null>(null);

  useEffect(() => {
    if (data) {
      setInitialFormValues({
        title: data.title,
        slug: data.slug,
        summary: data.summary ?? "",
        description: data.description ?? "",
        thumbnailId: data.thumbnailId ?? "",
        previewUrl: data.previewUrl ?? "",
        screenshotLaptopId: data.screenshotLaptopId ?? "",
        screenshotMobileId: data.screenshotMobileId ?? "",
        sections: data.sections !== undefined ? String(data.sections) : "",
        pages: data.pages !== undefined ? String(data.pages) : "",
        popups: data.popups !== undefined ? String(data.popups) : "",
        forms: data.forms !== undefined ? String(data.forms) : "",
        features: data.features ? data.features.join("\n") : "",
        tags: data.tags ? data.tags.join(", ") : "",
        active: data.active,
        reviews: data.reviews ?? [],
        blocks: data.blocks ?? [],
      });
    }
  }, [data]);

  async function handleSubmit(values: WebDemoFormValues) {
    if (!data) return;

    const title = values.title.trim();
    const slug = values.slug.trim().toLowerCase();

    if (!title || !slug) {
      toast.error("Vui lòng nhập Tiêu đề và Slug hợp lệ");
      return;
    }

    setSubmitting(true);
    try {
      const sections = values.sections ? Number(values.sections) : undefined;
      const pages = values.pages ? Number(values.pages) : undefined;
      const popups = values.popups ? Number(values.popups) : undefined;
      const forms = values.forms ? Number(values.forms) : undefined;

      const features = values.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const tags = values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await updateDemo({
        id: data._id,
        title,
        slug,
        summary: values.summary.trim() || undefined,
        description: values.description.trim() || undefined,
        thumbnailId: values.thumbnailId ? (values.thumbnailId as any) : undefined,
        previewUrl: values.previewUrl.trim() || undefined,
        screenshotLaptopId: values.screenshotLaptopId ? (values.screenshotLaptopId as any) : undefined,
        screenshotMobileId: values.screenshotMobileId ? (values.screenshotMobileId as any) : undefined,
        sections,
        pages,
        popups,
        forms,
        features,
        tags,
        active: values.active,
        reviews: values.reviews.map((rev) => ({
          ...rev,
          role: rev.role?.trim() || undefined,
          avatarUrl: rev.avatarUrl?.trim() || undefined,
        })),
        blocks: values.blocks.map((blk) => ({
          ...blk,
          description: blk.description?.trim() || undefined,
          imageId: blk.imageId ? (blk.imageId as any) : undefined,
        })),
      });

      toast.success("Cập nhật giao diện mẫu thành công!");
      router.push("/dashboard/web-demo");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật giao diện mẫu");
    } finally {
      setSubmitting(false);
    }
  }

  if (data === undefined || !initialFormValues) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Đang tải dữ liệu giao diện mẫu...
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-destructive">
        Không tìm thấy giao diện mẫu hoặc đã bị xóa.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold">Chỉnh Sửa Giao Diện Mẫu</h1>
        <p className="text-sm text-muted-foreground">Sửa đổi thông tin chi tiết và lưu lại các thay đổi.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin Web Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <WebDemoForm
            initialValues={initialFormValues}
            submitting={submitting}
            submitLabel="Lưu thay đổi"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/web-demo")}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
