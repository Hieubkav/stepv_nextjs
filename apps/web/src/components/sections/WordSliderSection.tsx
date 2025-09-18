'use client';

interface WordSliderSectionProps {
  words?: string[];
  repeatCount?: number;
}

const DEFAULT_WORDS = ['MÊ HOẶC', 'TRAO QUYỀN', 'NÂNG TẦM'];

const WordSliderSection = ({ words = DEFAULT_WORDS, repeatCount = 20 }: WordSliderSectionProps) => {
  const repeatedWords = Array.from({ length: repeatCount }, () => words).flat();

  return (
    <div className="overflow-hidden bg-gradient-to-r from-gray-900 via-black to-gray-900">
      {/* First Row - Moving Right */}
      <div className="relative py-8 md:py-12">
        <div className="animate-scroll-right flex whitespace-nowrap">
          {repeatedWords.map((word, index) => (
            <span
              key={`right-${index}`}
              className="inline-block text-white text-4xl md:text-6xl lg:text-8xl xl:text-9xl font-black mx-4 md:mx-6 lg:mx-8 hover:scale-110 transition-transform duration-300"
              style={{
                textShadow: '0 0 30px rgba(255,255,255,0.5)',
                letterSpacing: '0.1em',
              }}
            >
              {word}
            </span>
          ))}
          {repeatedWords.map((word, index) => (
            <span
              key={`right-dup-${index}`}
              className="inline-block text-white text-4xl md:text-6xl lg:text-8xl xl:text-9xl font-black mx-4 md:mx-6 lg:mx-8 hover:scale-110 transition-transform duration-300"
              style={{
                textShadow: '0 0 30px rgba(255,255,255,0.5)',
                letterSpacing: '0.1em',
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Second Row - Moving Left */}
      <div className="relative py-8 md:py-12 border-t border-gray-700">
        <div className="animate-scroll-left flex whitespace-nowrap">
          {repeatedWords.map((word, index) => (
            <span
              key={`left-${index}`}
              className="inline-block text-gray-300 text-4xl md:text-6xl lg:text-8xl xl:text-9xl font-black mx-4 md:mx-6 lg:mx-8 hover:scale-110 transition-transform duration-300"
              style={{
                textShadow: '0 0 20px rgba(156,163,175,0.4)',
                letterSpacing: '0.1em',
              }}
            >
              {word}
            </span>
          ))}
          {repeatedWords.map((word, index) => (
            <span
              key={`left-dup-${index}`}
              className="inline-block text-gray-300 text-4xl md:text-6xl lg:text-8xl xl:text-9xl font-black mx-4 md:mx-6 lg:mx-8 hover:scale-110 transition-transform duration-300"
              style={{
                textShadow: '0 0 20px rgba(156,163,175,0.4)',
                letterSpacing: '0.1em',
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordSliderSection;
