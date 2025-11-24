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
};

export default function BankInfo({
  orderNumber,
  amount,
  bankAccountNumber,
  bankAccountName,
  bankName,
  qrUrl,
  isLoading = false,
}: BankInfoProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const hasBankInfo = Boolean(bankAccountNumber && bankAccountName);
  const displayBankName = bankName?.trim() || 'Đang cập nhật';
  const transferNote = orderNumber?.trim() || 'Tạo đơn để nhận mã nội dung';

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

  const copyAllText = [bankAccountNumber, bankAccountName, displayBankName, transferNote]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="space-y-4 rounded-xl border border-slate-800/70 bg-[#030a18]/80 p-4 text-slate-50 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Chuyển khoản đến</p>
          <h3 className="text-lg font-semibold text-slate-50">Thông tin tài khoản</h3>
        </div>
        {qrUrl ? <QrCode className="h-5 w-5 text-amber-300" /> : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoRow
          label="Số tài khoản"
          value={bankAccountNumber}
          onCopy={() => handleCopy(bankAccountNumber!, 'account')}
          copied={copied === 'account'}
        />
        <InfoRow
          label="Chủ tài khoản"
          value={bankAccountName}
          onCopy={() => handleCopy(bankAccountName!, 'name')}
          copied={copied === 'name'}
        />
        <InfoRow label="Ngân hàng" value={displayBankName} />
        <InfoRow label="Số tiền" value={formatPrice(amount)} />
      </div>

      <div className="space-y-2 rounded-lg border border-amber-300/30 bg-amber-500/5 p-3">
        <p className="text-xs font-semibold text-amber-200">Nội dung chuyển khoản (bắt buộc)</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-black/30 px-3 py-2 font-mono text-sm text-amber-100 border border-amber-400/30">
            {transferNote}
          </code>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-400/50 text-amber-100 hover:bg-amber-500/10"
            onClick={() => handleCopy(orderNumber, 'note')}
            disabled={!orderNumber}
          >
            {copied === 'note' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[11px] text-amber-100/80">
          Sao chép chính xác mã đơn vào nội dung để hệ thống đối soát nhanh.
        </p>
      </div>

      <div className="space-y-2 rounded-lg border border-slate-800/70 bg-[#040c1c]/80 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-200">Mã QR ngân hàng</p>
            <p className="text-[11px] text-slate-400">Template VietQR `qr_only`</p>
          </div>
          {qrUrl ? (
            <Button asChild size="sm" variant="outline" className="text-xs">
              <a href={qrUrl} target="_blank" rel="noopener noreferrer">
                Mở QR
              </a>
            </Button>
          ) : null}
        </div>

        {qrUrl ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-800/70 bg-black/30 p-3">
            <img
              src={qrUrl}
              alt={`QR thanh toán ${displayBankName}`}
              className="h-48 w-48 rounded-md bg-white p-2"
            />
            <p className="text-[11px] text-slate-400 break-all">{qrUrl}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-4 text-center text-sm text-slate-400">
            Chưa tạo được mã QR. Vui lòng kiểm tra mã ngân hàng, số tài khoản.
          </div>
        )}
      </div>

      <Button
        className="w-full"
        onClick={() => handleCopy(copyAllText, 'all')}
        disabled={!copyAllText}
      >
        {copied === 'all' ? 'Đã sao chép' : 'Copy tất cả thông tin'}
      </Button>
    </div>
  );
}

type InfoRowProps = {
  label: string;
  value?: string;
  copied?: boolean;
  onCopy?: () => void;
};

function InfoRow({ label, value, copied = false, onCopy }: InfoRowProps) {
  const canCopy = Boolean(onCopy && value);
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-lg border border-slate-800/70 bg-black/30 px-3 py-2 font-mono text-sm text-slate-50">
          {value || '—'}
        </code>
        {canCopy ? (
          <Button size="icon" variant="outline" className="h-9 w-9" onClick={onCopy}>
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
