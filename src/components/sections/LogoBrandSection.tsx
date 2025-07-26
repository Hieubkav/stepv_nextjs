'use client';

interface ClientLogo {
  image: string;
  alt: string;
  client_name: string;
}

interface LogoBrandSectionProps {
  signatureImage?: string;
  founderName?: string;
  founderTitle?: string;
  clientLogos?: ClientLogo[];
  backgroundColor?: string;
  layout?: '1-column' | '2-columns';
}

const LogoBrandSection = ({
  signatureImage = 'https://stepv.studio/wp-content/uploads/2025/04/signaturewhite.png',
  founderName = 'VASILII GUREV',
  founderTitle = 'CEO & FOUNDER OF STEP V STUDIO',
  clientLogos = [
    { image: 'https://stepv.studio/wp-content/uploads/2024/08/wn-x-black-and-red-2-1024x1017.png', alt: 'Client Logo 1', client_name: 'WN-X' },
    { image: 'https://stepv.studio/wp-content/uploads/2024/08/dnalogo-1024x1017.png', alt: 'Client Logo 2', client_name: 'DNA' },
    { image: 'https://stepv.studio/wp-content/uploads/2024/10/gdivine-1024x1017.png', alt: 'Client Logo 3', client_name: 'G\'DIVINE' },
    { image: 'https://stepv.studio/wp-content/uploads/2024/10/caronparis-logo-1024x1017.png', alt: 'Client Logo 4', client_name: 'CARON PARIS' },
    { image: 'https://stepv.studio/wp-content/uploads/2024/08/wn-x-black-and-red-2-1024x1017.png', alt: 'Client Logo 5', client_name: 'WN-X' },
    { image: 'https://stepv.studio/wp-content/uploads/2024/08/dnalogo-1024x1017.png', alt: 'Client Logo 6', client_name: 'DNA' },
    { image: 'https://stepv.studio/wp-content/uploads/2024/10/gdivine-1024x1017.png', alt: 'Client Logo 7', client_name: 'G\'DIVINE' },
    { image: 'https://stepv.studio/wp-content/uploads/2024/10/caronparis-logo-1024x1017.png', alt: 'Client Logo 8', client_name: 'CARON PARIS' },
    { image: 'https://stepv.studio/wp-content/uploads/2024/10/caronparis-logo-1024x1017.png', alt: 'Client Logo 9', client_name: 'CARON PARIS' }
  ],
  backgroundColor = 'bg-black',
  layout = '2-columns'
}: LogoBrandSectionProps) => {

  // Divide logos into rows (3 logos per row)
  const logoRows = [];
  for (let i = 0; i < clientLogos.length; i += 3) {
    logoRows.push(clientLogos.slice(i, i + 3));
  }

  // Layout classes
  const containerClass = layout === '1-column' ? 'flex-col' : 'flex-row';
  const leftColumnClass = layout === '1-column' ? 'w-full' : 'w-1/2';
  const rightColumnClass = layout === '1-column' ? 'w-full' : 'w-1/2';

  return (
    <section 
      id="logo-brand" 
      className={`max-w-7xl mx-auto ${backgroundColor} flex items-center justify-center w-full relative text-left p-[10px] gap-5 box-border transition-all duration-300 ${containerClass}`}
    >
      {/* Left Column: Signature & Info */}
      <div className={`${leftColumnClass} flex flex-col relative text-left p-[10px] gap-5 box-border transition-all duration-300`}>
        
        {/* Signature Image (as background) */}
        <div 
          className="w-full flex flex-col relative text-left p-[10px] gap-5 box-border min-h-[150px] bg-contain bg-center bg-no-repeat transition-all duration-300"
          style={{ backgroundImage: `url('${signatureImage}')` }}
        >
          {/* This div is empty, only used to display background image */}
        </div>

        {/* Founder Info */}
        <div className="w-full flex flex-col relative text-left p-[10px] gap-5 box-border transition-all duration-300">
          <div className="w-full flex flex-col relative text-left gap-5 box-border">
            
            {/* Founder Name */}
            <div className="w-full relative text-left box-border">
              <h3 className="text-white font-light text-2xl leading-[35px] text-left font-sans box-border" style={{ textShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
                {founderName}
              </h3>
            </div>

            {/* Founder Title */}
            <div className="w-full relative text-left box-border">
              <h4 className="text-white font-light text-lg leading-[30px] text-left font-sans box-border" style={{ textShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
                {founderTitle}
              </h4>
            </div>

          </div>
        </div>

      </div>

      {/* Right Column: Client Logos */}
      <div className={`${rightColumnClass} flex flex-col relative text-left p-[10px] gap-5 box-border transition-all duration-300`}>
        
        {logoRows.map((logoRow, rowIndex) => (
          <div key={rowIndex} className="w-full grid grid-cols-3 justify-start items-stretch content-start relative text-left p-[10px] gap-5 box-border">
            {logoRow.map((logo, logoIndex) => (
              <div key={logoIndex}>
                <img 
                  src={logo.image}
                  loading="lazy"
                  decoding="async"
                  alt={logo.alt}
                  title={logo.client_name}
                  className="max-w-full align-middle hover:opacity-80 transition-opacity duration-300"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.src = 'https://via.placeholder.com/200x200?text=Logo';
                  }}
                />
              </div>
            ))}
            
            {/* Add empty divs if row doesn't have 3 logos */}
            {Array.from({ length: 3 - logoRow.length }, (_, i) => (
              <div key={`empty-${i}`}></div>
            ))}
          </div>
        ))}

      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .flex-row {
            flex-direction: column;
          }
          
          .w-1\\/2 {
            width: 100%;
          }
          
          .min-h-\\[150px\\] {
            min-height: 100px;
          }
          
          .text-2xl {
            font-size: 1.5rem;
            line-height: 2rem;
          }
          
          .text-lg {
            font-size: 1rem;
            line-height: 1.5rem;
          }
        }

        /* Grid responsive */
        @media (max-width: 640px) {
          .grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* Image hover effects */
        img {
          filter: brightness(0.9);
          transition: all 0.3s ease;
        }

        img:hover {
          filter: brightness(1.1);
          transform: scale(1.05);
        }

        /* Text shadow utility */
        .text-shadow {
          text-shadow: 0 0 10px rgba(0,0,0,0.3);
        }
      `}</style>
    </section>
  );
};

export default LogoBrandSection;
