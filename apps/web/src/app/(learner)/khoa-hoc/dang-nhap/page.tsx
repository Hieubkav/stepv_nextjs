'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';
import LoginForm from '@/features/learner/pages/login-form';

export default function LoginPage() {
  const router = useRouter();
  const { student, status } = useStudentAuth();

  useEffect(() => {
    if (status === 'authenticated' && student) {
      router.replace('/khoa-hoc');
    }
  }, [status, student, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">Đăng nhập</h1>
          <p className="text-center text-slate-600 mb-8">Đăng nhập để tiếp tục học tập</p>
          <LoginForm onSuccess={() => router.push('/khoa-hoc')} />
        </div>
      </div>
    </div>
  );
}
