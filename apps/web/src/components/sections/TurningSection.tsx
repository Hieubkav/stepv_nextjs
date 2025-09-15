'use client';

import { Button } from "@/components/ui/button";

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
  description = 'Tại DOHY Media, mọi thứ chúng tôi tạo ra đều bắt đầu từ niềm đam mê kể chuyện và đổi mới. Được thành lập tại Stuttgart, Đức, studio của chúng tôi ra đời từ mong muốn biến những ý tưởng táo bạo thành hình ảnh 3D và hoạt hình tuyệt đẹp. Những gì bắt đầu như một giấc mơ vượt qua ranh giới của thiết kế 3D đã phát triển thành đối tác sáng tạo đáng tin cậy cho các thương hiệu cao cấp và những người có tầm nhìn trên toàn thế giới. Mỗi dự án chúng tôi thực hiện đều là một sự hợp tác—tầm nhìn của bạn, được hiện thực hóa thông qua chuyên môn của chúng tôi.',
  buttonText = 'LIÊN HỆ',
  buttonUrl = '#contact',
  backgroundColor = 'bg-black',
  textSize = 'text-[60.8px]',
  signatureImage = 'https://stepv.studio/wp-content/uploads/2025/04/signaturewhite.png',
  founderName = 'VASILII GUREV',
  founderTitle = 'CEO & FOUNDER OF STEP V STUDIO',
  clientLogos = [
    { image: 'https://stepv.studio/wp-content/uploads/2025/04/wn-x.png', alt: 'WN-X Logo', client_name: 'WN-X' },
    { image: 'https://stepv.studio/wp-content/uploads/2025/04/dna.png', alt: 'DNA Logo', client_name: 'DNA' },
    { image: 'https://stepv.studio/wp-content/uploads/2025/04/gdivine.png', alt: 'G\'DIVINE Logo', client_name: 'G\'DIVINE' },
    { image: 'https://stepv.studio/wp-content/uploads/2025/04/hyaluronce.png', alt: 'Hyaluronce Logo', client_name: 'HYALURONCE' },
    { image: 'https://stepv.studio/wp-content/uploads/2025/04/fivo.png', alt: 'FIVO Logo', client_name: 'FIVO' },
    { image: 'https://stepv.studio/wp-content/uploads/2025/04/thedarkages.png', alt: 'The Dark Ages Logo', client_name: 'THE DARK AGES' },
    { image: 'https://stepv.studio/wp-content/uploads/2025/04/gazzaz.png', alt: 'GAZZAZ Logo', client_name: 'GAZZAZ' },
    { image: 'https://stepv.studio/wp-content/uploads/2025/04/sdvstudios.png', alt: 'SDV Studios Logo', client_name: 'SDV STUDIOS' },
    { image: 'https://stepv.studio/wp-content/uploads/2025/04/caronparis.png', alt: 'CARON PARIS Logo', client_name: 'CARON PARIS' }
  ]
}: TurningSectionProps) => {

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

  // Group logos into rows of 3
  const logoRows = [];
  for (let i = 0; i < clientLogos.length; i += 3) {
    logoRows.push(clientLogos.slice(i, i + 3));
  }

  return (
    <section
      id="about"
      className={`w-full ${backgroundColor} py-20`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
                {description}
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
                      <img
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
      </div>
    </section>
  );
};

export default TurningSection;