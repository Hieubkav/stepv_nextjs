import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import {
  Globe,
  Layout,
  FileText,
  CheckSquare,
  MessageSquare,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Star,
  Check,
} from "lucide-react";

type ThemeDetailPageProps = {
  params: Promise<{ slug: string }>;
};

// Hàm lấy Convex client
function getConvexClient() {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Missing CONVEX_URL environment variable");
  }
  return new ConvexHttpClient(convexUrl);
}

// 1. Tạo SEO Metadata cho từng trang chi tiết giao diện mẫu
export async function generateMetadata({ params }: ThemeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const client = getConvexClient();
    const demo = await client.query(api.web_demos.getBySlug, { slug });
    
    if (!demo) {
      return {
        title: "Không tìm thấy giao diện | DOHY Media",
      };
    }

    const title = `${demo.title} - Mẫu Giao Diện Website Cao Cấp | DOHY`;
    const description = demo.summary || demo.description || `Mẫu website ${demo.title} chuẩn SEO, tối ưu tốc độ và tương thích 100% các thiết bị.`;

    // Lấy ảnh thumbnail để làm ảnh OG
    let ogImage = "https://dohymedia.com/og-image.jpg";
    if (demo.thumbnailId) {
      const media = (await client.query(api.media.list, { kind: "image" })) as any[];
      const found = media.find((m: any) => String(m._id) === String(demo.thumbnailId));
      if (found?.url) {
        ogImage = found.url;
      }
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: ogImage, width: 1200, height: 630, alt: demo.title }],
      },
    };
  } catch (error) {
    return {
      title: "Giao Diện Mẫu Website | DOHY Media",
    };
  }
}

