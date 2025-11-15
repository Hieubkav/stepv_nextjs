"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const buildInitial = (student: StudentDetail): StudentFormValues => ({
  account: student.account,
  password: student.password,
  fullName: student.fullName,
  email: student.email ?? "",
  phone: student.phone ?? "",
  notes: student.notes ?? "",
  tagsText: student.tags?.join("\n") ?? "",
  order: String(student.order),
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
  order: "0",
  active: true,
};

export default function StudentEditPage() {
  const params = useParams<{ studentId: string }>();
  const router = useRouter();
  const studentId = params.studentId as Id<"students">;

  const student = useQuery(api.students.getStudent, { id: studentId }) as StudentDetail | null | undefined;
  const updateStudent = useMutation(api.students.updateStudent);
  const setActive = useMutation(api.students.setStudentActive);
  const deleteStudent = useMutation(api.students.deleteStudent);

  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => {
    if (!student) return emptyInitial;
    return buildInitial(student);
  }, [student]);

  async function handleSubmit(values: StudentFormValues) {
    if (!student) return;
    const account = values.account.trim();
    const fullName = values.fullName.trim();
    if (!account || !fullName) {
      toast.error("Cần nhập account và họ tên");
      return;
    }
    const orderNumber = Number.parseInt(values.order, 10);
    const parsedOrder = Number.isFinite(orderNumber) ? orderNumber : student.order;
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
        order: parsedOrder,
        active: values.active,
      });
      toast.success("Đã cập nhật học viên");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật học viên");
    } finally {
      setSubmitting(false);
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
    </div>
  );
}
