'use client';

import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">Lấy lại mật khẩu</h1>
          <p className="text-center text-slate-600 mb-8">Chọn phương thức xác thực của bạn</p>

          <div className="space-y-3">
            {/* OTP Method */}
            <Link
              href="/khoa-hoc/reset-password-otp"
              className="block w-full border-2 border-blue-600 rounded-lg p-4 hover:bg-blue-50 transition text-center"
            >
              <div className="font-semibold text-blue-600 mb-1">🔐 Mã OTP qua Email</div>
              <p className="text-sm text-slate-600">Nhanh nhất (15 phút hết hạn)</p>
            </Link>

            {/* Link Based Method */}
            <Link
              href="/khoa-hoc/reset-password-request"
              className="block w-full border-2 border-slate-300 rounded-lg p-4 hover:bg-slate-50 transition text-center"
            >
              <div className="font-semibold text-slate-700 mb-1">🔗 Đường dẫn xác thực</div>
              <p className="text-sm text-slate-600">Truyền thống (24 giờ hết hạn)</p>
            </Link>
          </div>

          <hr className="my-6" />

          <p className="text-center text-sm text-slate-600">
            <Link href="/khoa-hoc/dang-nhap" className="text-blue-600 hover:text-blue-700 underline">
              Quay lại trang đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
