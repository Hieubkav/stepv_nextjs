'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPrice, formatDate } from '@/lib/format';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
} from 'lucide-react';

type OrderStatus = 'pending' | 'paid' | 'activated' | 'cancelled';
type StatusFilter = 'all' | OrderStatus;

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

const FILTER_TABS: Array<'all' | OrderStatus> = ['all', 'pending', 'paid', 'activated', 'cancelled'];

export default function OrdersPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch orders based on status
  const allOrders = useQuery(api.orders.listOrders, { limit: 500 }) || [];
  const deleteOrderMutation = useMutation(api.orders.deleteOrder);

  const filteredOrders = useMemo(() => {
    let filtered = [...(allOrders || [])];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Filter by search (order number or notes)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(query) ||
          o.notes?.toLowerCase().includes(query)
      );
    }

    // Sort by date descending
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    return filtered;
  }, [allOrders, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    const summary: Record<'all' | OrderStatus, number> = {
      all: allOrders.length,
      pending: 0,
      paid: 0,
      activated: 0,
      cancelled: 0,
    };

    for (const order of allOrders) {
      summary[order.status] += 1;
    }

    return summary;
  }, [allOrders]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteOrderMutation({ orderId: deleteTarget.id as any });
      toast.success('Đã xóa đơn hàng vĩnh viễn');
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      toast.error('Xóa đơn thất bại');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý tất cả các đơn hàng từ khách hàng
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 border-b pb-3 overflow-x-auto">
        {FILTER_TABS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {status === 'all' ? 'Tất cả' : statusConfig[status]?.label}
            {' '}
            <span className="inline-block ml-1 px-2 py-0.5 text-xs bg-muted rounded-full">
              {status === 'all' ? counts.all : counts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Tìm kiếm theo mã đơn hàng (DH-2411-001)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Không có đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Mã đơn</th>
                    <th className="text-left py-3 px-4 font-semibold">Ngày</th>
                    <th className="text-left py-3 px-4 font-semibold">Số items</th>
                    <th className="text-left py-3 px-4 font-semibold">Tổng tiền</th>
                    <th className="text-left py-3 px-4 font-semibold">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const config = statusConfig[order.status as OrderStatus];
                    const itemCount = (order as any).items?.length || 1;

                    return (
                      <tr
                        key={order._id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <code className="font-mono font-bold text-primary">
                            {order.orderNumber}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          {itemCount} {itemCount === 1 ? 'sản phẩm' : 'sản phẩm'}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={config.color}>
                            {config.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Xem
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setDeleteTarget({ id: order._id, code: order.orderNumber })}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Xóa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đơn hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xóa cùng đơn hàng khỏi hệ thống và không thể khôi phục.
              {deleteTarget?.code ? ` Mã đơn: ${deleteTarget.code}.` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
