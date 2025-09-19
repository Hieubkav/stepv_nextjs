import type { Metadata } from "next";
// import Footer from "@/components/layout/footer";
import "@/index.css";
import SiteLayoutClient from './site-layout-client';

export const metadata: Metadata = {
  title: "DOHY Media - Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp",
  description: "DOHY Media chuyên tạo ra những hình ảnh 3D siêu thực và hoạt hình được thiết kế riêng cho ngành nước hoa và làm đẹp. Chúng tôi giúp các thương hiệu cao cấp thu hút khán giả, nâng cao cách trình bày sản phẩm và nổi bật trong thị trường cạnh tranh.",
  keywords: "hình ảnh 3D, hoạt hình 3D, nước hoa, làm đẹp, thương hiệu, marketing, quảng cáo, visualization, animation, perfume, beauty, brand, advertising",
  authors: [{ name: "DOHY Media" }],
  creator: "DOHY Media",
  publisher: "DOHY Media",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
  alternates: {
    canonical: "https://dohymedia.com",
  },
  openGraph: {
    title: "DOHY Media - Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp",
    description: "DOHY Media chuyên tạo ra những hình ảnh 3D siêu thực và hoạt hình được thiết kế riêng cho ngành nước hoa và làm đẹp.",
    url: "https://dohymedia.com",
    siteName: "DOHY Media",
    images: [
      {
        url: "https://dohymedia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DOHY Media - Hình ảnh 3D chuyên nghiệp",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DOHY Media - Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp",
    description: "DOHY Media chuyên tạo ra những hình ảnh 3D siêu thực và hoạt hình được thiết kế riêng cho ngành nước hoa và làm đẹp.",
    images: ["https://dohymedia.com/og-image.jpg"],
    creator: "@dohymedia",
  },
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteLayoutClient>{children}</SiteLayoutClient>;
}
