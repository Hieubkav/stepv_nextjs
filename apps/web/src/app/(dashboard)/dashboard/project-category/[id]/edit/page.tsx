"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ProjectCategoryForm, type ProjectCategoryFormValues } from "../../_components/category-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[`\?-]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();

function toInitial(category: any | null): ProjectCategoryFormValues {
  return {
    name: category?.name ?? "",
    description: category?.description ?? "",
    active: category?.active ?? true,
  };
}

export default function ProjectCategoryEditPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const category = useQuery(api.projects.getCategory, id ? { id: id as any } : "skip") as
    | {
        _id: Id<"project_categories">;
        name: string;
        slug: string;
        description?: string;
        order: number;
        active: boolean;
      }
    | null
    | undefined;

  const updateCategory = useMutation(api.projects.updateCategory);
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => toInitial(category), [category]);

  if (category === undefined) {
    return <div className="p-4 text-sm text-muted-foreground">Đang tải danh mục...</div>;
  }

  if (!category) {
    return <div className="p-4 text-sm text-muted-foreground">Không tìm thấy danh mục.</div>;
  }

  async function handleSubmit(values: ProjectCategoryFormValues) {
    if (!category) {
      toast.error("Danh m?c kh�ng t?n t?i.");
      return;
    }

    const name = values.name.trim();
    if (!name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setSubmitting(true);
    try {
      await updateCategory({
        id: category._id as any,
        name,
        slug: slugify(name),
        description: values.description.trim() || undefined,
        order: category.order,
        active: values.active,
      });
      toast.success("Đã cập nhật danh mục");
      router.push("/dashboard/project-category");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật danh mục");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectCategoryForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Lưu thay đổi"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/project-category")}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
