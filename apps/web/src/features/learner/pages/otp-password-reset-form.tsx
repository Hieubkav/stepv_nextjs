'use client';

import { type FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { Mail, AlertCircle, Loader, CheckCircle, Info, Lock, Send } from 'lucide-react';

type Step = 'email' | 'otp' | 'success';

type OTPPasswordResetFormProps = {
    onSuccess?: () => void;
};

export default function OTPPasswordResetForm({ onSuccess }: OTPPasswordResetFormProps) {
    const requestOTP = useMutation(api.otp.requestPasswordResetOTP);
    const verifyOTPAndReset = useMutation(api.otp.verifyOTPAndResetPassword);
    const getOTPStatus = useQuery(api.otp.getOTPStatus, { email: '' });

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    // OTP status for UI
    const [otpExpiresIn, setOtpExpiresIn] = useState(0);
    const [otpRemainingAttempts, setOtpRemainingAttempts] = useState(0);
    const [isOtpBlocked, setIsOtpBlocked] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [resendCountdown, setResendCountdown] = useState(0);

    // Format OTP input (only digits, max 6)
    const handleOtpChange = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 6);
        setOtpCode(digits);
    };

    // Timer for OTP expiry
    useEffect(() => {
        if (step !== 'otp' || otpExpiresIn <= 0) return;

        const timer = setInterval(() => {
            setOtpExpiresIn((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [step, otpExpiresIn]);

    // Timer for resend button
    useEffect(() => {
        if (resendCountdown <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setResendCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCountdown]);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
            const result = await requestOTP({ email: email.trim().toLowerCase() });

            if (result.success) {
                setStep('otp');
                setOtpCode('');
                setOtpExpiresIn(15 * 60); // 15 minutes
                setOtpRemainingAttempts(3);
                setIsOtpBlocked(false);
                setCanResend(false);
                setResendCountdown(60);
                setError(null);
            } else {
                setError(result.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!otpCode || otpCode.length !== 6) {
            setError('Vui lòng nhập mã OTP 6 chữ số');
            return;
        }

        if (!newPassword) {
            setError('Vui lòng nhập mật khẩu mới');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }

        setIsLoading(true);

        try {
            const result = await verifyOTPAndReset({
                email: email.trim().toLowerCase(),
                otpCode,
                newPassword,
            });

            if (result.success) {
                setStep('success');
                setSuccessMessage(result.message);
                setError(null);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    onSuccess?.();
                }, 3000);
            } else {
                setError(result.message || 'Có lỗi xảy ra');
                // Update attempts if error is about OTP
                if (result.message?.includes('Còn')) {
                    const match = result.message.match(/Còn (\d+) lần/);
                    if (match) {
                        setOtpRemainingAttempts(parseInt(match[1]));
                    }
                }
                if (result.message?.includes('Vui lòng thử lại sau')) {
                    setIsOtpBlocked(true);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await requestOTP({ email: email.trim().toLowerCase() });

            if (result.success) {
                setOtpCode('');
                setOtpExpiresIn(15 * 60);
                setOtpRemainingAttempts(3);
                setIsOtpBlocked(false);
                setCanResend(false);
                setResendCountdown(60);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-green-700">Thành công!</p>
                        <p className="text-sm text-green-600 mt-1">{successMessage}</p>
                        <p className="text-sm text-green-600 mt-2">Đang chuyển hướng đến trang đăng nhập...</p>
                    </div>
                </div>

                <p className="text-center text-sm text-slate-600">
                    <Link href="/khoa-hoc/dang-nhap" className="text-blue-600 hover:text-blue-700 underline">
                        Hoặc click vào đây để đăng nhập ngay
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div>
            {step === 'email' ? (
                // Step 1: Email entry
                <form onSubmit={handleEmailSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700">
                            Nhập email liên kết với tài khoản. Chúng tôi sẽ gửi mã OTP để xác thực.
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
                        {isLoading ? 'Đang gửi OTP...' : 'Gửi mã OTP'}
                    </button>

                    <p className="text-center text-sm text-slate-600">
                        <Link href="/khoa-hoc/dang-nhap" className="text-blue-600 hover:text-blue-700 underline">
                            Quay lại trang đăng nhập
                        </Link>
                    </p>
                </form>
            ) : (
                // Step 2: OTP and password entry
                <form onSubmit={handleOTPSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* OTP Code Status */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-blue-700 font-medium">
                                    Mã OTP đã được gửi đến {email}
                                </p>
                                <div className="mt-2 space-y-1 text-sm text-blue-600">
                                    <p>
                                        ⏱️ Hết hạn trong:{' '}
                                        <span className="font-semibold">
                                            {Math.floor(otpExpiresIn / 60)}:{String(otpExpiresIn % 60).padStart(2, '0')}
                                        </span>
                                    </p>
                                    <p>
                                        🔑 Còn{' '}
                                        <span className="font-semibold">{otpRemainingAttempts}</span>
                                        {' '}lần nhập
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* OTP Input */}
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-2">
                            Mã OTP (6 chữ số)
                        </label>
                        <div className="relative">
                            <Send className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                value={otpCode}
                                onChange={(e) => handleOtpChange(e.target.value)}
                                placeholder="000000"
                                disabled={isLoading || isOtpBlocked || otpExpiresIn <= 0}
                                maxLength={6}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-50 disabled:text-slate-500 text-center font-mono text-lg tracking-widest"
                            />
                        </div>
                        {otpExpiresIn <= 0 && (
                            <p className="text-sm text-red-600 mt-2">Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.</p>
                        )}
                    </div>

                    {/* Resend OTP Button */}
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={!canResend || isLoading}
                        className="w-full border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold py-2 px-4 rounded-lg transition"
                    >
                        {!canResend ? `Gửi lại OTP trong ${resendCountdown}s` : 'Gửi lại mã OTP'}
                    </button>

                    {/* New Password Input */}
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                disabled={isLoading || isOtpBlocked || otpExpiresIn <= 0}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                disabled={isLoading || isOtpBlocked || otpExpiresIn <= 0}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={
                            isLoading ||
                            isOtpBlocked ||
                            otpExpiresIn <= 0 ||
                            otpCode.length !== 6 ||
                            !newPassword ||
                            !confirmPassword
                        }
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                        {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </button>

                    {/* Go Back Button */}
                    <button
                        type="button"
                        onClick={() => {
                            setStep('email');
                            setOtpCode('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setError(null);
                        }}
                        className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Quay lại
                    </button>

                    <p className="text-center text-sm text-slate-600">
                        <Link href="/khoa-hoc/dang-nhap" className="text-blue-600 hover:text-blue-700 underline">
                            Quay lại trang đăng nhập
                        </Link>
                    </p>
                </form>
            )}
        </div>
    );
}
