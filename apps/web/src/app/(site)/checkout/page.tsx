'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import {
  ArrowLeft,
  Box,
  Check,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  X,
  Zap,
  Copy,
} from 'lucide-react';

import { api } from '@dohy/backend/convex/_generated/api';
import { useCart, type CartItem as CartItemType } from '@/context/cart-context';
import { useCustomerAuth } from '@/features/auth';
import { CartEmpty } from '@/features/cart/cart-empty';
import { useHeaderOffset } from '@/features/cart/use-header-offset';
import OrderSuccess from '@/components/checkout/OrderSuccess';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import { getBankName } from '@/lib/bank-codes';
import { buildVietQRImageUrl } from '@/lib/vietqr';

type CheckoutStep = 'form' | 'success';

type BankConfig = {
  bankAccountNumber: string;
  bankAccountName: string;
  bankCode: string;
};

type PaymentCardProps = {
  amount: number;
  transferNote: string;
  bankConfig: BankConfig | null;
  bankName?: string;
  qrUrl: string | null;
  isLoading: boolean;
  orderNumber?: string;
  onSubmit?: () => void;
  submitting?: boolean;
  error?: string | null;
  disableSubmit?: boolean;
};

type CopyFieldProps = {
  label: string;
  value: string;
  onCopy: (value: string, key: string) => void;
  fieldKey: string;
  important?: boolean;
  disabled?: boolean;
  isCopied?: boolean;
};

