'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContactFormSectionProps {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
}

interface FormData {
  name: string;
  email: string;
  serviceCategory: string;
  message: string;
  privacyAgreed: boolean;
}

const ContactFormSection = ({
  title = 'CÙNG HIỆN THỰC HÓA TẦM NHÌN CỦA BẠN',
  subtitle = 'Chúng tôi ở đây để giúp bạn tạo ra những hình ảnh và hoạt hình tuyệt đẹp, thu hút khán giả và nâng tầm thương hiệu của bạn. Dù bạn có câu hỏi, cần báo giá, hay muốn thảo luận về dự án tiếp theo, chúng tôi rất mong được lắng nghe từ bạn',
  backgroundColor = 'bg-black'
}: ContactFormSectionProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    serviceCategory: '',
    message: '',
    privacyAgreed: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacyAgreed) {
      alert('Vui lòng đồng ý với chính sách bảo mật');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        serviceCategory: '',
        message: '',
        privacyAgreed: false
      });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceCategories = [
    'HINH ANH 3D SAN PHAM',
    'SAN XUAT VFX / AR',
    'MOTION GRAPHICS',
    'HOAT HINH THUONG HIEU',
    'HINH ANH KIEN TRUC',
    'HOAT HINH NHAN VAT'
  ];

  const resolvedBackground = backgroundColor && backgroundColor.trim().length > 0
    ? backgroundColor
    : 'bg-gradient-to-br from-black via-gray-950 to-black';
  const shouldOverlay = !backgroundColor || backgroundColor.trim().length === 0;

  return (
    <section
      id="contact"
      className={`relative py-20 text-white min-h-screen ${resolvedBackground}`}
    >
      {shouldOverlay && <div className="absolute inset-0 bg-black/55" aria-hidden="true" />}
      <div className="relative container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_120px_rgba(0,0,0,0.6)]">
            <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Column - Information & Social */}
            <div className="flex flex-col gap-12 bg-black/50 px-8 py-12 sm:px-12 lg:py-16 border-b border-white/10 lg:border-b-0 lg:border-r">
              <div className="space-y-12">
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-thin leading-tight tracking-wide text-white">
                    {title}
                  </h1>
                  <p className="max-w-lg text-xl font-light leading-relaxed text-white/80">
                    {subtitle}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-white/15"></div>

                {/* Social Media Section */}
                <div className="space-y-6">
                  <p className="text-white/70 text-lg font-light leading-relaxed">
                    Theo dõi chúng tôi trên mạng xã hội để cập nhật tin tức mới nhất, dự án và nội dung hậu trường
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    {[
                      {
                        name: 'YouTube',
                        href: 'https://www.youtube.com/@dohystudio',
                        icon: (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        )
                      },
                      {
                        name: 'TikTok',
                        href: 'https://www.tiktok.com/@dohystudio',
                        icon: (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        )
                      },
                      {
                        name: 'Facebook',
                        href: 'https://www.facebook.com/profile.php?id=61574798173124&sk=friends_likes',
                        icon: (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        )
                      },
                      {
                        name: 'Instagram',
                        href: 'https://www.instagram.com/dohy_studio/',
                        icon: (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        )
                      },
                      {
                        name: 'Pinterest',
                        href: '',
                        icon: (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.895.803 1.604.803 2.111 0 3.633-1.941 3.633-4.354 0-2.312-1.888-4.042-4.316-4.042-3.021 0-4.625 2.003-4.625 4.137 0 .695.366 1.56.949 1.836.095.045.146.025.168-.07.017-.07.108-.432.142-.563.047-.183.029-.246-.102-.406-.284-.348-.466-.798-.466-1.435 0-1.848 1.375-3.63 3.722-3.63 2.03 0 3.444 1.378 3.444 3.344 0 2.516-1.11 4.25-2.558 4.25-.825 0-1.442-.682-1.244-1.519.237-1.001.696-2.08.696-2.803 0-.647-.347-1.188-1.062-1.188-.843 0-1.519.871-1.519 2.037 0 .743.251 1.246.251 1.246s-.864 3.663-.999 4.263c-.184.819-.027 1.988-.014 2.098.008.064.092.08.129.031.053-.07.756-1.018.979-1.8.088-.307.504-1.967.504-1.967.249.474.976.892 1.749.892 2.301 0 3.954-2.098 3.954-4.784C16.846 4.786 14.756 2.5 12 2.5 8.582 2.5 6.154 5.086 6.154 8.268c0 1.867.711 3.529 2.246 4.133.252.099.477.003.55-.272.053-.201.179-.709.235-.92.077-.297.047-.402-.162-.662-.459-.572-.753-1.296-.753-2.33 0-3.006 2.25-5.69 5.86-5.69 3.197 0 4.96 1.954 4.96 4.565 0 3.434-1.518 6.334-3.784 6.334-.76 0-1.477-.396-1.721-1.378l-.467 1.778c-.169.646-.625 1.457-.93 1.95C10.582 18.891 11.273 19 12 19c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                          </svg>
                        )
                      },
                      {
                        name: 'X',
                        href: '',
                        icon: (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        )
                      }
                    ].filter(social => social.href).map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:border-[#FFD700] hover:text-[#FFD700]"
                      >
                        <span className="text-white/80 transition-colors">
                          {social.icon}
                        </span>
                        <span className="text-sm uppercase tracking-wide">{social.name}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Our Services Button */}
                <div>
                  <Button className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-lg font-medium tracking-wide uppercase transition-all duration-300">
                    DỊCH VỤ CỦA CHÚNG TÔI
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info & Form */}
            <div className="lg:pl-16 py-12 flex flex-col justify-center">
              <div className="space-y-12">
                
                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
                    CÁCH LIÊN HỆ VỚI CHÚNG TÔI
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <a href="mailto:contact@stepv.studio" className="text-[#FFD700] hover:underline text-lg">
                        contact@stepv.studio
                      </a>
                    </div>
                    <div>
                      <a href="tel:+49-176-21129718" className="text-[#FFD700] hover:underline text-lg">
                        +49-176-21129718
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div>
                  <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-2">
                    HOẶC GỬI TIN NHẮN CHO CHÚNG TÔI
                  </h3>
                  <p className="text-white mb-8">
                    Điền vào biểu mẫu bên dưới, chúng tôi sẽ phản hồi bạn trong vòng <span className="text-[#FFD700]">24 giờ</span>
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <Input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-12 w-full rounded-2xl border border-white/20 bg-white/5 px-3 text-sm text-white placeholder-white/40 focus:border-[#FFD700] focus:ring-[#FFD700]/30 focus:ring-2 focus:outline-none transition"
                        placeholder="Họ và tên*"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <Input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-12 w-full rounded-2xl border border-white/20 bg-white/5 px-3 text-sm text-white placeholder-white/40 focus:border-[#FFD700] focus:ring-[#FFD700]/30 focus:ring-2 focus:outline-none transition"
                        placeholder="E-Mail*"
                      />
                    </div>

                    {/* Service Category Dropdown */}
                    <div>
                      <select
                        name="serviceCategory"
                        value={formData.serviceCategory}
                        onChange={handleInputChange}
                        className="h-12 w-full rounded-2xl border border-white/20 bg-white/5 px-3 text-sm text-white placeholder-white/40 focus:border-[#FFD700] focus:ring-[#FFD700]/30 focus:ring-2 focus:outline-none transition"
                      >
                        <option value="" className="text-gray-400">Danh mục dịch vụ</option>
                        {serviceCategories.map((category, index) => (
                          <option key={index} value={category} className="text-white bg-black">
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message Field */}
                    <div>
                      <Textarea
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#FFD700] focus:ring-[#FFD700]/30 focus:ring-2 focus:outline-none transition resize-none"
                        placeholder="Tin nhắn"
                      />
                    </div>

                    {/* Privacy Policy Checkbox */}
                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <input
                        type="checkbox"
                        name="privacyAgreed"
                        checked={formData.privacyAgreed}
                        onChange={handleInputChange}
                        className="mt-0.5 h-4 w-4 rounded border-white/40 bg-black/70 text-[#FFD700] focus:ring-[#FFD700] focus:ring-offset-0"
                        required
                      />
                      <span className="text-sm text-white/80">
                        Tôi đồng ý với{' '}
                        <a href="#" className="text-[#FFD700] hover:underline">
                          CHÍNH SÁCH BẢO MẬT
                        </a>
                      </span>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full border border-[#FFD700] bg-[#FFD700] py-3 px-6 font-medium uppercase tracking-wide text-black transition-all duration-300 hover:bg-transparent hover:text-[#FFD700] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "#FFD700", borderTopColor: "transparent" }}></div>
                          <span>Đang gửi...</span>
                        </div>
                      ) : (
                        'GỬI'
                      )}
                    </Button>

                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                      <div
                        className="rounded-2xl border px-5 py-4 text-center text-sm"
                        style={{ backgroundColor: 'rgba(255, 215, 0, 0.15)', borderColor: 'rgba(255, 215, 0, 0.65)', color: '#FFD700' }}
                      >
                        C?m on b?n! Tin nhan c?a b?n da du?c g?i th�nh c�ng. Ch�ng t�i s? ph?n h?i b?n s?m.
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="rounded-2xl border border-red-500/60 bg-red-500/15 px-5 py-4 text-center text-sm text-red-300">
                        Xin l?i, da c� l?i x?y ra khi g?i tin nh?n c?a b?n. Vui l�ng th? l?i.
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
