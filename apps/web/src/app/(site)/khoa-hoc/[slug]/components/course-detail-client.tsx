"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { useCustomerAuth } from "@/features/auth";
import { VideoPlayer } from "./video-player";
import { CourseDetails } from "./course-details";
import { CourseCurriculum } from "./course-curriculum";
import { CourseHighlights } from "./course-highlights";
import { CoursePrice } from "./course-price";

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

  const purchase = useQuery(
    api.purchases.getPurchase,
    customer ? { customerId: customer._id as Id<"customers">, productType: "course", productId: course.id } : "skip",
  ) as { _id: Id<"customer_purchases">; progressPercent?: number } | null | undefined;

  const hasFullAccess = course.pricingType === "free" || Boolean(customer && purchase);

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
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
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
        />
        <CourseCurriculum
          chapters={chapters}
          summary={curriculumSummary}
          badges={badges}
          onLessonSelect={handleLessonSelect}
          hasFullAccess={hasFullAccess}
          completionPercentage={purchase?.progressPercent}
        />
      </div>
    </>
  );
}
