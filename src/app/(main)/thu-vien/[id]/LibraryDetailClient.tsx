'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/supabaseClient';
import { getSoftwareIcons, getFormattedSoftwareNames } from '@/utils/softwareIcons';
import { useSiteSettings } from '@/hooks/useSiteConfig';

type Library = Database['public']['Tables']['libraries']['Row'];

interface LibraryDetailClientProps {
  id: string;
}

export default function LibraryDetailClient({ id }: LibraryDetailClientProps) {
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(true);

  // Get site settings for payment info
  const { getSetting } = useSiteSettings();

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('libraries')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setLibrary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </main>
    );
  }

  if (error || !library) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy tài nguyên</h2>
          <p className="text-gray-300 mb-6">{error || 'Tài nguyên không tồn tại'}</p>
          <Link 
            href="/thu-vien"
            className="inline-flex items-center px-6 py-3 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-300 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại thư viện
          </Link>
        </div>
      </main>
    );
  }

  const isFree = library.pricing.toLowerCase().includes('free');
  const hasLinkUrl = library.link_url && library.link_url.trim() !== '';
  const isLinkVisible = library.link_status === 'visible';
  const softwareIcons = getSoftwareIcons(library.type);
  const formattedSoftwareNames = getFormattedSoftwareNames(library.type);

  // Handle download/link click
  const handleDownloadClick = () => {
    if (hasLinkUrl && isLinkVisible) {
      window.open(library.link_url, '_blank');
    } else {
      // Fallback behavior if no link is set
      console.log('No download link available');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              href="/thu-vien"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Quay lại thư viện
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Image Section */}
            <div className="space-y-6">
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                {library.image_url ? (
                  <Image
                    src={library.image_url}
                    alt={library.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl text-gray-600">
                      <i className="fas fa-image"></i>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-8">
              
              {/* Title and Badge */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl font-bold text-white">
                    {library.title}
                  </h1>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                    isFree 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-400 text-black'
                  }`}>
                    {isFree ? 'Free' : 'Premium'}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-gray-400">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-tag"></i>
                    {formattedSoftwareNames}
                  </span>
                  <span className="flex items-center gap-2">
                    <i className="fas fa-calendar"></i>
                    {new Date(library.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Software Icons */}
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-gray-400 text-sm">Tương thích:</span>
                  <div className="flex gap-2">
                    {softwareIcons.map((icon, index) => (
                      <div key={index} className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center p-1.5 border border-gray-600">
                        {icon.name === 'BL' ? (
                          <span className="text-white text-xs font-bold">BL</span>
                        ) : (
                          <Image
                            src={icon.image}
                            alt={icon.name}
                            width={20}
                            height={20}
                            className="object-contain filter brightness-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-white text-xs font-bold">${icon.name}</span>`;
                              }
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Mô tả</h2>
                <p className="text-gray-300 leading-relaxed">
                  {library.description}
                </p>
              </div>

              {/* Pricing */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Giá</h2>
                <div className="text-3xl font-bold text-yellow-400">
                  {library.pricing}
                </div>

                {/* Payment Info for Premium Items */}
                {!isFree && (
                  <div className="mt-6 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Thông tin thanh toán</h3>
                      <button
                        onClick={() => setShowPaymentInfo(!showPaymentInfo)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        <i className={`fas fa-chevron-${showPaymentInfo ? 'up' : 'down'}`}></i>
                      </button>
                    </div>

                    {showPaymentInfo && (
                      <div className="space-y-4">
                        {/* Bank Info */}
                        {getSetting('bank_name') && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">Ngân hàng</label>
                              <div className="text-white font-medium">{getSetting('bank_name')}</div>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">Số tài khoản</label>
                              <div className="text-white font-medium font-mono">{getSetting('bank_account')}</div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-sm text-gray-400 mb-1">Chủ tài khoản</label>
                              <div className="text-white font-medium">{getSetting('bank_account_name')}</div>
                            </div>
                          </div>
                        )}

                        {/* QR Code */}
                        {getSetting('payment_qr_code') && (
                          <div className="text-center">
                            <label className="block text-sm text-gray-400 mb-2">Quét mã QR để thanh toán</label>
                            <div className="inline-block p-4 bg-white rounded-lg">
                              <Image
                                src={getSetting('payment_qr_code')}
                                alt="QR Code thanh toán"
                                width={200}
                                height={200}
                                className="mx-auto"
                              />
                            </div>
                          </div>
                        )}

                        {/* Contact Info */}
                        <div className="pt-4 border-t border-gray-700">
                          <p className="text-sm text-gray-400 mb-2">Sau khi thanh toán, vui lòng liên hệ:</p>
                          <div className="space-y-1">
                            {getSetting('contact_email') && (
                              <div className="flex items-center gap-2 text-sm">
                                <i className="fas fa-envelope text-yellow-400"></i>
                                <a
                                  href={`mailto:${getSetting('contact_email')}`}
                                  className="text-yellow-400 hover:text-yellow-300"
                                >
                                  {getSetting('contact_email')}
                                </a>
                              </div>
                            )}
                            {getSetting('contact_phone') && (
                              <div className="flex items-center gap-2 text-sm">
                                <i className="fas fa-phone text-yellow-400"></i>
                                <a
                                  href={`tel:${getSetting('contact_phone')}`}
                                  className="text-yellow-400 hover:text-yellow-300"
                                >
                                  {getSetting('contact_phone')}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Download Button */}
              <div className="pt-6">
                <button
                  onClick={handleDownloadClick}
                  disabled={!hasLinkUrl || !isLinkVisible}
                  className={`w-full font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-3 text-lg ${
                    hasLinkUrl && isLinkVisible
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <i className={hasLinkUrl && isLinkVisible ? "fas fa-external-link-alt" : "fas fa-download"}></i>
                  {hasLinkUrl && isLinkVisible
                    ? (isFree ? 'Tải xuống miễn phí' : 'Liên hệ để mua')
                    : 'Chưa có link tải'
                  }
                </button>

                {/* Link Status Info */}
                {hasLinkUrl && (
                  <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Link:</span>
                      <span className={`text-sm font-medium ${
                        isLinkVisible ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {isLinkVisible ? 'Hiện' : 'Ẩn'}
                      </span>
                    </div>
                  </div>
                )}

                {!isFree && hasLinkUrl && isLinkVisible && (
                  <p className="text-gray-400 text-sm mt-2 text-center">
                    Thanh toán an toàn qua PayPal hoặc thẻ tín dụng
                  </p>
                )}
              </div>

              {/* Features */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Tính năng</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-3">
                    <i className="fas fa-check text-green-400"></i>
                    Chất lượng cao, độ phân giải 4K
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-check text-green-400"></i>
                    Tương thích với các phần mềm phổ biến
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-check text-green-400"></i>
                    Hướng dẫn sử dụng chi tiết
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-check text-green-400"></i>
                    Hỗ trợ kỹ thuật 24/7
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
