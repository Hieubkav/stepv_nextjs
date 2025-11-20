'use client';

import { motion } from 'framer-motion';
import { Sparkles, Award, Heart, Zap } from 'lucide-react';

const values = [
  {
    icon: Sparkles,
    title: 'Sáng tạo',
    description: 'Chúng tôi luôn tìm tòi những ý tưởng mới lạ, kết hợp thiết kế hiện đại với công nghệ 3D tiên tiến để tạo ra những tác phẩm độc nhất vô nhị.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Award,
    title: 'Chuyên nghiệp',
    description: 'Với đội ngũ có kinh nghiệm cao, chúng tôi đảm bảo mỗi dự án được thực hiện với tiêu chuẩn chất lượng cao nhất.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Heart,
    title: 'Tận tâm',
    description: 'Chúng tôi cam kết lắng nghe nhu cầu của khách hàng và luôn sẵn sàng điều chỉnh để mang lại kết quả tối ưu nhất.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Hiệu quả',
    description: 'Quy trình làm việc tối ưu hóa giúp chúng tôi giao dự án đúng hạn mà không ảnh hưởng chất lượng.',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function ValuesAbout() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const glowVariants = {
    initial: { opacity: 0, scale: 0.5 },
    hover: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
  };

  return (
    <section className="relative py-20 md:py-32 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-gray-950 to-black overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, 50, 0],
            x: [0, 25, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Giá trị cốt lõi
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Những nguyên tắc hướng dẫn công việc của chúng tôi hàng ngày
          </p>
        </motion.div>

        {/* Values grid */}
        <motion.div
          className="max-w-5xl mx-auto px-4"
        >
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative"
                  variants={itemVariants}
                >
                  {/* Glow effect on hover */}
                  <motion.div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${value.color} rounded-2xl blur opacity-0 group-hover:opacity-20`}
                    variants={glowVariants}
                    initial="initial"
                    whileHover="hover"
                    transition={{ duration: 0.3 }}
                  />

                  {/* Card */}
                  <motion.div
                    className="relative p-6 md:p-8 bg-gradient-to-br from-gray-900/50 to-gray-950 border border-yellow-500/10 rounded-2xl backdrop-blur-sm group-hover:border-yellow-500/30 transition-all duration-300 h-full"
                    whileHover={{
                      y: -8,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {/* Icon container */}
                    <motion.div
                      className={`inline-flex items-center justify-center h-14 w-14 p-3 rounded-xl bg-gradient-to-br ${value.color} mb-6`}
                      whileHover={{
                        scale: 1.1,
                        rotate: 5,
                      }}
                    >
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{value.title}</h3>
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed">{value.description}</p>

                    {/* Hover indicator */}
                    <motion.div
                      className="absolute top-4 right-4 w-2 h-2 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          className="mt-16 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </section>
  );
}
