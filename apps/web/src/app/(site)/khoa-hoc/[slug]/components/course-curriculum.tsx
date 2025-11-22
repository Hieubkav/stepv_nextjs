"use client";

import { useState } from "react";
import { Play, Clock, ChevronDown, Unlock, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { CourseLesson, CourseChapter } from "./course-detail-client";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export type ChapterProgress = {
  chapterId: Id<"course_chapters">;
  title: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  lessons: Array<{
    lessonId: Id<"course_lessons">;
    title: string;
    isCompleted: boolean;
    watchedSeconds: number;
    duration: number;
  }>;
};

export function CourseCurriculum({
  chapters,
  summary,
  badges,
  onLessonSelect,
  hasFullAccess = false,
  completionPercentage,
  chaptersProgress,
  onToggleLessonComplete,
}: {
  chapters: CourseChapter[];
  summary: string;
  badges: string[];
  onLessonSelect?: (lesson: CourseLesson) => void;
  hasFullAccess?: boolean;
  completionPercentage?: number;
  chaptersProgress?: ChapterProgress[];
  onToggleLessonComplete?: (lessonId: Id<"course_lessons">, isCompleted: boolean) => void;
}) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    chapters.slice(0, 2).forEach(ch => initial.add(ch.id));
    return initial;
  });
  const [showAllChapters, setShowAllChapters] = useState(false);

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const visibleChapters = showAllChapters ? chapters : chapters.slice(0, 2);
  const hasMoreChapters = chapters.length > 2;

  return (
    <div className="space-y-6">
      {/* Course Actions */}
      {/* <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge} variant="outline">
                {badge}
              </Badge>
            ))}
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg" type="button">
              <Play className="mr-2 h-4 w-4" />
              Đăng ký học ngay
            </Button>
            <Button variant="outline" className="w-full" type="button">
              Thêm vào danh sách
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Course Curriculum */}
      <Card id="curriculum" className="scroll-mt-28 bg-[#0d1220]/80 border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Lộ trình học
          </CardTitle>
          <p className="text-sm text-muted-foreground">{summary || "Nội dung khóa học đang cập nhật."}</p>
          
          {hasFullAccess && completionPercentage !== undefined && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">Tiến độ học tập</span>
                <span className="text-emerald-600 font-semibold">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {chapters.length > 0 ? (
            <div className="space-y-1">
              {visibleChapters.map((chapter) => (
                <div key={chapter.id}>
                  {/* Chapter Header */}
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b"
                    type="button"
                  >
                    <ChevronDown 
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        expandedChapters.has(chapter.id) ? 'rotate-180' : ''
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{chapter.title}</p>
                      <p className="text-xs text-muted-foreground">{chapter.lessons.length} bài học</p>
                    </div>
                  </button>

                  {/* Lessons */}
                  {expandedChapters.has(chapter.id) && (
                    <div className="bg-muted/30">
                      {chapter.lessons.map((lesson) => {
                        const lessonProgress = chaptersProgress
                          ?.find(cp => cp.chapterId === chapter.id)
                          ?.lessons.find(lp => lp.lessonId === lesson.id as Id<"course_lessons">);
                        
                        return (
                          <CurriculumLessonRow
                            key={lesson.id}
                            lesson={lesson}
                            isUnlocked={hasFullAccess || lesson.isPreview}
                            showUnlockedBadge={hasFullAccess && !lesson.isPreview}
                            showCompleteCheckbox={hasFullAccess}
                            isCompleted={lessonProgress?.isCompleted || false}
                            onSelect={onLessonSelect}
                            onToggleComplete={onToggleLessonComplete}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {hasMoreChapters && (
                <button
                  onClick={() => setShowAllChapters(!showAllChapters)}
                  className="w-full flex items-center gap-2 p-4 text-left hover:bg-muted/50 transition-colors border-t border-b"
                  type="button"
                >
                  <ChevronDown 
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      showAllChapters ? 'rotate-180' : ''
                    }`}
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {showAllChapters ? `Ẩn ${chapters.length - 2} chương` : `Xem thêm ${chapters.length - 2} chương`}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="px-4 py-6 text-sm text-muted-foreground">Chương trình học sẽ được cập nhật sớm.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CurriculumLessonRow({
  lesson,
  isUnlocked,
  showUnlockedBadge,
  showCompleteCheckbox,
  isCompleted,
  onSelect,
  onToggleComplete,
}: {
  lesson: CourseLesson;
  isUnlocked: boolean;
  showUnlockedBadge: boolean;
  showCompleteCheckbox?: boolean;
  isCompleted?: boolean;
  onSelect?: (lesson: CourseLesson) => void;
  onToggleComplete?: (lessonId: Id<"course_lessons">, isCompleted: boolean) => void;
}) {
  const handleCheckboxChange = (checked: boolean | string) => {
    if (onToggleComplete && showCompleteCheckbox) {
      const isChecked = typeof checked === "boolean" ? checked : checked === "indeterminate" ? (isCompleted || false) : true;
      onToggleComplete(lesson.id as Id<"course_lessons">, isChecked);
    }
  };

  const isLocked = !isUnlocked && !lesson.isPreview;

  return (
    <div
      className={cn(
        "w-full border-l-4 p-4 text-left transition-colors flex items-center justify-between gap-3",
        isUnlocked
          ? "border-l-primary hover:bg-primary/5"
          : "border-l-muted text-muted-foreground opacity-60",
      )}
    >
      {showCompleteCheckbox ? (
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Checkbox
            checked={isCompleted || false}
            onCheckedChange={handleCheckboxChange}
            className="flex-shrink-0"
          />
          <button
            onClick={() => isUnlocked && onSelect?.(lesson)}
            disabled={!isUnlocked}
            className={cn(
              "flex-1 flex items-center gap-2 min-w-0 text-left",
              isUnlocked ? "cursor-pointer" : "cursor-not-allowed",
            )}
            type="button"
          >
            <div className="min-w-0 flex items-center gap-2">
              <p className={cn("text-sm font-medium text-pretty truncate", isUnlocked ? "text-foreground" : "")}>
                {lesson.title}
              </p>
              {showUnlockedBadge ? (
                <Badge variant="outline" className="hidden sm:flex items-center gap-1 bg-emerald-100 text-emerald-800">
                  <Unlock className="h-3 w-3" />
                  Đã mở
                </Badge>
              ) : null}
            </div>
          </button>
        </div>
      ) : (
        <button
          onClick={() => isUnlocked && onSelect?.(lesson)}
          disabled={!isUnlocked}
          className={cn(
            "flex-1 flex items-center gap-2 min-w-0",
            isUnlocked ? "cursor-pointer" : "cursor-not-allowed",
          )}
          type="button"
        >
          <div className="flex-shrink-0">
            {isLocked ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <div
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full",
                  isUnlocked ? "bg-primary" : "bg-muted",
                )}
              >
                <Play className="h-2 w-2 text-primary-foreground" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex items-center gap-2">
            <p className={cn("text-sm font-medium text-pretty truncate", isUnlocked ? "text-foreground" : "")}>
              {lesson.title}
            </p>
            {showUnlockedBadge ? (
              <Badge variant="outline" className="hidden sm:flex items-center gap-1 bg-emerald-100 text-emerald-800">
                <Unlock className="h-3 w-3" />
                Đã mở
              </Badge>
            ) : null}
          </div>
        </button>
      )}
      
      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
        <Clock className="h-3 w-3" />
        <span>{lesson.durationLabel ?? "00:00"}</span>
      </div>
    </div>
  );
}
