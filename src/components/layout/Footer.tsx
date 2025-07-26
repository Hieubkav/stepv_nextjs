import React from 'react';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-gray-50 border-t ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              StepV NextJS
            </h3>
            <p className="text-gray-600 text-sm">
              Website tĩnh được xây dựng với NextJS 15, TypeScript, Tailwind CSS và Shadcn/ui.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Liên kết
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-gray-900">Trang chủ</Link></li>
              <li><Link href="/about" className="hover:text-gray-900">Giới thiệu</Link></li>
              <li><Link href="/contact" className="hover:text-gray-900">Liên hệ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Công nghệ
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>NextJS 15</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Shadcn/ui</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © 2025 StepV NextJS. Được xây dựng với ❤️ và NextJS.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
