'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const storyMilestones = [
  {
    year: '2020',
    title: 'Khởi đầu',
    description: 'DOHY Media được thành lập với tầm nhìn biến hình ảnh 3D thành công cụ tiếp thị mạnh mẽ.',
    icon: '🚀',
  },
  {
    year: '2021',
    title: 'Tăng trưởng',
    description: 'Hợp tác thành công với 20+ thương hiệu cao cấp trong lĩnh vực nước hoa và làm đẹp.',
    icon: '📈',
  },
  {
    year: '2022',
    title: 'Mở rộng',
    description: 'Xây dựng đội ngũ sáng tạo chuyên nghiệp, nâng cao năng lực sản xuất hình ảnh 3D.',
    icon: '🎨',
  },
  {
    year: '2024',
    title: 'Đỉnh cao',
    description: 'Trở thành đối tác tin cậy của các thương hiệu quốc tế, cung cấp giải pháp hình ảnh 3D toàn diện.',
    icon: '⭐',
  },
];

export default function StoryAbout() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section ref={ref} className="relative py-20 md:py-32 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-950 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
          style={{
            y: useTransform(scrollYProgress, [0, 1], [0, -100]),
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
            Câu chuyện của chúng tôi
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Từ một ý tưởng đơn giản đến một thương hiệu được tin cậy bởi hàng chục công ty hàng đầu
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {storyMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.year}
              className={`relative ${index % 2 !== 0 ? 'md:mt-12' : ''}`}
              variants={itemVariants}
              style={{ marginBottom: '32px' }}
            >
              {/* Connector line */}
              {index < storyMilestones.length - 1 && (
                <div className="hidden md:block absolute -right-6 top-16 w-12 h-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
              )}

              {/* Card */}
              <motion.div
                className="group relative p-5 md:p-8 min-h-[200px] bg-gradient-to-br from-yellow-500/5 to-transparent border border-yellow-500/20 rounded-2xl backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-300"
                whileHover={{
                  borderColor: '#FFD700',
                  boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)',
                }}
              >
                {/* Year badge */}
                <div className="absolute -top-4 left-6 px-4 py-2 bg-black border border-yellow-500 rounded-full">
                  <span className="text-sm md:text-base text-yellow-400 font-bold">{milestone.year}</span>
                </div>

                {/* Icon */}
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {milestone.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-2xl font-bold text-white mb-3">{milestone.title}</h3>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed">{milestone.description}</p>

                {/* Animated border on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border border-yellow-500 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission statement */}
        <motion.div
          className="mt-20 md:mt-28 p-6 md:p-12 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-2xl backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-center text-lg md:text-2xl text-white leading-relaxed">
            <span className="text-yellow-400 font-semibold">Sứ mệnh của chúng tôi:</span> Nâng tầm thương hiệu thông qua nghệ thuật thị giác, tạo ra những hình ảnh 3D độc đáo và hoạt hình ấn tượng giúp sản phẩm của bạn bắt mắt khách hàng.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
