'use client';

type CareSectionButton = {
  label?: string;
  url?: string;
};

type CareSectionProps = {
  title?: string;
  description?: string;
  button?: CareSectionButton;
};

const DEFAULT_TITLE = 'HAY DE CHUNG TOI CHAM SOC BAN';
const DEFAULT_DESCRIPTION =
  'Step V Studio - Doi tac cua ban cho cac du an hinh anh 3D cao cap, hoat hinh va giai phap marketing. Hien thuc hoa tam nhin cua ban voi do chinh xac, sang tao va doi moi.';
const DEFAULT_BUTTON: CareSectionButton = { label: 'DAT LICH HEN', url: '#booking' };

const CareSection = ({ title, description, button }: CareSectionProps) => {
  const resolvedTitle = title && title.trim().length > 0 ? title : DEFAULT_TITLE;
  const resolvedDescription =
    description && description.trim().length > 0 ? description : DEFAULT_DESCRIPTION;
  const resolvedButton = button && button.label ? { ...DEFAULT_BUTTON, ...button } : DEFAULT_BUTTON;

  return (
    <section className="relative isolate py-24 text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-gray-950 to-black" />
      <div className="absolute inset-0 -z-10 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(255, 215, 0, 0.12), transparent 55%)' }} />

      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-thin uppercase tracking-[0.2em] text-white/90">
            {resolvedTitle}
          </h2>
          <p className="mt-8 text-lg md:text-xl leading-relaxed text-white/70">
            {resolvedDescription}
          </p>

          {resolvedButton.label && (
            <div className="mt-10 flex justify-center">
              {(() => {
                const href = resolvedButton.url ?? '#contact';
                const isHash = href.startsWith('#');
                const isExternal = href.startsWith('http://') || href.startsWith('https://');
                const className = 'inline-flex items-center gap-3 rounded-full border border-[#FFD700] px-8 py-3 text-sm font-medium uppercase tracking-wide text-[#FFD700] transition-all duration-300 hover:bg-[#FFD700] hover:text-black';
                const target = isExternal ? '_blank' : undefined;
                const rel = target ? 'noopener noreferrer' : undefined;

                return (
                  <a href={href} className={className} target={isHash ? undefined : target} rel={isHash ? undefined : rel}>
                    {resolvedButton.label}
                  </a>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CareSection;
