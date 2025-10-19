"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";

import type { Id } from "@dohy/backend/convex/_generated/dataModel";

type CourseDoc = {
  _id: Id<"courses">;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  introVideoUrl?: string;
  pricingType: "free" | "paid";
  priceAmount?: number;
  priceNote?: string;
  isPriceVisible: boolean;
  order: number;
  active: boolean;
};

export default function CoursesListPage() {
  const courses = useQuery(api.courses.listCourses, { includeInactive: true }) as CourseDoc[] | undefined;
  const updateCourse = useMutation(api.courses.updateCourse);
  const setCourseActive = useMutation(api.courses.setCourseActive);
  const deleteCourse = useMutation(api.courses.deleteCourse);

  const sorted = useMemo(() => {
    if (!courses) return [] as CourseDoc[];
    return [...courses].sort((a, b) => a.order - b.order);
  }, [courses]);

  async function toggleActive(course: CourseDoc) {
    try {
      await setCourseActive({ id: course._id, active: !course.active });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function move(course: CourseDoc, direction: "up" | "down") {
    const index = sorted.findIndex((item) => item._id === course._id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const target = sorted[targetIndex];
    try {
      await updateCourse({ id: course._id, order: target.order });
      await updateCourse({ id: target._id, order: course.order });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể đổi thứ tự");
    }
  }

  async function remove(course: CourseDoc) {
    if (!window.confirm(`Xóa khóa học "${course.title}"?`)) return;
    try {
      const result = await deleteCourse({ id: course._id });
      if (!result?.ok) {
        toast.error("Không thể xóa khóa học");
        return;
      }
      toast.success("Đã xóa khóa học");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa khóa học");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Khóa học</h1>
          <p className="text-sm text-muted-foreground">Quản lý danh sách khóa học KISS.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/courses/new">
            <Plus className="mr-2 size-4" />
            Thêm khóa học
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách khóa học</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!courses && <div className="text-sm text-muted-foreground">Đang tải...</div>}
          {courses && sorted.length === 0 && <div className="text-sm text-muted-foreground">Chưa có khóa học nào.</div>}
          {courses && sorted.length > 0 && (
            <div className="space-y-3">
              {sorted.map((course, index) => (
                <div
                  key={String(course._id)}
                  className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{course.title}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        order #{course.order}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                        {course.active ? "active" : "inactive"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Slug: {course.slug}</div>
                    {course.subtitle && (
                      <div className="text-xs text-muted-foreground">{course.subtitle}</div>
                    )}
                    {course.introVideoUrl && (
                      <div className="text-xs text-muted-foreground">Intro: {course.introVideoUrl}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Giá: {course.pricingType === "free"
                        ? "Miễn phí"
                        : course.isPriceVisible && course.priceAmount !== undefined
                        ? `${course.priceAmount.toLocaleString()} VND`
                        : "(ẩn)"}
                    </div>
                    {course.priceNote && (
                      <div className="text-xs text-muted-foreground">{course.priceNote}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <Checkbox checked={course.active} onCheckedChange={() => toggleActive(course)} />
                      <span>{course.active ? "Đang hiện" : "Đang ẩn"}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/courses/${course._id}/edit`}>
                          <Pencil className="mr-2 size-4" />
                          Quản lý
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => move(course, "up")}
                        disabled={index === 0}
                        title="Lên thứ tự"
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => move(course, "down")}
                        disabled={index === sorted.length - 1}
                        title="Xuống thứ tự"
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => remove(course)} title="Xóa">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
