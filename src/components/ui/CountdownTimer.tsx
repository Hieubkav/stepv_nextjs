'use client';

import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  className?: string;
  smartMode?: boolean; // Chế độ thông minh với auto-reset
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ className = '', smartMode = false }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [targetTime, setTargetTime] = useState<Date>(() => {
    if (smartMode) {
      // Khởi tạo với 10 giờ từ bây giờ
      const now = new Date();
      return new Date(now.getTime() + 10 * 60 * 60 * 1000);
    }
    // Fallback cho chế độ cũ
    const fallbackDate = new Date();
    fallbackDate.setMonth(fallbackDate.getMonth() + 3);
    return fallbackDate;
  });

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date();
      const difference = targetTime.getTime() - now.getTime();

      if (smartMode) {
        // Kiểm tra nếu còn dưới 30 phút (1800000 ms)
        if (difference <= 30 * 60 * 1000 && difference > 0) {
          // Reset về 10 giờ
          const newTarget = new Date(now.getTime() + 10 * 60 * 60 * 1000);
          setTargetTime(newTarget);
          const newDifference = newTarget.getTime() - now.getTime();

          return {
            days: Math.floor(newDifference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((newDifference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((newDifference / 1000 / 60) % 60),
            seconds: Math.floor((newDifference / 1000) % 60),
          };
        }
      }

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetTime, smartMode]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const timeUnits = [
    { value: timeLeft.days, label: 'NGÀY' },
    { value: timeLeft.hours, label: 'GIỜ' },
    { value: timeLeft.minutes, label: 'PHÚT' },
    { value: timeLeft.seconds, label: 'GIÂY' },
  ];

  return (
    <div className={`flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 xl:gap-12 ${className}`}>
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="text-center group">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-yellow-400/30 transition-all duration-300 hover:scale-105">
            {/* Number */}
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-[69px] font-bold text-white leading-none group-hover:text-yellow-400 transition-colors duration-300">
              {formatNumber(unit.value)}
            </span>
            {/* Label */}
            <span className="text-sm sm:text-lg md:text-xl lg:text-[20px] font-light text-yellow-400 uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity duration-300">
              {unit.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
