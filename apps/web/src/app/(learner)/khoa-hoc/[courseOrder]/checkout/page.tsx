'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConvexHttpClient } from 'convex/browser';
import { useQuery } from 'convex/react';
import { ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';

import { api } from '@dohy/backend/convex/_generated/api';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import CheckoutForm from '@/features/learner/pages/checkout-form';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';

type PageParams = Promise<{ courseOrder: string }>;

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

async function getCourseForCheckout(order: number) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error('CONVEX_URL not configured');
  }

  const client = new ConvexHttpClient(convexUrl);
  const courses = await client.query(api.courses.listCourses, { includeInactive: false });
  const course = courses.find((c: any) => c?.order === order);

  if (!course) {
    throw new Error('Course not found');
  }

  return {
    id: course._id,
    title: course.title,
    slug: course.slug,
    priceAmount: course.priceAmount,
    pricingType: course.pricingType,
    thumbnailMediaId: course.thumbnailMediaId,
  };
}

async function getThumbnailUrl(thumbnailMediaId: string | null) {
  if (!thumbnailMediaId) return null;

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;

  try {
    const client = new ConvexHttpClient(convexUrl);
    const mediaList = await client.query(api.media.list, { kind: 'image' });
    const media = mediaList.find((m: any) => m._id.toString() === thumbnailMediaId.toString());
    return media?.url || null;
  } catch {
    return null;
  }
}

export default async function CheckoutPage({
  params,
}: {
  params: PageParams;
}) {
  const { courseOrder } = await params;
  const numericOrder = Number(courseOrder);

  if (!Number.isFinite(numericOrder)) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Lỗi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">Tham số khóa học không hợp lệ.</p>
            <Button asChild className="w-full">
              <Link href="/khoa-hoc">Quay lại danh sách khóa học</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    const course = await getCourseForCheckout(numericOrder);

    if (course.pricingType !== 'paid' || !course.priceAmount) {
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
                <Link href={`/khoa-hoc/${courseOrder}`}>Xem chi tiết khóa học</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const thumbnailUrl = await getThumbnailUrl(course.thumbnailMediaId || null);

    return (
      <div className="min-h-screen bg-muted/20">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <Button variant="outline" size="sm" className="gap-2 mb-4" asChild>
              <Link href={`/khoa-hoc/${courseOrder}`}>
                <ArrowLeft className="h-4 w-4" />
                Quay lại chi tiết khóa học
              </Link>
            </Button>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Thanh toán
              </p>
              <h1 className="text-lg font-semibold leading-tight text-balance">
                {course.title}
              </h1>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-8">
          <CheckoutPageContent
            courseId={course.id}
            courseName={course.title}
            coursePrice={course.priceAmount}
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
              {error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.'}
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

function CheckoutPageContent({
  courseId,
  courseName,
  coursePrice,
  courseThumbnailUrl,
}: {
  courseId: Id<'courses'>;
  courseName: string;
  coursePrice: number;
  courseThumbnailUrl: string | null;
}) {
  const router = useRouter();
  const { student } = useStudentAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Verify student is logged in
  if (!student) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-600">Vui lòng đăng nhập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Bạn cần đăng nhập để thanh toán khóa học.
          </p>
          <Button
            className="w-full"
            onClick={() => router.push('/khoa-hoc/dang-nhap')}
          >
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💳 Phương thức thanh toán</h3>
        <p className="text-sm text-blue-800">
          Chúng tôi sử dụng VietQR để thanh toán an toàn qua ngân hàng. Admin sẽ xác nhận thanh toán thủ công.
        </p>
      </div>

      <CheckoutForm
        courseId={courseId}
        studentId={student._id}
        courseName={courseName}
        coursePrice={coursePrice}
        courseThumbnailUrl={courseThumbnailUrl || undefined}
      />
    </div>
  );
}
