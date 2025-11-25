"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { useCustomerAuth } from "@/features/auth";
import { VideoPlayer } from "./video-player";
import { CourseDetails } from "./course-details";
import { CourseCurriculum } from "./course-curriculum";
import { CourseHighlights } from "./course-highlights";
import { CoursePrice } from "./course-price";
import { useToast } from "@/hooks/use-toast";
import type { ChapterProgress } from "./course-curriculum";

export type CourseLesson = {
  id: string;
  title: string;
  description: string | null;
  durationSeconds: number | null;
  durationLabel: string | null;
  isPreview: boolean;
  active: boolean;
  order: number;
  videoType?: "youtube" | "drive" | "none";
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  exerciseLink?: string | null;
};

export type CourseChapter = {
  id: string;
  title: string;
  summary: string | null;
  order: number;
  active: boolean;
  lessons: CourseLesson[];
};

export type CourseSummary = {
  id: string;
  order: number;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  pricingType: "free" | "paid";
  priceAmount: number | null;
  priceNote: string | null;
  isPriceVisible: boolean;
  active: boolean;
};

type ThumbnailInfo = {
  url?: string;
  title?: string | null;
};

export function CourseDetailClient({
  course,
  chapters,
  thumbnail,
  introVideoUrl,
  totalDurationText,
  priceText,
  comparePriceText,
  descriptionBody,
  heroStats,
  features,
  curriculumSummary,
  badges,
  heroDescription,
  courseId,
}: {
  course: CourseSummary;
  chapters: CourseChapter[];
  thumbnail: ThumbnailInfo | null;
  introVideoUrl: string | null;
  totalDurationText: string | null;
  priceText: string;
  comparePriceText: string | null;
  descriptionBody: string;
  heroStats: Array<{ label: string; value: string }>;
  features: string[];
  curriculumSummary: string;
  badges: string[];
  heroDescription: string;
  courseId: string;
}) {
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const { customer } = useCustomerAuth();
  const { toast } = useToast();
  const [optimisticProgress, setOptimisticProgress] = useState<ChapterProgress[] | undefined>(undefined);
  const hasEnsuredEnrollment = useRef(false);

  const ensureEnrollment = useMutation(api.courses.upsertEnrollment);
  const markLessonComplete = useMutation(api.progress.markLessonComplete);
  const unmarkLessonComplete = useMutation(api.progress.unmarkLessonComplete);

  const purchase = useQuery(
    api.purchases.getPurchase,
    customer ? { customerId: customer._id as Id<"customers">, productType: "course", productId: course.id } : "skip",
  ) as { _id: Id<"customer_purchases">; progressPercent?: number } | null | undefined;
  const productLock = useQuery(
    api.orders.getProductLockStatus,
    customer
      ? ({
          customerId: customer._id as Id<"customers">,
          productType: "course",
          productId: course.id,
        } as const)
      : "skip",
  ) as
    | {
        hasPurchased: boolean;
        hasActiveOrder: boolean;
        activeOrderStatus: string | null;
        activeOrderNumber: string | null;
      }
    | null
    | undefined;

  const hasFullAccess = course.pricingType === "free" || Boolean(customer && purchase);
  const hasActiveOrder = Boolean(productLock?.hasActiveOrder);

  useEffect(() => {
    if (!hasFullAccess) {
      setOptimisticProgress(undefined);
      hasEnsuredEnrollment.current = false;
    }
  }, [hasFullAccess]);

  useEffect(() => {
    if (!hasFullAccess || !customer || hasEnsuredEnrollment.current) return;
    hasEnsuredEnrollment.current = true;
    ensureEnrollment({
      courseId: course.id as Id<"courses">,
      userId: customer._id as string,
      active: true,
    }).catch((error) => {
      console.error("Khong the khoi tao enrollment", error);
      hasEnsuredEnrollment.current = false;
    });
  }, [hasFullAccess, customer, course.id, ensureEnrollment]);

  const enrollmentProgress = useQuery(
    api.progress.getEnrollmentProgress,
    hasFullAccess && customer
      ? ({ courseId: course.id as Id<"courses">, studentId: customer._id as string } as const)
      : "skip",
  ) as
    | {
        exists: boolean;
        completionPercentage: number;
        chaptersProgress: ChapterProgress[];
      }
    | null
    | undefined;

  useEffect(() => {
    if (enrollmentProgress?.chaptersProgress) {
      setOptimisticProgress(enrollmentProgress.chaptersProgress);
    }
  }, [enrollmentProgress?.chaptersProgress]);

  useEffect(() => {
    if (selectedLesson && !hasFullAccess && !selectedLesson.isPreview) {
      setSelectedLesson(null);
    }
  }, [hasFullAccess, selectedLesson]);

  const handleLessonSelect = (lesson: CourseLesson) => {
    if (hasFullAccess || lesson.isPreview) {
      setSelectedLesson(lesson);
    }
  };

  const handleClearSelection = () => {
    setSelectedLesson(null);
  };

  const updateLocalProgress = (lessonId: Id<"course_lessons">, isCompleted: boolean) => {
    setOptimisticProgress((prev) => {
      const source = prev ?? enrollmentProgress?.chaptersProgress;
      if (!source) return source;
      return source.map((chapter) => {
        const lessons = chapter.lessons.map((lesson) =>
          lesson.lessonId === lessonId ? { ...lesson, isCompleted } : lesson,
        );
        const completedLessons = lessons.filter((lesson) => lesson.isCompleted).length;
        return {
          ...chapter,
          lessons,
          completedLessons,
          percentage: lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0,
        };
      });
    });
  };

  const handleToggleLessonComplete = async (lessonId: Id<"course_lessons">, isCompleted: boolean) => {
    if (!hasFullAccess || !customer) {
      toast({ title: "C\u1ea7n \u0111\u0103ng nh\u1eadp", description: "H\u00e3y \u0111\u0103ng nh\u1eadp ho\u1eb7c mua kh\u00f3a h\u1ecdc \u0111\u1ec3 \u0111\u00e1nh d\u1ea5u ti\u1ebfn \u0111\u1ed9.", variant: "destructive" });
      return;
    }
    updateLocalProgress(lessonId, isCompleted);
    const payload = { studentId: customer._id as string, lessonId, courseId: course.id as Id<"courses"> };
    try {
      const mutation = isCompleted ? markLessonComplete : unmarkLessonComplete;
      await mutation(payload);
    } catch (error) {
      console.error("Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt ti\u1ebfn \u0111\u1ed9 b\u00e0i h\u1ecdc", error);
      toast({ title: "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt", description: error instanceof Error ? error.message : "Vui l\u00f2ng th\u1eed l\u1ea1i sau.", variant: "destructive" });
      setOptimisticProgress(enrollmentProgress?.chaptersProgress);
    }
  };

  const curriculumProgress = optimisticProgress ?? enrollmentProgress?.chaptersProgress;

  const completionPercentage = useMemo(() => {
    if (curriculumProgress && curriculumProgress.length > 0) {
      const totals = curriculumProgress.reduce(
        (acc, chapter) => {
          acc.completed += chapter.completedLessons;
          acc.total += chapter.totalLessons;
          return acc;
        },
        { completed: 0, total: 0 },
      );
      if (totals.total > 0) {
        return Math.round((totals.completed / totals.total) * 100);
      }
      return 0;
    }
    if (enrollmentProgress?.completionPercentage !== undefined) {
      return enrollmentProgress.completionPercentage;
    }
    return purchase?.progressPercent;
  }, [curriculumProgress, enrollmentProgress?.completionPercentage, purchase?.progressPercent]);

  return (
    <>
      <div className="space-y-8 lg:col-span-2">
        <VideoPlayer
          thumbnail={thumbnail}
          totalDurationText={selectedLesson ? selectedLesson.durationLabel : totalDurationText}
          introVideoUrl={introVideoUrl}
          selectedLesson={selectedLesson ? {
            id: selectedLesson.id,
            title: selectedLesson.title,
            durationLabel: selectedLesson.durationLabel,
            videoType: selectedLesson.videoType,
            videoUrl: selectedLesson.videoUrl,
            youtubeUrl: selectedLesson.youtubeUrl,
          } : null}
        />
        
        {selectedLesson && (
          <div className="flex justify-center">
            <button
              onClick={handleClearSelection}
              className="px-4 py-2 text-sm font-medium text-slate-400 underline underline-offset-4 transition-colors hover:text-amber-200"
              type="button"
            >
              Quay lại video giới thiệu
            </button>
          </div>
        )}

        {selectedLesson ? (
          <CourseDetails
            title={selectedLesson.title}
            subtitle={null}
            description={selectedLesson.description || "Chưa có mô tả cho bài học này."}
            exerciseLink={selectedLesson.exerciseLink}
          />
        ) : (
          <>
            <CourseDetails
              title={course.title}
              subtitle={course.subtitle}
              description={descriptionBody}
            />
            <CourseHighlights stats={heroStats} features={features} curriculumSummary={curriculumSummary} />
          </>
        )}
      </div>
      <div className="space-y-6">
        <CoursePrice
          priceText={priceText}
          comparePriceText={comparePriceText}
          priceNote={course.priceNote}
          pricingType={course.pricingType}
          priceAmount={course.priceAmount ?? 0}
          courseTitle={course.title}
          courseSlug={course.slug}
          courseId={courseId}
          hasFullAccess={hasFullAccess}
          thumbnailUrl={thumbnail?.url}
          hasActiveOrder={hasActiveOrder}
          pendingOrderLabel={
            productLock?.activeOrderNumber
              ? `${productLock.activeOrderNumber} (${productLock.activeOrderStatus ?? "pending"})`
              : null
          }
        />
        <CourseCurriculum
          chapters={chapters}
          summary={curriculumSummary}
          badges={badges}
          onLessonSelect={handleLessonSelect}
          hasFullAccess={hasFullAccess}
          completionPercentage={completionPercentage}
          chaptersProgress={curriculumProgress}
          onToggleLessonComplete={handleToggleLessonComplete}
        />
      </div>
    </>
  );
}
