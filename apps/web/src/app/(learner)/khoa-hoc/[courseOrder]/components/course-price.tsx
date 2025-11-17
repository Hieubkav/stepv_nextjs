'use client';

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudentAuth } from "@/features/learner/auth/student-auth-context";

export function CoursePrice({
  priceText,
  comparePriceText,
  priceNote,
  pricingType,
  courseOrder,
}: {
  priceText: string;
  comparePriceText: string | null;
  priceNote: string | null;
  pricingType: "free" | "paid";
  courseOrder?: number;
}) {
  const { student } = useStudentAuth();

  return (
    <Card id="support">
      <CardHeader>
        <CardTitle>Học phí</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{priceText}</span>
            {comparePriceText ? <span className="text-muted-foreground line-through">{comparePriceText}</span> : null}
          </div>
          {priceNote && pricingType === "paid" ? (
            <p className="text-xs text-muted-foreground mt-1">{priceNote}</p>
          ) : null}
        </div>

        {pricingType === "paid" && courseOrder ? (
          <Button
            asChild
            size="lg"
            className="w-full"
          >
            <Link href={`/khoa-hoc/${courseOrder}/checkout`}>
              Mua khóa học
            </Link>
          </Button>
        ) : null}

        {pricingType === "free" ? (
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled
          >
            Miễn phí - Đăng ký ở phần "Chương trình học"
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
