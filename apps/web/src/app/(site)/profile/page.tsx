'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  UserCircle2,
  Shield,
  KeyRound,
  Smartphone,
  Mail,
  User,
} from 'lucide-react';
import { useCustomerAuth } from '@/features/auth';

type ProfileFormState = {
  fullName: string;
  email: string;
  account: string;
  phone: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const validateProfile = (form: ProfileFormState) => {
  const trimmed = {
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    account: form.account.trim(),
    phone: form.phone.trim(),
  };
  if (!trimmed.fullName || !trimmed.email || !trimmed.account) {
    return { error: 'Vui lòng điền đầy đủ Họ tên, Email và Tài khoản' } as const;
  }
  return {
    data: {
      fullName: trimmed.fullName,
      email: trimmed.email,
      account: trimmed.account,
      phone: trimmed.phone || undefined,
    },
  } as const;
};

const validatePassword = (form: PasswordFormState) => {
  const { currentPassword, newPassword, confirmPassword } = form;
  if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
    return { error: 'Vui lòng điền đủ 3 trường mật khẩu.' } as const;
  }
  if (newPassword !== confirmPassword) return { error: 'Mật khẩu mới không khớp.' } as const;
  if (newPassword.length < 6) return { error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' } as const;
  return {
    data: {
      currentPassword: currentPassword.trim(),
      newPassword: newPassword.trim(),
    },
  } as const;
};

export default function ProfilePage() {
  const router = useRouter();
  const { customer, status, updateProfile, refresh } = useCustomerAuth();
  const changePassword = useMutation(api.customers.changePassword);

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    fullName: '',
    email: '',
    account: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const finishProfile = (message?: string) => {
    if (message) setProfileMessage(message);
    setProfileLoading(false);
  };

  const finishPassword = (message?: string) => {
    if (message) setPasswordMessage(message);
    setPasswordLoading(false);
  };

  useEffect(() => {
    if (status === 'idle' && !customer) {
      router.replace('/login');
    }
  }, [status, customer, router]);

  useEffect(() => {
    if (!customer) return;
    setProfileForm({
      fullName: customer.fullName || '',
      email: customer.email || '',
      account: customer.account || '',
      phone: customer.phone || '',
    });
  }, [customer]);

  const isHydrating = useMemo(() => status === 'loading' && !customer, [status, customer]);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) return;
    setProfileMessage(null);
    setProfileLoading(true);

    const validated = validateProfile(profileForm);
    if ('error' in validated) return finishProfile(validated.error);

    const result = await updateProfile(validated.data);
    if (!result.ok) return finishProfile(result.error ?? 'Cập nhật thất bại, thử lại sau.');

    await refresh();
    finishProfile('Đã cập nhật thông tin.');
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) return;
    setPasswordMessage(null);
    setPasswordLoading(true);

    const validated = validatePassword(passwordForm);
    if ('error' in validated) return finishPassword(validated.error);

    const result = await changePassword({ customerId: customer._id as any, ...validated.data });
    if (!result?.ok) return finishPassword(result?.error ?? 'Đổi mật khẩu thất bại.');

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    finishPassword('Đã đổi mật khẩu thành công.');
  };

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải thông tin khách hàng...</p>
      </div>
    );
  }

  if (!customer) return null;

  const customerName = profileForm.fullName || profileForm.account || 'Khách hàng';

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-28 pb-12">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-500/60 bg-yellow-500/10">
              <UserCircle2 className="h-4 w-4 text-yellow-300" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl font-semibold text-yellow-100">Hồ sơ</h1>
              <p className="text-sm text-neutral-400">{customerName}</p>
            </div>
          </div>

          <div className="text-[11px] text-right text-neutral-500 space-y-0.5">
            <p className="flex items-center justify-end gap-1">
              <Mail className="h-3 w-3 text-yellow-400" />
              <span>{profileForm.email || '—'}</span>
            </p>
            <p className="flex items-center justify-end gap-1">
              <Smartphone className="h-3 w-3 text-yellow-400" />
              <span>{profileForm.phone || '—'}</span>
            </p>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Thông tin cá nhân */}
          <Card className="bg-neutral-950/90 border border-yellow-500/40 text-neutral-100 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-100">Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {profileMessage && (
                <div className="mb-3 rounded-md border border-yellow-500/60 bg-yellow-500/10 px-3 py-1.5 text-[11px] text-yellow-100">
                  {profileMessage}
                </div>
              )}
              <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-[11px] flex items-center gap-1">
                    <User className="h-3 w-3 text-yellow-400" /> Họ tên
                  </Label>
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-xs text-white placeholder:text-neutral-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="account" className="text-[11px]">
                    Tài khoản
                  </Label>
                  <Input
                    id="account"
                    value={profileForm.account}
                    onChange={(e) => setProfileForm((p) => ({ ...p, account: e.target.value }))}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-xs text-white placeholder:text-neutral-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[11px] flex items-center gap-1">
                    <Mail className="h-3 w-3 text-yellow-400" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-xs text-white placeholder:text-neutral-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[11px] flex items-center gap-1">
                    <Smartphone className="h-3 w-3 text-yellow-400" /> Số điện thoại
                  </Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="09xx xxx xxx"
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-xs text-white placeholder:text-neutral-500"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={profileLoading}
                    className="h-8 bg-yellow-500 text-black hover:bg-yellow-400 border border-yellow-300 text-xs px-4"
                  >
                    {profileLoading ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Đổi mật khẩu */}
          <Card className="bg-neutral-950/90 border border-neutral-800 text-neutral-100">
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 border border-neutral-700">
                <Shield className="h-4 w-4 text-yellow-300" />
              </div>
              <CardTitle className="text-sm font-medium text-yellow-100">Mật khẩu</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {passwordMessage && (
                <div className="mb-3 rounded-md border border-yellow-500/60 bg-yellow-500/10 px-3 py-1.5 text-[11px] text-yellow-100">
                  {passwordMessage}
                </div>
              )}
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-[11px] flex items-center gap-1">
                    <KeyRound className="h-3 w-3 text-yellow-400" /> Hiện tại
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-xs text-white placeholder:text-neutral-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-[11px]">
                    Mới
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-xs text-white placeholder:text-neutral-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-[11px]">
                    Nhập lại
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-xs text-white placeholder:text-neutral-500"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="h-8 bg-yellow-500 text-black hover:bg-yellow-400 border border-yellow-300 text-xs px-4"
                  >
                    {passwordLoading ? 'Đang đổi...' : 'Đổi'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
