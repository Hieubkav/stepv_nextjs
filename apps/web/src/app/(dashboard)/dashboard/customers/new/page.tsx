"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { CustomerForm } from "../_components/customer-form";
import type { CustomerFormValues } from "../_components/customer-form";

const buildInitial = (values?: Partial<CustomerFormValues>): CustomerFormValues => ({
  account: values?.account ?? "",
  email: values?.email ?? "",
  password: values?.password ?? "",
  fullName: values?.fullName ?? "",
  phone: values?.phone ?? "",
  notes: values?.notes ?? "",
  active: values?.active ?? true,
});

export default function CustomerCreatePage() {
  const router = useRouter();
  const customers = useQuery(api.customers.listCustomers, {}) as { order: number }[] | undefined;
  const createCustomer = useMutation(api.customers.createCustomer);
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => buildInitial(), []);

  const nextOrder = useMemo(() => {
    if (!customers || customers.length === 0) return 0;
    return customers.reduce((max, item) => Math.max(max, item.order ?? 0), 0) + 1;
  }, [customers]);

  async function handleSubmit(values: CustomerFormValues) {
    const account = values.account.trim();
    const email = values.email.trim().toLowerCase();
    const password = values.password.trim();
    const fullName = values.fullName.trim();

    if (!account || !email || !password || !fullName) {
      toast.error("Cần nhập account, email, mật khẩu và họ tên");
      return;
    }

    setSubmitting(true);
    try {
      const result = (await createCustomer({
        account,
        email,
        password,
        fullName,
        phone: values.phone.trim() || undefined,
        notes: values.notes.trim() || undefined,
        order: nextOrder,
        active: values.active,
      })) as { ok: boolean; error?: string };

      if (!result?.ok) {
        toast.error(result?.error ?? "Kh�ng th? t?o kh�ch h�ng");
        return;
      }

      toast.success("Da t?o kh�ch h�ng");
      router.push("/dashboard/customers");
    } catch (error: any) {
      toast.error(error?.message ?? "Kh�ng th? t?o kh�ch h�ng");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thêm khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Tạo"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/customers")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
