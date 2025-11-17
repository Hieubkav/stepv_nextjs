'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { Mail, AlertCircle, Loader, CheckCircle, Info } from 'lucide-react';

type ResetPasswordRequestFormProps = {
  onSuccess?: () => void;
};

export default function ResetPasswordRequestForm({ onSuccess }: ResetPasswordRequestFormProps) {
  const requestPasswordReset = useMutation(api.students.requestPasswordReset);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dohy.dev';
      const result = await requestPasswordReset({
        email: email.trim().toLowerCase(),
        resetBaseUrl: `${baseUrl}/khoa-hoc/reset-password`,
      });

      if (result.ok) {
        setSentEmail(email);
        setSuccess(true);
        setEmail('');
      } else {
        setError(result.error || 'Email không tồn tại trong hệ thống');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-700">Email đã được gửi!</p>
            <p className="text-sm text-green-600 mt-1">
              Vui lòng kiểm tra email {sentEmail} để nhận đường dẫn xác thực (có hiệu lực 24 giờ)
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700">Nếu bạn không nhận được email, vui lòng:</p>
            <ul className="text-sm text-blue-600 mt-2 ml-4 list-disc">
              <li>Kiểm tra thư mục Spam</li>
              <li>Chờ vài phút rồi thử lại</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => {
            setSuccess(false);
            setEmail('');
          }}
          className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg transition"
        >
          Gửi lại
        </button>

        <p className="text-center text-sm text-slate-600">
          <Link href="/khoa-hoc/dang-nhap" className="text-blue-600 hover:text-blue-700 underline">
            Quay lại trang đăng nhập
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Nhập email liên kết với tài khoản của bạn. Chúng tôi sẽ gửi đường dẫn xác thực (24 giờ)
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        {isLoading && <Loader className="h-4 w-4 animate-spin" />}
        {isLoading ? 'Đang gửi...' : 'Gửi đường dẫn xác thực'}
      </button>

      <p className="text-center text-sm text-slate-600">
        <Link href="/khoa-hoc/dang-nhap" className="text-blue-600 hover:text-blue-700 underline">
          Quay lại trang đăng nhập
        </Link>
      </p>
    </form>
  );
}
