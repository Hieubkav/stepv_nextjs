'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { useCart } from '@/context/cart-context';
import { useCustomerAuth } from '@/features/auth';
import { formatPrice } from '@/lib/format';
import { buildVietQRImageUrl } from '@/lib/vietqr';
import { getBankName } from '@/lib/bank-codes';
import { Button } from '@/components/ui/button';
import CartItem from '@/components/cart/CartItem';
import BankInfo from '@/components/checkout/BankInfo';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSuccess from '@/components/checkout/OrderSuccess';
import { CartEmpty } from '@/features/cart/cart-empty';
import { useHeaderOffset } from '@/features/cart/use-header-offset';

type CheckoutStep = 'form' | 'success';

type BankConfig = {
  bankAccountNumber: string;
  bankAccountName: string;
  bankCode: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const { customer, status } = useCustomerAuth();
  const [step, setStep] = useState<CheckoutStep>('form');
  const [orderNumber, setOrderNumber] = useState<string>('');
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
        addInfo: orderNumber || undefined,
        template: 'qr_only',
      }) ?? null
    );
  }, [
    bankConfig?.bankAccountNumber,
    bankConfig?.bankAccountName,
    bankConfig?.bankCode,
    displayTotal,
    orderNumber,
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
      const timer = setTimeout(() => {
        router.push('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [itemCount, status, router, step]);

  const handleCheckout = async (_data: { fullName: string; email: string; phone?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!customer?._id) {
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
        customerId: customer._id as any,
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
  };

  if (step !== 'success' && itemCount === 0) {
    return (
      <CheckoutShell headerOffset={headerOffset}>
        <div className="rounded-2xl border border-slate-800/70 bg-[#050914]/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <CartEmpty />
        </div>
      </CheckoutShell>
    );
  }

  if (step === 'success') {
    return (
      <CheckoutShell headerOffset={headerOffset}>
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-2xl border border-slate-800/70 bg-[#050914]/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <OrderSuccess
              orderNumber={orderNumber}
              amount={displayTotal}
              itemCount={displayItemCount}
            />
          </div>
          <div className="rounded-2xl border border-slate-800/70 bg-[#050914]/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <BankInfo
              orderNumber={orderNumber}
              amount={displayTotal}
              bankAccountNumber={bankConfig?.bankAccountNumber}
              bankAccountName={bankConfig?.bankAccountName}
              bankName={bankName}
              qrUrl={qrUrl}
              isLoading={isBankLoading}
            />
          </div>
        </div>
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell headerOffset={headerOffset}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Digital Checkout
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">Thanh toán</h1>
          <p className="text-sm text-slate-400">Xác nhận đơn hàng digital của bạn.</p>
        </div>
        <div className="rounded-lg border border-slate-800/70 bg-[#050914]/80 px-3 py-2 text-xs text-slate-300">
          <span className="font-semibold text-amber-200">Tổng:</span> {formatPrice(displayTotal)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4 rounded-2xl border border-slate-800/70 bg-[#050914]/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-semibold text-slate-50">Đơn hàng của bạn</h2>
          <div className="divide-y divide-slate-800/70 rounded-xl border border-slate-800/70 bg-[#030a18]/80">
            {items.map((item) => (
              <CartItem key={`${item.productType}-${item.id}`} item={item} />
            ))}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
            <span className="text-sm font-semibold text-amber-100">Tổng cộng</span>
            <span className="text-2xl font-bold text-amber-200 drop-shadow-[0_0_18px_rgba(255,193,7,0.35)]">
              {formatPrice(displayTotal)}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800/70 bg-[#050914]/85 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <BankInfo
              orderNumber={orderNumber}
              amount={displayTotal}
              bankAccountNumber={bankConfig?.bankAccountNumber}
              bankAccountName={bankConfig?.bankAccountName}
              bankName={bankName}
              qrUrl={qrUrl}
              isLoading={isBankLoading}
            />
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-[#050914]/85 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">Thông tin của bạn</h2>
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
            <CheckoutForm onSubmit={handleCheckout} isLoading={isLoading} />
          </div>

          {status === 'idle' && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-amber-50">
              <p className="text-sm">
                <strong>Lưu ý:</strong> Bạn cần{' '}
                <a href="/login" className="font-semibold underline">
                  đăng nhập
                </a>{' '}
                để tiếp tục thanh toán.
              </p>
            </div>
          )}
        </div>
      </div>
    </CheckoutShell>
  );
}

function CheckoutShell({ headerOffset, children }: { headerOffset: number; children: React.ReactNode }) {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#030712] text-slate-50 selection:bg-amber-500/25 selection:text-amber-100"
      style={{ paddingTop: headerOffset }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute right-[-20%] top-4 h-80 w-80 rounded-full bg-sky-500/10 blur-[150px]" />
        <div className="absolute left-1/3 bottom-[-28%] h-96 w-96 rounded-full bg-indigo-600/10 blur-[190px]" />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 md:px-6">
        {children}
      </div>
    </main>
  );
}
