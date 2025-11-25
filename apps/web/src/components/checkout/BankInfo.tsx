'use client';

import { useState } from 'react';
import { Check, Copy, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';

type BankInfoProps = {
  orderNumber: string;
  amount: number;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  qrUrl?: string | null;
  isLoading?: boolean;
  transferNote?: string;
};

const DEFAULT_TRANSFER_NOTE = 'CK DOHY STUDIO';

export default function BankInfo({
  orderNumber,
  amount,
  bankAccountNumber,
  bankAccountName,
  bankName,
  qrUrl,
  isLoading = false,
  transferNote: transferNoteProp,
}: BankInfoProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const hasBankInfo = Boolean(bankAccountNumber && bankAccountName);
  const displayBankName = bankName?.trim() || 'Đang cập nhật';
  const transferNote = transferNoteProp?.trim() || DEFAULT_TRANSFER_NOTE;

  const handleCopy = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1800);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-xl border border-slate-800/70 bg-[#030a18]/80 p-4">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-800/60" />
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-24 rounded bg-slate-800/50" />
              <div className="h-10 rounded-lg border border-slate-800/70 bg-slate-900/70" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasBankInfo) {
    return (
      <div className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-50">
        <p className="text-sm font-semibold">Chưa cấu hình tài khoản thanh toán</p>
        <p className="text-sm text-amber-100/90">
          Vào trang Cài đặt &gt; Ngân hàng để nhập số tài khoản, chủ tài khoản và ngân hàng. Mã
          QR sẽ tự sinh sau khi có đủ thông tin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-xl border border-slate-800/70 bg-[#030a18]/80 p-4 text-slate-50 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Chuyển khoản đến</p>
          <h3 className="text-lg font-semibold text-slate-50">Thông tin tài khoản</h3>
        </div>
        {orderNumber ? (
          <span className="rounded-full border border-slate-800/80 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-slate-200">
            Mã đơn #{orderNumber}
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-3 rounded-xl border border-slate-800/70 bg-[#040c1c]/85 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-amber-200/90">Số tiền cần chuyển</p>
              <p className="text-3xl font-semibold text-amber-100 drop-shadow-[0_0_24px_rgba(255,193,7,0.25)]">
                {formatPrice(amount)}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-100 hover:bg-slate-800/70"
              onClick={() => handleCopy(formatPrice(amount), 'amount')}
              disabled={!amount}
            >
              {copied === 'amount' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800/70 bg-black/20 px-3 py-2 text-sm text-amber-100/90">
            <span className="rounded-lg border border-amber-400/40 bg-black/30 px-3 py-1 font-semibold tracking-tight">
              {transferNote}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-100 hover:bg-slate-800/70"
              onClick={() => handleCopy(transferNote, 'note')}
            >
              {copied === 'note' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <span className="text-[11px] uppercase tracking-[0.16em] text-amber-200/80">
              Nội dung chuyển khoản (bắt buộc)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Số TK', value: bankAccountNumber, copyType: 'account' as const },
              { label: 'Chủ TK', value: bankAccountName, copyType: 'name' as const },
              { label: 'Ngân hàng', value: displayBankName, copyType: null },
            ].map(({ label, value, copyType }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-800/70 bg-black/25 px-3 py-2 text-sm text-slate-100"
              >
                <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{label}</span>
                <span className="font-semibold text-slate-50">{value || '-'}</span>
                {copyType && value ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 border border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-800/80"
                    onClick={() => handleCopy(value, copyType)}
                  >
                    {copied === copyType ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/70 bg-[#040c1c]/85 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-100">QR ngân hàng</p>
              <p className="text-[11px] text-slate-400">Quét để điền sẵn số tiền &amp; nội dung</p>
            </div>
            {qrUrl ? <QrCode className="h-5 w-5 text-amber-300" /> : null}
          </div>

          {qrUrl ? (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-slate-800/70 bg-black/30 p-3">
              <img
                src={qrUrl}
                alt={`QR thanh toán ${displayBankName}`}
                className="h-60 w-60 rounded-md bg-white p-2 shadow-[0_18px_38px_rgba(0,0,0,0.35)]"
              />
              <p className="text-center text-[11px] text-slate-400 break-all">{qrUrl}</p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-4 text-center text-sm text-slate-400">
              Chưa tạo được mã QR. Vui lòng kiểm tra mã ngân hàng, số tài khoản.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
