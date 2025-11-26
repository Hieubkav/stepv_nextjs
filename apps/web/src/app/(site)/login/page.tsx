'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Manrope } from 'next/font/google';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCustomerAuth } from '@/features/auth';

const bodyFont = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
});

export default function LoginPage() {
  const router = useRouter();
  const { customer, status, login } = useCustomerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && customer) {
      router.replace('/');
    }
  }, [status, customer, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    setLoading(true);
    const result = await login({ email: trimmedEmail, password: trimmedPassword, rememberMe });
    if (!result.ok) {
      setError(result.error ?? 'Đăng nhập thất bại');
    } else {
      router.replace('/');
    }
    setLoading(false);
  };

  return (
    <div className={`${bodyFont.className} min-h-screen w-full bg-black flex items-center justify-center px-4`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-yellow-500/70 bg-black/80 px-7 py-8 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-center"
          >
            <h1 className="text-2xl font-semibold tracking-[0.2em] text-white uppercase">
              DOHY STUDIO
            </h1>
            <p className="mt-2 text-xs text-zinc-400">
              Cổng truy cập dành cho học viên & khách hàng
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {error && (
              <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}
            {/* Email Input */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-yellow-400/90 uppercase font-semibold">
                Email hoặc tên đăng nhập
              </Label>
              <div className="relative group">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-400/70 transition-colors">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 rounded-xl border-yellow-500/40 bg-black/60 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-yellow-500/60 focus-visible:ring-yellow-500/50 focus-visible:ring-offset-0 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-yellow-400/90 uppercase font-semibold">
                Mật khẩu truy cập
              </Label>
              <div className="relative group">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-400/70 transition-colors">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-yellow-500/40 bg-black/60 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-yellow-500/60 focus-visible:ring-yellow-500/50 focus-visible:ring-offset-0 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between gap-3 text-xs text-zinc-300 pt-1">
              <label className="flex items-center gap-2 cursor-pointer hover:text-yellow-400/70 transition-colors">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                  className="border-yellow-500/70 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 data-[state=checked]:text-black"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>

              <button
                type="button"
                className="text-[11px] font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                onClick={() => router.push('/forgot-password')}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="mt-6 w-full h-11 rounded-xl bg-yellow-500 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-black hover:bg-yellow-400 transition-all active:scale-95 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex items-center justify-between text-[11px] text-zinc-500"
          >
            <span>Chưa có tài khoản?</span>
            <button
              type="button"
              className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
              onClick={() => router.push('/register')}
            >
              Đăng ký ngay
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
