"use client";

import { Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CourseLesson = {
  id: string;
  title: string;
  durationLabel: string | null;
  isPreview: boolean;
};

type CourseChapter = {
  id: string;
  title: string;
  lessons: CourseLesson[];
};

export function CourseCurriculum({ 
  chapters, 
  summary,
  badges
}: { 
  chapters: CourseChapter[];
  summary: string;
  badges: string[];
}) {
  const lessons = chapters.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({
      id: `${chapter.id}-${lesson.id}`,
      title: lesson.title,
      duration: lesson.durationLabel ?? "00:00",
      chapterTitle: chapter.title,
      isPreview: lesson.isPreview,
    })),
  );

  return (
    <div className="space-y-6">
      {/* Course Actions */}
      <Card>
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
      </Card>

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
          {lessons.length > 0 ? (
            <div className="space-y-1">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className={`w-full border-l-2 p-4 text-left transition-colors hover:bg-muted/50 ${
                    lesson.isPreview ? "border-l-primary bg-primary/5" : "border-l-transparent"
                  }`}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          lesson.isPreview ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Play className="h-3 w-3" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium text-pretty ${
                            lesson.isPreview ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{lesson.chapterTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{lesson.duration}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-sm text-muted-foreground">Chương trình học sẽ được cập nhật sớm.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
