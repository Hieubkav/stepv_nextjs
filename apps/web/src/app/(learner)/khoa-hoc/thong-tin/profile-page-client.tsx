'use client';

import { type FormEvent, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';
import { Mail, Lock, User, AlertCircle, Loader, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';

type StudentAccount = {
  _id: Id<'students'>;
  account: string;
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

type ProfilePageClientProps = {
  student: StudentAccount;
};

export default function ProfilePageClient({ student: initialStudent }: ProfilePageClientProps) {
  const { student: currentStudent, refresh } = useStudentAuth();
  const updateStudentMutation = useMutation(api.students.updateStudent);
  const changePasswordMutation = useMutation(api.students.changePassword);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: currentStudent?.fullName || '',
    email: currentStudent?.email || '',
    phone: currentStudent?.phone || '',
    notes: currentStudent?.notes || '',
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateProfileForm = (): boolean => {
    if (!profileData.fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }
    if (!profileData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setError('Email không hợp lệ');
      return false;
    }
    return true;
  };

  const validatePasswordForm = (): boolean => {
    if (!passwordData.currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return false;
    }
    if (!passwordData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return false;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return false;
    }
    return true;
  };

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateStudentMutation({
        id: currentStudent!._id,
        fullName: profileData.fullName.trim(),
        email: profileData.email.trim().toLowerCase(),
        phone: profileData.phone.trim() || undefined,
        notes: profileData.notes.trim() || undefined,
      });

      await refresh();
      setIsEditingProfile(false);
      setSuccess('Cập nhật thông tin thành công');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật thông tin';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const student = currentStudent;
      if (!student) throw new Error('Không tìm thấy tài khoản');

      const result = await changePasswordMutation({
        studentId: student._id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (!result.ok) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      await refresh();
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSuccess('Cập nhật mật khẩu thành công');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật mật khẩu';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const displayStudent = currentStudent || initialStudent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Thông tin cá nhân</h1>
            <p className="text-slate-600">Quản lý thông tin tài khoản và bảo mật của bạn</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          <div className="flex gap-4 mb-8 border-b">
            <button
              onClick={() => {
                setActiveTab('profile');
                setIsEditingProfile(false);
                setError(null);
                setSuccess(null);
              }}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="inline-block w-4 h-4 mr-2" />
              Thông tin chung
            </button>
            <button
              onClick={() => {
                setActiveTab('password');
                setError(null);
                setSuccess(null);
              }}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="inline-block w-4 h-4 mr-2" />
              Bảo mật
            </button>
          </div>

          {activeTab === 'profile' && (
            <div>
              {!isEditingProfile ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-600">Tài khoản</label>
                      <p className="text-lg text-slate-900 mt-1">{displayStudent.account}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600">Họ tên</label>
                      <p className="text-lg text-slate-900 mt-1">{displayStudent.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600">Email</label>
                      <p className="text-lg text-slate-900 mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {displayStudent.email || 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600">Số điện thoại</label>
                      <p className="text-lg text-slate-900 mt-1">{displayStudent.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  {displayStudent.notes && (
                    <div>
                      <label className="text-sm font-semibold text-slate-600">Ghi chú</label>
                      <p className="text-slate-900 mt-1 whitespace-pre-wrap">{displayStudent.notes}</p>
                    </div>
                  )}
                  <div className="pt-6 border-t">
                    <button
                      onClick={() => {
                        setIsEditingProfile(true);
                        setProfileData({
                          fullName: displayStudent.fullName,
                          email: displayStudent.email || '',
                          phone: displayStudent.phone || '',
                          notes: displayStudent.notes || '',
                        });
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Chỉnh sửa thông tin
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập họ tên"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập email"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập số điện thoại"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      name="notes"
                      value={profileData.notes}
                      onChange={handleProfileChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập ghi chú"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                      Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setError(null);
                      }}
                      disabled={isLoading}
                      className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập mật khẩu hiện tại"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                    }
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập mật khẩu mới"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Xác nhận mật khẩu mới"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                    }
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
