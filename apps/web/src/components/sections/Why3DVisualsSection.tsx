'use client';

import { useMemo, useState } from 'react';
import { getLucideIcon } from '@/lib/lucide-icons';

interface AccordionItem {
  title: string;
  content: string;
}

interface Why3DCard {
  icon: string;
  title: string;
  items: AccordionItem[];
}

interface Why3DVisualsSectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  topCards?: Why3DCard[];
  bottomCards?: Why3DCard[];
}

const DEFAULT_TOP_CARDS: Why3DCard[] = [
  {
    icon: 'DollarSign',
    title: 'HIEU QUA CHI PHI',
    items: [
      {
        title: 'Tiet kiem chi phi san xuat',
        content: 'Loai bo chi phi chup anh va setup nhieu lan; tai san 3D tao mot lan co the tai su dung.',
      },
      {
        title: 'Tai san su dung lai',
        content: 'Tai su dung model va scene cho nhung chien dich tiep theo de tiet kiem thoi gian.',
      },
      {
        title: 'Than thien moi truong',
        content: 'Giam vat tu va di chuyen, gop phan vao quy trinh quang cao ben vung hon.',
      },
    ],
  },
  {
    icon: 'Video',
    title: 'CHAT LUONG STUDIO',
    items: [
      {
        title: 'Do chi tiet cao',
        content: 'Cong nghe render hien dai tao ra hinh anh sieu thuc tu moi goc nhin.',
      },
      {
        title: 'Tu do sang tao',
        content: 'Khong bi gioi han boi vat ly, de dang tao khong gian va hien ung doc dao.',
      },
      {
        title: 'Xu ly da nen tang',
        content: 'Toi uu cho web, social, in an va video tu cung mot bo tai san 3D.',
      },
    ],
  },
  {
    icon: 'Clock',
    title: 'TOC DO VA LINH HOAT',
    items: [
      {
        title: 'Ra mat nhanh hon',
        content: 'Bo qua khoan logistics phuc tap, du an co the hoan tat chi trong vai ngay.',
      },
      {
        title: 'Dieu chinh nhanh',
        content: 'Cap nhat mau sac, vat lieu hay lenh thuc thi chi trong vai phut.',
      },
    ],
  },
];

const DEFAULT_BOTTOM_CARDS: Why3DCard[] = [
  {
    icon: 'Gem',
    title: 'DANH RIENG CHO CAO CAP',
    items: [
      {
        title: 'Ton vinh ban sac thuong hieu',
        content: 'Moi du an duoc thiet ke de pho dien su tinh te va phong cach rieng cua ban.',
      },
      {
        title: 'Quy trinh dong hanh',
        content: 'Lam viec chinh chu voi doi ngu chuyen gia tu giai doan y tuong den ban giao.',
      },
    ],
  },
  {
    icon: 'Lightbulb',
    title: 'GIAI PHAP TUONG LAI',
    items: [
      {
        title: 'Mo rong de dang',
        content: 'Tai san 3D co the cap nhat lien tuc khi ban ra mat san pham moi.',
      },
      {
        title: 'Cong nghe moi nhat',
        content: 'Theo sat xu huong cong nghe de du an luon noi bat.',
      },
    ],
  },
];

const Why3DVisualsSection = ({
  title = 'TAI SAO HINH ANH 3D LA LUA CHON THONG MINH CHO THUONG HIEU CUA BAN',
  subtitle = '',
  buttonText = 'LIEN HE CHUNG TOI',
  buttonLink = '#contact',
  topCards,
  bottomCards,
}: Why3DVisualsSectionProps) => {
  const resolvedTopCards = useMemo(
    () => (topCards && topCards.length > 0 ? topCards : DEFAULT_TOP_CARDS),
    [topCards],
  );
  const resolvedBottomCards = useMemo(
    () => (bottomCards && bottomCards.length > 0 ? bottomCards : DEFAULT_BOTTOM_CARDS),
    [bottomCards],
  );

  const [openAccordions, setOpenAccordions] = useState<Record<string, number | null>>({});

  const toggleAccordion = (cardKey: string, itemIndex: number) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [cardKey]: prev[cardKey] === itemIndex ? null : itemIndex,
    }));
  };

  const renderCard = (card: Why3DCard, cardKey: string) => {
    const IconComponent = getLucideIcon(card.icon) ?? getLucideIcon('Info');

    return (
      <div
        key={cardKey}
        className="flex w-full flex-col gap-5 rounded-3xl border border-gray-800 bg-gradient-to-b from-black to-gray-900 p-6 transition-transform duration-300 hover:scale-[1.02]"
      >
        <div className="flex items-center gap-5">
          <IconComponent className="text-3xl text-yellow-400" />
          <h3 className="text-2xl font-semibold uppercase text-white">{card.title}</h3>
        </div>

        <div className="flex flex-col">
          {card.items.map((item, itemIndex) => {
            const itemKey = `${cardKey}-item-${itemIndex}`;
            const isOpen = openAccordions[cardKey] === itemIndex;
            return (
              <div key={itemKey} className="border-t border-white/20 first:border-t-0">
                <button
                  type="button"
                  onClick={() => toggleAccordion(cardKey, itemIndex)}
                  className="flex w-full cursor-pointer items-center justify-between py-4 focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-yellow-400 text-sm transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
                    >
                      &#9656;
                    </span>
                    <span
                      className={`text-lg font-light transition-colors duration-300 ${isOpen ? 'text-white' : 'text-white/80'}`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <span
                    className={`text-lg font-light transition-colors duration-300 ${isOpen ? 'text-yellow-400' : 'text-white/60'}`}
                  >
                    {isOpen ? '-' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-4 text-gray-300 leading-relaxed animate-fade-in">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light uppercase text-white leading-tight mb-8">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl font-light leading-relaxed text-gray-300 lg:w-3/5 mb-8">
              {subtitle}
            </p>
          )}
          <a
            href={buttonLink}
            className="inline-flex items-center gap-3 px-8 py-3 border border-white rounded-2xl text-white text-sm uppercase font-medium hover:bg-white hover:text-black transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {buttonText}
          </a>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-8">
          {resolvedTopCards.map((card, index) => renderCard(card, `top-${index}`))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {resolvedBottomCards.map((card, index) => renderCard(card, `bottom-${index}`))}
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Why3DVisualsSection;
