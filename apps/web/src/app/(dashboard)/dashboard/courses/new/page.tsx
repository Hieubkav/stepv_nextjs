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
  comparePriceAmount: values?.comparePriceAmount ?? "",
  priceNote: values?.priceNote ?? "",
  isPriceVisible: values?.isPriceVisible ?? false,
  order: values?.order ?? "0",
  active: values?.active ?? true,
  softwareIds: values?.softwareIds ?? [],
});

export default function CourseCreatePage() {
  const router = useRouter();
  const courses = useQuery(api.courses.listCourses, { includeInactive: true }) as { order: number }[] | undefined;
  const createCourse = useMutation(api.courses.createCourse);
  const setCourseSoftwares = useMutation(api.courses.setCourseSoftwares);
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => {
    const nextOrder = courses ? courses.length : 0;
    return buildInitial({ order: String(nextOrder) });
  }, [courses]);

  async function handleSubmit(values: CourseFormValues) {
    const title = values.title.trim();
    const slug = values.slug.trim();
    if (!title || !slug) {
      toast.error("Cần nhập tiêu đề và slug");
      return;
    }
    if (values.pricingType === "paid" && !values.priceAmount.trim()) {
      toast.error("Khóa học trả phí cần nhập giá");
      return;
    }
    const orderNumber = Number.parseInt(values.order, 10);
    const parsedOrder = Number.isFinite(orderNumber) ? orderNumber : courses?.length ?? 0;

    setSubmitting(true);
    try {
      const course = await createCourse({
        title,
        slug,
        subtitle: values.subtitle.trim() || undefined,
        description: values.description.trim() || undefined,
        thumbnailMediaId: values.thumbnailMediaId ? (values.thumbnailMediaId as unknown as Id<"media">) : undefined,
        introVideoUrl: values.introVideoUrl.trim() || undefined,
        pricingType: values.pricingType,
        priceAmount: values.pricingType === "paid" ? Number(values.priceAmount) || 0 : undefined,
        comparePriceAmount: values.pricingType === "paid" ? Number(values.comparePriceAmount) || undefined : undefined,
        priceNote: values.priceNote.trim() || undefined,
        isPriceVisible: values.pricingType === "paid" ? values.isPriceVisible : false,
        order: parsedOrder,
        active: values.active,
      });

      // Set softwares if any selected
      if (course && values.softwareIds.length > 0) {
        await setCourseSoftwares({
          courseId: course._id as Id<"courses">,
          softwareIds: values.softwareIds as Id<"library_softwares">[],
        });
      }

      toast.success("Đã tạo khóa học");
      router.push("/dashboard/courses");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể tạo khóa học");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thêm khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Tạo"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/courses")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
