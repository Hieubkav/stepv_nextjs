import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";
import { ArrowLeft } from "lucide-react";

import { api } from "@dohy/backend/convex/_generated/api";
import type { Doc, Id } from "@dohy/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutPageContent } from "./checkout-page-content";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type CourseForCheckout = {
  id: Id<'courses'>;
  title: string;
  slug: string;
  priceAmount: number | null;
  comparePriceAmount: number | null;
  pricingType: "free" | "paid";
  thumbnailMediaId: Id<'media'> | null;
};

type MediaWithUrl = Doc<'media'> & { url?: string | null };

async function getCourseForCheckout(slug: string): Promise<CourseForCheckout> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("CONVEX_URL not configured");
  }

  const client = new ConvexHttpClient(convexUrl);
  const result = await client.query(api.courses.getCourseDetail, {
    slug,
    includeInactive: false,
  });

  if (!result || !result.course) {
    throw new Error("Course not found");
  }

  const course = result.course;
  const courseAny = course as any;
  return {
    id: course._id as Id<'courses'>,
    title: course.title,
    slug: course.slug,
    priceAmount: typeof course.priceAmount === "number" ? course.priceAmount : null,
    comparePriceAmount: typeof courseAny.comparePriceAmount === "number" ? courseAny.comparePriceAmount : null,
    pricingType: course.pricingType === "paid" ? "paid" : "free",
    thumbnailMediaId: (course.thumbnailMediaId as Id<'media'> | null) ?? null,
  };
}

async function getThumbnailUrl(thumbnailMediaId: Id<'media'> | null) {
  if (!thumbnailMediaId) return null;

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;

  try {
    const client = new ConvexHttpClient(convexUrl);
    const mediaList = (await client.query(api.media.list, { kind: "image" })) as MediaWithUrl[];
    const media = mediaList.find((m) => m._id.toString() === thumbnailMediaId.toString());
    return media?.url ?? null;
  } catch {
    return null;
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearch = searchParams ? await searchParams : {};
  const slugParam = resolvedSearch.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const normalizedSlug = typeof slug === "string" ? slug.trim() : "";

  if (!normalizedSlug) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Lỗi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">Slug khóa học không hợp lệ.</p>
            <Button asChild className="w-full">
              <Link href="/khoa-hoc">Quay lại danh sách khóa học</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    const course = await getCourseForCheckout(normalizedSlug);

    if (course.pricingType !== "paid" || typeof course.priceAmount !== "number") {
      return (
        <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Khóa học miễn phí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Khóa học này là miễn phí. Bạn có thể truy cập trực tiếp từ trang chi tiết khóa học.
              </p>
              <Button asChild className="w-full">
                <Link href={`/khoa-hoc/${course.slug}`}>Xem chi tiết khóa học</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const priceAmount = course.priceAmount;
    const thumbnailUrl = await getThumbnailUrl(course.thumbnailMediaId ?? null);

    return (
      <div className="min-h-screen bg-muted/20">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-start px-4 py-2">
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <Link href={`/khoa-hoc/${course.slug}`}>
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-2">
         <CheckoutPageContent
           courseId={course.id}
           courseName={course.title}
           coursePrice={priceAmount}
           comparePriceAmount={course.comparePriceAmount}
           courseThumbnailUrl={thumbnailUrl}
         />
        </main>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Không thể tải khóa học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại."}
            </p>
            <Button asChild className="w-full">
              <Link href="/khoa-hoc">Quay lại danh sách khóa học</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
