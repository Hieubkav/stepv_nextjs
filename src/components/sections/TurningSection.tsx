'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";

// Import logos as static assets
import wnxLogo from '../../../public/images/logos/wn-x.png';
import dnaLogo from '../../../public/images/logos/dna.png';
import gdivineLogo from '../../../public/images/logos/gdivine.png';
import hyaluronceLogo from '../../../public/images/logos/hyaluronce.png';
import fivoLogo from '../../../public/images/logos/fivo.png';
import thedarkagesLogo from '../../../public/images/logos/thedarkages.png';
import gazzazLogo from '../../../public/images/logos/gazzaz.png';
import sdvstudiosLogo from '../../../public/images/logos/sdvstudios.png';
import caronparisLogo from '../../../public/images/logos/caronparis.png';

interface ClientLogo {
  image: string;
  alt: string;
  client_name: string;
}

interface TurningSectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor?: string;
  textSize?: string;
  signatureImage?: string;
  founderName?: string;
  founderTitle?: string;
  clientLogos?: ClientLogo[];
}

const TurningSection = ({
  title = 'BIẾN ĐAM MÊ THÀNH HOÀN HẢO',
  description = 'Tại DOHY Media, mọi thứ chúng tôi tạo ra đều bắt đầu từ niềm đam mê kể chuyện và đổi mới. Được thành lập tại Stuttgart, Đức, studio của chúng tôi ra đời từ mong muốn biến những ý tưởng táo bạo thành hình ảnh 3D và hoạt hình tuyệt đẹp. Những gì bắt đầu như một giấc mơ vượt qua ranh giới của thiết kế 3D đã phát triển thành đối tác sáng tạo đáng tin cậy cho các thương hiệu cao cấp và những người có tầm nhìn trên toàn thế giới.\n\nMỗi dự án chúng tôi thực hiện đều là một sự hợp tác—tầm nhìn của bạn, được hiện thực hóa thông qua chuyên môn của chúng tôi.',
  buttonText = 'LIÊN HỆ',
  buttonUrl = '#contact',
  backgroundColor = 'bg-black',
  textSize = 'text-[60.8px]',
  signatureImage = 'https://stepv.studio/wp-content/uploads/2025/04/signaturewhite.png',
  founderName = 'VASILII GUREV',
  founderTitle = 'CEO & FOUNDER OF STEP V STUDIO',
  clientLogos = [
    { image: wnxLogo, alt: 'WN-X Logo', client_name: 'WN-X' },
    { image: dnaLogo, alt: 'DNA Logo', client_name: 'DNA' },
    { image: gdivineLogo, alt: 'G\'DIVINE Logo', client_name: 'G\'DIVINE' },
    { image: hyaluronceLogo, alt: 'Hyaluronce Logo', client_name: 'HYALURONCE' },
    { image: fivoLogo, alt: 'FIVO Logo', client_name: 'FIVO' },
    { image: thedarkagesLogo, alt: 'The Dark Ages Logo', client_name: 'THE DARK AGES' },
    { image: gazzazLogo, alt: 'GAZZAZ Logo', client_name: 'GAZZAZ' },
    { image: sdvstudiosLogo, alt: 'SDV Studios Logo', client_name: 'SDV STUDIOS' },
    { image: caronparisLogo, alt: 'CARON PARIS Logo', client_name: 'CARON PARIS' }
  ]
}: TurningSectionProps) => {

  // Convert \n to <br> for description
  const formattedDescription = description.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      {index < description.split('\n').length - 1 && <br />}
    </span>
  ));

  const handleButtonClick = () => {
    if (buttonUrl.startsWith('#')) {
      const element = document.querySelector(buttonUrl);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.open(buttonUrl, '_blank');
    }
  };

  // Divide logos into rows (3 logos per row)
  const logoRows = [];
  for (let i = 0; i < clientLogos.length; i += 3) {
    logoRows.push(clientLogos.slice(i, i + 3));
  }

  return (
    <section
      id="about"
      className={`max-w-7xl mx-auto ${backgroundColor} py-20 px-6 lg:px-8`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Content */}
        <div className="space-y-8">
          {/* Main Title */}
          <div>
            <h2 className={`text-white font-light uppercase ${textSize} leading-tight font-sans`}>
              {title}
            </h2>
          </div>

          {/* Description */}
          <div>
            <p className="text-white font-light text-xl leading-relaxed font-sans">
              {formattedDescription}
            </p>
          </div>

          {/* Button */}
          <div>
            <Button
              onClick={handleButtonClick}
              className="bg-white hover:bg-gray-200 text-black font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:scale-105 uppercase tracking-wide text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {buttonText}
            </Button>
          </div>
        </div>

        {/* Right Column: Founder & Logos */}
        <div className="space-y-8">
          {/* Founder Signature */}
          <div className="space-y-4">
            <div
              className="w-full h-32 bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${signatureImage}')` }}
            />
            <div>
              <h3 className="text-white font-light text-2xl leading-tight font-sans">
                {founderName}
              </h3>
              <p className="text-white font-light text-lg leading-relaxed font-sans opacity-80">
                {founderTitle}
              </p>
            </div>
          </div>

          {/* Client Logos Grid */}
          <div className="space-y-6">

            {logoRows.map((logoRow, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-3 gap-6">
                {logoRow.map((logo, logoIndex) => (
                  <div key={logoIndex} className="logo-container flex items-center justify-center p-2">
                    <Image
                      src={logo.image}
                      alt={logo.alt}
                      width={120}
                      height={60}
                      className="max-w-full max-h-16 w-auto h-auto object-contain opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-105"
                      title={logo.client_name}
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
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .text-\\[60\\.8px\\] {
            font-size: 2.5rem !important;
            line-height: 2.5rem !important;
          }

          .grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .lg\\:grid-cols-2 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .text-\\[60\\.8px\\] {
            font-size: 3.5rem !important;
            line-height: 3.5rem !important;
          }
        }

        /* Logo hover effects */
        img {
          transition: all 0.3s ease;
        }

        img:hover {
          transform: scale(1.05);
        }

        /* Button hover effects */
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.1);
        }

        /* Signature background positioning */
        .bg-contain {
          background-size: contain;
          background-position: left center;
        }

        /* Logo grid spacing */
        .grid.grid-cols-3 {
          align-items: center;
          justify-items: center;
        }

        /* Logo styling for dark background */
        .logo-container {
          transition: all 0.3s ease;
        }

        .logo-container:hover {
          transform: translateY(-2px);
        }

        /* Responsive logo grid */
        @media (max-width: 640px) {
          .grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1rem;
          }
        }

        /* Text animations */
        .space-y-8 > div {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        .space-y-8 > div:nth-child(1) { animation-delay: 0.1s; }
        .space-y-8 > div:nth-child(2) { animation-delay: 0.2s; }
        .space-y-8 > div:nth-child(3) { animation-delay: 0.3s; }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default TurningSection;
