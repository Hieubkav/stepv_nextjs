'use client';

import { useEffect, useMemo, useState } from 'react';
import { getLucideIcon } from '@/lib/lucide-icons';

interface WorkStep {
  title: string;
  description: string;
  icon: string;
}

interface WorkCta {
  label: string;
  url: string;
}

interface WeWorkSectionProps {
  title?: string;
  subtitle?: string;
  steps?: WorkStep[];
  ctas?: WorkCta[];
}

const DEFAULT_STEPS: WorkStep[] = [
  {
    title: 'KHOI DONG & LEN KE HOACH',
    description:
      'Bat dau bang buoi tu van de hieu ro tam nhin va muc tieu cua ban. Chung toi lap lo trinh ro rang tu nhung buoc dau.',
    icon: 'Lightbulb',
  },
  {
    title: 'PHAT TRIEN Y TUONG',
    description:
      'Doi ngu sang tao de xuat y tuong phu hop thuong hieu va muc tieu cua du an, giup xac dinh phong cach ngay tu dau.',
    icon: 'PenTool',
  },
  {
    title: 'MO HINH HOA & THIET KE',
    description:
      'Su dung cong cu hien dai de tao model 3D chi tiet, vat lieu va anh sang chinh xac theo ban phac thao.',
    icon: 'Cube',
  },
  {
    title: 'HOAT HINH & HIEU UNG',
    description:
      'Them chuyen dong va hieu ung hinh anh de tang cam xuc, tao ra noi dung cuon hut va kha nang ke chuyen ro rang.',
    icon: 'PlayCircle',
  },
  {
    title: 'DANH GIA & HOAN THIEN',
    description:
      'Thu thap feedback, dieu chinh chi tiet cho den khi tat ca diem cham trai nghiem deu hoan hao.',
    icon: 'Search',
  },
  {
    title: 'BAN GIAO CUOI CUNG',
    description:
      'Xuat ban giao du an theo dinh dang ban yeu cau, san sang su dung tren moi kenh marketing.',
    icon: 'CheckCircle2',
  },
];

const DEFAULT_CTAS: WorkCta[] = [{ label: 'BAT DAU DU AN', url: '#contact' }];

const WeWorkSection = ({
  title = 'CACH CHUNG TOI LAM VIEC',
  subtitle =
    'Tai DOHY Media, chung toi xem trong quy trinh lam viec ro rang va minh bach de dam bao moi du an luon dieu huong dung nhu ban mong doi.',
  steps,
  ctas,
}: WeWorkSectionProps) => {
  const resolvedSteps = useMemo(() => (steps && steps.length > 0 ? steps : DEFAULT_STEPS), [steps]);
  const resolvedCtas = useMemo(() => (ctas && ctas.length > 0 ? ctas : DEFAULT_CTAS), [ctas]);

  const [activeStep, setActiveStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (activeStep >= resolvedSteps.length) {
      setActiveStep(0);
    }
  }, [resolvedSteps.length, activeStep]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getResponsiveDimensions = () => {
    if (typeof window === 'undefined') {
      return { circleSize: 500, buttonSize: 110, radius: 250 };
    }
    const width = window.innerWidth;
    if (width < 480) return { circleSize: 280, buttonSize: 60, radius: 140 };
    if (width < 768) return { circleSize: 350, buttonSize: 75, radius: 175 };
    if (width < 1024) return { circleSize: 400, buttonSize: 90, radius: 200 };
    return { circleSize: 500, buttonSize: 110, radius: 250 };
  };

  const getStepPosition = (index: number, total: number) => {
    const { circleSize, buttonSize, radius } = getResponsiveDimensions();
    const angle = (index * 360) / total - 90;
    const center = circleSize / 2;
    const x = center + radius * Math.cos((angle * Math.PI) / 180) - buttonSize / 2;
    const y = center + radius * Math.sin((angle * Math.PI) / 180) - buttonSize / 2;
    return { x, y };
  };

  const { circleSize, buttonSize } = getResponsiveDimensions();
  const safeActiveStep = resolvedSteps.length > 0 ? Math.min(activeStep, resolvedSteps.length - 1) : 0;
  const ActiveIcon = getLucideIcon(resolvedSteps[safeActiveStep]?.icon) ?? getLucideIcon('Info');

  return (
    <section id="more" className="py-12 sm:py-16 md:py-20 bg-black text-white min-h-screen">
      <div className="container mx-auto px-4 max-w-[1140px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[61px] font-light mb-4 sm:mb-6 md:mb-8 uppercase tracking-wide leading-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-[20px] font-light leading-relaxed mb-6 sm:mb-8 md:mb-12">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 items-center lg:items-start justify-center lg:justify-start">
              {resolvedCtas.map((cta, index) => {
                const href = cta.url || '#';
                const isAnchor = href.startsWith('#') || href.startsWith('/');
                return (
                  <a
                    key={`wework-cta-${index}-${cta.label}`}
                    href={href}
                    className="inline-flex px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-2 border-[#FFD700] text-[#FFD700] uppercase font-medium rounded-lg hover:bg-[#FFD700] hover:text-black transition-all duration-300 text-xs sm:text-sm md:text-base min-h-[48px] items-center justify-center"
                    target={isAnchor ? '_self' : '_blank'}
                    rel={isAnchor ? undefined : 'noopener noreferrer'}
                  >
                    {cta.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div
              className="relative mx-auto"
              style={{ width: circleSize, height: circleSize, minWidth: circleSize, minHeight: circleSize }}
            >
              <div
                className="absolute inset-0 rounded-full border-2 border-[#FFD700] bg-black flex flex-col justify-center items-center text-center p-4 sm:p-6 md:p-8 lg:p-12"
                style={{ width: circleSize, height: circleSize }}
              >
                <div className="mb-3 sm:mb-4 md:mb-6 text-[#FFD700] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                  <ActiveIcon className="text-[#FFD700] text-2xl sm:text-3xl md:text-4xl lg:text-5xl" />
                </div>
                <h3 className="text-[#FFD700] text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl uppercase font-medium mb-3 sm:mb-4 md:mb-6 leading-tight px-2">
                  {resolvedSteps[safeActiveStep]?.title || 'Step'}
                </h3>
                <p className="text-white font-light text-xs sm:text-sm md:text-base leading-relaxed px-2">
                  {resolvedSteps[safeActiveStep]?.description || ''}
                </p>
              </div>

              {resolvedSteps.map((step, index) => {
                const position = getStepPosition(index, resolvedSteps.length);
                const buttonLabel = isMobile || buttonSize < 70 ? String(index + 1) : `Step ${index + 1}`;
                return (
                  <button
                    key={`step-${index}-${step.title}`}
                    className="absolute rounded-full border-2 border-[#FFD700] bg-black flex items-center justify-center text-white font-medium transition-all duration-300 hover:bg-[#FFD700] hover:text-black hover:scale-105 active:scale-95"
                    style={{
                      left: position.x,
                      top: position.y,
                      width: buttonSize,
                      height: buttonSize,
                      fontSize: buttonSize < 70 ? 10 : buttonSize < 90 ? 12 : 14,
                      minHeight: 44,
                      minWidth: 44,
                    }}
                    onClick={() => setActiveStep(index)}
                    aria-label={`Step ${index + 1}`}
                  >
                    <span className="text-center leading-tight">{buttonLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeWorkSection;
