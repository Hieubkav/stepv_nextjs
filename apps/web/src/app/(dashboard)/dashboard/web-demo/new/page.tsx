"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { WebDemoForm, type WebDemoFormValues } from "../_components/web-demo-form";

const defaultValues: WebDemoFormValues = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  thumbnailId: "",
  previewUrl: "",
  screenshotLaptopId: "",
  screenshotMobileId: "",
  features: "",
  tags: "",
  active: true,
  stats: [],
};

export default function NewWebDemoPage() {
  const router = useRouter();
  const createDemo = useMutation(api.web_demos.create);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: WebDemoFormValues) {
    const title = values.title.trim();
    const slug = values.slug.trim().toLowerCase();

    if (!title || !slug) {
      toast.error("Vui lòng nhập Tiêu đề và Slug hợp lệ");
      return;
    }

    setSubmitting(true);
    try {
      const features = values.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const tags = values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await createDemo({
        title,
        slug,
        summary: values.summary.trim() || undefined,
        description: values.description.trim() || undefined,
        thumbnailId: values.thumbnailId ? (values.thumbnailId as any) : undefined,
        previewUrl: values.previewUrl.trim() || undefined,
        screenshotLaptopId: values.screenshotLaptopId ? (values.screenshotLaptopId as any) : undefined,
        screenshotMobileId: values.screenshotMobileId ? (values.screenshotMobileId as any) : undefined,
        features,
        tags,
        active: values.active,
        stats: values.stats
          .filter((s) => s.label.trim() && s.value !== "")
          .slice(0, 4)
          .map((s) => ({ label: s.label.trim(), value: Number(s.value) })),
      });

      toast.success("Tạo giao diện mẫu thành công!");
      router.push("/dashboard/web-demo");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể tạo giao diện mẫu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold">Thêm Giao Diện Mẫu Mới</h1>
        <p className="text-sm text-muted-foreground">Nhập đầy đủ thông tin để hiển thị ngoài trang theme-demo.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin Web Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <WebDemoForm
            initialValues={defaultValues}
            submitting={submitting}
            submitLabel="Tạo giao diện mẫu"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/web-demo")}
            mode="new"
          />
        </CardContent>
      </Card>
    </div>
  );
}
