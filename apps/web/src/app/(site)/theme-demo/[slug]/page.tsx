import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import {
  Globe,
  Layout,
  ChevronLeft,
  Check,
  Phone,
} from "lucide-react";

type ThemeDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function getConvexClient() {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) throw new Error("Missing CONVEX_URL environment variable");
  return new ConvexHttpClient(convexUrl);
}

export async function generateMetadata({ params }: ThemeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const client = getConvexClient();
    const demo = await client.query(api.web_demos.getBySlug, { slug });
    if (!demo) return { title: "Không tìm thấy giao diện | DOHY Media" };

    const title = `${demo.title} - Mẫu Giao Diện Website Cao Cấp | DOHY`;
    const description = demo.summary || demo.description || `Mẫu website ${demo.title} chuẩn SEO, tối ưu tốc độ và tương thích 100% các thiết bị.`;

    let ogImage = "https://dohymedia.com/og-image.jpg";
    if (demo.thumbnailId) {
      const media = (await client.query(api.media.list, { kind: "image" })) as any[];
      const found = media.find((m: any) => String(m._id) === String(demo.thumbnailId));
      if (found?.url) ogImage = found.url;
    }

    return {
      title,
      description,
      openGraph: { title, description, images: [{ url: ogImage, width: 1200, height: 630, alt: demo.title }] },
    };
  } catch {
    return { title: "Giao Diện Mẫu Website | DOHY Media" };
  }
}

export default async function ThemeDetailPage({ params }: ThemeDetailPageProps) {
  const { slug } = await params;
  const client = getConvexClient();

  const demo = await client.query(api.web_demos.getBySlug, { slug });
  if (!demo) notFound();

  const media = (await client.query(api.media.list, { kind: "image" })) as any[];
  const mediaMap = new Map<string, any>();
  for (const item of media) mediaMap.set(String(item._id), item);

  const thumbUrl = demo.thumbnailId ? mediaMap.get(demo.thumbnailId)?.url : null;
  const laptopUrl = demo.screenshotLaptopId ? mediaMap.get(demo.screenshotLaptopId)?.url : null;
  const mobileUrl = demo.screenshotMobileId ? mediaMap.get(demo.screenshotMobileId)?.url : null;

  const stats: { label: string; value: number }[] = demo.stats ?? [];

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: "80px" }}>
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          href="/theme-demo"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronLeft className="size-3.5" /> Kho giao diện
        </Link>
      </div>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Info */}
          <div className="space-y-7 order-2 lg:order-1">
            {/* Tags */}
            {demo.tags && demo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {demo.tags.map((tag: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-indigo-600 border-indigo-200 bg-indigo-50/60 font-medium text-[11px] px-2.5 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              {demo.title}
            </h1>

            {/* Description */}
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              {demo.description || demo.summary || "Mẫu giao diện thiết kế chuyên nghiệp, bố cục hài hòa và tối ưu hóa cao."}
            </p>

            {/* Stats động — chỉ hiện nếu có data */}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-center"
                  >
                    <div className="text-2xl font-black text-indigo-600">{stat.value}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Features list */}
            {demo.features && demo.features.length > 0 && (
              <ul className="space-y-2">
                {demo.features.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="size-2.5" />
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              {demo.previewUrl && (
                <Button
                  asChild
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl h-11 px-6 shadow-md shadow-indigo-200"
                >
                  <a href={demo.previewUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 size-4" /> Xem demo trực tiếp
                  </a>
                </Button>
              )}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl h-11 px-6"
              >
                <Link href="/about">
                  <Phone className="mr-2 size-4" /> Yêu cầu tư vấn
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Mockup */}
          <div className="order-1 lg:order-2 relative flex items-center justify-center">
            {/* Gradient glow behind */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/60 via-violet-50/30 to-transparent rounded-3xl blur-2xl" />

            {/* Laptop frame */}
            <div className="relative w-full max-w-[540px] aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/80 border border-slate-200 bg-slate-100 z-10">
              {laptopUrl ? (
                <img src={laptopUrl} alt={`${demo.title} Laptop`} className="w-full h-full object-cover" />
              ) : thumbUrl ? (
                <img src={thumbUrl} alt={demo.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <Layout className="size-16 text-slate-300" />
                </div>
              )}
            </div>

            {/* Mobile floating */}
            {mobileUrl && (
              <div className="absolute -right-2 sm:right-2 bottom-0 sm:-bottom-6 w-[90px] sm:w-[120px] aspect-[9/19] rounded-[20px] overflow-hidden shadow-2xl border-4 border-slate-800 bg-white z-20 hidden sm:block">
                <img src={mobileUrl} alt={`${demo.title} Mobile`} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── DIVIDER BANNER CTA ── */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 py-12 mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-white text-center sm:text-left">
            <p className="text-lg font-bold">Bạn muốn triển khai giao diện này?</p>
            <p className="text-indigo-200 text-sm mt-1">Liên hệ DOHY Media để được tư vấn và báo giá nhanh chóng.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {demo.previewUrl && (
              <Button asChild className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold rounded-xl h-10 px-5">
                <a href={demo.previewUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-1.5 size-4" /> Xem Demo
                </a>
              </Button>
            )}
            <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold rounded-xl h-10 px-5">
              <Link href="/about">Liên hệ tư vấn</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
