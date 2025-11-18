'use client';

import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, PlayCircle, BookCheck } from 'lucide-react';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';
import CheckoutForm from '@/features/learner/pages/checkout-form';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';

export type CheckoutPageContentProps = {
  courseId: Id<'courses'>;
  courseSlug: string;
  courseName: string;
  coursePrice: number;
  comparePriceAmount: number | null;
  courseThumbnailUrl: string | null;
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function CheckoutPageContent({
  courseId,
  courseSlug,
  courseName,
  coursePrice,
  comparePriceAmount,
  courseThumbnailUrl,
}: CheckoutPageContentProps) {
  const router = useRouter();
  const { student } = useStudentAuth();

  if (!student) {
    return (
      <Card>
        <CardHeader>
          <p className="font-semibold text-amber-600">Vui lòng đăng nhập</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Bạn cần đăng nhập để đặt khóa học.</p>
          <Button className="w-full" onClick={() => router.push('/khoa-hoc/dang-nhap')}>
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="shadow-none border rounded-2xl col-span-1">
          <CardHeader className="font-semibold text-base md:text-lg py-3 md:py-4">Khóa học</CardHeader>
          <CardContent className="space-y-3">
            {courseThumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={courseThumbnailUrl}
                alt="Preview khóa học"
                className="rounded-xl w-full h-36 object-cover"
              />
            ) : (
              <div className="rounded-xl w-full h-36 bg-muted flex items-center justify-center text-sm text-muted-foreground">
                Đang cập nhật hình ảnh
              </div>
            )}

            <div>
              <p className="text-muted-foreground text-xs">TÊN KHÓA</p>
              <p className="font-semibold">{courseName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">HỌC PHÍ</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-blue-600">{currencyFormatter.format(coursePrice)}</span>
                {comparePriceAmount && comparePriceAmount > coursePrice ? (
                  <span className="text-sm text-muted-foreground line-through">
                    {currencyFormatter.format(comparePriceAmount)}
                  </span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border rounded-2xl col-span-1 lg:col-span-2">
          <CardHeader className="py-3 md:py-4">
            <p className="font-semibold text-base md:text-lg">Quy trình đặt đơn</p>
            <p className="text-muted-foreground text-xs md:text-sm">
              Hệ thống MVP kích hoạt khóa học tự động sau khi bạn nhấn “Xác nhận đặt khóa”.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <StepCard
                icon={<CheckCircle className="h-5 w-5 text-primary" />}
                title="Bước 1"
                description="Nhấn Xác nhận đặt khóa để tạo đơn."
              />
              <StepCard
                icon={<PlayCircle className="h-5 w-5 text-primary" />}
                title="Bước 2"
                description="Hệ thống kích hoạt khóa học ngay lập tức."
              />
              <StepCard
                icon={<BookCheck className="h-5 w-5 text-primary" />}
                title="Bước 3"
                description="Vào mục khóa học để học bài ngay."
              />
            </div>

            <SeparatorLine />

            <CheckoutForm
              courseId={courseId}
              studentId={student._id}
              courseName={courseName}
              courseSlug={courseSlug}
              coursePrice={coursePrice}
              courseThumbnailUrl={courseThumbnailUrl ?? undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StepCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border p-3 flex items-start gap-3 bg-muted/30">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
        <p className="text-sm text-foreground">{description}</p>
      </div>
    </div>
  );
}

function SeparatorLine() {
  return <div className="h-px w-full bg-border" />;
}
