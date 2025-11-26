"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ProjectForm, type ProjectFormValues } from "../_components/project-form";

type ProjectDoc = {
  order: number;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[`\?-]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();

function buildInitial(): ProjectFormValues {
  return {
    title: "",
    content: "",
    categoryId: "",
    thumbnailId: "",
    videoMediaId: "",
    videoUrl: "",
    active: true,
    images: [],
  };
}

export default function ProjectCreatePage() {
  const router = useRouter();
  const projects = useQuery(api.projects.listProjects, { includeInactive: true }) as ProjectDoc[] | undefined;
  const createProject = useMutation(api.projects.createProject);
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => buildInitial(), []);

  async function handleSubmit(values: ProjectFormValues) {
    const title = values.title.trim();
    if (!title) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }

    const slug = slugify(title);
    const order = projects ? projects.length : 0;

    const images = values.images
      .filter((img) => img.mediaId)
      .map((img, index) => ({
        ...img,
        id: undefined,
        order: Number.isFinite(img.order) ? img.order : index,
        caption: img.caption.trim() || undefined,
        altText: img.altText.trim() || undefined,
        mediaId: img.mediaId as any,
      }));

    setSubmitting(true);
    try {
      await createProject({
        title,
        slug,
        summary: undefined,
        content: values.content || undefined,
        categoryId: values.categoryId ? (values.categoryId as any) : undefined,
        thumbnailId: values.thumbnailId ? (values.thumbnailId as any) : undefined,
        videoMediaId: values.videoMediaId ? (values.videoMediaId as any) : undefined,
        videoUrl: values.videoUrl.trim() || undefined,
        order,
        active: values.active,
        images,
      } as any);
      toast.success("Đã tạo dự án");
      router.push("/dashboard/project");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể tạo dự án");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Thêm dự án</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Tạo dự án"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/project")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

