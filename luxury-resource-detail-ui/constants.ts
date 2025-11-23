import { ResourceDetail } from './types';

export const MOCK_RESOURCE: ResourceDetail = {
  id: 'res-001',
  title: 'Bộ UI Kit Cao Cấp - Phiên Bản Bóng Đêm Sang Trọng',
  description: 'Thiết kế hướng tới cảm giác sang trọng, tối giản: nền xanh đen, ánh gold nhẹ, viền tinh tế, hạn chế chi tiết gây chói mắt.',
  price: 1250000,
  originalPrice: 2500000,
  currency: 'đ',
  detailedContent: `
    <h3>Giới thiệu sản phẩm</h3>
    <p>Chào mừng bạn đến với bộ giao diện người dùng (UI Kit) đẳng cấp, được thiết kế riêng cho các ứng dụng đòi hỏi sự tinh tế và thẩm mỹ cao. Đây là giải pháp hoàn hảo để nâng tầm trải nghiệm người dùng.</p>
    <br/>
    <h3>Tính năng nổi bật</h3>
    <ul>
      <li><strong>Chế độ Dark Mode:</strong> Tối ưu hóa cho mắt, tạo cảm giác chiều sâu.</li>
      <li><strong>Hệ thống Grid chuẩn:</strong> Dễ dàng tùy biến trên mọi kích thước màn hình.</li>
      <li><strong>Thư viện Component:</strong> Hơn 50+ component React được xây dựng sẵn với Tailwind CSS.</li>
      <li><strong>Typography:</strong> Sử dụng font Inter hiện đại kết hợp Playfair Display sang trọng.</li>
    </ul>
    <br/>
    <h3>Hướng dẫn sử dụng</h3>
    <p>Sau khi mua, bạn sẽ nhận được mã nguồn đầy đủ và tài liệu hướng dẫn tích hợp vào dự án ReactJS của mình chỉ trong vài bước đơn giản.</p>
  `,
  previews: [
    {
      id: 'p1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
      label: 'Ảnh 1'
    },
    {
      id: 'p2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=200&auto=format&fit=crop',
      label: 'Ảnh 2'
    },
    {
      id: 'p3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop', 
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=200&auto=format&fit=crop',
      label: 'Ảnh 3'
    },
    {
      id: 'p4',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200&auto=format&fit=crop',
      label: 'Ảnh 4'
    }
  ],
  related: [
    { 
      id: 'r1', 
      title: 'Bộ icon 3D cao cấp - Phong cách kính mờ', 
      link: '#',
      thumbnail: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=200&auto=format&fit=crop'
    },
    { 
      id: 'r2', 
      title: 'Dashboard quản trị Dark Mode v2.0', 
      link: '#',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=200&auto=format&fit=crop'
    },
    { 
      id: 'r3', 
      title: 'Landing page Bất động sản Luxury', 
      link: '#',
      thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=200&auto=format&fit=crop'
    },
    { 
      id: 'r4', 
      title: 'Template E-commerce Thời trang', 
      link: '#',
      thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=200&auto=format&fit=crop'
    },
  ]
};