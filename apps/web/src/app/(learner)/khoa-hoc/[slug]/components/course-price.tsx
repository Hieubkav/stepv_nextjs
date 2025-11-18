'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useStudentAuth } from "@/features/learner/auth/student-auth-context";
import { toast } from "sonner";

export function CoursePrice({
  priceText,
  comparePriceText,
  priceNote,
  pricingType,
  courseSlug,
  courseId,
}: {
  priceText: string;
  comparePriceText: string | null;
  priceNote: string | null;
  pricingType: "free" | "paid";
  courseSlug?: string;
  courseId: string;
}) {
  const { student } = useStudentAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const favoriteCheck = useQuery(
    api.students.isCourseFavorited,
    student
      ? {
          studentId: student._id as Id<"students">,
          courseId: courseId as Id<"courses">,
        }
      : "skip"
  );

  const toggleFavoriteMutation = useMutation(api.students.toggleCourseFavorite);

  useEffect(() => {
    if (favoriteCheck?.isFavorite !== undefined) {
      setIsFavorite(favoriteCheck.isFavorite);
    }
  }, [favoriteCheck?.isFavorite]);

  const checkoutHref =
    courseSlug && typeof courseSlug === "string"
      ? { pathname: "/khoa-hoc/checkout", query: { slug: courseSlug } }
      : null;

  async function handleToggleFavorite() {
    if (!student) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleFavoriteMutation({
        studentId: student._id as Id<"students">,
        courseId: courseId as Id<"courses">,
      });

      if (result.ok) {
        setIsFavorite(result.isFavorite);
        toast.success(
          result.isFavorite
            ? "Đã thêm vào danh sách yêu thích"
            : "Đã xóa khỏi danh sách yêu thích"
        );
      }
    } catch (error) {
      toast.error("Không thể cập nhật danh sách yêu thích");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

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

        {pricingType === "paid" && checkoutHref ? (
          <Button
            asChild
            size="lg"
            className="w-full font-semibold"
          >
            <Link href={checkoutHref}>
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

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleToggleFavorite}
          disabled={isLoading}
        >
          <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          {isLoading ? "Cập nhật..." : isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
        </Button>
      </CardContent>
    </Card>
  );
}
