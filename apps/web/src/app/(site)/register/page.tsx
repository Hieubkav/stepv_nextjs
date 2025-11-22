'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomerRegisterForm from '@/features/auth/customer-register-form';
import { useCustomerAuth } from '@/features/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { customer, status } = useCustomerAuth();

  useEffect(() => {
    if (status === 'authenticated' && customer) {
      router.replace('/');
    }
  }, [status, customer, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">Đăng ký</h1>
          <p className="text-center text-slate-600 mb-8">
            Tạo tài khoản để thanh toán và quản lý đơn hàng của bạn
          </p>
          <CustomerRegisterForm onSuccess={() => router.push('/')} />
        </div>
      </div>
    </div>
  );
}
