'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface HeroAboutProps {
  siteName?: string;
  logoUrl?: string;
}

export default function HeroAbout({ siteName, logoUrl }: HeroAboutProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
      },
    },
  };

  return (
    <section className="relative h-screen min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 right-10 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        {logoUrl && (
          <motion.div
            className="mb-6 md:mb-8 flex justify-center"
            variants={itemVariants}
          >
            <motion.div
              className="relative"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
            >
              <div className="h-24 w-24 rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent p-2 flex items-center justify-center backdrop-blur-sm">
                <Image
                  src={logoUrl}
                  alt={siteName || 'Logo'}
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Main title */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tight"
          variants={itemVariants}
        >
          Về{' '}
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
            {siteName || 'DOHY Media'}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-gray-400/80 mb-6 max-w-2xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          Chuyên gia hình ảnh 3D và hoạt hình cho các thương hiệu cao cấp, nâng tầm sản phẩm của bạn thông qua nghệ thuật thị giác đẳng cấp.
        </motion.p>

        {/* Highlight text */}
        <motion.div
          className="inline-block px-6 py-3 border border-yellow-500/50 rounded-full bg-yellow-500/5 backdrop-blur-sm hover:bg-yellow-500/10 transition-all duration-300"
          variants={itemVariants}
          whileHover={{
            borderColor: '#FFD700',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
          }}
        >
          <p className="text-sm sm:text-base text-yellow-300 font-medium">Hơn 5 năm kinh nghiệm • 50+ thương hiệu • 150+ dự án</p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          variants={itemVariants}
        >
          <motion.a
            href="#contact"
            className="min-w-[180px] h-14 px-8 flex items-center justify-center bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Liên hệ ngay
          </motion.a>
          <motion.a
            href="#achievements"
            className="min-w-[180px] h-14 px-8 flex items-center justify-center border-2 border-yellow-500/50 text-yellow-400 font-semibold rounded-lg hover:border-yellow-500 hover:bg-yellow-500/5 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Xem thành tựu
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-yellow-400 uppercase tracking-widest drop-shadow-lg">Scroll</p>
          <svg
            className="w-5 h-5 text-yellow-400 drop-shadow-lg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
