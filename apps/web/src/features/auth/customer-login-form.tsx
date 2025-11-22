'use client';

import { type FormEvent, type InputHTMLAttributes, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useCustomerAuth } from '@/features/auth';

type CustomerLoginFormProps = {
    onSuccess?: () => void;
};

type FormState = {
    email: string;
    password: string;
    rememberMe: boolean;
};

export default function CustomerLoginForm({ onSuccess }: CustomerLoginFormProps) {
    const { login, status } = useCustomerAuth();
    const [formState, setFormState] = useState<FormState>({
        email: '',
        password: '',
        rememberMe: true,
    });
    const [error, setError] = useState<string | null>(null);

    const isLoading = status === 'loading';

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const trimmedEmail = formState.email.trim();
        const trimmedPassword = formState.password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const result = await login({
            email: trimmedEmail,
            password: trimmedPassword,
            rememberMe: formState.rememberMe,
        });

        if (result.ok) {
            onSuccess?.();
            return;
        }

        setError(result.error || 'Đăng nhập thất bại');
    };

    const updateField = (key: keyof FormState, value: string | boolean) => {
        setFormState((prev) => ({ ...prev, [key]: value }));
    };

    const helperText = useMemo(
        () => 'Cổng truy cập dành cho học viên & khách hàng của DOHY Studio',
        [],
    );

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 md:space-y-10"
        >
            <p className="text-xs md:text-sm text-neutral-400 text-center leading-6 md:leading-relaxed">
                {helperText}
            </p>

            <div className="space-y-6 md:space-y-8">
                <LuxuryInput
                    id="email"
                    label="Email hoặc tên đăng nhập"
                    type="email"
                    value={formState.email}
                    disabled={isLoading}
                    autoComplete="username"
                    onValueChange={(value) => updateField('email', value)}
                />
                <LuxuryInput
                    id="password"
                    label="Mật khẩu truy cập"
                    type="password"
                    value={formState.password}
                    disabled={isLoading}
                    autoComplete="current-password"
                    onValueChange={(value) => updateField('password', value)}
                />
            </div>

            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-neutral-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        checked={formState.rememberMe}
                        onChange={(event) => updateField('rememberMe', event.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-amber-500/40 bg-transparent text-amber-400 focus:ring-amber-500/60 focus:outline-none"
                    />
                    <span>Ghi nhớ đăng nhập</span>
                </label>

                <Link
                    href="/khoa-hoc/forgot-password"
                    className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                    Quên mật khẩu?
                </Link>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-rose-300"
                >
                    <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_14px_rgba(248,113,113,0.6)]" />
                    <p className="text-[11px] uppercase tracking-[0.2em] font-mono">{error}</p>
                </motion.div>
            )}

            <GoldButton type="submit" isLoading={isLoading}>
                Đăng nhập
            </GoldButton>

            <div className="pt-4 border-t border-neutral-800/50 flex flex-col md:flex-row items-center justify-center gap-3 text-sm text-neutral-300">
                <span>Chưa có tài khoản?</span>
                <Link
                    href="/register"
                    className="text-amber-400 hover:text-amber-200 font-semibold tracking-[0.1em] uppercase transition-colors"
                >
                    Đăng ký ngay
                </Link>
            </div>
        </motion.form>
    );
}

type LuxuryInputProps = {
    label: string;
    onValueChange?: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>;

function LuxuryInput({ label, value = '', onValueChange, id, disabled, ...props }: LuxuryInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = typeof value === 'string' ? value.length > 0 : Boolean(value);

    return (
        <div className={`relative group ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
            <label
                htmlFor={id}
                className={`absolute left-3 px-1 font-sans uppercase tracking-[0.18em] transition-all duration-300 pointer-events-none ${
                    isFocused || hasValue
                        ? '-top-3 text-[10px] text-amber-400 bg-[#0b0901]/80'
                        : 'top-3.5 text-xs text-neutral-500 group-hover:text-neutral-300'
                }`}
            >
                {label}
            </label>

            <div
                className={`relative rounded-2xl border bg-black/40 backdrop-blur-sm transition-all duration-300 ${
                    isFocused
                        ? 'border-amber-400/70 shadow-[0_0_20px_-8px_rgba(245,158,11,0.6)]'
                        : 'border-neutral-800 hover:border-neutral-700'
                }`}
            >
                <input
                    id={id}
                    value={value}
                    disabled={disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(event) => onValueChange?.(event.target.value)}
                    className="w-full bg-transparent py-4 px-4 text-neutral-100 focus:outline-none font-[var(--font-dohy-display)] text-lg tracking-wide placeholder-transparent disabled:cursor-not-allowed rounded-2xl"
                    {...props}
                />

                <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50" />
            </div>
        </div>
    );
}

type GoldButtonProps = {
    isLoading?: boolean;
    children?: React.ReactNode;
} & HTMLMotionProps<'button'>;

function GoldButton({ children, isLoading, className, ...props }: GoldButtonProps) {
    return (
        <motion.button
            whileHover={!isLoading ? { scale: 1.01 } : undefined}
            whileTap={!isLoading ? { scale: 0.99 } : undefined}
            disabled={isLoading}
            className={`relative w-full h-14 group overflow-hidden rounded-xl border border-amber-500/40 bg-transparent text-amber-300 shadow-[0_0_24px_-10px_rgba(245,158,11,0.4)] transition-colors duration-500 disabled:cursor-not-allowed disabled:opacity-70 ${className ?? ''}`}
            {...props}
        >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(245,158,11,0.05)_12px,rgba(245,158,11,0.05)_24px)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
                variants={{ hover: { width: '100%', opacity: 0.16 } }}
                initial={{ width: '0%', opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute inset-0 m-auto h-full bg-amber-500 rounded-xl"
            />
            <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-amber-400/70 rounded-tl-md opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-amber-400/70 rounded-br-md opacity-40 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 flex items-center justify-center h-full w-full">
                {isLoading ? (
                    <div className="flex items-center gap-3 text-amber-200">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-[11px] font-mono tracking-[0.18em] uppercase">
                            Đang xử lý...
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="font-[var(--font-dohy-display)] text-[13px] tracking-[0.22em] uppercase font-semibold">
                            {children}
                        </span>
                        <motion.span
                            variants={{ hover: { x: 4, opacity: 1 } }}
                            initial={{ x: 0, opacity: 0.7 }}
                            className="text-amber-300 text-xs"
                        >
                            ►
                        </motion.span>
                    </div>
                )}
            </div>
        </motion.button>
    );
}
