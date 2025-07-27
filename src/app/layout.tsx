import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { StagewiseToolbar } from '@stagewise/toolbar-next';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DH STUDIO - Creative Video Production & Design",
  description: "We specialize in crafting photorealistic 3D visuals and animations tailored for the perfumes and beauty industry.",
  keywords: ["3D Animation", "Product Visualization", "Perfume", "Beauty", "3D Rendering", "Visual Effects", "Creative Video Production", "Design"],
  authors: [{ name: "DH Studio" }],
  creator: "DH Studio",
  openGraph: {
    title: "DH STUDIO - Creative Video Production & Design",
    description: "We specialize in crafting photorealistic 3D visuals and animations tailored for the perfumes and beauty industry.",
    type: "website",
    locale: "en_US",
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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-black text-white min-h-screen`}>
        <StagewiseToolbar />
        <Header />
        {children}
      </body>
    </html>
  );
}
