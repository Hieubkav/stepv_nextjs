'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Loader, Mail, Phone, User, Lock } from 'lucide-react';
import { useCustomerAuth } from '@/features/auth';

type CustomerRegisterFormProps = {
  onSuccess?: () => void;
};

export default function CustomerRegisterForm({ onSuccess }: CustomerRegisterFormProps) {
  const { register, status } = useCustomerAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    account: '',
    phone: '',
  });
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === 'loading';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.account.trim()) {
      setError('Vui lòng điền đầy đủ Họ tên, Email, Tài khoản và Mật khẩu');
      return;
    }

    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      account: formData.account,
      phone: formData.phone || undefined,
    });

    if (result.ok) {
      onSuccess?.();
    } else {
      setError(result.error || 'Đăng ký thất bại');
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-50 disabled:text-slate-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
          Họ tên
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            disabled={isLoading}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="account" className="block text-sm font-medium text-slate-700 mb-2">
          Tài khoản (username)
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            id="account"
            name="account"
            value={formData.account}
            onChange={handleChange}
            placeholder="ten-dang-nhap"
            disabled={isLoading}
            className={inputClass}
          />
        </div>
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
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email của bạn"
            disabled={isLoading}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
          Số điện thoại (tuỳ chọn)
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="09xx xxx xxx"
            disabled={isLoading}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Ít nhất 6 ký tự"
            disabled={isLoading}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        {isLoading && <Loader className="h-4 w-4 animate-spin" />}
        {isLoading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
      </button>

      <div className="text-center space-y-2">
        <p className="text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Đăng nhập
          </Link>
        </p>
      </div>
    </form>
  );
}
