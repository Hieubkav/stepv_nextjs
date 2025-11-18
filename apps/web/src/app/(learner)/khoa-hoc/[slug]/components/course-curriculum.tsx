"use client";

import { useState } from "react";
import { Play, Clock, ChevronDown, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CourseLesson, CourseChapter } from "./course-detail-client";
import { cn } from "@/lib/utils";

export function CourseCurriculum({
  chapters,
  summary,
  badges,
  onLessonSelect,
  hasFullAccess = false,
}: {
  chapters: CourseChapter[];
  summary: string;
  badges: string[];
  onLessonSelect?: (lesson: CourseLesson) => void;
  hasFullAccess?: boolean;
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
      <Card id="curriculum">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Lộ trình học
          </CardTitle>
          <p className="text-sm text-muted-foreground">{summary || "Nội dung khóa học đang cập nhật."}</p>
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
                      {chapter.lessons.map((lesson) => (
                        <CurriculumLessonRow
                          key={lesson.id}
                          lesson={lesson}
                          isUnlocked={hasFullAccess || lesson.isPreview}
                          showUnlockedBadge={hasFullAccess && !lesson.isPreview}
                          onSelect={onLessonSelect}
                        />
                      ))}
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
  onSelect,
}: {
  lesson: CourseLesson;
  isUnlocked: boolean;
  showUnlockedBadge: boolean;
  onSelect?: (lesson: CourseLesson) => void;
}) {
  return (
    <button
      onClick={() => isUnlocked && onSelect?.(lesson)}
      disabled={!isUnlocked}
      className={cn(
        "w-full border-l-4 p-4 text-left transition-colors",
        isUnlocked
          ? "border-l-primary hover:bg-primary/5 cursor-pointer"
          : "border-l-muted text-muted-foreground opacity-60 cursor-not-allowed",
      )}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0",
              isUnlocked ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            <Play className="h-2.5 w-2.5" />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <p className={cn("text-sm font-medium text-pretty truncate", isUnlocked ? "text-foreground" : "")}>
              {lesson.title}
            </p>
            {showUnlockedBadge ? (
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1 bg-emerald-100 text-emerald-800">
                <Unlock className="h-3 w-3" />
                Đã mở
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
          <Clock className="h-3 w-3" />
          <span>{lesson.durationLabel ?? "00:00"}</span>
        </div>
      </div>
    </button>
  );
}
