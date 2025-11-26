"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ProjectForm, type ProjectFormValues } from "../../_components/project-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

type RawProjectImage = {
  _id: Id<"project_images"> | string;
  mediaId: Id<"media"> | string;
  caption?: string;
  altText?: string;
  order?: number;
  active?: boolean;
};

function normalizeImages(detail: any | null) {
  const images = (Array.isArray(detail?.images) ? detail.images : []) as RawProjectImage[];

  return images
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((img, index) => ({
      id: String(img._id),
      mediaId: String(img.mediaId),
      caption: img.caption ?? "",
      altText: img.altText ?? "",
      order: img.order ?? index,
      active: img.active ?? true,
    }));
}

function toInitial(detail: any | null): ProjectFormValues {
  const project = detail?.project ?? null;

  return {
    title: project?.title ?? "",
    content: project?.content ?? "",
    categoryId: project?.categoryId ? String(project.categoryId) : "",
    thumbnailId: project?.thumbnailId ? String(project.thumbnailId) : "",
    videoMediaId: project?.videoMediaId ? String(project.videoMediaId) : "",
    videoUrl: project?.videoUrl ?? "",
    active: project?.active ?? true,
    images: normalizeImages(detail),
  };
}

export default function ProjectEditPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const detail = useQuery(
    api.projects.getProjectDetail,
    id ? { id: id as any, includeInactive: true } : "skip"
  ) as any | null | undefined;

  const updateProject = useMutation(api.projects.updateProject);
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => toInitial(detail), [detail]);

  if (detail === undefined) {
    return <div className="p-4 text-sm text-muted-foreground">Đang tải dự án...</div>;
  }

  if (!detail?.project) {
    return <div className="p-4 text-sm text-muted-foreground">Không tìm thấy dự án.</div>;
  }

  async function handleSubmit(values: ProjectFormValues) {
    const title = values.title.trim();
    if (!title) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }

    const images = values.images
      .filter((img) => img.mediaId)
      .map((img, index) => ({
        ...img,
        id: img.id ? (img.id as Id<"project_images">) : undefined,
        order: Number.isFinite(img.order) ? img.order : index,
        caption: img.caption.trim() || undefined,
        altText: img.altText.trim() || undefined,
        mediaId: img.mediaId as any,
      }));

    setSubmitting(true);
    try {
      await updateProject({
        id: detail.project._id as any,
        title,
        summary: undefined,
        content: values.content || undefined,
        categoryId: values.categoryId ? (values.categoryId as any) : undefined,
        thumbnailId: values.thumbnailId ? (values.thumbnailId as any) : undefined,
        videoMediaId: values.videoMediaId ? (values.videoMediaId as any) : undefined,
        videoUrl: values.videoUrl.trim() || undefined,
        order: detail.project.order ?? 0,
        active: values.active,
        images,
      } as any);
      toast.success("Đã cập nhật dự án");
      router.push("/dashboard/project");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật dự án");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa dự án</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Lưu thay đổi"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/project")}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
