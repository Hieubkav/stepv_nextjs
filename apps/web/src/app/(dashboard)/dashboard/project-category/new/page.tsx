"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ProjectCategoryForm, type ProjectCategoryFormValues } from "../_components/category-form";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[`\?-]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();

function buildInitial(): ProjectCategoryFormValues {
  return {
    name: "",
    description: "",
    active: true,
  };
}

export default function ProjectCategoryCreatePage() {
  const router = useRouter();
  const categories = useQuery(api.projects.listCategories, { includeInactive: true }) as
    | { order: number }[]
    | undefined;
  const createCategory = useMutation(api.projects.createCategory);
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => buildInitial(), []);

  async function handleSubmit(values: ProjectCategoryFormValues) {
    const name = values.name.trim();
    if (!name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    const slug = slugify(name);
    const order = categories ? categories.length : 0;

    setSubmitting(true);
    try {
      await createCategory({
        name,
        slug,
        description: values.description.trim() || undefined,
        order,
        active: values.active,
      } as any);
      toast.success("Đã tạo danh mục");
      router.push("/dashboard/project-category");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể tạo danh mục");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Thêm danh mục dự án</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectCategoryForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Tạo danh mục"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/project-category")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

