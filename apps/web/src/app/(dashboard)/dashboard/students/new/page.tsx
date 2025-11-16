"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { StudentForm } from "../_components/student-form";
import type { StudentFormValues } from "../_components/student-form";

const buildInitial = (values?: Partial<StudentFormValues>): StudentFormValues => ({
  account: values?.account ?? "",
  password: values?.password ?? "",
  fullName: values?.fullName ?? "",
  email: values?.email ?? "",
  phone: values?.phone ?? "",
  notes: values?.notes ?? "",
  tagsText: values?.tagsText ?? "",
  active: values?.active ?? true,
});

export default function StudentCreatePage() {
  const router = useRouter();
  const students = useQuery(api.students.listStudents, {}) as { order: number }[] | undefined;
  const createStudent = useMutation(api.students.createStudent);
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => buildInitial(), []);

  const nextOrder = useMemo(() => {
    if (!students || students.length === 0) return 0;
    return students.reduce((max, item) => Math.max(max, item.order ?? 0), 0) + 1;
  }, [students]);

  async function handleSubmit(values: StudentFormValues) {
    const account = values.account.trim();
    const fullName = values.fullName.trim();
    const password = values.password.trim();
    if (!account || !fullName || !password) {
      toast.error("Cần nhập account, họ tên và mật khẩu");
      return;
    }
    setSubmitting(true);
    try {
      await createStudent({
        account,
        password,
        fullName,
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        notes: values.notes.trim() || undefined,
        tags: values.tagsText
          ? values.tagsText.split(/\r?\n|,/).map((tag) => tag.trim()).filter(Boolean)
          : undefined,
        order: nextOrder,
        active: values.active,
      });
      toast.success("Đã tạo học viên");
      router.push("/dashboard/students");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể tạo học viên");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thêm học viên</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Tạo"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/students")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
