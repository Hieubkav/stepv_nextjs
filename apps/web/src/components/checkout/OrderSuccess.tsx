'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';

type OrderSuccessProps = {
    orderNumber: string;
    amount: number;
    itemCount: number;
};

export default function OrderSuccess({
    orderNumber,
    amount,
    itemCount,
}: OrderSuccessProps) {
    return (
        <div className="w-full max-w-md mx-auto text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
                    <CheckCircle className="w-20 h-20 text-green-600 relative" />
                </div>
            </div>

            {/* Title */}
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Đơn hàng thành công! 🎉
                </h1>
                <p className="text-muted-foreground">
                    Cảm ơn bạn đã mua sắm tại DOHY
                </p>
            </div>

            {/* Order Details */}
            <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mã đơn hàng:</span>
                    <code className="font-mono font-bold text-primary text-lg">
                        {orderNumber}
                    </code>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Số lượng sản phẩm:</span>
                    <span className="font-bold">{itemCount}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-primary">
                        {formatPrice(amount)}
                    </span>
                </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 text-left p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900">📋 Hướng dẫn thanh toán:</h3>
                <ol className="space-y-2 text-sm text-blue-900">
                    <li>
                        <strong>1.</strong> Mở ứng dụng ngân hàng của bạn
                    </li>
                    <li>
                        <strong>2.</strong> Chuyển khoản đến số tài khoản ở trang trước
                    </li>
                    <li>
                        <strong>3.</strong> Nội dung chuyển khoản: <code className="font-mono font-bold">{orderNumber}</code>
                    </li>
                    <li>
                        <strong>4.</strong> Chúng tôi sẽ kích hoạt đơn hàng trong vòng 24h
                    </li>
                </ol>
            </div>

            {/* Important Note */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-800">
                    ⚠️ <strong>Lưu ý quan trọng:</strong> Nếu chuyển khoản không đúng nội dung, chúng tôi không thể xác nhận được đơn hàng. Vui lòng kiểm tra kỹ trước khi gửi.
                </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
                <Button size="lg" className="w-full" asChild>
                    <Link href="/my-library">
                        Xem thư viện của tôi
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full" asChild>
                    <Link href="/khoa-hoc">
                        Tiếp tục mua sắm
                    </Link>
                </Button>
            </div>

            {/* Help */}
            <div className="text-center">
                <p className="text-xs text-muted-foreground">
                    Có vấn đề? Hãy liên hệ{' '}
                    <Link href="mailto:support@dohy.dev" className="text-primary hover:underline">
                        support@dohy.dev
                    </Link>
                </p>
            </div>
        </div>
    );
}
