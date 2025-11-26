'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/features/auth';
import { User, AtSign, Mail, Phone, Lock } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const { customer, status, register } = useCustomerAuth();
  const [step, setStep] = useState<1 | 2>(1);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordError = () => {
    if (!password || !confirmPassword) return 'Vui lòng điền mật khẩu';
    if (password !== confirmPassword) return 'Mật khẩu không khớp';
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return '';
  };

  React.useEffect(() => {
    if (status === 'authenticated' && customer) {
      router.replace('/');
    }
  }, [status, customer, router]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (step === 1) {
      // Validate step 1
      if (!fullName.trim() || !username.trim() || !email.trim()) {
        setError('Vui lòng điền đầy đủ thông tin');
        return;
      }
      setStep(2);
      return;
    }

    handleRegister();
  }

  async function handleRegister() {
    setLoading(true);
    setError('');

    const pwdError = passwordError();
    if (pwdError) {
      setError(pwdError);
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        account: username.trim(),
        email: email.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });

      if (!result.ok) {
        setError(result.error ?? 'Đăng ký thất bại. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      router.push('/');
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  const isStep1 = step === 1;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Card className="w-full max-w-lg border border-yellow-500/70 bg-neutral-950/80 backdrop-blur-sm shadow-lg shadow-yellow-500/20">
        <CardHeader className="space-y-4 text-center">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-yellow-400">
              Đăng ký tài khoản
            </CardTitle>
            <CardDescription className="text-sm text-neutral-300">
              Tạo tài khoản để thanh toán và quản lý đơn hàng của bạn.
            </CardDescription>
          </div>

          {/* Wizard steps */}
          <div className="flex items-center justify-center gap-4 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full border text-[11px] flex items-center justify-center font-medium ${
                  isStep1
                    ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300'
                    : 'border-neutral-600 text-neutral-400'
                }`}
              >
                1
              </div>
              <span className={isStep1 ? 'text-yellow-200' : 'text-neutral-400'}>
                Thông tin cơ bản
              </span>
            </div>
            <div className="h-px w-8 bg-neutral-700" />
            <div className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full border text-[11px] flex items-center justify-center font-medium ${
                  !isStep1
                    ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300'
                    : 'border-neutral-600 text-neutral-400'
                }`}
              >
                2
              </div>
              <span className={!isStep1 ? 'text-yellow-200' : 'text-neutral-400'}>
                Bảo mật & liên hệ
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}

            {isStep1 ? (
              <>
                {/* Họ tên */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fullName"
                    className="flex items-center gap-2 text-xs font-medium text-neutral-200"
                  >
                    <User className="h-4 w-4 text-yellow-400" />
                    Họ tên
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-sm text-white placeholder:text-neutral-500"
                  />
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="username"
                    className="flex items-center gap-2 text-xs font-medium text-neutral-200"
                  >
                    <AtSign className="h-4 w-4 text-yellow-400" />
                    Tài khoản (username)
                  </Label>
                  <Input
                    id="username"
                    placeholder="pokestorevn@gmail.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-sm text-white placeholder:text-neutral-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-xs font-medium text-neutral-200"
                  >
                    <Mail className="h-4 w-4 text-yellow-400" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-sm text-white placeholder:text-neutral-500"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Phone */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-xs font-medium text-neutral-200"
                  >
                    <Phone className="h-4 w-4 text-yellow-400" />
                    Số điện thoại <span className="text-neutral-500 text-[11px]">(tuỳ chọn)</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="09xx xxx xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-sm text-white placeholder:text-neutral-500"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-xs font-medium text-neutral-200"
                  >
                    <Lock className="h-4 w-4 text-yellow-400" />
                    Mật khẩu
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-sm text-white placeholder:text-neutral-500"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 text-xs font-medium text-neutral-200"
                  >
                    <Lock className="h-4 w-4 text-yellow-400" />
                    Nhập lại mật khẩu
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-black/60 border-neutral-700 focus:border-yellow-500 focus-visible:ring-yellow-500/40 text-sm text-white placeholder:text-neutral-500"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Vui lòng nhập lại mật khẩu để xác nhận.
                  </p>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              {step === 2 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-neutral-700 text-black hover:bg-neutral-900/70 hover:text-white text-xs px-4"
                >
                  Quay lại
                </Button>
              ) : (
                <span className="text-[11px] text-neutral-500 text-left">
                  Bước 1/2: Nhập thông tin cơ bản.
                </span>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="ml-auto bg-yellow-500 text-black hover:bg-yellow-400 font-semibold text-sm tracking-wide border border-yellow-400 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : isStep1 ? 'Tiếp tục' : 'Tạo tài khoản'}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex items-center justify-center text-xs text-neutral-400 gap-1">
          <span>Đã có tài khoản?</span>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="font-medium text-yellow-400 hover:underline underline-offset-2 decoration-yellow-400"
          >
            Đăng nhập
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
