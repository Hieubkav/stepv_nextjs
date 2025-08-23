'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings } from '@/hooks/useSiteConfig';

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
  const { getSetting } = useSiteSettings();
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
    'Hình ảnh 3D Sản phẩm',
    'Sản xuất VFX / AR',
    'Motion Graphics',
    'Hoạt hình Thương hiệu',
    'Hình ảnh Kiến trúc',
    'Hoạt hình Nhân vật'
  ];

  return (
    <section id="contact" className={`py-20 ${backgroundColor} text-white min-h-screen`}>
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Left Column - Information & Social */}
            <div className="lg:pr-16 py-12 flex flex-col justify-center">
              <div className="space-y-12">
                
                {/* Main Title */}
                <div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-thin text-white leading-tight mb-8 tracking-wide">
                    {title}
                  </h1>
                  <p className="text-xl text-white font-light leading-relaxed max-w-lg">
                    {subtitle}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-white opacity-30"></div>

                {/* Social Media Section */}
                <div className="space-y-6">
                  <p className="text-white text-lg font-light">
                    Theo dõi chúng tôi trên mạng xã hội để cập nhật tin tức mới nhất, dự án và nội dung hậu trường
                  </p>
                  
                  <div className="flex space-x-4">
                    {[
                      {
                        name: 'YouTube',
                        href: 'https://www.youtube.com/@dohystudio',
                        icon: (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        )
                      },
                      {
                        name: 'TikTok',
                        href: 'https://www.tiktok.com/@dohystudio',
                        icon: (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        )
                      },
                      {
                        name: 'Facebook',
                        href: 'https://www.facebook.com/profile.php?id=61574798173124&sk=friends_likes',
                        icon: (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        )
                      },
                      {
                        name: 'Instagram',
                        href: 'https://www.instagram.com/dohy_studio/',
                        icon: (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        )
                      }
                    ].map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-black border border-gray-800 rounded-lg flex items-center justify-center transition-all duration-300 hover:border-[#FFD700] group"
                      >
                        <div className="text-[#FFD700] group-hover:scale-110 transition-transform duration-300">
                          {social.icon}
                        </div>
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
                      <a href={`mailto:${getSetting('contact_email', 'contact@stepv.studio')}`} className="text-[#FFD700] hover:underline text-lg">
                        {getSetting('contact_email', 'contact@stepv.studio')}
                      </a>
                    </div>
                    <div>
                      <a href={`tel:${getSetting('contact_phone', '+49-176-21129718')}`} className="text-[#FFD700] hover:underline text-lg">
                        {getSetting('contact_phone', '+49-176-21129718')}
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
                        className="bg-black border border-gray-600 text-white placeholder-gray-400 focus:border-[#FFD700] focus:ring-0 rounded-lg h-12"
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
                        className="bg-black border border-gray-600 text-white placeholder-gray-400 focus:border-[#FFD700] focus:ring-0 rounded-lg h-12"
                        placeholder="E-Mail*"
                      />
                    </div>

                    {/* Service Category Dropdown */}
                    <div>
                      <select
                        name="serviceCategory"
                        value={formData.serviceCategory}
                        onChange={handleInputChange}
                        className="w-full bg-black border border-gray-600 text-white focus:border-[#FFD700] focus:ring-0 rounded-lg h-12 px-3"
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
                        className="bg-black border border-gray-600 text-white placeholder-gray-400 focus:border-[#FFD700] focus:ring-0 rounded-lg resize-none"
                        placeholder="Tin nhắn"
                      />
                    </div>

                    {/* Privacy Policy Checkbox */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        name="privacyAgreed"
                        checked={formData.privacyAgreed}
                        onChange={handleInputChange}
                        className="mt-1 w-4 h-4 text-[#FFD700] bg-black border-gray-600 rounded focus:ring-[#FFD700] focus:ring-2"
                        required
                      />
                      <label className="text-white text-sm">
                        Tôi đồng ý với{' '}
                        <a href="#" className="text-[#FFD700] hover:underline">
                          CHÍNH SÁCH BẢO MẬT
                        </a>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-black border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black font-medium py-3 px-6 rounded-lg transition-all duration-300 uppercase tracking-wide disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang gửi...</span>
                        </div>
                      ) : (
                        'GỬI'
                      )}
                    </Button>

                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                      <div className="p-4 bg-[#FFD700]/20 border border-[#FFD700] rounded-lg text-[#FFD700] text-center">
                        Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi bạn sớm.
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-center">
                        Xin lỗi, đã có lỗi xảy ra khi gửi tin nhắn của bạn. Vui lòng thử lại.
                      </div>
                    )}
                  </form>
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