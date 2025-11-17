'use client';

import { useState } from 'react';
import { useMutation, useQuery, useAction } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@dohy/backend/convex/_generated/api';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Upload, Loader } from 'lucide-react';

interface CheckoutFormProps {
  courseId: Id<'courses'>;
  studentId: Id<'students'>;
  courseName: string;
  coursePrice: number;
  courseThumbnailUrl?: string;
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

type Step = 'confirm' | 'qr' | 'upload' | 'success';

export default function CheckoutForm({
  courseId,
  studentId,
  courseName,
  coursePrice,
  courseThumbnailUrl,
}: CheckoutFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('confirm');
  const [orderId, setOrderId] = useState<Id<'orders'> | null>(null);
  const [paymentId, setPaymentId] = useState<Id<'payments'> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Queries
  const paymentSettings = useQuery(api.paymentSettings.getPaymentSettings);
  const order = orderId ? useQuery(api.payments.getOrder, { orderId }) : null;

  // Actions
  const generateVietQRAction = useAction(api.vietqr.generateVietQRCode);
  const [vietqrCode, setVietqrCode] = useState<{
    qrCodeUrl?: string;
    qrDataUrl?: string;
    success: boolean;
  } | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  // Mutations
  const createOrderMutation = useMutation(api.payments.createOrder);
  const recordPaymentMutation = useMutation(api.payments.recordPayment);

  const handleCreateOrder = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await createOrderMutation({
        studentId,
        courseId,
      });
      setOrderId(result.orderId);

      // Generate VietQR code immediately after order creation
      if (paymentSettings) {
        setGeneratingQR(true);
        const qrResult = await generateVietQRAction({
          accountNumber: paymentSettings.bankAccountNumber,
          accountName: paymentSettings.bankAccountName,
          bankCode: paymentSettings.bankCode,
          amount: coursePrice,
          transactionInfo: `DOHY-${courseName.slice(0, 10).toUpperCase()}-${result.orderId.slice(-6)}`,
        });
        setVietqrCode(qrResult);
        setGeneratingQR(false);
      }

      setStep('qr');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!orderId) {
      setError('Không tìm thấy đơn hàng');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // If screenshot exists, upload it first
      let screenshotUrl: string | undefined;
      if (screenshotFile) {
        setUploading(true);
        // TODO: Implement file upload to Convex storage
        // For now, use a placeholder
        screenshotUrl = URL.createObjectURL(screenshotFile);
        setUploading(false);
      }

      const result = await recordPaymentMutation({
        orderId,
        studentId,
        qrCodeUrl: vietqrCode?.qrCodeUrl,
        qrCodeData: vietqrCode?.qrDataUrl,
        bankAccount: paymentSettings?.bankAccountNumber,
        bankAccountName: paymentSettings?.bankAccountName,
        screenshotUrl,
      });

      setPaymentId(result.paymentId);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể ghi nhận thanh toán');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setScreenshotFile(file);
      setError('');
    }
  };

  const handleBackToHome = () => {
    router.push('/khoa-hoc');
  };

  const handleGoToCourse = () => {
    router.push(`/khoa-hoc/${courseId}`);
  };

  if (!paymentSettings && step !== 'confirm') {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Đang tải cấu hình thanh toán...</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Confirm Order */}
      {step === 'confirm' && (
        <Card>
          <CardHeader>
            <CardTitle>Xác nhận đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {courseThumbnailUrl && (
              <img
                src={courseThumbnailUrl}
                alt={courseName}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tên khóa học</p>
              <p className="text-lg font-semibold">{courseName}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Học phí</p>
              <p className="text-2xl font-bold text-blue-600">
                {currencyFormatter.format(coursePrice)}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">ℹ️ Quá trình thanh toán:</p>
              <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                <li>Bạn sẽ nhận QR code để chuyển khoản</li>
                <li>Quét QR hoặc chuyển khoản theo thông tin hiển thị</li>
                <li>Chụp ảnh hoặc video bằng chứng chuyển khoản</li>
                <li>Tải lên để xác nhận (admin sẽ xác thực)</li>
                <li>Khi được duyệt, bạn sẽ được truy cập khóa học</li>
              </ol>
            </div>

            <Button
              size="lg"
              onClick={handleCreateOrder}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: VietQR Code Display */}
      {step === 'qr' && orderId && (
        <Card>
          <CardHeader>
            <CardTitle>Mã QR Thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {generatingQR ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-muted-foreground">Đang tạo mã QR...</p>
              </div>
            ) : vietqrCode && vietqrCode.success ? (
              <>
                <div className="text-center">
                  {vietqrCode.qrCodeUrl ? (
                    <img
                      src={vietqrCode.qrCodeUrl}
                      alt="VietQR Code"
                      className="w-full max-w-sm mx-auto border-2 border-blue-200 rounded-lg p-4"
                    />
                  ) : vietqrCode.qrDataUrl ? (
                    <img
                      src={`data:image/png;base64,${vietqrCode.qrDataUrl}`}
                      alt="VietQR Code"
                      className="w-full max-w-sm mx-auto border-2 border-blue-200 rounded-lg p-4"
                    />
                  ) : null}
                </div>

                <div className="bg-amber-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-amber-900">📋 Thông tin chuyển khoản</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tài khoản:</span>
                      <span className="font-mono font-semibold">
                        {paymentSettings?.bankAccountNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chủ tài khoản:</span>
                      <span className="font-semibold">{paymentSettings?.bankAccountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tiền:</span>
                      <span className="font-bold text-blue-600">
                        {currencyFormatter.format(coursePrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nội dung:</span>
                      <span className="font-mono text-xs">
                        DOHY-{courseName.slice(0, 10).toUpperCase()}-{orderId.slice(-6)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    ✅ Quét mã QR bằng ứng dụng ngân hàng hoặc copy thông tin để chuyển khoản
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={() => setStep('upload')}
                  className="w-full"
                >
                  Tôi đã chuyển khoản rồi
                </Button>
              </>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Không thể tạo mã QR. Vui lòng thử lại.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Upload Payment Proof */}
      {step === 'upload' && orderId && (
        <Card>
          <CardHeader>
            <CardTitle>Tải lên bằng chứng thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vui lòng chụp ảnh hoặc quay video bằng chứng chuyển khoản (hiển thị số tiền, tên người nhận, thời gian)
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <label htmlFor="screenshot" className="cursor-pointer">
                  <span className="text-blue-600 font-medium hover:underline">
                    Chọn ảnh/video
                  </span>
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleScreenshotChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-sm text-muted-foreground mt-2">
                  hoặc kéo thả vào đây (tối đa 5MB)
                </p>
              </div>
            </div>

            {screenshotFile && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">{screenshotFile.name}</p>
                  <p className="text-xs text-green-700">
                    {(screenshotFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                💡 Hình ảnh/video sẽ được admin xem xét. Thường xuyên hoàn tất trong vòng 1-2 giờ.
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleRecordPayment}
              disabled={loading || uploading || !screenshotFile}
              className="w-full"
            >
              {uploading ? 'Đang tải lên...' : loading ? 'Đang ghi nhận...' : 'Ghi nhận thanh toán'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setStep('qr')}
              disabled={loading}
              className="w-full"
            >
              Quay lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 'success' && paymentId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-600">✅ Thanh toán đã ghi nhận</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">{courseName}</p>
              <p className="text-2xl font-bold text-blue-600">
                {currencyFormatter.format(coursePrice)}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-green-900">📝 Mã thanh toán</p>
              <p className="font-mono text-sm text-green-800 break-all">{paymentId}</p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bằng chứng của bạn đã được ghi nhận. Admin sẽ xác thực trong vòng 1-2 giờ.
                Bạn sẽ nhận email khi thanh toán được duyệt.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button size="lg" onClick={handleBackToHome} className="w-full">
                Quay lại danh sách khóa học
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleGoToCourse}
                className="w-full"
              >
                Xem chi tiết khóa học
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
