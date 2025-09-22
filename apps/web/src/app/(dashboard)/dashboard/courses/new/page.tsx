"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { CourseForm } from "../_components/course-form";
import type { CourseFormValues } from "../_components/course-form";

const buildInitial = (values?: Partial<CourseFormValues>): CourseFormValues => ({
  title: values?.title ?? "",
  slug: values?.slug ?? "",
  subtitle: values?.subtitle ?? "",
  description: values?.description ?? "",
  thumbnailMediaId: values?.thumbnailMediaId ?? "",
  introVideoUrl: values?.introVideoUrl ?? "",
  pricingType: values?.pricingType ?? "free",
  priceAmount: values?.priceAmount ?? "",
  priceNote: values?.priceNote ?? "",
  isPriceVisible: values?.isPriceVisible ?? false,
  order: values?.order ?? "0",
  active: values?.active ?? true,
});

export default function CourseCreatePage() {
  const router = useRouter();
  const courses = useQuery(api.courses.listCourses, { includeInactive: true }) as { order: number }[] | undefined;
  const createCourse = useMutation(api.courses.createCourse);
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => {
    const nextOrder = courses ? courses.length : 0;
    return buildInitial({ order: String(nextOrder) });
  }, [courses]);

  async function handleSubmit(values: CourseFormValues) {
    const title = values.title.trim();
    const slug = values.slug.trim();
    if (!title || !slug) {
      toast.error("Can nhap tieu de va slug");
      return;
    }
    if (values.pricingType === "paid" && !values.priceAmount.trim()) {
      toast.error("Khoa hoc tra phi can nhap gia");
      return;
    }
    const orderNumber = Number.parseInt(values.order, 10);
    const parsedOrder = Number.isFinite(orderNumber) ? orderNumber : courses?.length ?? 0;

    setSubmitting(true);
    try {
      await createCourse({
        title,
        slug,
        subtitle: values.subtitle.trim() || undefined,
        description: values.description.trim() || undefined,
        thumbnailMediaId: values.thumbnailMediaId ? (values.thumbnailMediaId as unknown as Id<"media">) : undefined,
        introVideoUrl: values.introVideoUrl.trim() || undefined,
        pricingType: values.pricingType,
        priceAmount: values.pricingType === "paid" ? Number(values.priceAmount) || 0 : undefined,
        priceNote: values.priceNote.trim() || undefined,
        isPriceVisible: values.pricingType === "paid" ? values.isPriceVisible : false,
        order: parsedOrder,
        active: values.active,
      });
      toast.success("Da tao khoa hoc");
      router.push("/dashboard/courses");
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the tao khoa hoc");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Them khoa hoc</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Tao"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/courses")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
