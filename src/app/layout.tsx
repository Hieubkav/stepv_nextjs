import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Step V Studio - Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp",
  description: "Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp. Tạo ra, thu hút, chuyển đổi.",
  keywords: ["3D Animation", "Product Visualization", "Perfume", "Beauty", "3D Rendering", "Visual Effects", "Creative Video Production", "Design", "Step V Studio"],
  authors: [{ name: "Step V Studio" }],
  creator: "Step V Studio",
  openGraph: {
    title: "Step V Studio - Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp",
    description: "Chuyên gia hình ảnh 3D cho thương hiệu nước hoa & làm đẹp. Tạo ra, thu hút, chuyển đổi.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
        {/* Preload hero background image for faster loading */}
        <link rel="preload" href="/hero-glass.jpg" as="image" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
