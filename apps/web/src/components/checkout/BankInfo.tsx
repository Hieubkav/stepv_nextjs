'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';

type BankInfoProps = {
    orderNumber: string;
    amount: number;
    bankAccountNumber?: string;
    bankAccountName?: string;
    bankName?: string;
};

export default function BankInfo({
    orderNumber,
    amount,
    bankAccountNumber = '1234567890',
    bankAccountName = 'DOHY STUDIO',
    bankName = 'Vietcombank',
}: BankInfoProps) {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-4 p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
            <div>
                <h3 className="font-bold text-lg text-blue-900 mb-3">
                    💳 Chuyển khoản đến
                </h3>
            </div>

            {/* Bank Account */}
            <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">Số tài khoản</label>
                <div className="flex gap-2 items-center">
                    <code className="flex-1 p-2 bg-white rounded border text-sm font-mono">
                        {bankAccountNumber}
                    </code>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(bankAccountNumber, 'account')}
                        className="px-2"
                    >
                        {copied === 'account' ? (
                            <Check className="w-4 h-4 text-green-600" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Account Name */}
            <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">Chủ tài khoản</label>
                <div className="flex gap-2 items-center">
                    <code className="flex-1 p-2 bg-white rounded border text-sm font-mono">
                        {bankAccountName}
                    </code>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(bankAccountName, 'name')}
                        className="px-2"
                    >
                        {copied === 'name' ? (
                            <Check className="w-4 h-4 text-green-600" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Bank */}
            <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">Ngân hàng</label>
                <div className="p-2 bg-white rounded border text-sm">
                    {bankName}
                </div>
            </div>

            {/* Amount */}
            <div className="space-y-1 pt-2 border-t">
                <label className="text-sm font-semibold text-foreground">Số tiền</label>
                <div className="p-2 bg-white rounded border text-lg font-bold text-primary">
                    {formatPrice(amount)}
                </div>
            </div>

            {/* Transfer Content */}
            <div className="space-y-1 pt-2 border-t">
                <label className="text-sm font-semibold text-foreground">
                    Nội dung chuyển khoản (rất quan trọng!)
                </label>
                <div className="p-3 rounded bg-white border-2 border-red-300">
                    <code className="text-red-600 font-bold text-center block">
                        {orderNumber}
                    </code>
                </div>
                <p className="text-xs text-muted-foreground italic">
                    ⚠️ Vui lòng copy chính xác mã đơn hàng này vào nội dung chuyển khoản
                </p>
            </div>

            {/* Copy All */}
            <Button
                className="w-full"
                onClick={() => {
                    const text = `${bankAccountNumber}\n${bankAccountName}\n${bankName}\n${orderNumber}`;
                    handleCopy(text, 'all');
                }}
            >
                {copied === 'all' ? '✓ Đã copy' : 'Copy tất cả'}
            </Button>
        </div>
    );
}
