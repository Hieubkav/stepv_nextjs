'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";

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
}: {
  priceText: string;
  comparePriceText: string | null;
  priceNote: string | null;
  pricingType: "free" | "paid";
  priceAmount: number;
  courseTitle: string;
  courseSlug?: string;
  courseId: string;
  hasFullAccess: boolean;
}) {
  const router = useRouter();
  const { addItem, hasDuplicate } = useCart();

  const handleAddToCart = () => {
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
      });
    }
    router.push("/checkout");
  };

  return (
    <Card id="support" className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Học phí</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight">{priceText}</span>
            {comparePriceText ? (
              <span className="text-sm text-muted-foreground line-through">{comparePriceText}</span>
            ) : null}
          </div>
          {priceNote ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{priceNote}</p>
          ) : null}
        </div>

        {hasFullAccess ? (
          <Button asChild size="lg" className="w-full font-semibold">
            <Link href={courseSlug ? `/khoa-hoc/${courseSlug}#curriculum` : "#curriculum"}>Vào học ngay</Link>
          </Button>
        ) : pricingType === "paid" ? (
          <Button size="lg" className="w-full font-semibold" onClick={handleAddToCart}>
            Thêm vào giỏ &amp; thanh toán
          </Button>
        ) : (
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link href={courseSlug ? `/khoa-hoc/${courseSlug}#curriculum` : "#curriculum"}>
              Miễn phí - Học ngay
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
