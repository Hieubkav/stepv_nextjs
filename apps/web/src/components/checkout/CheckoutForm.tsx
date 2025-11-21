'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStudentAuth } from '@/features/learner/auth';

type CheckoutFormProps = {
    onSubmit: (data: {
        fullName: string;
        email: string;
        phone?: string;
    }) => Promise<void>;
    isLoading?: boolean;
};

export default function CheckoutForm({ onSubmit, isLoading = false }: CheckoutFormProps) {
    const { student } = useStudentAuth();
    const [formData, setFormData] = useState({
        fullName: student?.fullName || '',
        email: student?.email || '',
        phone: student?.phone || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Tên đầy đủ không được để trống';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại không được để trống';
        }

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Checkout error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="fullName" className="block text-sm font-semibold mb-1">
                    Tên đầy đủ *
                </label>
                <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={student?.fullName ? true : false}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                    placeholder="Nhập tên đầy đủ"
                />
                {errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-1">
                    Email *
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={student?.email ? true : false}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                    placeholder="Nhập email"
                />
                {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-semibold mb-1">
                    Số điện thoại *
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập số điện thoại"
                />
                {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
            </div>

            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
            >
                {isLoading ? 'Đang xử lý...' : 'Tạo đơn hàng'}
            </Button>

            {student && (
                <p className="text-xs text-muted-foreground text-center">
                    Các thông tin từ tài khoản của bạn sẽ được dùng để xác nhận đơn hàng.
                </p>
            )}
        </form>
    );
}
