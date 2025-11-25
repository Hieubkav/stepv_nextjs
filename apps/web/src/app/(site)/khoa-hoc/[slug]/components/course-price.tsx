'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";

type CoursePriceProps = {
  priceText: string;
  comparePriceText: string | null;
  priceNote: string | null;
  pricingType: "free" | "paid";
  priceAmount: number;
  courseTitle: string;
  courseSlug?: string;
  courseId: string;
  hasFullAccess: boolean;
  thumbnailUrl?: string | null;
  hasActiveOrder?: boolean;
  pendingOrderLabel?: string | null;
};

export function CoursePrice({
  priceText,
  comparePriceText,
  priceNote,
  pricingType,
  priceAmount,
  courseTitle,
  courseSlug,
  courseId,
  hasFullAccess,
  thumbnailUrl,
  hasActiveOrder,
  pendingOrderLabel,
}: CoursePriceProps) {
  const router = useRouter();
  const { addItem, hasDuplicate } = useCart();

  const handleAddToCart = () => {
    if (hasFullAccess) {
      router.push(courseSlug ? `/khoa-hoc/${courseSlug}` : "/khoa-hoc");
      return;
    }

    if (hasActiveOrder) {
      toast.message("Sản phẩm đã được đặt, vui lòng chờ xử lý.", {
        description: pendingOrderLabel ?? "Kiểm tra trang đơn hàng của bạn.",
      });
      router.push("/khoa-hoc/don-dat");
      return;
    }

    if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
      toast.error("Học phí chưa được cấu hình.");
      return;
    }

    if (!hasDuplicate("course", courseId)) {
      addItem({
        id: courseId,
        productType: "course",
        title: courseTitle,
        price: priceAmount,
        thumbnail: thumbnailUrl ?? undefined,
      });
    }
    router.push("/checkout");
  };

  return (
    <Card
      id="support"
      className="sticky top-4 overflow-hidden border border-amber-500/25 bg-gradient-to-b from-[#0b1324] to-[#050914] text-slate-100 shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white">Học phí</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-serif font-bold tracking-tight text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
              {priceText}
            </span>
            {comparePriceText ? (
              <span className="text-sm text-slate-500 line-through">{comparePriceText}</span>
            ) : null}
          </div>
          {priceNote ? <p className="text-sm leading-relaxed text-slate-300">{priceNote}</p> : null}
        </div>

        {hasFullAccess ? (
          <Button
            asChild
            size="lg"
            className="w-full font-semibold bg-gradient-to-r from-amber-500 to-yellow-300 text-black hover:brightness-110"
          >
            <Link href={courseSlug ? `/khoa-hoc/${courseSlug}#curriculum` : "#curriculum"}>Vào học ngay</Link>
          </Button>
        ) : pricingType === "paid" ? (
          <Button
            size="lg"
            className="w-full font-semibold bg-gradient-to-r from-amber-500 to-yellow-300 text-black hover:brightness-110"
            onClick={handleAddToCart}
            disabled={hasActiveOrder}
          >
            {hasActiveOrder ? "Đã đặt, chờ duyệt" : "Thêm vào giỏ & thanh toán"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            className="w-full border-slate-700 bg-[#0a1220] text-amber-100 hover:border-amber-400 hover:text-amber-200"
            asChild
          >
            <Link href={courseSlug ? `/khoa-hoc/${courseSlug}#curriculum` : "#curriculum"}>
              Miễn phí - Học ngay
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
