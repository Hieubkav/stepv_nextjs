'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/format';
import { ChevronLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import OrderActions from '@/components/admin/OrderActions';

type OrderStatus = 'pending' | 'paid' | 'activated' | 'cancelled';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: {
    label: 'Chờ thanh toán',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  paid: {
    label: 'Đã thanh toán',
    color: 'bg-sky-100 text-sky-800',
    icon: CheckCircle,
  },
  activated: {
    label: 'Đã kích hoạt',
    color: 'bg-emerald-100 text-emerald-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-slate-200 text-slate-800',
    icon: AlertCircle,
  },
};

interface OrderDetail {
  _id: string;
  orderNumber: string;
  customerId: string;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  items: Array<{
    _id: string;
    productType: 'course' | 'resource' | 'vfx';
    productId: string;
    price: number;
    createdAt: number;
  }>;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderParam = Array.isArray(params?.orderId) ? params.orderId[0] : params?.orderId;

  // Fetch order with items
  const orderData = useQuery(
    api.orders.getOrderWithItems,
    orderParam
      ? {
          orderId: orderParam as any,
        }
      : 'skip'
  ) as OrderDetail | null | undefined;

  const status = orderData?.status as OrderStatus;
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const handleRefresh = () => {
    router.refresh();
  };

  // Loading state
  if (orderData === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!orderData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Không tìm thấy đơn hàng</h1>
          <Button asChild>
            <a href="/dashboard/orders">Quay lại danh sách</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Đơn hàng {orderData.orderNumber}</h1>
          <p className="text-muted-foreground mt-1">
            Tạo ngày: {formatDate(orderData.createdAt)}
          </p>
        </div>
        <Badge className={`px-4 py-2 text-base ${config.color}`}>
          <StatusIcon className="w-4 h-4 mr-2 inline" />
          {config.label}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Order Details (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                  <p className="font-mono font-bold text-primary">{orderData.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <p className="font-semibold">{config.label}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-semibold">{formatDate(orderData.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cập nhật lúc</p>
                  <p className="font-semibold">{formatDate(orderData.updatedAt)}</p>
                </div>
              </div>
              {orderData.notes && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Ghi chú</p>
                  <p className="text-sm mt-1">{orderData.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Mã học viên</p>
                <p className="font-mono text-sm">{orderData.customerId}</p>
              </div>
              <p className="text-xs text-muted-foreground italic">
                💡 MVP: Dùng studentId làm customerId. Xem Convex Dashboard để lấy tên, email, phone
              </p>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm trong đơn ({orderData.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">#</th>
                      <th className="text-left py-3 px-4 font-semibold">Loại</th>
                      <th className="text-left py-3 px-4 font-semibold">Mã sản phẩm</th>
                      <th className="text-right py-3 px-4 font-semibold">Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.items.map((item, idx) => (
                      <tr key={item._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                            {item.productType === 'course'
                              ? '🎓 Khóa học'
                              : item.productType === 'resource'
                              ? '📦 Tài nguyên'
                              : '✨ VFX'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{item.productId}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {formatPrice(item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary & Actions (1 column) */}
        <div className="space-y-6">
          {/* Total */}
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng cộng</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(orderData.totalAmount)}
                  </p>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm text-muted-foreground">Số lượng items</p>
                  <p className="text-2xl font-bold">{orderData.items.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <OrderActions order={orderData} onRefresh={handleRefresh} />
        </div>
      </div>
    </div>
  );
}
