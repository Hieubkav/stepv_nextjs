"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { StudentForm } from "../../_components/student-form";
import type { StudentFormValues } from "../../_components/student-form";

type StudentDetail = {
  _id: Id<"students">;
  account: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  order: number;
  active: boolean;
};

type CourseSummary = {
  _id: Id<"courses">;
  title: string;
  active: boolean;
  order: number;
};

type EnrollmentDoc = {
  _id: Id<"course_enrollments">;
  courseId: Id<"courses">;
  userId: string;
  order: number;
  active: boolean;
  enrolledAt: number;
  completionPercentage?: number;
};

const buildInitial = (student: StudentDetail): StudentFormValues => ({
  account: student.account,
  password: student.password,
  fullName: student.fullName,
  email: student.email ?? "",
  phone: student.phone ?? "",
  notes: student.notes ?? "",
  tagsText: student.tags?.join("\n") ?? "",
  active: student.active,
});

const emptyInitial: StudentFormValues = {
  account: "",
  password: "",
  fullName: "",
  email: "",
  phone: "",
  notes: "",
  tagsText: "",
  active: true,
};

export default function StudentEditPage() {
  const params = useParams<{ studentId: string }>();
  const router = useRouter();
  const studentId = params.studentId as Id<"students">;

  const student = useQuery(api.students.getStudent, { id: studentId }) as StudentDetail | null | undefined;
  const enrollments = useQuery(api.courses.listEnrollmentsByUser, {
    userId: String(studentId),
    includeInactive: true,
  }) as EnrollmentDoc[] | undefined;
  const courses = useQuery(api.courses.listCourses, { includeInactive: true }) as CourseSummary[] | undefined;
  const updateStudent = useMutation(api.students.updateStudent);
  const setActive = useMutation(api.students.setStudentActive);
  const deleteStudent = useMutation(api.students.deleteStudent);
  const upsertEnrollment = useMutation(api.courses.upsertEnrollment);
  const removeEnrollmentMutation = useMutation(api.courses.removeEnrollment);

  const [submitting, setSubmitting] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseSubmitting, setCourseSubmitting] = useState(false);

  const initialValues = useMemo(() => {
    if (!student) return emptyInitial;
    return buildInitial(student);
  }, [student]);

  const courseMap = useMemo(() => {
    const map = new Map<string, CourseSummary>();
    (courses ?? []).forEach((course) => {
      map.set(String(course._id), course);
    });
    return map;
  }, [courses]);

  const availableCourseOptions = useMemo(() => {
    if (!courses) return [];
    const assigned = new Set((enrollments ?? []).map((enrollment) => String(enrollment.courseId)));
    return courses
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title))
      .filter((course) => !assigned.has(String(course._id)))
      .map((course) => ({
        id: String(course._id),
        label: course.title,
      }));
  }, [courses, enrollments]);

  const studentCourses = useMemo(() => {
    if (!enrollments) return [];
    return enrollments
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((enrollment) => ({
        enrollment,
        course: courseMap.get(String(enrollment.courseId)) ?? null,
      }));
  }, [enrollments, courseMap]);

  useEffect(() => {
    setSelectedCourseId((prev) => {
      if (availableCourseOptions.length === 0) {
        return "";
      }
      return availableCourseOptions.some((option) => option.id === prev)
        ? prev
        : availableCourseOptions[0].id;
    });
  }, [availableCourseOptions]);

  async function handleSubmit(values: StudentFormValues) {
    if (!student) return;
    const account = values.account.trim();
    const fullName = values.fullName.trim();
    if (!account || !fullName) {
      toast.error("Cần nhập account và họ tên");
      return;
    }
    const tags = values.tagsText
      ? values.tagsText.split(/\r?\n|,/).map((tag) => tag.trim()).filter(Boolean)
      : undefined;

    setSubmitting(true);
    try {
      await updateStudent({
        id: student._id,
        account,
        password: values.password.trim() || undefined,
        fullName,
        email: values.email.trim() || null,
        phone: values.phone.trim() || null,
        notes: values.notes.trim() || null,
        tags,
        active: values.active,
      });
      toast.success("Đã cập nhật học viên");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật học viên");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!student) return;
    if (!selectedCourseId) {
       toast.error("Vui lòng chọn khóa học");
       return;
     }
    const courseInfo = courseMap.get(selectedCourseId);
    setCourseSubmitting(true);
    try {
      await upsertEnrollment({
        courseId: selectedCourseId as Id<"courses">,
        userId: String(student._id),
      } as any);
      toast.success(
        courseInfo
          ? `Đã gán ${student.fullName} vào khóa "${courseInfo.title}"`
          : "Đã cấp quyền khóa học",
      );
      setSelectedCourseId("");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể gán khóa học");
    } finally {
      setCourseSubmitting(false);
    }
  }

  async function handleRemoveCourse(enrollment: EnrollmentDoc) {
    if (!student) return;
    const courseId = String(enrollment.courseId);
    const courseInfo = courseMap.get(courseId);
    const label = courseInfo ? courseInfo.title : courseId;
    if (!window.confirm(`Xóa ${student.fullName} khỏi khóa "${label}"?`)) return;
    try {
      const result = await removeEnrollmentMutation({
        courseId: enrollment.courseId,
        userId: String(student._id),
      });
      if (!result?.ok) {
        toast.error("Không thể xóa khóa học");
        return;
      }
      toast.success(`Đã xóa ${student.fullName} khỏi ${label}`);
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa khóa học");
    }
  }

  async function handleToggleActive() {
    if (!student) return;
    try {
      await setActive({ id: student._id, active: !student.active });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function handleDelete() {
    if (!student) return;
    if (!window.confirm(`Xóa học viên "${student.fullName}"?`)) return;
    try {
      const result = await deleteStudent({ id: student._id });
      if (!result?.ok) {
        toast.error("Không thể xóa học viên");
        return;
      }
      toast.success("Đã xóa học viên");
      router.push("/dashboard/students");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa học viên");
    }
  }

  if (student === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Đang tải học viên...</div>;
  }

  if (!student) {
    return <div className="p-6 text-sm text-muted-foreground">Không tìm thấy học viên.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chỉnh sửa học viên</h1>
          <p className="text-sm text-muted-foreground">Cập nhật thông tin tài khoản và liên hệ.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/students")}>Quay lại</Button>
          <Button variant="secondary" onClick={handleToggleActive}>
            {student.active ? "Đang hoạt động" : "Đang khóa"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Xóa học viên
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin học viên</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Lưu"
            onSubmit={handleSubmit}
            requirePassword={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Khóa học tham gia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleAddCourse}>
            <div className="sm:flex-1">
              <label className="text-sm font-medium">Khóa học</label>
              {courses === undefined ? (
                <div className="text-xs text-muted-foreground">Đang tải danh sách khóa học...</div>
              ) : availableCourseOptions.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  {courses.length === 0 ? "Chưa có khóa học nào." : "Không còn khóa học trống."}
                </div>
              ) : (
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedCourseId}
                  onChange={(event) => setSelectedCourseId(event.target.value)}
                >
                  {availableCourseOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex justify-end sm:block">
              <Button
                type="submit"
                disabled={courseSubmitting || !selectedCourseId || availableCourseOptions.length === 0}
              >
                {courseSubmitting ? "Đang lưu..." : "Thêm khóa học"}
              </Button>
            </div>
          </form>
          <Separator />
          {!enrollments && <div className="text-sm text-muted-foreground">Đang tải khóa học...</div>}
          {enrollments && enrollments.length === 0 && (
            <div className="text-sm text-muted-foreground">Học viên chưa tham gia khóa học nào.</div>
          )}
          {enrollments && enrollments.length > 0 && (
            <div className="space-y-2">
              {studentCourses.map(({ enrollment, course }) => (
                <div
                  key={String(enrollment._id)}
                  className="flex flex-col gap-2 rounded-md border p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">{course?.title ?? `Khóa học #${enrollment.courseId}`}</div>
                      <div className="text-xs text-muted-foreground">
                        {course ? (course.active ? "Khóa học đang hiển" : "Khóa học đang ẩn") : "Không rõ trạng thái khóa học"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                          enrollment.active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {enrollment.active ? "Đang hiển" : "Đang ẩn"}
                      </span>
                      {course ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/courses/${course._id}/edit`}>Mở khóa học</Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          Khóa học không còn
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveCourse(enrollment)}>
                        Xóa
                      </Button>
                    </div>
                  </div>

                  {enrollment.completionPercentage !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Tiến độ học</span>
                        <span className="text-emerald-600 font-semibold">{enrollment.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${enrollment.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
