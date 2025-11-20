'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, Instagram, Facebook, Youtube, Mail, MapPin } from 'lucide-react';
import { buildVietQRImageUrl } from '@/lib/vietqr';

interface CTAAboutProps {
  contactEmail?: any;
  address?: any;
  zaloUrl?: any;
  facebookUrl?: any;
  instagramUrl?: any;
  youtubeUrl?: any;
  tiktokUrl?: any;
  bankAccountNumber?: any;
  bankAccountName?: any;
  bankCode?: any;
  siteName?: any;
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
  }, [siteSettings?.value, contactEmail, address, zaloUrl, facebookUrl, instagramUrl, youtubeUrl, tiktokUrl, bankAccountNumber, bankAccountName, bankCode, siteName]);

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );

  // Zalo text icon
  const ZaloIcon = () => (
    <span className="text-xs font-bold">Z</span>
  );

  const socialLinks = [
    { id: 'facebook', icon: Facebook, url: settings.facebookUrl },
    { id: 'instagram', icon: Instagram, url: settings.instagramUrl },
    { id: 'youtube', icon: Youtube, url: settings.youtubeUrl },
    { id: 'zalo', icon: ZaloIcon, url: settings.zaloUrl },
    { id: 'tiktok', icon: TikTokIcon, url: settings.tiktokUrl },
  ];

  return (
    <section className="py-12 px-6 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2
            style={{ fontFamily: "'Noto Sans', 'Inter', sans-serif" }}
            className="text-5xl md:text-6xl text-white font-light leading-tight"
          >
            <span className="text-[#D4AF37]">Liên hệ ngay</span>
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
          {/* Left - Contact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#D4AF37]" />
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-semibold">
                  Địa chỉ
                </p>
              </div>
              <p className="text-white text-sm leading-relaxed font-light ml-6">
                {settings.address}
              </p>
            </div>

            <div className="h-px bg-white/5" />

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#D4AF37]" />
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-semibold">
                  Email
                </p>
              </div>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="text-white hover:text-[#D4AF37] transition-colors text-sm font-light ml-6"
              >
                {settings.contactEmail}
              </a>
            </div>

            {/* Social */}
            <div className="flex gap-4 pt-2">
              {socialLinks.map(
                (social) =>
                  social.url && (
                    <motion.a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -2 }}
                      className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                    >
                      {social.id === 'zalo' || social.id === 'tiktok' ? (
                        <social.icon />
                      ) : (
                        <social.icon size={14} />
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
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-1 lg:sticky lg:top-16"
          >
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-semibold mb-1">
                  Thanh toán
                </p>
                <h3
                  style={{ fontFamily: "'Noto Sans', 'Inter', sans-serif" }}
                  className="text-2xl md:text-3xl text-white font-light"
                >
                  {settings.bankCode}
                </h3>
              </div>

              <div className="border-t border-b border-white/10 py-4">
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold mb-2">
                  Số tài khoản
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(settings.bankAccountNumber)}
                  className="text-white hover:text-[#D4AF37] transition-colors text-base font-mono font-light tracking-wide"
                >
                  {settings.bankAccountNumber}
                  <span className="text-[9px] block text-white/20 mt-1">Copy</span>
                </button>
              </div>

              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold mb-1">
                  Chủ tài khoản
                </p>
                <p className="text-white font-light text-xs tracking-wide">
                  {settings.bankAccountName}
                </p>
              </div>

              {vietqrPreviewUrl && (
                <motion.button
                  onClick={() => setShowQR(true)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full mt-4 py-3 bg-[#D4AF37] text-black font-light uppercase tracking-widest text-[10px] hover:bg-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <QrCode size={13} />
                  Mã QR
                </motion.button>
              )}
            </div>
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
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-sm w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute -top-10 right-0 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} strokeWidth={1} />
              </button>

              <div className="bg-white p-3">
                <img
                  src={vietqrPreviewUrl}
                  alt="QR Code"
                  className="w-full h-auto bg-white"
                />
              </div>

              <div className="bg-[#0A0A0A] border-t border-white/5 p-4 text-center">
                <p className="text-white font-mono text-sm tracking-wider font-light">
                  {settings.bankAccountNumber}
                </p>
                <p className="text-[9px] text-white/30 mt-1 uppercase tracking-widest">
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