const TRANSFER_NOTE = 'CK DOHY STUDIO';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart, removeItem } = useCart();
  const { customer, status } = useCustomerAuth();
  const customerId = customer?._id;
  const [step, setStep] = useState<CheckoutStep>('form');
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);
  const [confirmedItemCount, setConfirmedItemCount] = useState<number | null>(null);
  const headerOffset = useHeaderOffset();

  const createOrderMutation = useMutation(api.orders.createOrderWithItems);
  const paymentSettings = useQuery(api.paymentSettings.getPaymentSettings);
  const siteSettings = useQuery(api.settings.getByKey, { key: 'site' });

  const total = getTotal();
  const itemCount = items.length;

  const bankConfig = useMemo<BankConfig | null>(() => {
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
      };
    }

    const value = (siteSettings?.value ?? {}) as Record<string, any>;
    const number = typeof value.bankAccountNumber === 'string' ? value.bankAccountNumber.trim() : '';
    const name = typeof value.bankAccountName === 'string' ? value.bankAccountName.trim() : '';
    const code = typeof value.bankCode === 'string' ? value.bankCode.trim() : '';

    if (number && name && code) {
      return { bankAccountNumber: number, bankAccountName: name, bankCode: code };
    }

    return null;
  }, [
    paymentSettings?.exists,
    paymentSettings?.bankAccountNumber,
    paymentSettings?.bankAccountName,
    paymentSettings?.bankCode,
    siteSettings?._id,
    siteSettings?.updatedAt,
    siteSettings?.value?.bankAccountNumber,
    siteSettings?.value?.bankAccountName,
    siteSettings?.value?.bankCode,
  ]);

  const bankName = bankConfig ? getBankName(bankConfig.bankCode) : undefined;

  const displayTotal = step === 'success' && confirmedTotal !== null ? confirmedTotal : total;
  const displayItemCount =
    step === 'success' && confirmedItemCount !== null ? confirmedItemCount : itemCount;

  const qrUrl = useMemo(() => {
    if (!bankConfig) return null;
    return (
      buildVietQRImageUrl({
        bankCode: bankConfig.bankCode,
        accountNumber: bankConfig.bankAccountNumber,
        accountName: bankConfig.bankAccountName,
        amount: displayTotal > 0 ? displayTotal : undefined,
        addInfo: TRANSFER_NOTE,
        template: 'qr_only',
      }) ?? null
    );
  }, [
    bankConfig?.bankAccountNumber,
    bankConfig?.bankAccountName,
    bankConfig?.bankCode,
    displayTotal,
  ]);

  const isBankLoading = paymentSettings === undefined && siteSettings === undefined;

  useEffect(() => {
    if (status === 'authenticated' || status === 'loading') return;
    if (status === 'idle') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (step === 'success') return;
    if (itemCount === 0 && status !== 'loading') {
      const timer = setTimeout(() => router.push('/'), 1200);
      return () => clearTimeout(timer);
    }
  }, [itemCount, status, router, step]);

  const handleCheckout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!customerId) {
        setError('Không tìm thấy thông tin khách hàng');
        setIsLoading(false);
        return;
      }

      const orderItems = items.map((item) => ({
        productType: item.productType as 'course' | 'resource' | 'vfx',
        productId: item.id,
        price: item.price,
      }));

      const currentTotal = getTotal();
      const currentItemCount = items.length;

      const order = (await createOrderMutation({
        customerId: customerId as any,
        items: orderItems,
      })) as { orderNumber?: string } | null;

      if (!order || !order.orderNumber) {
        throw new Error('Không thể tạo đơn hàng');
      }

      setOrderNumber(order.orderNumber);
      setConfirmedTotal(currentTotal);
      setConfirmedItemCount(currentItemCount);
      clearCart();
      setStep('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(message);
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clearCart, createOrderMutation, customerId, getTotal, items]);

  const handleRemoveItem = useCallback(
    (item: CartItemType) => removeItem(item.id, item.productType),
    [removeItem],
  );

  const heading = (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
          Digital Checkout
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-white to-slate-400 bg-clip-text md:text-4xl">
          Thanh toán
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Hoàn tất đơn hàng digital của bạn một cách an toàn.
        </p>
      </div>
      <div className="hidden md:flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-400/30">
        <ShieldCheck className="w-4 h-4" />
        <span className="font-medium">Bảo mật tuyệt đối</span>
      </div>
    </header>
  );

  if (step !== 'success' && itemCount === 0) {
    return (
      <CheckoutShell headerOffset={headerOffset}>
        {heading}
        <div className="rounded-2xl border border-slate-800/50 bg-[#0f172a]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <CartEmpty />
        </div>
      </CheckoutShell>
    );
  }

  const summarySection = (
    <section className="lg:col-span-5 order-2 lg:order-1">
      <div className="sticky space-y-6" style={{ top: headerOffset + 24 }}>
        <div className="rounded-2xl border border-slate-700/60 bg-[#0f172a]/90 shadow-xl shadow-black/40 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-700/60 px-6 py-5">
            <div className="text-lg font-semibold text-white">Đơn hàng của bạn</div>
            <span className="text-xs font-medium text-slate-300 bg-[#1e293b]/80 px-2.5 py-1 rounded-full border border-slate-700">
              {displayItemCount} sản phẩm
            </span>
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-2">
            {items.map((item) => (
              <CheckoutCartItem key={`${item.productType}-${item.id}`} item={item} onRemove={handleRemoveItem} />
            ))}
          </div>
          <div className="px-6 pb-6 pt-5 bg-[#1e293b]/60 border-t border-slate-700/60 rounded-b-2xl">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Tạm tính</span>
              <span>{formatPrice(displayTotal)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xl font-bold text-white border-t border-dashed border-slate-600 pt-4">
              <span>Tổng cộng</span>
              <span className="text-amber-400">{formatPrice(displayTotal)}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block text-center text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
          Nếu gặp khó khăn khi thanh toán, hãy liên hệ <span className="text-white underline-offset-2 hover:underline cursor-pointer">Support</span> để được hỗ trợ nhanh nhất.
        </div>
      </div>
    </section>
  );

  const paymentSection = (
    <section className="lg:col-span-7 order-1 lg:order-2">
      <PaymentCard
        amount={displayTotal}
        transferNote={TRANSFER_NOTE}
        bankConfig={bankConfig}
        bankName={bankName}
        qrUrl={qrUrl}
        isLoading={isBankLoading}
        onSubmit={step === 'success' ? undefined : handleCheckout}
        submitting={isLoading}
        error={error}
        orderNumber={orderNumber}
        disableSubmit={step === 'success'}
      />

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors lg:hidden">
        <ArrowLeft className="w-4 h-4" /> Quay lại cửa hàng
      </div>
    </section>
  );

  if (step === 'success') {
    return (
      <CheckoutShell headerOffset={headerOffset}>
        {heading}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-5 order-2 lg:order-1">
            <div className="rounded-2xl border border-slate-700/60 bg-[#0f172a]/90 p-6 shadow-xl shadow-black/40">
              <OrderSuccess
                orderNumber={orderNumber}
                amount={displayTotal}
                itemCount={displayItemCount}
              />
            </div>
          </section>

          {paymentSection}
        </div>
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell headerOffset={headerOffset}>
      {heading}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {summarySection}
        {paymentSection}
      </div>
    </CheckoutShell>
  );
}

function CheckoutShell({ headerOffset, children }: { headerOffset: number; children: ReactNode }) {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-50 selection:bg-amber-500/30 selection:text-amber-50"
      style={{ paddingTop: headerOffset }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10%] top-[-10%] h-72 w-72 rounded-full bg-amber-500/10 blur-[160px]" />
        <div className="absolute left-[-18%] bottom-[-18%] h-80 w-80 rounded-full bg-blue-500/10 blur-[170px]" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-16 md:px-6 lg:px-12">
        {children}
      </div>
    </main>
  );
}

