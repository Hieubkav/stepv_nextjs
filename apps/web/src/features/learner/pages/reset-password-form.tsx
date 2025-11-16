'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { Lock, AlertCircle, Loader, CheckCircle, Clock } from 'lucide-react';

type ResetPasswordFormProps = {
  token: string;
  onSuccess?: () => void;
};

export default function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const resetPassword = useMutation(api.students.resetPassword);
  const tokenInfo = useQuery(api.students.verifyResetToken, { token });
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (tokenInfo === null) {
      setError('Đường dẫn không hợp lệ hoặc đã hết hạn');
    }
  }, [tokenInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.newPassword.trim()) {
      setError('Vui lòng nhập mật khẩu mới');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (!formData.confirmPassword.trim()) {
      setError('Vui lòng xác nhận mật khẩu');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await resetPassword({
        token,
        newPassword: formData.newPassword,
      });

      if (result.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        setError(result.error || 'Đặt lại mật khẩu thất bại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (tokenInfo === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (tokenInfo === null) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Đường dẫn không hợp lệ</p>
            <p className="text-sm text-red-600 mt-1">
              Đường dẫn đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lấy lại mật khẩu
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-700">Đặt lại mật khẩu thành công!</p>
            <p className="text-sm text-green-600 mt-1">Đang chuyển hướng đến trang đăng nhập...</p>
          </div>
        </div>
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
        <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">Đường dẫn này có hiệu lực trong 24 giờ</p>
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
          Mật khẩu mới
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Tối thiểu 6 ký tự"
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
          Xác nhận mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu"
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
        {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
      </button>
    </form>
  );
}
