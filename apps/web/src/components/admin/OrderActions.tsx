'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

type OrderStatus = 'pending' | 'paid' | 'activated' | 'cancelled';

interface Order {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  items: Array<{
    _id: string;
    productType: 'course' | 'resource' | 'vfx';
    productId: string;
    price: number;
  }>;
}

interface OrderActionsProps {
  order: Order;
  onRefresh: () => void;
}

export default function OrderActions({ order, onRefresh }: OrderActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const markPaidMutation = useMutation(api.orders.markOrderAsPaid);
  const activateMutation = useMutation(api.orders.activateOrder);
  const cancelMutation = useMutation(api.orders.cancelOrder);

  // Mark as Paid
  const handleMarkPaid = async () => {
    setIsLoading(true);
    try {
      await markPaidMutation({
        orderId: order._id as any,
        notes: `Thanh toán được xác nhận lúc ${new Date().toLocaleString('vi-VN')}`,
      });

      toast({
        title: 'Thành công',
        description: `Đơn hàng ${order.orderNumber} đã được đánh dấu đã thanh toán`,
      });

      // Wait a moment then refresh
      setTimeout(() => {
        onRefresh();
      }, 500);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể đánh dấu đơn hàng đã thanh toán',
        variant: 'destructive',
      });
      console.error('Mark paid error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Activate Order
  const handleActivate = async () => {
    setIsLoading(true);
    try {
      await activateMutation({
        orderId: order._id as any,
      });

      toast({
        title: 'Thành công',
        description: `Đơn hàng ${order.orderNumber} đã được kích hoạt. Khách hàng có thể truy cập sản phẩm ngay.`,
      });

      // Wait a moment then refresh
      setTimeout(() => {
        onRefresh();
      }, 500);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể kích hoạt đơn hàng',
        variant: 'destructive',
      });
      console.error('Activate error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel Order
  const handleCancel = async (reason?: string) => {
    setIsLoading(true);
    try {
      await cancelMutation({
        orderId: order._id as any,
        reason: reason || 'Hủy bởi admin',
      });

      toast({
        title: 'Thành công',
        description: `Đơn hàng ${order.orderNumber} đã được hủy`,
      });

      // Wait a moment then refresh
      setTimeout(() => {
        onRefresh();
      }, 500);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể hủy đơn hàng',
        variant: 'destructive',
      });
      console.error('Cancel error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pending: Show Mark Paid & Cancel
  if (order.status === 'pending') {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Chờ thanh toán:</strong> Bạn cần xác nhận đã nhận tiền trước khi kích hoạt đơn.
          </p>
        </div>

        {/* Mark as Paid */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" size="lg" disabled={isLoading}>
              ✓ Đánh dấu đã thanh toán
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận thanh toán?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn xác nhận đã nhận được thanh toán cho đơn hàng <strong>{order.orderNumber}</strong> (
                <strong>Tổng: {order.totalAmount.toLocaleString('vi-VN')} VND</strong>)?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleMarkPaid} disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full" size="lg" disabled={isLoading}>
              ✕ Hủy đơn hàng
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hủy đơn hàng?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn xác nhận muốn hủy đơn hàng <strong>{order.orderNumber}</strong>? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Không, giữ lại</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleCancel('Hủy bởi admin')}
                disabled={isLoading}
                className="bg-destructive"
              >
                {isLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Paid: Show Activate
  if (order.status === 'paid') {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Đã thanh toán:</strong> Hãy kích hoạt đơn hàng để khách hàng có thể truy cập sản phẩm.
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" size="lg" disabled={isLoading}>
              ⚡ Kích hoạt đơn hàng
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kích hoạt đơn hàng?</AlertDialogTitle>
              <AlertDialogDescription>
                Kích hoạt đơn hàng <strong>{order.orderNumber}</strong> sẽ:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Tạo quyền truy cập cho {order.items.length} sản phẩm</li>
                  <li>Khách hàng có thể xem trong "Thư viện của tôi"</li>
                  <li>Cho phép download/truy cập ngay lập tức</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleActivate} disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Xác nhận kích hoạt'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Activated: Inform no more actions
  if (order.status === 'activated') {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>✓ Đã kích hoạt:</strong> Khách hàng có thể truy cập các sản phẩm trong "Thư viện của tôi".
          </p>
        </div>

        <Button disabled className="w-full" size="lg" variant="outline">
          ✓ Đã kích hoạt - Không thể sửa
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Để hủy đơn, vui lòng liên hệ quản trị viên hệ thống
        </p>
      </div>
    );
  }

  // Cancelled: display info only
  if (order.status === 'cancelled') {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-sm text-slate-800">
            <strong>Đơn đã hủy:</strong> Không còn hành động nào khả dụng cho đơn này.
          </p>
        </div>

        <Button disabled className="w-full" size="lg" variant="outline">
          Không có thao tác
        </Button>
      </div>
    );
  }

  return null;
}
