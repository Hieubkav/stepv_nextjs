'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import type { Doc, Id } from '@dohy/backend/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, X, Eye, EyeOff } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

type PendingPayment = {
  _id: Id<'payments'>;
  orderId: Id<'orders'>;
  studentName: string;
  studentEmail: string;
  courseName: string;
  amount: number;
  screenshotUrl?: string | null;
  createdAt: number;
};

type PaymentDetail = Doc<'payments'> & {
  courseName: string;
  studentName: string;
  studentEmail: string;
  orderAmount: number;
};

export default function PaymentDashboard() {
  const [selectedPaymentId, setSelectedPaymentId] = useState<Id<'payments'> | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Queries
  const pendingPayments = useQuery(api.payments.listPendingPayments) as
    | PendingPayment[]
    | undefined;
  const selectedPayment = selectedPaymentId
    ? (useQuery(api.payments.getPayment, { paymentId: selectedPaymentId }) as PaymentDetail | undefined)
    : null;

  // Mutations
  const confirmPaymentMutation = useMutation(api.payments.adminConfirmPayment);
  const rejectPaymentMutation = useMutation(api.payments.adminRejectPayment);

  // We'll need to get the current admin ID from context/auth
  // For now, using a placeholder
  const adminId: Id<'students'> = 'admin_id' as Id<'students'>;

  const handleConfirmPayment = async (paymentId: Id<'payments'>) => {
    try {
      setMessage('');
      setProcessing(true);

      await confirmPaymentMutation({
        paymentId,
        adminStudentId: adminId,
      });

      setMessage('Thanh toán đã được xác nhận thành công');
      setMessageType('success');
      setSelectedPaymentId(null);

      // Refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể xác nhận thanh toán');
      setMessageType('error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayment = async (paymentId: Id<'payments'>) => {
    if (!rejectionReason.trim()) {
      setMessage('Vui lòng nhập lý do từ chối');
      setMessageType('error');
      return;
    }

    try {
      setMessage('');
      setProcessing(true);

      await rejectPaymentMutation({
        paymentId,
        adminStudentId: adminId,
        reason: rejectionReason,
      });

      setMessage('Thanh toán đã được từ chối');
      setMessageType('success');
      setSelectedPaymentId(null);
      setRejectionReason('');
      setShowRejectionForm(false);

      // Refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể từ chối thanh toán');
      setMessageType('error');
    } finally {
      setProcessing(false);
    }
  };

  if (!pendingPayments) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">Đang tải...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Thanh toán</h2>
        <p className="text-muted-foreground">Quản lý các đơn thanh toán chờ xác nhận</p>
      </div>

      {message && (
        <Alert variant={messageType === 'success' ? 'default' : 'destructive'}>
          {messageType === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Thanh toán chờ xác nhận ({pendingPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Không có thanh toán chờ xác nhận
              </p>
            ) : (
              <div className="space-y-2">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{payment.studentName || payment.studentEmail}</p>
                      <p className="text-sm text-muted-foreground truncate">{payment.courseName}</p>
                      <p className="text-sm font-mono">
                        {payment.studentEmail}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {currencyFormatter.format(payment.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant={selectedPaymentId === payment._id ? 'default' : 'outline'}
                        onClick={() =>
                          setSelectedPaymentId(
                            selectedPaymentId === payment._id ? null : payment._id
                          )
                        }
                      >
                        {selectedPaymentId === payment._id ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Ẩn
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedPayment && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Chi tiết thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Học viên</p>
                  <p className="font-semibold">{selectedPayment.studentName}</p>
                  <p className="text-sm">{selectedPayment.studentEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Khóa học</p>
                  <p className="font-semibold">{selectedPayment.courseName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số tiền</p>
                  <p className="font-bold text-lg text-blue-600">
                    {currencyFormatter.format(selectedPayment.orderAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày yêu cầu</p>
                  <p className="font-semibold">
                    {new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {selectedPayment.bankAccount && (
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm font-semibold mb-3">🏦 Thông tin tài khoản gửi</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tài khoản:</span>
                      <span className="font-mono">{selectedPayment.bankAccount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chủ tài khoản:</span>
                      <span>{selectedPayment.bankAccountName}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment.screenshotUrl && (
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm font-semibold mb-3">📸 Bằng chứng thanh toán</p>
                  <img
                    src={selectedPayment.screenshotUrl}
                    alt="Payment proof"
                    className="max-w-full max-h-96 rounded border"
                  />
                </div>
              )}

              {selectedPayment.transactionId && (
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm font-semibold mb-2">🔢 Mã giao dịch</p>
                  <p className="font-mono text-sm break-all">{selectedPayment.transactionId}</p>
                </div>
              )}

              {!showRejectionForm ? (
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    onClick={() => handleConfirmPayment(selectedPayment._id)}
                    disabled={processing}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Xác nhận thanh toán
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={() => setShowRejectionForm(true)}
                    disabled={processing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Từ chối
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-white rounded-lg border border-red-200">
                  <p className="text-sm font-semibold">Nhập lý do từ chối</p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="VD: Số tiền không khớp, ảnh không rõ, v.v."
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleRejectPayment(selectedPayment._id)
                      }
                      disabled={processing || !rejectionReason.trim()}
                      className="flex-1"
                    >
                      Xác nhận từ chối
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowRejectionForm(false);
                        setRejectionReason('');
                      }}
                      disabled={processing}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
