'use client';

import { useRouter } from 'next/navigation';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';
import RegisterForm from '@/features/learner/pages/register-form';

export default function RegisterPage() {
  const router = useRouter();
  const { student, status } = useStudentAuth();

  if (status === 'authenticated' && student) {
    router.replace('/dashboard/students');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">Đăng ký</h1>
          <p className="text-center text-slate-600 mb-8">Tạo tài khoản để bắt đầu học tập</p>
          <RegisterForm onSuccess={() => router.push('/khoa-hoc/dang-nhap')} />
        </div>
      </div>
    </div>
  );
}