function CheckoutCartItem({
  item,
  onRemove,
}: {
  item: CartItemType;
  onRemove: (item: CartItemType) => void;
}) {
  const productTypeLabels: Record<CartItemType['productType'], string> = {
    course: 'Khóa học',
    resource: 'Tài nguyên',
    vfx: 'VFX',
  };

  const renderIcon = () => {
    if (item.productType === 'course') return <GraduationCap className="w-6 h-6 text-blue-300" />;
    if (item.productType === 'resource') return <Box className="w-6 h-6 text-purple-300" />;
    return <Zap className="w-6 h-6 text-amber-300" />;
  };

  return (
    <div className="group relative flex items-center gap-4 rounded-xl border-b border-slate-700/70 px-4 py-4 last:border-none hover:bg-white/5 transition-colors">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-700/60 bg-[#0b1224] flex items-center justify-center">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        ) : (
          renderIcon()
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500">
          {productTypeLabels[item.productType]}
        </p>
        <h4 className="truncate text-sm font-semibold text-white" title={item.title}>
          {item.title}
        </h4>
        <p className="mt-1 text-sm font-semibold text-amber-400">{formatPrice(item.price)}</p>
      </div>

      <button
        onClick={() => onRemove(item)}
        className="flex-shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-800/70 hover:text-red-300 opacity-0 group-hover:opacity-100"
        aria-label="Xoá khỏi giỏ"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function PaymentCard({
  amount,
  transferNote,
  bankConfig,
  bankName,
  qrUrl,
  isLoading,
  orderNumber,
  onSubmit,
  submitting,
  error,
  disableSubmit,
}: PaymentCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-[#0f172a]/95 shadow-2xl shadow-black/50">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28" />

      <div className="border-b border-slate-700/60 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400">Thông tin chuyển khoản</p>
            <p className="text-lg font-semibold text-white">Quét mã QR hoặc chuyển khoản thủ công</p>
          </div>
          {orderNumber ? (
            <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-200">
              Mã đơn #{orderNumber}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-6 pt-8">
        <PaymentDetails
          amount={amount}
          transferNote={transferNote}
          bankConfig={bankConfig}
          bankName={bankName}
          qrUrl={qrUrl}
          isLoading={isLoading}
        />

        {error ? (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-700/60 bg-[#0f172a]/90 px-6 py-5">
        <Button
          className="w-full text-lg font-semibold h-14 bg-gradient-to-r from-amber-400 to-amber-300 text-black hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all"
          size="lg"
          onClick={onSubmit}
          disabled={disableSubmit || !onSubmit || submitting || isLoading || !bankConfig}
        >
          {submitting ? 'Đang tạo đơn...' : disableSubmit ? 'Đơn đã tạo' : 'Tôi đã chuyển khoản'}
        </Button>
        <p className="text-center text-xs text-slate-400">
          Đơn hàng sẽ được tạo bằng tài khoản bạn đang đăng nhập, không cần nhập lại thông tin.
        </p>
      </div>
    </div>
  );
}

function PaymentDetails({
  amount,
  transferNote,
  bankConfig,
  bankName,
  qrUrl,
  isLoading,
}: {
  amount: number;
  transferNote: string;
  bankConfig: BankConfig | null;
  bankName?: string;
  qrUrl: string | null;
  isLoading: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = useCallback(async (value: string, key: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch (error) {
      console.error('Copy failed', error);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="space-y-3">
            <div className="h-3 w-28 rounded bg-slate-800 animate-pulse" />
            <div className="h-11 rounded-lg border border-slate-800 bg-slate-900 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!bankConfig) {
    return (
      <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-amber-50 text-sm">
        Chưa cấu hình tài khoản thanh toán. Vào phần Cài đặt &gt; Ngân hàng để thêm số tài khoản, chủ
        tài khoản và mã ngân hàng.
      </div>
    );
  }

  const bankInitial = bankName ? bankName.slice(0, 2).toUpperCase() : 'NH';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <CopyField
          label="Số tiền cần chuyển"
          value={formatPrice(amount)}
          important
          onCopy={handleCopy}
          fieldKey="amount"
          isCopied={copied === 'amount'}
        />

        <CopyField
          label="Nội dung chuyển khoản (Bắt buộc)"
          value={transferNote}
          onCopy={handleCopy}
          fieldKey="note"
          isCopied={copied === 'note'}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CopyField
            label="Số tài khoản"
            value={bankConfig.bankAccountNumber}
            onCopy={handleCopy}
            fieldKey="account"
            isCopied={copied === 'account'}
          />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">
              Chủ tài khoản
            </label>
            <div className="p-3 h-[50px] flex items-center rounded-lg border border-slate-700 bg-[#1e293b]/60 text-slate-100 font-medium select-none">
              {bankConfig.bankAccountName}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">
            Ngân hàng
          </label>
          <div className="p-3 flex items-center gap-3 rounded-lg border border-slate-700 bg-[#1e293b]/60">
            <div className="w-9 h-9 rounded bg-white flex items-center justify-center font-bold text-indigo-700 text-xs">
              {bankInitial}
            </div>
            <span className="font-medium text-slate-50">{bankName || 'Đang cập nhật'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-200 rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
          <div className="relative bg-white p-4 rounded-xl shadow-inner">
            {qrUrl ? (
              <img src={qrUrl} alt={`QR thanh toán ${bankName ?? ''}`} className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 text-sm">
                Chưa có mã QR
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-xl">
              <span className="text-xs font-bold text-black uppercase tracking-widest">
                Scan me
              </span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-medium text-sm">
            <Zap className="w-4 h-4" />
            <span>Kích hoạt tự động</span>
          </div>
          <p className="text-xs text-slate-400 max-w-[220px] mx-auto">
            Quét mã để điền sẵn số tiền và nội dung chuyển khoản chính xác.
          </p>
        </div>
      </div>
    </div>
  );
}

function CopyField({
  label,
  value,
  onCopy,
  fieldKey,
  important,
  disabled,
  isCopied,
}: CopyFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div
        className={`relative flex items-center justify-between p-3 rounded-lg border transition-all ${
          important
            ? 'bg-amber-500/10 border-amber-400/40'
            : 'bg-[#0f172a] border-slate-700 hover:border-slate-600'
        }`}
      >
        <span
          className={`font-mono font-medium truncate pr-10 ${
            important ? 'text-amber-300 text-lg' : 'text-slate-100'
          }`}
          title={value}
        >
          {value}
        </span>

        <button
          type="button"
          onClick={() => onCopy(value, fieldKey)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md border text-slate-200 transition ${
            important
              ? 'border-amber-300 bg-amber-500/10 hover:bg-amber-500/20'
              : 'border-slate-700 bg-[#1e293b] hover:border-slate-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
          aria-label={`Copy ${label}`}
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
