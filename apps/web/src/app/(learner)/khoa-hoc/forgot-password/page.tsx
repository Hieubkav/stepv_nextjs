'use client';

import { useRouter } from 'next/navigation';
import ForgotPasswordForm from '@/features/learner/pages/forgot-password-form';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">Lấy lại mật khẩu</h1>
          <p className="text-center text-slate-600 mb-8">Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>
          <ForgotPasswordForm onSuccess={() => router.push('/khoa-hoc/dang-nhap')} />
        </div>
      </div>
    </div>
  );
}
