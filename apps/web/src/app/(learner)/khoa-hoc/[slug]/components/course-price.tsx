'use client';

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CoursePrice({
  priceText,
  comparePriceText,
  priceNote,
  pricingType,
  courseSlug,
  courseId,
  hasFullAccess,
}: {
  priceText: string;
  comparePriceText: string | null;
  priceNote: string | null;
  pricingType: "free" | "paid";
  courseSlug?: string;
  courseId: string;
  hasFullAccess: boolean;
}) {
  const checkoutHref =
    courseSlug && typeof courseSlug === "string"
      ? { pathname: "/khoa-hoc/checkout", query: { slug: courseSlug } }
      : null;

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
        ) : pricingType === "paid" && checkoutHref ? (
          <Button asChild size="lg" className="w-full font-semibold">
            <Link href={checkoutHref}>Mua khóa học</Link>
          </Button>
        ) : pricingType === "free" ? (
          <Button variant="outline" size="lg" className="w-full" disabled>
            Miễn phí - Đăng ký ở phần "Chương trình học"
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
