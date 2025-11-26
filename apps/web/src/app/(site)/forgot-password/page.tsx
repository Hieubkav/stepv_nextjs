'use client';

import { useRouter } from 'next/navigation';
import OTPPasswordResetForm from '@/features/learner/pages/otp-password-reset-form';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-200 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 bg-amber-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 bg-indigo-500/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl border border-amber-500/20 bg-white/5 backdrop-blur-md rounded-2xl shadow-[0_15px_60px_rgba(0,0,0,0.5)] p-8 md:p-10 space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-amber-300/80">Dohy Studio</p>
          <h1 className="text-3xl font-semibold text-white">Khôi phục mật khẩu</h1>
          <p className="text-sm text-slate-400">
            Nhập email để nhận mã OTP qua SMTP và đặt lại mật khẩu mới.
          </p>
        </div>

        <OTPPasswordResetForm
          loginHref="/login"
          onSuccess={() => router.push('/login')}
        />
      </div>
    </div>
  );
}
