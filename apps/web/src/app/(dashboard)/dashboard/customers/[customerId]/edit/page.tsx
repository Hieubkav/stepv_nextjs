"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { CustomerForm } from "../../_components/customer-form";
import type { CustomerFormValues } from "../../_components/customer-form";

type CustomerDetail = {
  _id: Id<"customers">;
  account: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  notes?: string;
  order: number;
  active: boolean;
  createdAt?: number;
  updatedAt?: number;
};

const buildInitial = (customer: CustomerDetail): CustomerFormValues => ({
  account: customer.account,
  email: customer.email,
  password: customer.password,
  fullName: customer.fullName,
  phone: customer.phone ?? "",
  notes: customer.notes ?? "",
  active: customer.active,
});

const emptyInitial: CustomerFormValues = {
  account: "",
  email: "",
  password: "",
  fullName: "",
  phone: "",
  notes: "",
  active: true,
};

export default function CustomerEditPage() {
  const params = useParams<{ customerId: string }>();
  const router = useRouter();
  const customerId = params.customerId as Id<"customers">;

  const customer = useQuery(api.customers.getCustomer, { id: customerId }) as CustomerDetail | null | undefined;
  const updateCustomer = useMutation(api.customers.updateCustomer);
  const setActive = useMutation(api.customers.setCustomerActive);

  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => {
    if (!customer) return emptyInitial;
    return buildInitial(customer);
  }, [customer]);

  async function handleSubmit(values: CustomerFormValues) {
    if (!customer) return;
    const account = values.account.trim();
    const email = values.email.trim().toLowerCase();
    const fullName = values.fullName.trim();

    if (!account || !email || !fullName) {
      toast.error("Cần nhập account, email và họ tên");
      return;
    }

    setSubmitting(true);
    try {
      await updateCustomer({
        id: customer._id,
        account,
        email,
        password: values.password.trim() || undefined,
        fullName,
        phone: values.phone.trim() || null,
        notes: values.notes.trim() || null,
        active: values.active,
      });
      toast.success("Đã cập nhật khách hàng");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật khách hàng");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive() {
    if (!customer) return;
    try {
      await setActive({ id: customer._id, active: !customer.active });
      toast.success(customer.active ? "Đã khóa khách hàng" : "Đã mở khách hàng");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  function formatDate(timestamp?: number) {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString("vi-VN");
  }

  if (customer === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Đang tải khách hàng...</div>;
  }

  if (!customer) {
    return <div className="p-6 text-sm text-muted-foreground">Không tìm thấy khách hàng.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chỉnh sửa khách hàng</h1>
          <p className="text-sm text-muted-foreground">Cập nhật thông tin đăng nhập và liên hệ.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/customers")}>Quay lại</Button>
          <Button variant="secondary" onClick={handleToggleActive}>
            {customer.active ? "Đang hoạt động" : "Đang khóa"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm
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
          <CardTitle>Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Tạo lúc</span>
            <span className="font-medium text-foreground">{formatDate(customer.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Cập nhật lần cuối</span>
            <span className="font-medium text-foreground">{formatDate(customer.updatedAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Thứ tự (order)</span>
            <span className="font-mono text-foreground">{customer.order}</span>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground">
            Mẹo: dùng reorder ở danh sách để thay đổi thứ tự kéo-thả hiển thị.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
