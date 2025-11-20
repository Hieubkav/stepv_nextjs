'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const stats = [
  { number: 150, label: 'Dự án hoàn thành', suffix: '+' },
  { number: 50, label: 'Thương hiệu hợp tác', suffix: '+' },
  { number: 98, label: 'Độ hài lòng khách hàng', suffix: '%' },
  { number: 5, label: 'Năm kinh nghiệm', suffix: '+' },
];

const achievements = [
  {
    title: 'Top Hình ảnh 3D',
    description: 'Được công nhận là đơn vị hàng đầu trong lĩnh vực hình ảnh 3D tại Việt Nam.',
    icon: '🏆',
  },
  {
    title: 'Sáng tạo Vô hạn',
    description: 'Mỗi dự án là một tác phẩm độc nhất, được thiết kế riêng cho từng thương hiệu.',
    icon: '🎨',
  },
  {
    title: 'Đối tác Tin cậy',
    description: 'Được các thương hiệu quốc tế tin tưởng cho các dự án quan trọng.',
    icon: '🤝',
  },
  {
    title: 'Công nghệ Hàng đầu',
    description: 'Sử dụng công nghệ 3D và animation phần mềm hiện đại nhất.',
    icon: '⚡',
  },
];

const CounterNumber = ({ target }: { target: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let current = 0;
    const increment = Math.ceil(target / 50);
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(current);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isInView, target]);

  return <div ref={ref}>{count}</div>;
};

export default function AchievementsAbout() {
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
    <section id="achievements" className="relative py-20 md:py-32 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-950 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-1/4 -right-48 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, 40, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Stats section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Số liệu thành tích
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Những con số nói lên sự cam kết và tâm huyết của chúng tôi
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="group relative p-4 md:p-8 text-center flex flex-col items-center justify-center"
                variants={itemVariants}
              >
                {/* Glow background on hover */}
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />

                {/* Card content */}
                <div className="relative z-10 w-full">
                  <motion.div
                    className="flex items-baseline justify-center gap-1 mb-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-400">
                      <CounterNumber target={stat.number} />
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-yellow-400">{stat.suffix}</span>
                  </motion.div>
                  <p className="text-xs md:text-sm lg:text-base text-gray-400 whitespace-normal break-words">{stat.label}</p>
                </div>

                {/* Border animation on hover */}
                <motion.div
                  className="absolute inset-0 border border-yellow-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Achievements grid */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl md:text-4xl font-bold text-white">
              Những điểm nổi bật
            </h3>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                className="group relative p-6 md:p-8 border border-yellow-500/10 rounded-2xl bg-gradient-to-br from-yellow-500/5 to-transparent hover:border-yellow-500/30 transition-all duration-300"
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  boxShadow: '0 20px 40px rgba(255, 215, 0, 0.1)',
                }}
              >
                {/* Icon */}
                <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {achievement.icon}
                </div>

                {/* Content */}
                <h4 className="text-lg md:text-xl font-bold text-white mb-2">{achievement.title}</h4>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed">{achievement.description}</p>

                {/* Hover border glow */}
                <motion.div
                  className="absolute inset-0 border border-yellow-500 rounded-2xl opacity-0 group-hover:opacity-30"
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
