'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Barlow_Condensed, Manrope } from 'next/font/google';
import CustomerLoginForm from '@/features/auth/customer-login-form';
import { useCustomerAuth } from '@/features/auth';
import CreativeBackground from './_components/creative-background';

const displayFont = Barlow_Condensed({
    subsets: ['latin', 'latin-ext'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-dohy-display',
});

const bodyFont = Manrope({
    subsets: ['latin', 'latin-ext'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-dohy-body',
});

export default function LoginPage() {
  const router = useRouter();
  const { customer, status } = useCustomerAuth();

  useEffect(() => {
    if (status === 'authenticated' && customer) {
      router.replace('/');
    }
  }, [status, customer, router]);

  return (
    <div
      className={`${bodyFont.className} ${displayFont.variable} min-h-screen w-full relative flex items-start md:items-center justify-center px-4 pt-28 pb-12 md:pt-32 md:pb-16 bg-[#050505] text-white overflow-hidden`}
    >
      <CreativeBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[640px]"
      >
        <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/5 border border-amber-500/15 shadow-[0_0_50px_-12px_rgba(245,158,11,0.35)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent opacity-70" />
            <div className="absolute inset-0 shadow-[inset_0_0_90px_rgba(0,0,0,0.78)]" />
            <div className="absolute -left-24 top-1/3 h-40 w-40 rounded-full bg-amber-500/10 blur-[120px]" />
          </div>

          <div className="relative p-8 md:p-10 space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center space-y-3"
            >
              <div className="relative inline-block group">
                <h1 className="font-[var(--font-dohy-display)] text-3xl md:text-4xl font-bold tracking-tight relative inline-block select-none">
                  <span className="relative z-10">DOHY STUDIO</span>
                  <span className="absolute inset-0 text-red-500 opacity-0 group-hover:opacity-60 group-hover:-translate-x-1 transition-all duration-100 mix-blend-screen blur-[0.5px]">
                    DOHY STUDIO
                  </span>
                  <span className="absolute inset-0 text-blue-400 opacity-0 group-hover:opacity-60 group-hover:translate-x-1 transition-all duration-100 mix-blend-screen blur-[0.5px]">
                    DOHY STUDIO
                  </span>
                </h1>
              </div>

            </motion.div>

            <CustomerLoginForm onSuccess={() => router.push('/')} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
