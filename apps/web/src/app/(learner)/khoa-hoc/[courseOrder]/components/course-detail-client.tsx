"use client";

import { useState } from "react";
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
}) {
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);

  const handleLessonSelect = (lesson: CourseLesson) => {
    setSelectedLesson(lesson);
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
            id: selectedLesson.youtubeUrl || "",
            title: selectedLesson.title,
            durationLabel: selectedLesson.durationLabel,
          } : null}
          courseId={course.id}
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
          courseOrder={course.order}
        />
        <CourseCurriculum chapters={chapters} summary={curriculumSummary} badges={badges} onLessonSelect={handleLessonSelect} />
      </div>
    </>
  );
}
