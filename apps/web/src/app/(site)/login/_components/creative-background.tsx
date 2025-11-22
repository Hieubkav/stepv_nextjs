'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

const particles = Array.from({ length: 18 }, (_, index) => ({
    x: `${(index * 37) % 100}%`,
    y: `${(index * 53) % 100}%`,
    size: 1 + ((index * 7) % 3),
    delay: (index % 6) * 0.45,
    duration: 12 + (index % 5) * 2,
    opacity: 0.25 + ((index % 4) * 0.1),
}));

function CreativeBackground() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050505]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b0901] via-[#0a0700] to-[#050505]" />

            <motion.div
                animate={{ x: ['-15%', '115%'], opacity: [0, 0.8, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
                className="absolute top-[45%] left-0 h-[2px] w-[90%] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent blur-[3px] mix-blend-screen"
            />
            <motion.div
                animate={{ x: ['110%', '-10%'], opacity: [0, 0.5, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: 2 }}
                className="absolute top-[62%] left-0 h-[1px] w-[70%] bg-gradient-to-r from-transparent via-amber-200/50 to-transparent blur-[1px] mix-blend-screen"
            />

            <motion.div
                animate={{ opacity: [0.45, 0.7, 0.45], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] bg-amber-500/14 rounded-full blur-[120px] mix-blend-screen"
            />

            {particles.map((particle, index) => (
                <motion.span
                    key={`dust-${index}`}
                    className="absolute rounded-full bg-amber-200/50"
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        left: particle.x,
                        top: particle.y,
                    }}
                    animate={{ y: ['0%', '-20%'], opacity: [0, particle.opacity, 0] }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: particle.delay,
                    }}
                />
            ))}

            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07] mix-blend-overlay" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_90%)]" />
        </div>
    );
}

export default memo(CreativeBackground);
