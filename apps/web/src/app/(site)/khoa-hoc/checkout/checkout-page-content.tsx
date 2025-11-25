'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useMutation, useQuery } from 'convex/react';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';
import { api } from '@dohy/backend/convex/_generated/api';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Banknote, FileText, Loader2 } from 'lucide-react';
import { useCustomerAuth } from '@/features/auth';
import { buildVietQRImageUrl } from '@/lib/vietqr';
import { getBankName } from '@/lib/bank-codes';
import { toast } from 'sonner';

export type CheckoutPageContentProps = {
  courseId: Id<'courses'>;
  courseName: string;
  coursePrice: number;
  comparePriceAmount: number | null;
  courseThumbnailUrl: string | null;
  courseSlug?: string;
};

type PaymentConfig = {
  bankAccountNumber: string;
  bankAccountName: string;
  bankCode: string;
  bankBranch?: string | null;
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
  courseSlug,
}: CheckoutPageContentProps) {
  const router = useRouter();
  const { customer, status } = useCustomerAuth();
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const paymentSettings = useQuery(api.paymentSettings.getPaymentSettings);
  const siteSettings = useQuery(api.settings.getByKey, { key: 'site' });
  const existingPurchase = useQuery(
    api.purchases.getPurchase,
    customer
      ? { customerId: customer._id as any, productType: 'course', productId: String(courseId) }
      : 'skip',
  ) as { _id: Id<'customer_purchases'> } | null | undefined;

  const createOrder = useMutation(api.orders.createOrderWithItems);

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

  const transferNote = useMemo(() => buildTransferNote(courseName), [courseName]);
  const summaryQrUrl = useMemo(() => {
    if (!summaryPaymentConfig) return null;
    return (
      buildVietQRImageUrl({
        bankCode: summaryPaymentConfig.bankCode,
        accountNumber: summaryPaymentConfig.bankAccountNumber,
        accountName: summaryPaymentConfig.bankAccountName,
        template: 'qr_only',
        amount: coursePrice,
        addInfo: transferNote,
      }) ?? null
    );
  }, [
    summaryPaymentConfig?.bankAccountNumber,
    summaryPaymentConfig?.bankAccountName,
    summaryPaymentConfig?.bankCode,
    coursePrice,
    transferNote,
  ]);

  const loginHref = `/login?next=${encodeURIComponent(`/khoa-hoc/checkout?slug=${courseSlug ?? ''}`)}` as Route;

  const handlePlaceOrder = async () => {
    if (!customer?._id) {
      router.push(loginHref);
      return;
    }

    if (existingPurchase) {
      router.push((courseSlug ? `/khoa-hoc/${courseSlug}` : '/my-library') as Route);
      return;
    }

    try {
      setIsPlacing(true);
      const order = (await createOrder({
        customerId: customer._id as any,
        items: [
          {
            productType: 'course',
            productId: String(courseId),
            price: coursePrice,
          },
        ],
      })) as { orderNumber?: string };

      if (!order?.orderNumber) {
        throw new Error('Không tạo được đơn hàng');
      }

      setOrderNumber(order.orderNumber);
      toast.success('Đã ghi nhận đơn, chờ xác nhận thanh toán');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tạo đơn hàng';
      toast.error(message);
    } finally {
      setIsPlacing(false);
    }
  };

  if (status === 'loading') {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang kiểm tra phiên đăng nhập...
        </CardContent>
      </Card>
    );
  }

  if (!customer) {
    return (
      <Card>
        <CardHeader>
          <p className="font-semibold text-amber-600">Vui lòng đăng nhập</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Bạn cần đăng nhập bằng tài khoản khách hàng để thanh toán.</p>
          <Button className="w-full" onClick={() => router.push(loginHref)}>
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (existingPurchase) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/70">
        <CardHeader>
          <p className="font-semibold text-emerald-700">Bạn đã sở hữu khóa học này</p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-emerald-800">
          <p>Hệ thống phát hiện bạn đã mua khóa học. Hãy vào thư viện để học ngay.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <a href="/my-library">Mở thư viện</a>
            </Button>
            {courseSlug ? (
              <Button asChild variant="outline" className="flex-1">
                <a href={`/khoa-hoc/${courseSlug}`}>Xem chi tiết</a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
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

        <Card className="shadow-none border rounded-2xl col-span-1 lg:col-span-2">
          <CardHeader className="py-3 md:py-4">
            <p className="font-semibold text-base md:text-lg">Thanh toán &amp; hướng dẫn nhanh</p>
            <p className="text-muted-foreground text-xs md:text-sm">
              Làm theo 3 bước dưới đây để hoàn tất đơn.
            </p>
          </CardHeader>
          <CardContent className="py-0 pb-3 md:pb-4 space-y-3 md:space-y-4 text-xs md:text-sm">
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
                      <span className="font-medium">Ngân hàng:</span> {getBankName(summaryPaymentConfig.bankCode)}
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
                      <span className="font-medium">Nội dung:</span> {transferNote}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5 md:space-y-1">
                  <p className="font-medium text-xs md:text-sm">Bước 1: Chuyển khoản</p>
                  <p className="text-muted-foreground text-[11px] md:text-xs">
                    Quét QR hoặc chuyển STK, nội dung: {transferNote}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5 md:space-y-1">
                  <p className="font-medium text-xs md:text-sm">Bước 2: Xác nhận mua</p>
                  <p className="text-muted-foreground text-[11px] md:text-xs">
                    Bấm nút "Xác nhận đặt khóa" sau khi chuyển khoản.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5 md:space-y-1">
                  <p className="font-medium text-xs md:text-sm">Bước 3: Chờ duyệt</p>
                  <p className="text-muted-foreground text-[11px] md:text-xs">
                    Đơn sẽ được duyệt và kích hoạt ngay khi admin xác nhận.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border rounded-2xl">
        <CardContent className="space-y-3 py-4">
          <Button
            size="lg"
            className="w-full font-semibold"
            onClick={handlePlaceOrder}
            disabled={isPlacing}
          >
            {isPlacing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Xác nhận đặt khóa'
            )}
          </Button>

          {orderNumber ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle className="h-4 w-4" />
                Đã ghi nhận đơn, chờ xác nhận
              </div>
              <p className="font-mono text-xs bg-white/60 rounded px-2 py-1 w-fit">
                Mã đơn: {orderNumber}
              </p>
              <Button
                onClick={() => router.push('/don-dat')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Xem đơn đã đặt
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function buildTransferNote(courseName: string) {
  const normalized = courseName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 10)
    .toUpperCase();
  return `DOHY-${normalized || 'COURSE'}`;
}
