'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Facebook, Instagram, Music, Palette } from 'lucide-react';
import XIcon from '@/components/ui/XIcon';

interface ContactCTAAboutProps {
  settings?: any;
}

export default function ContactCTAAbout({ settings }: ContactCTAAboutProps) {
  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: settings?.contactEmail || 'hello@dohy.com',
      href: `mailto:${settings?.contactEmail || 'hello@dohy.com'}`,
    },
    {
      icon: MapPin,
      label: 'Địa chỉ',
      value: settings?.address || 'Ho Chi Minh City, Vietnam',
      href: '#',
    },
    {
      icon: Phone,
      label: 'Zalo',
      value: 'Nhắn tin Zalo',
      href: settings?.zaloUrl || '#',
    },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', url: settings?.facebookUrl, color: 'text-blue-500' },
    { icon: Instagram, label: 'Instagram', url: settings?.instagramUrl, color: 'text-pink-500' },
    { icon: Music, label: 'TikTok', url: settings?.tiktokUrl, color: 'text-white' },
    { icon: Palette, label: 'Pinterest', url: settings?.pinterestUrl, color: 'text-red-600' },
  ];

  const filteredSocials = [
    ...socialLinks,
    { icon: XIcon, label: 'X', url: settings?.xUrl, color: 'text-white' },
  ].filter(s => s.url);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="contact" className="relative py-20 md:py-32 px-4 md:px-6 lg:px-8 bg-black overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Main CTA */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Sẵn sàng nâng tầm thương hiệu?
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Hãy liên hệ với chúng tôi để thảo luận về dự án của bạn. Chúng tôi luôn sẵn sàng giúp bạn tạo ra những hình ảnh 3D ấn tượng.
          </p>
        </motion.div>

        {/* Contact info cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <motion.a
                key={index}
                href={info.href}
                className="group relative p-8 border border-yellow-500/20 rounded-2xl bg-gradient-to-br from-yellow-500/5 to-transparent hover:border-yellow-500/50 transition-all duration-300"
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  boxShadow: '0 20px 40px rgba(255, 215, 0, 0.2)',
                }}
              >
                {/* Icon container */}
                <motion.div
                  className="inline-flex p-3 rounded-lg bg-yellow-500/20 mb-4 group-hover:bg-yellow-500/30 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Icon className="w-6 h-6 text-yellow-400" />
                </motion.div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">{info.label}</h3>
                <p className="text-gray-400 group-hover:text-yellow-300 transition-colors">{info.value}</p>

                {/* Hover indicator */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.a>
            );
          })}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.a
            href="#contact"
            className="px-8 py-4 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Gửi yêu cầu
          </motion.a>
          <motion.a
            href={settings?.zaloUrl || '#'}
            className="px-8 py-4 border-2 border-yellow-500/50 text-yellow-400 font-semibold rounded-lg hover:border-yellow-500 hover:bg-yellow-500/5 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Nhắn tin Zalo
          </motion.a>
        </motion.div>

        {/* Social links */}
        {filteredSocials.length > 0 && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-gray-400 mb-6">Theo dõi chúng tôi trên mạng xã hội</p>
            <motion.div
              className="flex justify-center gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {filteredSocials.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group p-3 border border-yellow-500/20 rounded-lg bg-yellow-500/5 hover:border-yellow-500 transition-all duration-300 ${social.color}`}
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.2,
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                    }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {/* Footer text */}
        <motion.div
          className="mt-16 pt-8 border-t border-yellow-500/10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-gray-500 text-sm">
            © 2024 {settings?.siteName || 'DOHY Media'}. Tất cả quyền được bảo lưu.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
