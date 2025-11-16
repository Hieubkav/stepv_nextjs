'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResetPasswordForm from '@/features/learner/pages/reset-password-form';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-4 text-red-600">Lỗi</h1>
            <p className="text-center text-slate-600 mb-6">Đường dẫn không hợp lệ. Vui lòng yêu cầu lấy lại mật khẩu</p>
            <button
              onClick={() => router.push('/khoa-hoc/forgot-password')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">Đặt lại mật khẩu</h1>
          <p className="text-center text-slate-600 mb-8">Nhập mật khẩu mới của bạn</p>
          <ResetPasswordForm token={token} onSuccess={() => router.push('/khoa-hoc/dang-nhap')} />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
