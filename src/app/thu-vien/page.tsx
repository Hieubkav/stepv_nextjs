import React from 'react';
import type { Metadata } from 'next';
import ThuVienClient from './ThuVienClient';

export const metadata: Metadata = {
  title: 'Thư viện - Step V Studio',
  description: 'Thư viện tài nguyên và nội dung sáng tạo sắp ra mắt tại Step V Studio. Đón chờ những điều tuyệt vời sắp tới.',
  keywords: 'thư viện, tài nguyên, nội dung sáng tạo, Step V Studio, coming soon',
};

export default function ThuVienPage() {
  return <ThuVienClient />;
}