// 2. Component Render Trang Chi Tiết
export default async function ThemeDetailPage({ params }: ThemeDetailPageProps) {
  const { slug } = await params;
  const client = getConvexClient();
  
  // Load thông tin demo và media
  const demo = await client.query(api.web_demos.getBySlug, { slug });
  if (!demo) {
    notFound();
  }

  const media = (await client.query(api.media.list, { kind: "image" })) as any[];
  
  // Tạo map O(1) để tìm URL hình ảnh từ mediaId
  const mediaMap = new Map<string, any>();
  if (Array.isArray(media)) {
    for (const item of media) {
      mediaMap.set(String(item._id), item);
    }
  }

  const thumbUrl = demo.thumbnailId ? mediaMap.get(demo.thumbnailId)?.url : null;
  const laptopUrl = demo.screenshotLaptopId ? mediaMap.get(demo.screenshotLaptopId)?.url : null;
  const mobileUrl = demo.screenshotMobileId ? mediaMap.get(demo.screenshotMobileId)?.url : null;

  return (
    <div className="bg-slate-50/50 min-h-screen pt-20 sm:pt-24">
      {/* Nút quay lại */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/theme-demo"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="size-4" /> Quay lại kho giao diện
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Cột chữ bên trái */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex flex-wrap gap-1.5">
              {demo.tags &&
                demo.tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-0">
                    {tag}
                  </Badge>
                ))}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl leading-tight">
              {demo.title}
            </h1>

            <p className="text-sm text-slate-500 leading-relaxed">
              {demo.description || demo.summary || "Mẫu giao diện thiết kế chuyên nghiệp, bố cục hài hòa và tối ưu hóa cao."}
            </p>

            {/* Các đặc điểm nổi bật */}
            {demo.features && demo.features.length > 0 && (
              <ul className="space-y-2.5 text-xs text-slate-600">
                {demo.features.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="flex size-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="size-2.5" />
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {demo.previewUrl && (
                <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm h-11 px-6 shadow-sm">
                  <a href={demo.previewUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 size-4" /> Xem demo trực tiếp
                  </a>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-sm h-11 px-6">
                <Link href="/about">
                  Yêu cầu tư vấn thiết kế
                </Link>
              </Button>
            </div>
          </div>

          {/* Cột Mockup Lồng nhau (Overlapping device mockups) ở bên phải */}
          <div className="lg:col-span-7 relative flex items-center justify-center py-6 sm:py-12">
            {/* Ảnh Laptop làm nền lớn */}
            <div className="relative w-full max-w-[560px] aspect-[16/10] rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
              {laptopUrl ? (
                <img src={laptopUrl} alt={`${demo.title} Laptop Mockup`} className="w-full h-full object-cover" />
              ) : thumbUrl ? (
                <img src={thumbUrl} alt={`${demo.title} Laptop Mockup`} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <Layout className="size-16 text-slate-300" />
                </div>
              )}
            </div>

            {/* Ảnh Điện thoại đè lên lệch góc dưới bên phải */}
            {mobileUrl && (
              <div className="absolute right-0 bottom-0 sm:right-6 sm:-bottom-4 w-[120px] sm:w-[150px] aspect-[9/19] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-white z-10 hidden sm:block">
                <img src={mobileUrl} alt={`${demo.title} Mobile Mockup`} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Thống kê chỉ số */}
      <section className="bg-white border-y border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto">
            <Card className="border-slate-100 shadow-none bg-slate-50/40">
              <CardContent className="p-5 text-center space-y-1">
                <Layout className="size-6 text-indigo-500 mx-auto mb-1.5" />
                <div className="text-2xl font-black text-slate-800">{demo.sections ?? 0}</div>
                <div className="text-xs text-slate-400 font-medium uppercase">Sections</div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-none bg-slate-50/40">
              <CardContent className="p-5 text-center space-y-1">
                <FileText className="size-6 text-indigo-500 mx-auto mb-1.5" />
                <div className="text-2xl font-black text-slate-800">{demo.pages ?? 0}</div>
                <div className="text-xs text-slate-400 font-medium uppercase">Trang mẫu</div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-none bg-slate-50/40">
              <CardContent className="p-5 text-center space-y-1">
                <Sparkles className="size-6 text-indigo-500 mx-auto mb-1.5" />
                <div className="text-2xl font-black text-slate-800">{demo.popups ?? 0}</div>
                <div className="text-xs text-slate-400 font-medium uppercase">Popups</div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-none bg-slate-50/40">
              <CardContent className="p-5 text-center space-y-1">
                <CheckSquare className="size-6 text-indigo-500 mx-auto mb-1.5" />
                <div className="text-2xl font-black text-slate-800">{demo.forms ?? 0}</div>
                <div className="text-xs text-slate-400 font-medium uppercase">Biểu mẫu</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section các Block cấu thành (showcase blocks) */}
      {demo.blocks && demo.blocks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Cấu trúc giao diện chi tiết
            </h2>
            <p className="text-xs text-slate-400">
              Khám phá các khối giao diện được xây dựng nhất quán, chuẩn UI/UX và cực kỳ sang trọng.
            </p>
          </div>

          <div className="grid gap-8 max-w-4xl mx-auto">
            {demo.blocks.map((block: any, idx: number) => {
              const blockImgUrl = block.imageId ? mediaMap.get(block.imageId)?.url : null;
              return (
                <div
                  key={idx}
                  className="flex flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-6 md:flex-row md:items-center shadow-xs"
                >
                  {/* Ảnh block bên trái */}
                  <div className="w-full md:w-64 aspect-[16/10] overflow-hidden rounded-xl border bg-slate-50 flex-shrink-0">
                    {blockImgUrl ? (
                      <img src={blockImgUrl} alt={block.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100">
                        <Layout className="size-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Nội dung text bên phải */}
                  <div className="flex-1 space-y-2">
                    <div className="inline-flex size-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                      {idx + 1}
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{block.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {block.description || "Thiết kế hiện đại, responsive mượt mà và trực quan."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section Phản hồi của khách hàng (Reviews) */}
      {demo.reviews && demo.reviews.length > 0 && (
        <section className="bg-white border-t border-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Cảm nhận từ khách hàng
              </h2>
              <p className="text-xs text-slate-400">
                Đánh giá khách quan từ các đơn vị đã triển khai giao diện mẫu này cho hoạt động kinh doanh.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
              {demo.reviews.map((rev: any, idx: number) => (
                <Card key={idx} className="border-slate-100 shadow-xs relative bg-slate-50/30">
                  <CardContent className="p-6 space-y-4">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: rev.rating ?? 5 }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-current" />
                      ))}
                    </div>

                    {/* Cảm nhận */}
                    <p className="text-xs text-slate-500 italic leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {/* Khách hàng */}
                    <div className="flex items-center gap-3 border-t border-slate-100 pt-3.5">
                      {rev.avatarUrl ? (
                        <img src={rev.avatarUrl} alt={rev.name} className="size-9 rounded-full object-cover border" />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 uppercase border border-indigo-100">
                          {rev.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-800">{rev.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{rev.role || "Đối tác tin dùng"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
