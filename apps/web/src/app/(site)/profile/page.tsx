'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserCircle2, Shield, KeyRound, Smartphone, Mail, User } from 'lucide-react';
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

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      <div className="min-h-screen bg-gradient-to-b from-[#050915] via-[#071026] to-[#02050d] text-slate-100">
        <div className="flex h-full items-center justify-center px-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            Đang tải thông tin khách hàng...
          </div>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const customerName = profileForm.fullName || profileForm.account || 'Khách hàng';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050915] via-[#071026] to-[#02050d] text-slate-100">
      <div className="relative mx-auto max-w-5xl px-3 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32 md:pt-36">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_center,#fbbf2426,transparent_60%)] opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-8 top-20 h-64 bg-[radial-gradient(circle_at_center,#22d3ee1a,transparent_65%)] blur-3xl" />

        <div className="relative z-10 space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/40 bg-amber-400/15 text-amber-100 shadow-inner">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80">Dohy Studio</p>
                <h1 className="text-2xl font-semibold text-white">Hồ sơ khách hàng</h1>
                <p className="text-sm text-slate-400">Quản lý thông tin truy cập và liên hệ.</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3 text-xs text-slate-300 shadow-[0_15px_45px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-amber-200" />
                <span>{profileForm.email || 'Email chưa cập nhật'}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5 text-amber-200" />
                <span>{profileForm.phone || 'Số điện thoại chưa có'}</span>
              </div>
            </div>
          </header>

          <main className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr] lg:gap-5">
            <Card className="border border-white/5 bg-white/[0.04] text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white">Thông tin tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {profileMessage ? (
                  <div className="mb-3 rounded-lg border border-amber-300/50 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-50">
                    {profileMessage}
                  </div>
                ) : null}

                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-[11px] uppercase tracking-[0.15em] text-slate-300">
                      Họ tên
                    </Label>
                    <Input
                      id="fullName"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                      className="border-white/10 bg-white/[0.02] text-sm text-white placeholder:text-slate-500 focus:border-amber-300/60 focus-visible:ring-amber-200/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="account" className="text-[11px] uppercase tracking-[0.15em] text-slate-300">
                      Tài khoản
                    </Label>
                    <Input
                      id="account"
                      value={profileForm.account}
                      onChange={(e) => setProfileForm((p) => ({ ...p, account: e.target.value }))}
                      className="border-white/10 bg-white/[0.02] text-sm text-white placeholder:text-slate-500 focus:border-amber-300/60 focus-visible:ring-amber-200/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.15em] text-slate-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                      className="border-white/10 bg-white/[0.02] text-sm text-white placeholder:text-slate-500 focus:border-amber-300/60 focus-visible:ring-amber-200/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-[11px] uppercase tracking-[0.15em] text-slate-300">
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="09xx xxx xxx"
                      className="border-white/10 bg-white/[0.02] text-sm text-white placeholder:text-slate-500 focus:border-amber-300/60 focus-visible:ring-amber-200/40"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={profileLoading}
                      className="h-9 rounded-full border border-amber-200/60 bg-amber-400 text-slate-950 shadow-[0_12px_35px_rgba(251,191,36,0.35)] transition hover:brightness-110"
                    >
                      {profileLoading ? 'Đang lưu...' : 'Lưu thông tin'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border border-white/5 bg-[#0b1224]/80 text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/50 bg-amber-400/10 text-amber-100">
                    <Shield className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-white">Mật khẩu</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {passwordMessage ? (
                  <div className="mb-3 rounded-lg border border-amber-300/50 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-50">
                    {passwordMessage}
                  </div>
                ) : null}
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="currentPassword"
                      className="text-[11px] uppercase tracking-[0.15em] text-slate-300"
                    >
                      Hiện tại
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                      className="border-white/10 bg-white/[0.02] text-sm text-white placeholder:text-slate-500 focus:border-amber-300/60 focus-visible:ring-amber-200/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-[11px] uppercase tracking-[0.15em] text-slate-300">
                      Mới
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                      className="border-white/10 bg-white/[0.02] text-sm text-white placeholder:text-slate-500 focus:border-amber-300/60 focus-visible:ring-amber-200/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-[11px] uppercase tracking-[0.15em] text-slate-300"
                    >
                      Nhập lại
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      className="border-white/10 bg-white/[0.02] text-sm text-white placeholder:text-slate-500 focus:border-amber-300/60 focus-visible:ring-amber-200/40"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="h-9 rounded-full border border-amber-200/60 bg-amber-400 text-slate-950 shadow-[0_12px_35px_rgba(251,191,36,0.35)] transition hover:brightness-110"
                    >
                      {passwordLoading ? 'Đang đổi...' : 'Cập nhật mật khẩu'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
