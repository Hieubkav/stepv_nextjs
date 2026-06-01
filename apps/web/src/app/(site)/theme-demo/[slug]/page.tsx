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
  const heroImg = laptopUrl ?? thumbUrl;

  return (
    <>
      {/* Be Vietnam Pro font */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen bg-white"
        style={{ paddingTop: "80px", fontFamily: "'Be Vietnam Pro', sans-serif" }}
      >
        {/* ── BREADCRUMB ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <Link
            href="/theme-demo"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors font-medium"
          >
            <ChevronLeft className="size-3.5" /> Kho giao diện
          </Link>
        </div>

        {/* ── HEADER: Tags + Title ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          {/* Tags */}
          {demo.tags && demo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            {demo.title}
          </h1>
        </section>

        {/* ── HERO IMAGE: full width ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/60 bg-slate-100">
            {heroImg ? (
              <img
                src={heroImg}
                alt={demo.title}
                className="w-full object-cover"
                style={{ aspectRatio: "16/9", objectPosition: "top" }}
              />
            ) : (
              <div className="flex items-center justify-center bg-slate-100" style={{ aspectRatio: "16/9" }}>
                <Layout className="size-20 text-slate-300" />
              </div>
            )}

            {/* Mobile floating — chỉ hiện khi có ảnh mobile */}
            {mobileUrl && (
              <div className="absolute right-4 bottom-0 translate-y-1/4 w-[80px] sm:w-[100px] aspect-[9/19] rounded-[16px] overflow-hidden shadow-2xl border-4 border-slate-800 bg-white hidden sm:block">
                <img src={mobileUrl} alt={`${demo.title} Mobile`} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </section>

        {/* ── BODY: Description + Stats + Features + CTAs ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

          {/* Description — full width */}
          {(demo.description || demo.summary) && (
            <p className="text-slate-600 text-base sm:text-lg leading-[1.85] max-w-prose">
              {demo.description || demo.summary}
            </p>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-center"
                >
                  <div className="text-3xl font-black text-indigo-600 leading-none">{stat.value}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-1.5">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Features — 2 columns */}
          {demo.features && demo.features.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-4">Tính năng nổi bật</h2>
              <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
                {demo.features.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="size-3" />
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
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
        </section>
      </div>
    </>
  );
}
