'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';
import { api } from '@dohy/backend/convex/_generated/api';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Banknote, FileText } from 'lucide-react';
import CheckoutForm, { type PaymentConfig, buildTransferNote } from '@/features/learner/pages/checkout-form';
import { useStudentAuth } from '@/features/learner/auth/student-auth-context';
import { buildVietQRImageUrl } from '@/lib/vietqr';

export type CheckoutPageContentProps = {
  courseId: Id<'courses'>;
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
  courseName,
  coursePrice,
  comparePriceAmount,
  courseThumbnailUrl,
}: CheckoutPageContentProps) {
  const router = useRouter();
  const { student } = useStudentAuth();
  const paymentSettings = useQuery(api.paymentSettings.getPaymentSettings);
  const siteSettings = useQuery(api.settings.getByKey, { key: 'site' });

  const summaryPaymentConfig = useMemo<PaymentConfig | null>(() => {
    if (
      paymentSettings &&
      paymentSettings.exists &&
      paymentSettings.bankAccountNumber &&
      paymentSettings.bankAccountName &&
      paymentSettings.bankCode
    ) {
      return {
        bankAccountNumber: paymentSettings.bankAccountNumber,
        bankAccountName: paymentSettings.bankAccountName,
        bankCode: paymentSettings.bankCode,
        bankBranch: paymentSettings.bankBranch,
      };
    }

    const value = (siteSettings?.value ?? {}) as Record<string, any>;
    const number = typeof value.bankAccountNumber === 'string' ? value.bankAccountNumber.trim() : '';
    const name = typeof value.bankAccountName === 'string' ? value.bankAccountName.trim() : '';
    const code = typeof value.bankCode === 'string' ? value.bankCode.trim() : '';
    const branch =
      typeof value.bankBranch === 'string' && value.bankBranch.trim().length > 0
        ? value.bankBranch.trim()
        : undefined;

    if (number && name && code) {
      return {
        bankAccountNumber: number,
        bankAccountName: name,
        bankCode: code,
        bankBranch: branch,
      };
    }

    return null;
  }, [
    paymentSettings?.exists,
    paymentSettings?.bankAccountNumber,
    paymentSettings?.bankAccountName,
    paymentSettings?.bankCode,
    paymentSettings?.bankBranch,
    siteSettings?._id,
    siteSettings?.updatedAt,
    siteSettings?.value?.bankAccountNumber,
    siteSettings?.value?.bankAccountName,
    siteSettings?.value?.bankCode,
    siteSettings?.value?.bankBranch,
  ]);

  const summaryTransferNote = useMemo(() => buildTransferNote(courseName), [courseName]);
  const summaryQrUrl = useMemo(() => {
    if (!summaryPaymentConfig) return null;
    return (
      buildVietQRImageUrl({
        bankCode: summaryPaymentConfig.bankCode,
        accountNumber: summaryPaymentConfig.bankAccountNumber,
        accountName: summaryPaymentConfig.bankAccountName,
        template: 'qr_only',
        amount: coursePrice,
        addInfo: summaryTransferNote,
      }) ?? null
    );
  }, [
    summaryPaymentConfig?.bankAccountNumber,
    summaryPaymentConfig?.bankAccountName,
    summaryPaymentConfig?.bankCode,
    coursePrice,
    summaryTransferNote,
  ]);

  if (!student) {
    return (
      <Card>
        <CardHeader>
          <p className="font-semibold text-amber-600">Vui lòng đăng nhập</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Bạn cần đăng nhập để thanh toán khóa học.</p>
          <Button className="w-full" onClick={() => router.push('/khoa-hoc/dang-nhap')}>
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* SUMMARY SECTION */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* COURSE INFO */}
        <Card className="shadow-none border rounded-2xl col-span-1 lg:col-span-1">
          <CardHeader className="font-semibold text-base md:text-lg py-3 md:py-4">
            Thông tin khóa học
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3 text-sm md:text-base py-0 pb-3 md:pb-4">
            {courseThumbnailUrl ? (
              <img
                src={courseThumbnailUrl}
                alt="Preview khóa học"
                className="rounded-xl w-full h-32 md:h-40 object-cover"
              />
            ) : (
              <div className="rounded-xl w-full h-32 md:h-40 bg-muted flex items-center justify-center">
                <p className="text-muted-foreground text-xs">Chưa có hình ảnh</p>
              </div>
            )}

            <div className="space-y-0.5 md:space-y-1">
              <p className="text-muted-foreground text-xs">Tên khóa</p>
              <p className="font-semibold text-sm md:text-base line-clamp-2">{courseName}</p>
            </div>

            <div className="space-y-0.5 md:space-y-1">
              <p className="text-muted-foreground text-xs">Học phí</p>
              <div className="flex items-baseline gap-2">
                <p className="font-semibold text-lg md:text-xl text-blue-600">
                  {currencyFormatter.format(coursePrice)}
                </p>
                {comparePriceAmount && comparePriceAmount > coursePrice ? (
                  <p className="text-muted-foreground line-through text-sm">
                    {currencyFormatter.format(comparePriceAmount)}
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PAYMENT + STEPS COMBINED */}
        <Card className="shadow-none border rounded-2xl col-span-1 lg:col-span-2">
          <CardHeader className="py-3 md:py-4">
            <p className="font-semibold text-base md:text-lg">Thanh toán &amp; hướng dẫn nhanh</p>
            <p className="text-muted-foreground text-xs md:text-sm">
              Làm theo 3 bước dưới đây để hoàn tất đơn.
            </p>
          </CardHeader>
          <CardContent className="py-0 pb-3 md:pb-4 space-y-3 md:space-y-4 text-xs md:text-sm">
            {/* QR + BANK INFO ROW */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              {summaryQrUrl ? (
                <div className="flex-1 flex justify-center md:justify-start">
                  <div className="border rounded-xl p-2 md:p-3 inline-flex flex-col items-center gap-1">
                    <img
                      src={summaryQrUrl}
                      alt="Mã QR thanh toán"
                      className="w-40 h-40 md:w-44 md:h-44"
                    />
                    <p className="text-[11px] text-muted-foreground">Quét QR để chuyển khoản nhanh</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex justify-center md:justify-start">
                  <div className="border rounded-xl p-2 md:p-3 bg-muted/50 w-40 h-44 md:w-44 md:h-44 flex items-center justify-center">
                    <p className="text-[11px] text-muted-foreground text-center">
                      Chưa có cấu hình thanh toán
                    </p>
                  </div>
                </div>
              )}

              {summaryPaymentConfig ? (
                <div className="flex-[1.2] space-y-2">
                  <div className="space-y-1">
                    <p className="font-medium text-xs md:text-sm">Thông tin chuyển khoản</p>
                    <p>
                      <span className="font-medium">Ngân hàng:</span> {summaryPaymentConfig.bankCode}
                    </p>
                    <p>
                      <span className="font-medium">Số tài khoản:</span>{' '}
                      {summaryPaymentConfig.bankAccountNumber}
                    </p>
                    <p>
                      <span className="font-medium">Chủ tài khoản:</span>{' '}
                      {summaryPaymentConfig.bankAccountName}
                    </p>
                    <p>
                      <span className="font-medium">Nội dung:</span> {summaryTransferNote}
                    </p>
                  </div>

                  {summaryQrUrl && (
                    <Button className="w-full mt-1" variant="outline" asChild>
                      <a href={summaryQrUrl} target="_blank" rel="noopener noreferrer">
                        Mở QR trong tab mới
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex-[1.2] flex items-center justify-center bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Chưa cấu hình tài khoản thanh toán. Liên hệ admin để cập nhật.
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-1" />

            {/* 3 STEPS INLINE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5 md:space-y-1">
                  <p className="font-medium text-xs md:text-sm">Bước 1: Chuyển khoản</p>
                  <p className="text-muted-foreground text-[11px] md:text-xs">
                    Quét QR hoặc chuyển STK, nội dung: {summaryTransferNote}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5 md:space-y-1">
                  <p className="font-medium text-xs md:text-sm">Bước 2: Xác nhận mua</p>
                  <p className="text-muted-foreground text-[11px] md:text-xs">
                    Chuyển khoản xong, bấm nút "Xác nhận mua".
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5 md:space-y-1">
                  <p className="font-medium text-xs md:text-sm">Bước 3: Chờ duyệt</p>
                  <p className="text-muted-foreground text-[11px] md:text-xs">
                    Đơn được duyệt trong vài phút.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHECKOUT FORM */}
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
