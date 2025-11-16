import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";
// import Footer from "@/components/layout/footer";
import "@/index.css";
import SiteLayoutClient from "./site-layout-client";

export const dynamic = "force-dynamic";

const fallbackMetadata: Metadata = {
  title: "DOHY Media - Chuyen gia hinh anh 3D cho thuong hieu nuoc hoa & lam dep",
  description:
    "DOHY Media chuyen tao ra nhung hinh anh 3D sieu thuc va hoat hinh duoc thiet ke rieng cho nganh nuoc hoa va lam dep. Chung toi giup cac thuong hieu cao cap thu hut khan gia, nang cao cach trinh bay san pham va noi bat trong thi truong canh tranh.",
  keywords:
    "hinh anh 3D, hoat hinh 3D, nuoc hoa, lam dep, thuong hieu, marketing, quang cao, visualization, animation, perfume, beauty, brand, advertising",
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
    title: "DOHY Media - Chuyen gia hinh anh 3D cho thuong hieu nuoc hoa & lam dep",
    description: "DOHY Media chuyen tao ra nhung hinh anh 3D sieu thuc va hoat hinh duoc thiet ke rieng cho nganh nuoc hoa va lam dep.",
    url: "https://dohymedia.com",
    siteName: "DOHY Media",
    images: [
      {
        url: "https://dohymedia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DOHY Media - Hinh anh 3D chuyen nghiep",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DOHY Media - Chuyen gia hinh anh 3D cho thuong hieu nuoc hoa & lam dep",
    description: "DOHY Media chuyen tao ra nhung hinh anh 3D sieu thuc va hoat hinh duoc thiet ke rieng cho nganh nuoc hoa va lam dep.",
    images: ["https://dohymedia.com/og-image.jpg"],
    creator: "@dohymedia",
  },
};

type SiteSettingValue = {
  siteName?: string;
  logoUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
};

export async function generateMetadata(): Promise<Metadata> {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return fallbackMetadata;
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const site = await client.query(api.settings.getByKey, { key: "site" });
    const value = (site?.value ?? {}) as SiteSettingValue;

    const title = value.metaTitle || value.siteName || fallbackMetadata.title;
    const description = value.metaDescription || fallbackMetadata.description;
    const iconUrl = value.logoUrl;
    const ogImage = value.ogImageUrl || iconUrl;
    const ogAlt = typeof title === "string" ? title : "Site thumbnail";

    return {
      ...fallbackMetadata,
      title,
      description,
      icons: iconUrl ? { icon: iconUrl } : fallbackMetadata.icons,
      openGraph: {
        ...fallbackMetadata.openGraph,
        title: title || fallbackMetadata.openGraph?.title,
        description: description || fallbackMetadata.openGraph?.description,
        images: ogImage
          ? [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: ogAlt,
              },
            ]
          : fallbackMetadata.openGraph?.images,
      },
      twitter: {
        ...fallbackMetadata.twitter,
        title: title || fallbackMetadata.twitter?.title,
        description: description || fallbackMetadata.twitter?.description,
        images: ogImage ? [ogImage] : fallbackMetadata.twitter?.images,
      },
    };
  } catch (error) {
    console.warn("Không thể lấy site settings từ Convex", error);
    return fallbackMetadata;
  }
}

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteLayoutClient>{children}</SiteLayoutClient>;
}
