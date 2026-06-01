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
  sections: "",
  pages: "",
  popups: "",
  forms: "",
  features: "",
  tags: "",
  active: true,
  reviews: [],
  blocks: [],
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

      // Submit lên backend Convex
      await createDemo({
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
