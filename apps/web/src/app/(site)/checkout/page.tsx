'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import { useCart } from '@/context/cart-context';
import { useCustomerAuth } from '@/features/auth';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import CartItem from '@/components/cart/CartItem';
import BankInfo from '@/components/checkout/BankInfo';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSuccess from '@/components/checkout/OrderSuccess';

type CheckoutStep = 'form' | 'success';

export default function CheckoutPage() {
    const router = useRouter();
    const convex = useConvex();
    const { items, getTotal, clearCart } = useCart();
    const { customer, isAuthenticated } = useCustomerAuth();
    const [step, setStep] = useState<CheckoutStep>('form');
    const [orderNumber, setOrderNumber] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createOrderMutation = useMutation(api.orders.createOrderWithItems);

    const total = getTotal();
    const itemCount = items.length;

    // Redirect if cart is empty
    useEffect(() => {
        if (itemCount === 0) {
            const timer = setTimeout(() => {
                router.push('/khoa-hoc');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [itemCount, router]);

    const handleCheckout = async (data: {
        fullName: string;
        email: string;
        phone?: string;
    }) => {
        setIsLoading(true);
        setError(null);

        try {
            // If not authenticated, create account first
            let customerId = customer?._id;

            if (!isAuthenticated) {
                // For MVP, we'll just use the existing customer if logged in
                // For guests, we'd need to implement guest checkout
                setError('Vui lòng đăng nhập hoặc đăng ký để tiếp tục');
                setIsLoading(false);
                return;
            }

            if (!customerId) {
                setError('Không tìm thấy thông tin khách hàng');
                setIsLoading(false);
                return;
            }

            // Create order with items
            const orderItems = items.map((item) => ({
                productType: item.productType as 'course' | 'resource' | 'vfx',
                productId: item.id,
                price: item.price,
            }));

            const order = await createOrderMutation({
                customerId,
                items: orderItems,
            }) as any;

            if (!order || !order.orderNumber) {
                throw new Error('Không thể tạo đơn hàng');
            }

            // Success
            setOrderNumber(order.orderNumber);
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

    // Empty cart state
    if (itemCount === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Giỏ hàng trống</h1>
                    <p className="text-muted-foreground">Hãy thêm sản phẩm vào giỏ hàng</p>
                    <Button asChild>
                        <a href="/khoa-hoc">Quay lại mua sắm</a>
                    </Button>
                </div>
            </div>
        );
    }

    // Success state
    if (step === 'success') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
                <OrderSuccess
                    orderNumber={orderNumber}
                    amount={total}
                    itemCount={itemCount}
                />
            </div>
        );
    }

    // Checkout form state
    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Cart Items */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Đơn hàng của bạn</h2>

                        {/* Items */}
                        <div className="border rounded-lg p-4 space-y-2">
                            {items.map((item) => (
                                <CartItem
                                    key={`${item.productType}-${item.id}`}
                                    item={item}
                                />
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                            <span className="text-lg font-semibold">Tổng cộng:</span>
                            <span className="text-3xl font-bold text-primary">
                                {formatPrice(total)}
                            </span>
                        </div>
                    </div>

                    {/* Right: Payment */}
                    <div className="space-y-6">
                        {/* Bank Info */}
                        <BankInfo
                            orderNumber="DH-XXXX-XXX"
                            amount={total}
                        />

                        {/* Checkout Form */}
                        <div>
                            <h2 className="text-xl font-bold mb-4">Thông tin của bạn</h2>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                    {error}
                                </div>
                            )}
                            <CheckoutForm
                                onSubmit={handleCheckout}
                                isLoading={isLoading}
                            />
                        </div>

                        {/* Authentication reminder */}
                        {!isAuthenticated && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm text-yellow-800">
                                    <strong>Lưu ý:</strong> Bạn cần đăng nhập để tiếp tục thanh toán
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
