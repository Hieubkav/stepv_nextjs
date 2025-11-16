'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';

type LoginFormProps = {
  onSuccess?: () => void;
};

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, status } = useStudentAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === 'loading';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    const result = await login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });

    if (result.ok) {
      onSuccess?.();
    } else {
      setError(result.error || 'Đăng nhập thất bại');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

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
             placeholder="Nhập email của bạn"
             disabled={isLoading}
             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
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
            placeholder="Nhập mật khẩu"
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="rememberMe"
          type="checkbox"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
          disabled={isLoading}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-700 cursor-pointer">
          Ghi nhớ đăng nhập
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        {isLoading && <Loader className="h-4 w-4 animate-spin" />}
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      <div className="text-center space-y-2">
        <p className="text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <Link href="/khoa-hoc/dang-ky" className="text-blue-600 hover:text-blue-700 font-semibold">
            Đăng ký ngay
          </Link>
        </p>
        <p className="text-sm">
          <Link href="/khoa-hoc/forgot-password" className="text-slate-600 hover:text-slate-700 underline">
            Quên mật khẩu?
          </Link>
        </p>
      </div>
    </form>
  );
}
