'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';
import ProfilePageClient from './profile-page-client';

export default function ProfilePage() {
  const router = useRouter();
  const { student, status } = useStudentAuth();

  useEffect(() => {
    if (status === 'idle') {
      router.replace('/khoa-hoc/dang-nhap');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return <ProfilePageClient student={student} />;
}
