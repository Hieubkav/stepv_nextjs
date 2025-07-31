'use client';

import React from 'react';
import Image from 'next/image';

const ProjectPortfolio = () => {
  const projects = [
    {
      id: 1,
      title: 'Chiến Dịch Nước Hoa Cao Cấp',
      description: 'Trực quan hóa 3D siêu thực cho thương hiệu nước hoa premium',
      image: '/images/projects/GDIVINE2.png',
      date: '2024-01-15',
      category: 'Trực Quan Hóa 3D'
    },
    {
      id: 2,
      title: 'Hoạt Hình Sản Phẩm Làm Đẹp',
      description: 'Giới thiệu sản phẩm động với hoạt hình thanh lịch',
      image: '/images/projects/2321.png',
      date: '2024-02-20',
      category: 'Hoạt Hình 3D'
    },
    {
      id: 3,
      title: 'Quảng Cáo Thương Hiệu Mỹ Phẩm',
      description: 'Sản xuất quảng cáo truyền hình hoàn chỉnh với yếu tố 3D',
      image: '/images/projects/vlcsnap-2024-08-24-21h22m22s456.png',
      date: '2024-03-10',
      category: 'Quảng Cáo'
    },
    {
      id: 4,
      title: 'Dòng Sản Phẩm Chăm Sóc Da',
      description: 'Bộ nhận diện thị giác hoàn chỉnh cho dòng sản phẩm chăm sóc da',
      image: '/images/projects/GDIVINE2.png',
      date: '2024-03-25',
      category: 'Trực Quan Hóa 3D'
    },
    {
      id: 5,
      title: 'Thiết Kế Chai Nước Hoa',
      description: 'Trực quan hóa concept cho chai nước hoa mới',
      image: '/images/projects/2321.png',
      date: '2024-04-05',
      category: 'Thiết Kế Sản Phẩm'
    },
    {
      id: 6,
      title: 'Chiến Dịch Thương Hiệu Trang Điểm',
      description: 'Chiến dịch thị giác đa nền tảng với hoạt hình',
      image: '/images/projects/vlcsnap-2024-08-24-21h22m22s456.png',
      date: '2024-04-18',
      category: 'Hoạt Hình 3D'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="bg-black text-white py-20 lg:py-32">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-24">
          <h2 className="text-5xl lg:text-7xl font-light uppercase tracking-wider mb-8">
            DỰ ÁN CỦA CHÚNG TÔI
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Khám phá những dự án đã hoàn thành của chúng tôi - từ trực quan hóa đến hoạt hình và sản xuất quảng cáo
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project) => (
            <div 
              key={project.id}
              className="group cursor-pointer"
            >
              {/* Project Image */}
              <div className="relative aspect-[4/3] mb-6 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 border-2 border-yellow-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <i className="fas fa-play text-yellow-400 text-xl"></i>
                    </div>
                    <span className="text-white font-semibold uppercase tracking-wider">
                      Xem Dự Án
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 text-sm uppercase tracking-wider font-semibold">
                    {project.category}
                  </span>
                  <span className="text-yellow-400 text-sm">
                    {formatDate(project.date)}
                  </span>
                </div>
                
                <h3 className="text-2xl lg:text-3xl font-light uppercase tracking-wide group-hover:text-yellow-400 transition-colors duration-300">
                  {project.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed">
                  {project.description}
                </p>
                
                <button className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300 group/btn">
                  <span className="uppercase font-semibold tracking-wider">XEM THÊM</span>
                  <i className="fas fa-arrow-right transition-transform duration-300 group-hover/btn:translate-x-1"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-16 lg:mt-24">
          <button className="bg-yellow-400 text-black px-12 py-4 uppercase font-semibold tracking-wider hover:bg-yellow-300 transition-all duration-300 hover:scale-105">
            TẢI THÊM DỰ ÁN
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectPortfolio;
