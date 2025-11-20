'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, Instagram, Facebook, Youtube, Music } from 'lucide-react';
import XIcon from '@/components/ui/XIcon';

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
  contactEmail = 'contact@dohystudio.com',
  address = 'The Manor Tower, Bình Thạnh, TP.HCM',
  zaloUrl = 'https://zalo.me/0909000000',
  facebookUrl,
  instagramUrl,
  youtubeUrl,
  tiktokUrl,
  bankAccountNumber = '0123 456 789',
  bankAccountName = 'DOHY STUDIO',
  siteName = 'Dohy Studio'
}) => {
  const [showQR, setShowQR] = useState(false);
  const qrCodeUrl = `https://img.vietqr.io/image/TPB-${bankAccountNumber?.replace(/\s/g, '')}-compact.png`;

  return (
    <section className="pt-24 pb-12 px-6 bg-[#020202] relative overflow-hidden border-t border-[#D4AF37]/10">
      
      <div className="max-w-6xl mx-auto mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start lg:items-center">
          
          {/* Left: Call to Action & Contact */}
          <div>
            <div className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase mb-4 font-bold">
              Liên Hệ Hợp Tác
            </div>
            <h2 className="font-serif text-4xl md:text-6xl text-white mb-8 leading-tight">
              Sẵn Sàng <br/>
              <span className="text-white/30 italic">Bứt Phá?</span>
            </h2>
            
            <div className="space-y-8 mt-10 border-l border-white/10 pl-6">
              <div>
                <h4 className="text-white text-xs uppercase tracking-widest mb-2 font-bold text-[#D4AF37]/80">
                  Studio Address
                </h4>
                <p className="text-white/60 font-light text-sm">{address}</p>
              </div>
              
              <div>
                <h4 className="text-white text-xs uppercase tracking-widest mb-2 font-bold text-[#D4AF37]/80">
                  Email & Support
                </h4>
                <div className="flex flex-col gap-2 text-sm">
                  <a href={`mailto:${contactEmail}`} className="text-white/60 hover:text-white transition-colors">
                    {contactEmail}
                  </a>
                  <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                    Zalo Support
                  </a>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-black hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all">
                    <Facebook size={18}/>
                  </a>
                )}
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-black hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all">
                    <Instagram size={18}/>
                  </a>
                )}
                {youtubeUrl && (
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-black hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all">
                    <Youtube size={18}/>
                  </a>
                )}
                {tiktokUrl && (
                  <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-black hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all">
                    <Music size={18}/>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: Banking Information */}
          <div className="relative w-full">
            <div className="absolute inset-0 bg-[#D4AF37]/5 blur-[60px] rounded-full"></div>
            <div className="relative bg-[#080808] border border-[#D4AF37]/20 p-8 md:p-10 max-w-md mx-auto lg:ml-auto shadow-2xl">
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] mb-2 font-bold">
                    Thanh toán
                  </p>
                  <h3 className="text-xl md:text-2xl font-serif text-white">TPBank</h3>
                </div>
                <div className="w-12 h-12 bg-white/5 flex items-center justify-center border border-white/10 text-[#D4AF37]">
                  <QrCode size={20} />
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div 
                  className="group cursor-pointer" 
                  onClick={() => {
                    if (bankAccountNumber) {
                      navigator.clipboard.writeText(bankAccountNumber);
                    }
                  }}
                >
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1 group-hover:text-[#D4AF37] transition-colors">
                    Số tài khoản (Copy)
                  </label>
                  <div className="text-2xl md:text-3xl font-mono text-white tracking-wider group-hover:text-[#D4AF37] transition-colors truncate">
                    {bankAccountNumber}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-1">
                    Chủ tài khoản
                  </label>
                  <div className="text-sm text-white/80 uppercase font-bold tracking-wide">
                    {bankAccountName}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowQR(true)}
                className="w-full py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center justify-center gap-2"
              >
                <QrCode size={16} /> Mở Mã QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5 pt-8 text-center">
        <p className="text-white/20 text-[10px] uppercase tracking-[0.2em]">
          © 2024 {siteName}.
        </p>
      </div>

      {/* QR Modal Popup */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-2 max-w-[300px] w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowQR(false)} 
                className="absolute -top-10 right-0 text-white/50 hover:text-[#D4AF37] transition-colors p-2"
              >
                <X size={24} />
              </button>
              
              <div className="bg-white p-2">
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-auto block mix-blend-multiply" />
              </div>
              
              <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                <p className="font-bold text-black text-lg font-mono tracking-wider">
                  {bankAccountNumber}
                </p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
                  TPBank • {bankAccountName}
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
