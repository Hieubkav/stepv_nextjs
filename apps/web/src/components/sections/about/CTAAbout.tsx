'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, Instagram, Facebook, Youtube, Mail, MapPin } from 'lucide-react';
import { buildVietQRImageUrl } from '@/lib/vietqr';
import { getBankName } from '@/lib/bank-codes';

interface CTAAboutProps {
  contactEmail?: string;
  address?: string;
  zaloUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankCode?: string;
  siteName?: string;
}

const CTAAbout: React.FC<CTAAboutProps> = ({
  contactEmail,
  address,
  zaloUrl,
  facebookUrl,
  instagramUrl,
  youtubeUrl,
  tiktokUrl,
  bankAccountNumber,
  bankAccountName,
  bankCode,
  siteName,
}) => {
  const siteSettings = useQuery(api.settings.getByKey, { key: 'site' });
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const settings = useMemo(() => {
    const v: any = siteSettings?.value ?? {};
    return {
      siteName: siteName ?? v.siteName ?? 'Dohy Studio',
      contactEmail: contactEmail ?? v.contactEmail ?? 'contact@dohystudio.com',
      address: address ?? v.address ?? 'The Manor Tower, Bình Thạnh, TP.HCM',
      zaloUrl: zaloUrl ?? v.zaloUrl ?? 'https://zalo.me/0909000000',
      facebookUrl: facebookUrl ?? v.facebookUrl ?? '',
      instagramUrl: instagramUrl ?? v.instagramUrl ?? '',
      youtubeUrl: youtubeUrl ?? v.youtubeUrl ?? '',
      tiktokUrl: tiktokUrl ?? v.tiktokUrl ?? '',
      bankAccountNumber: bankAccountNumber ?? v.bankAccountNumber ?? '0123 456 789',
      bankAccountName: bankAccountName ?? v.bankAccountName ?? 'DOHY STUDIO',
      bankCode: bankCode ?? v.bankCode ?? 'TPB',
    };
  }, [
    siteSettings?.value,
    contactEmail,
    address,
    zaloUrl,
    facebookUrl,
    instagramUrl,
    youtubeUrl,
    tiktokUrl,
    bankAccountNumber,
    bankAccountName,
    bankCode,
    siteName,
  ]);

  const vietqrPreviewUrl = useMemo(() => {
    const code = settings.bankCode?.trim();
    const account = settings.bankAccountNumber?.trim();
    if (!code || !account) return '';

    return (
      buildVietQRImageUrl({
        bankCode: code,
        accountNumber: account,
        accountName: settings.bankAccountName?.trim() || undefined,
        template: 'qr_only',
      }) ?? ''
    );
  }, [settings.bankCode, settings.bankAccountNumber, settings.bankAccountName]);

  // TikTok SVG Component
  const TikTokIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );

  // Zalo text icon
  const ZaloIcon = () => (
    <span className="text-sm font-semibold leading-none" aria-hidden="true">
      Zalo
    </span>
  );

  const socialLinks = [
    { id: 'facebook', icon: Facebook, url: settings.facebookUrl, label: 'Facebook' },
    { id: 'instagram', icon: Instagram, url: settings.instagramUrl, label: 'Instagram' },
    { id: 'youtube', icon: Youtube, url: settings.youtubeUrl, label: 'YouTube' },
    { id: 'zalo', icon: ZaloIcon, url: settings.zaloUrl, label: 'Zalo' },
    { id: 'tiktok', icon: TikTokIcon, url: settings.tiktokUrl, label: 'TikTok' },
  ];

  const hasBankInfo = Boolean(settings.bankCode && settings.bankAccountNumber);

  const handleCopyAccount = async () => {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(settings.bankAccountNumber || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy account number', error);
      setCopyError('Không thể sao chép. Vui lòng thử lại.');
    }
  };

  // Focus management & ESC key for QR modal
  useEffect(() => {
    if (!showQR) return;

    lastActiveElementRef.current = document.activeElement as HTMLElement | null;

    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ];

    const trapFocus = (event: KeyboardEvent) => {
      if (!modalRef.current) return;

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
      ).filter((el) => !el.hasAttribute('disabled'));

      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      if (event.key === 'Escape') {
        setShowQR(false);
      }
    };

    document.addEventListener('keydown', trapFocus);

    // Focus the close button initially
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', trapFocus);
      // restore focus
      if (lastActiveElementRef.current) {
        lastActiveElementRef.current.focus();
      }
    };
  }, [showQR]);

  return (
    <section className="py-8 md:py-12 px-4 md:px-6 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-4xl text-white font-light leading-tight">
            <span className="text-[#D4AF37]">Liên hệ ngay</span>
          </h2>
          <p className="mt-2 text-xs md:text-sm text-white/50 max-w-md">
            Thông tin liên hệ và thanh toán cho {settings.siteName}.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_minmax(0,1fr)] gap-6 lg:gap-12 items-start lg:items-center">
          {/* Left - Contact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-5 lg:space-y-7"
          >
            {/* Address */}
            <div>
              <p className="text-[10px] lg:text-xs text-[#D4AF37] uppercase tracking-[0.3em] font-semibold mb-1">
                Địa chỉ
              </p>
              <p className="text-white text-xs lg:text-sm font-light leading-relaxed">
                {settings.address}
              </p>
            </div>

            {/* Email */}
             <div>
               <p className="text-[10px] lg:text-xs text-[#D4AF37] uppercase tracking-[0.3em] font-semibold mb-1">
                 Email
               </p>
               <a
                 href={`mailto:${settings.contactEmail}`}
                 className="text-white text-xs lg:text-sm font-light hover:text-[#D4AF37] hover:underline transition-colors inline-block"
               >
                 {settings.contactEmail}
               </a>
             </div>

            {/* Social */}
             <div className="flex gap-3 lg:gap-3 pt-1 lg:pt-2 ">
               {socialLinks.map(
                 (social) =>
                   social.url && (
                     <motion.a
                       key={social.id}
                       href={social.url}
                       target="_blank"
                       rel="noopener noreferrer"
                       whileHover={{ y: -1 }}
                       className="w-9 h-9 lg:w-8 lg:h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                      aria-label={`Mở ${social.label} của ${settings.siteName}`}
                    >
                      {social.id === 'zalo' || social.id === 'tiktok' ? (
                        <social.icon />
                      ) : (
                        <social.icon size={14} aria-hidden="true" />
                      )}
                    </motion.a>
                  )
              )}
            </div>
          </motion.div>

          {/* Right - Banking */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            viewport={{ once: true }}
            className="space-y-3 lg:space-y-4 pt-6 border-t border-white/15 lg:pt-0 lg:border-t-0 lg:pl-8 lg:border-l lg:border-l-white/15"
          >
            {hasBankInfo ? (
              <>
                <div>
                   <p className="text-[10px] lg:text-xs text-[#D4AF37] uppercase tracking-[0.3em] font-semibold mb-1">
                     Thanh toán
                   </p>
                   <h3 className="text-xl lg:text-2xl text-white font-light">
                     {getBankName(settings.bankCode)}
                   </h3>
                   <p className="text-[11px] lg:text-xs text-white/50 mt-1">
                     Thanh toán cho {settings.siteName}.
                   </p>
                 </div>

                <div className="py-3 lg:py-4">
                   <p className="text-[10px] lg:text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">
                     Số tài khoản
                   </p>
                   <button
                     type="button"
                     onClick={handleCopyAccount}
                     className="text-white hover:text-[#D4AF37] transition-colors text-sm lg:text-base font-mono font-light tracking-wide flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                   >
                     <span>{settings.bankAccountNumber}</span>
                     <span className="text-[11px] text-white/60">
                       {copied ? 'Đã sao chép' : 'Copy'}
                     </span>
                   </button>
                  {copyError && (
                    <p className="mt-1 text-[11px] text-red-400">{copyError}</p>
                  )}
                </div>

                <div>
                   <p className="text-[10px] lg:text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">
                     Chủ tài khoản
                   </p>
                   <p className="text-white font-light text-xs lg:text-sm tracking-wide">
                     {settings.bankAccountName}
                   </p>
                 </div>

                {vietqrPreviewUrl && (
                   <motion.button
                     type="button"
                     onClick={() => setShowQR(true)}
                     whileHover={{ scale: 1.01 }}
                     whileTap={{ scale: 0.99 }}
                     className="w-full mt-3 lg:mt-4 py-2.5 lg:py-3 bg-[#D4AF37] text-black font-light uppercase tracking-widest text-[10px] lg:text-xs hover:bg-white transition-colors flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                   >
                     <QrCode size={14} aria-hidden="true" />
                     <span>Mở mã QR thanh toán</span>
                   </motion.button>
                 )}
              </>
            ) : (
              <div className="text-white/70 text-xs lg:text-sm">
                 <p className="text-[10px] lg:text-xs text-[#D4AF37] uppercase tracking-[0.3em] font-semibold mb-2">
                   Thanh toán
                 </p>
                 <p>Thông tin thanh toán đang được cập nhật. Vui lòng liên hệ qua email để được hỗ trợ.</p>
               </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && vietqrPreviewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setShowQR(false)}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-sm w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setShowQR(false)}
                className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Đóng mã QR thanh toán"
              >
                <X size={20} strokeWidth={1} aria-hidden="true" />
              </button>

              <div className="bg-white p-3">
                <img
                  src={vietqrPreviewUrl}
                  alt={`Mã QR thanh toán cho tài khoản ${getBankName(settings.bankCode)} – ${settings.bankAccountName}`}
                  className="w-full h-auto bg-white"
                />
              </div>

              <div className="bg-[#0A0A0A] border-t border-white/10 p-4 text-center">
                <p className="text-white font-mono text-sm tracking-wider font-light">
                  {settings.bankAccountNumber}
                </p>
                <p className="text-[11px] text-white/40 mt-1 uppercase tracking-widest">
                  {settings.bankCode} • {settings.bankAccountName}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CTAAbout;
