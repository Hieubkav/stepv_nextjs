"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export type CustomerFormValues = {
  account: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  notes: string;
  active: boolean;
};

type CustomerFormProps = {
  initialValues: CustomerFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  onCancel?: () => void;
  requirePassword?: boolean;
};

export function CustomerForm({
  initialValues,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  requirePassword = true,
}: CustomerFormProps) {
  const [values, setValues] = useState<CustomerFormValues>(initialValues);
  const [showPasswordHelper, setShowPasswordHelper] = useState(false);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const canSubmit = useMemo(() => {
    if (!values.account.trim() || !values.email.trim() || !values.fullName.trim()) return false;
    if (requirePassword && !values.password.trim()) return false;
    return true;
  }, [values, requirePassword]);

  function update(field: keyof CustomerFormValues, value: string | boolean) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    await onSubmit(values);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tài khoản</label>
          <Input
            value={values.account}
            onChange={(event) => update("account", event.target.value)}
            placeholder="username"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Mật khẩu</label>
          <Input
            value={values.password}
            onChange={(event) => update("password", event.target.value)}
            placeholder="Nhập mật khẩu cho khách hàng"
            onFocus={() => setShowPasswordHelper(true)}
            required={requirePassword}
          />
          {showPasswordHelper && (
            <p className="text-xs text-muted-foreground">
              Mật khẩu được lưu dạng plain-text (MVP). Hãy đổi sau khi gửi cho khách nếu cần.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Họ tên</label>
          <Input
            value={values.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            placeholder="Nguyen Van A"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Số điện thoại</label>
          <Input
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="090xxxxxxx"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Ghi chú</label>
          <Textarea
            value={values.notes}
            onChange={(event) => update("notes", event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-2 text-sm">
          <Checkbox
            checked={values.active}
            onCheckedChange={(checked) => update("active", Boolean(checked))}
          />
          <span>{values.active ? "Đang hoạt động" : "Đang khóa"}</span>
        </label>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={submitting || !canSubmit}>
            {submitting ? "Đang lưu..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
