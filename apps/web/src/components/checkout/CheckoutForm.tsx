'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/features/auth';

type CheckoutFormProps = {
  onSubmit: (data: { fullName: string; email: string; phone?: string }) => Promise<void>;
  isLoading?: boolean;
};

export default function CheckoutForm({ onSubmit, isLoading = false }: CheckoutFormProps) {
  const { customer } = useCustomerAuth();
  const [formData, setFormData] = useState({
    fullName: customer?.fullName ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.fullName.trim()) next.fullName = 'Vui long nhap ho ten day du';
    if (!formData.email.trim()) {
      next.email = 'Vui long nhap email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      next.email = 'Email khong hop le';
    }
    if (!formData.phone.trim()) next.phone = 'Vui long nhap so dien thoai';
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="mb-1 block text-sm font-semibold">
          Họ tên *
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          disabled={Boolean(customer?.fullName)}
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
          placeholder="Nhập họ tên"
        />
        {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={Boolean(customer?.email)}
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
          placeholder="Nhập email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-semibold">
          Số điện thoại *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Nhập số điện thoại"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Tạo đơn hàng'}
      </Button>

      {customer && (
        <p className="text-center text-xs text-muted-foreground">
          Thông tin từ tài khoản của bạn sẽ được dùng để xác nhận đơn hàng.
        </p>
      )}
    </form>
  );
}
