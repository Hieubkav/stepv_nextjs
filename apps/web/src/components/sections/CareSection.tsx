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

const CareSection = ({ title, description, button }: CareSectionProps) => {
  const resolvedTitle = title?.trim();
  const resolvedDescription = description?.trim();
  const buttonLabel = button?.label?.trim();
  const buttonHref = button?.url?.trim();

  const hasContent = Boolean(resolvedTitle || resolvedDescription || buttonLabel);
  if (!hasContent) return null;

  return (
    <section className="relative isolate py-24 text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-gray-950 to-black" />
      <div className="absolute inset-0 -z-10 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(255, 215, 0, 0.12), transparent 55%)' }} />

      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl text-center">
          {resolvedTitle && (
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-thin uppercase tracking-[0.2em] text-white/90">
              {resolvedTitle}
            </h2>
          )}
          {resolvedDescription && (
            <p className="mt-8 text-lg md:text-xl leading-relaxed text-white/70">
              {resolvedDescription}
            </p>
          )}

          {buttonLabel && (
            <div className="mt-10 flex justify-center">
              {(() => {
                const href = buttonHref ?? '#contact';
                const isHash = href.startsWith('#');
                const isExternal = href.startsWith('http://') || href.startsWith('https://');
                const className = 'inline-flex items-center gap-3 rounded-full border border-[#FFD700] px-8 py-3 text-sm font-medium uppercase tracking-wide text-[#FFD700] transition-all duration-300 hover:bg-[#FFD700] hover:text-black';
                const target = isExternal ? '_blank' : undefined;
                const rel = target ? 'noopener noreferrer' : undefined;

                return (
                  <a href={href} className={className} target={isHash ? undefined : target} rel={isHash ? undefined : rel}>
                    {buttonLabel}
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
