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
  order: values?.order ?? "0",
  active: values?.active ?? true,
});

export default function StudentCreatePage() {
  const router = useRouter();
  const students = useQuery(api.students.listStudents, {}) as { order: number }[] | undefined;
  const createStudent = useMutation(api.students.createStudent);
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => {
    const nextOrder = students ? students.length : 0;
    return buildInitial({ order: String(nextOrder) });
  }, [students]);

  async function handleSubmit(values: StudentFormValues) {
    const account = values.account.trim();
    const fullName = values.fullName.trim();
    const password = values.password.trim();
    if (!account || !fullName || !password) {
      toast.error("Can nhap account, ho ten va mat khau");
      return;
    }
    const orderNumber = Number.parseInt(values.order, 10);
    const parsedOrder = Number.isFinite(orderNumber) ? orderNumber : students?.length ?? 0;

    setSubmitting(true);
    try {
      await createStudent({
        account,
        password,
        fullName,
        email: values.email.trim() || undefined,
        phone: values.phone.trim() || undefined,
        notes: values.notes.trim() || undefined,
        tags: values.tagsText
          ? values.tagsText.split(/\r?\n|,/).map((tag) => tag.trim()).filter(Boolean)
          : undefined,
        order: parsedOrder,
        active: values.active,
      });
      toast.success("Da tao hoc vien");
      router.push("/dashboard/students");
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the tao hoc vien");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Them hoc vien</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Tao"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/students")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
