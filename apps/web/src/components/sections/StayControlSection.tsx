'use client';

import { useMemo } from 'react';

interface Feature {
  title: string;
  description: string;
  icon_svg?: string;
  width?: string;
  row?: number;
}

interface StayControlSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: Feature[];
  backgroundColor?: string;
  layout?: 'grid-2x2' | 'single-column' | 'custom';
}

const DEFAULT_FEATURES: Feature[] = [
  {
    title: 'Truy cap tat ca file',
    description: 'Truy cap vao toan bo tai san du an va ban giao trong mot noi dung an toan bat cu luc nao.',
    icon_svg: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z',
    width: '40%',
    row: 1,
  },
  {
    title: 'Theo doi tien do',
    description: 'Cap nhat tien do, moc quan trong va deadline theo thoi gian thuc de ban luon chu dong.',
    icon_svg: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z',
    width: '60%',
    row: 1,
  },
  {
    title: 'Giao tiep don gian',
    description: 'Gop y truc tiep trong dashboard, loai bo email dai dong va giu tat ca thong tin tap trung.',
    icon_svg: 'M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9V7H18V9H6M14,11V13H6V11H14M16,15V13H18V15H16Z',
    width: '60%',
    row: 2,
  },
  {
    title: 'To chuc du an tuong lai',
    description: 'Kho luu tru dai han giup xem lai du an cu hoac khoi dong du an moi trong vai giay.',
    icon_svg: 'M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19M16.5,16L13.5,12.5L11,15.5L8.5,12.5L5.5,16H16.5Z',
    width: '40%',
    row: 2,
  },
];

const DEFAULT_DESCRIPTION = 'Chung toi giup ban de dang ket noi va kiem soat moi thao tac voi doi ngu thong qua bang dieu khien truc quan.';

const StayControlSection = ({
  title = 'KIEM SOAT HOAN TOAN VOI BANG DIEU KHIEN KHACH HANG',
  subtitle,
  description,
  features,
  backgroundColor = 'bg-black',
  layout = 'grid-2x2',
}: StayControlSectionProps) => {
  const resolvedFeatures = useMemo(() => (features && features.length > 0 ? features : DEFAULT_FEATURES), [features]);

  const featureRows = useMemo(() => {
    if (resolvedFeatures.length === 0) {
      return [] as Feature[][];
    }

    const everyHasRow = resolvedFeatures.every((feature) => typeof feature.row === 'number');
    if (everyHasRow) {
      const rowMap = new Map<number, Feature[]>();
      resolvedFeatures.forEach((feature) => {
        const rowKey = typeof feature.row === 'number' ? feature.row : 1;
        if (!rowMap.has(rowKey)) {
          rowMap.set(rowKey, []);
        }
        rowMap.get(rowKey)!.push(feature);
      });
      return Array.from(rowMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, items]) => items);
    }

    if (layout === 'single-column') {
      return [resolvedFeatures];
    }

    const chunkSize = layout === 'custom' ? 3 : 2;
    const rows: Feature[][] = [];
    for (let i = 0; i < resolvedFeatures.length; i += chunkSize) {
      rows.push(resolvedFeatures.slice(i, i + chunkSize));
    }
    return rows;
  }, [resolvedFeatures, layout]);

  const headlineSubtitle = subtitle ?? description ?? DEFAULT_DESCRIPTION;
  const supportingDescription = description ?? subtitle ?? DEFAULT_DESCRIPTION;

  const getWidthClass = (feature: Feature, rowLength: number) => {
    if (layout === 'single-column') return 'w-full';
    if (feature.width === '40%') return 'w-full md:w-[40%]';
    if (feature.width === '60%') return 'w-full md:w-[60%]';
    if (feature.width === '100%') return 'w-full';
    if (rowLength === 1) return 'w-full';
    return 'w-full md:w-1/2';
  };

  const sectionClasses = `${backgroundColor} flex flex-col items-center w-full text-left py-20 box-border`.trim();

  return (
    <div className={sectionClasses}>
      <div className="w-full max-w-[1140px] px-4">
        <div className="w-full flex flex-col p-4 lg:p-[25px] gap-5 box-border">
          <div className="w-full">
            <div className="mb-[30px] text-left">
              <h2 className="text-white font-light uppercase text-5xl lg:text-[60.8px] lg:leading-[60.8px]">
                {title}
              </h2>
            </div>
            <div className="w-full lg:w-[60%] text-left">
              <p className="text-white font-light text-xl leading-[35px]" style={{ textShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
                {headlineSubtitle}
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-5 mt-10 mb-[10%]" style={{ perspective: '1200px' }}>
            {featureRows.map((featureRow, rowIndex) => {
              const isFirstRow = rowIndex === 0;
              const gradientDirection = isFirstRow
                ? 'linear-gradient(to bottom, #000000 0%, #333333 100%)'
                : 'linear-gradient(to bottom, #333333 0%, #000000 100%)';

              return (
                <div key={`row-${rowIndex}`} className="flex flex-col md:flex-row gap-5">
                  {featureRow.map((feature, featureIndex) => {
                    const widthClass = getWidthClass(feature, featureRow.length);
                    return (
                      <div
                        key={`feature-${rowIndex}-${featureIndex}`}
                        className={`${widthClass} flex flex-col justify-start p-8 rounded-[25px] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
                        style={{
                          background: gradientDirection,
                          transform: 'matrix3d(0.998, -0.001, 0.061, 0, 0, 0.999, 0.019, 0, -0.061, -0.019, 0.997, 0, 0, 0, 0, 1)',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        <div className="flex flex-col gap-6">
                          {feature.icon_svg ? (
                            <div className="flex justify-start">
                              <svg className="w-7 h-7" fill="#FFD700" viewBox="0 0 24 24">
                                <path d={feature.icon_svg} />
                              </svg>
                            </div>
                          ) : null}
                          <div>
                            <h3 className="text-white font-semibold text-[28px] leading-tight mb-4 uppercase">
                              {feature.title}
                            </h3>
                            <p className="text-[#d2d2d2] font-light text-[20px] leading-relaxed" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {supportingDescription && (
            <p className="text-white/70 font-light text-lg leading-relaxed lg:w-[60%]">
              {supportingDescription}
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .text-5xl {
            font-size: 2.5rem !important;
          }

          .lg\:text-\[60\.8px\] {
            font-size: 2.5rem !important;
            line-height: 2.5rem !important;
          }

          .lg\:w-\[60\%\] {
            width: 100% !important;
          }

          .md\:w-\[40\%\],
          .md\:w-\[60\%\] {
            width: 100% !important;
          }

          .md\:flex-row {
            flex-direction: column !important;
          }

          .text-\[28px\] {
            font-size: 24px !important;
          }

          .text-\[20px\] {
            font-size: 18px !important;
          }
        }

        .hover\:scale-\[1\.02\]:hover {
          transform: matrix3d(1.018, -0.001, 0.062, 0, 0, 1.019, 0.019, 0, -0.062, -0.019, 1.017, 0, 0, 0, 0, 1);
        }

        .hover\:shadow-2xl:hover {
          box-shadow: 0 35px 70px -12px rgba(0, 0, 0, 0.6);
        }

        .transition-all {
          will-change: transform, box-shadow, scale;
        }
      `}</style>
    </div>
  );
};

export default StayControlSection;
