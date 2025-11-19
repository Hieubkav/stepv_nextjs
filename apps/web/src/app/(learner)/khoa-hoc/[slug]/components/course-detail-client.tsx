"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { useStudentAuth } from "@/features/learner/auth/student-auth-context";
import { toast } from "sonner";
import { VideoPlayer } from "./video-player";
import { CourseDetails } from "./course-details";
import { CourseCurriculum, type ChapterProgress } from "./course-curriculum";
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
  const { student } = useStudentAuth();
  
  const enrollment = useQuery(
    api.enrollment.getEnrollmentProgress,
    student ? { courseId: course.id as Id<"courses">, userId: student._id } : "skip",
  ) as { exists: boolean; active: boolean } | undefined;
  
  const progressData = useQuery(
    api.progress.getEnrollmentProgress,
    student && enrollment?.exists ? { courseId: course.id as Id<"courses">, studentId: student._id } : "skip",
  ) as { exists: boolean; completionPercentage: number; chaptersProgress: ChapterProgress[] } | undefined;
  
  const hasFullAccess = Boolean(student && enrollment?.exists && enrollment?.active);
  
  const markLessonCompleteMutation = useMutation(api.progress.markLessonComplete);
  const unmarkLessonCompleteMutation = useMutation(api.progress.unmarkLessonComplete);

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

  const handleToggleLessonComplete = async (
    lessonId: Id<"course_lessons">,
    isCompleted: boolean,
  ) => {
    if (!student) return;

    try {
      if (isCompleted) {
        await markLessonCompleteMutation({
          studentId: student._id,
          lessonId,
          courseId: course.id as Id<"courses">,
        });
        toast.success("Bài học đã được đánh dấu hoàn thành");
      } else {
        await unmarkLessonCompleteMutation({
          studentId: student._id,
          lessonId,
          courseId: course.id as Id<"courses">,
        });
        toast.success("Đã bỏ đánh dấu bài học");
      }
    } catch (error) {
      console.error("Error toggling lesson complete:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
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
          completionPercentage={progressData?.completionPercentage}
          chaptersProgress={progressData?.chaptersProgress}
          onToggleLessonComplete={handleToggleLessonComplete}
        />
      </div>
    </>
  );
}
