"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { useStudentAuth } from "@/features/learner/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ExternalLink, Lock } from "lucide-react";

type CourseDoc = {
  _id: Id<'courses'>;
  slug: string;
  title: string;
};

type ChapterDoc = {
  _id: Id<'course_chapters'>;
  courseId: Id<'courses'>;
  title: string;
  order: number;
};

type LessonDoc = {
  _id: Id<'course_lessons'>;
  courseId: Id<'courses'>;
  chapterId: Id<'course_chapters'>;
  title: string;
  description?: string;
  youtubeUrl: string;
  durationSeconds?: number;
  isPreview?: boolean;
  exerciseLink?: string;
  order: number;
  active: boolean;
};

type LearnerCourseDetail = {
  course: CourseDoc;
  chapters: Array<ChapterDoc & { lessons: LessonDoc[] }>;
  progress: {
    totalLessons: number;
    completedLessons: number;
    percent: number;
    nextLesson: LessonDoc | null;
    lastLesson: LessonDoc | null;
    firstLesson: LessonDoc | null;
  };
};

type PublicCourseDetail = {
  course: CourseDoc;
  chapters: Array<ChapterDoc & { lessons: LessonDoc[] }>;
};

type CoursePath = `/khoa-hoc/${string}`;
type LessonPath = `/khoa-hoc/${string}/chuong/${string}/bai/${string}`;

type LessonPlayerScreenProps = {
  courseSlug: string;
  chapterId: string;
  lessonId: string;
};

export function LessonPlayerScreen({ courseSlug, lessonId }: LessonPlayerScreenProps) {
  const { student } = useStudentAuth();
  const recordProgress = useMutation(api.courses.recordLessonProgress);
  const [hasRecorded, setHasRecorded] = useState(false);

  const learnerDetail = useQuery(
    api.courses.getLearnerCourseDetail,
    student
      ? {
          userId: String(student._id),
          slug: courseSlug,
        }
      : ('skip' as const),
  ) as LearnerCourseDetail | null | undefined;

  const publicDetail = useQuery(api.courses.getCourseDetail, { slug: courseSlug }) as PublicCourseDetail | null | undefined;

  if (student) {
    if (learnerDetail === undefined || publicDetail === undefined) {
      return <LessonSkeleton />;
    }
    if (learnerDetail === null) {
      if (!publicDetail) {
        return <LessonNotFound />;
      }
      return <GuestLessonView detail={publicDetail} lessonId={lessonId} status="notEnrolled" />;
    }
    return (
      <LearnerLessonView
        detail={learnerDetail}
        lessonId={lessonId}
        recordProgress={recordProgress}
        hasRecorded={hasRecorded}
        setHasRecorded={setHasRecorded}
        studentId={String(student._id)}
      />
    );
  }

  if (publicDetail === undefined) {
    return <LessonSkeleton />;
  }
  if (publicDetail === null) {
    return <LessonNotFound />;
  }
  return <GuestLessonView detail={publicDetail} lessonId={lessonId} />;
}

type LearnerLessonViewProps = {
  detail: LearnerCourseDetail;
  lessonId: string;
  recordProgress: ReturnType<typeof useMutation<typeof api.courses.recordLessonProgress>>;
  hasRecorded: boolean;
  setHasRecorded: (value: boolean) => void;
  studentId: string;
};

function LearnerLessonView({
  detail,
  lessonId,
  recordProgress,
  hasRecorded,
  setHasRecorded,
  studentId,
}: LearnerLessonViewProps) {
  useEffect(() => {
    setHasRecorded(false);
  }, [lessonId, setHasRecorded]);

  const flattened = useMemo(() => {
    const entries: Array<{
      lesson: LessonDoc;
      chapter: ChapterDoc & { lessons: LessonDoc[] };
      index: number;
    }> = [];
    detail.chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        entries.push({ lesson, chapter, index: entries.length });
      });
    });
    return entries;
  }, [detail.chapters]);

  const currentEntry = useMemo(() => {
    return flattened.find((entry) => String(entry.lesson._id) === lessonId) ?? null;
  }, [flattened, lessonId]);

  useEffect(() => {
    if (!currentEntry || hasRecorded) return;
    const run = async () => {
      try {
        await recordProgress({
          courseId: detail.course._id,
          userId: studentId,
          lessonId: currentEntry.lesson._id,
        });
        setHasRecorded(true);
      } catch (error) {
        console.warn('Khong the cap nhat tien do', error);
      }
    };
    void run();
  }, [currentEntry, detail.course._id, hasRecorded, recordProgress, setHasRecorded, studentId]);

  if (!currentEntry) {
    return <LessonNotFound />;
  }

  const handleMarkCompleted = async () => {
    try {
      await recordProgress({
        courseId: detail.course._id,
        userId: studentId,
        lessonId: currentEntry.lesson._id,
      });
      setHasRecorded(true);
    } catch (error) {
      console.warn('Khong the cap nhat tien do', error);
    }
  };

  const currentIndex = currentEntry.index;
  const totalLessons = flattened.length;
  const previousEntry = currentIndex > 0 ? flattened[currentIndex - 1] : null;
  const nextEntry = currentIndex < flattened.length - 1 ? flattened[currentIndex + 1] : null;
  const embedUrl = getYoutubeEmbedUrl(currentEntry.lesson.youtubeUrl);

  return (
    <LessonLayout
      courseSlug={detail.course.slug}
      courseTitle={detail.course.title}
      currentLesson={currentEntry}
      previousEntry={previousEntry}
      nextEntry={nextEntry}
      totalLessons={totalLessons}
      currentIndex={currentIndex}
      embedUrl={embedUrl}
      lessonDescription={currentEntry.lesson.description}
      lessonDurationSeconds={currentEntry.lesson.durationSeconds}
      exerciseLink={currentEntry.lesson.exerciseLink}
      onMarkCompleted={handleMarkCompleted}
    />
  );
}

type GuestLessonViewProps = {
  detail: PublicCourseDetail;
  lessonId: string;
  status?: "guest" | "notEnrolled";
};

function GuestLessonView({ detail, lessonId, status = "guest" }: GuestLessonViewProps) {
  const flattened = useMemo(() => {
    const entries: Array<{
      lesson: LessonDoc;
      chapter: ChapterDoc & { lessons: LessonDoc[] };
      index: number;
    }> = [];
    detail.chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        entries.push({ lesson, chapter, index: entries.length });
      });
    });
    return entries;
  }, [detail.chapters]);

  const currentEntry = useMemo(() => {
    return flattened.find((entry) => String(entry.lesson._id) === lessonId) ?? null;
  }, [flattened, lessonId]);

  if (!currentEntry) {
    return <LessonNotFound />;
  }

  if (!currentEntry.lesson.isPreview) {
    return (
      <Card className="border-dashed text-center shadow-none">
        <CardHeader>
          <CardTitle>Can dang nhap</CardTitle>
          <CardDescription>
            Bai hoc nay chi danh cho hoc vien. Vui long dang nhap tai <Link href="/khoa-hoc" className="underline">/khoa-hoc</Link> de tiep tuc.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/khoa-hoc">
              <Lock className="mr-2 h-4 w-4" /> Dang nhap de mo khoa
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const previewEntries = flattened.filter((entry) => entry.lesson.isPreview);
  const previewIndex = previewEntries.findIndex((entry) => entry.lesson._id === currentEntry.lesson._id);
  const previousEntry = previewIndex > 0 ? previewEntries[previewIndex - 1] : null;
  const nextEntry = previewIndex >= 0 && previewIndex < previewEntries.length - 1 ? previewEntries[previewIndex + 1] : null;
  const embedUrl = getYoutubeEmbedUrl(currentEntry.lesson.youtubeUrl);

  return (
    <LessonLayout
      courseSlug={detail.course.slug}
      courseTitle={detail.course.title}
      currentLesson={currentEntry}
      previousEntry={previousEntry}
      nextEntry={nextEntry}
      totalLessons={previewEntries.length}
      currentIndex={previewIndex}
      embedUrl={embedUrl}
      lessonDescription={currentEntry.lesson.description}
      lessonDurationSeconds={currentEntry.lesson.durationSeconds}
      exerciseLink={currentEntry.lesson.exerciseLink}
      previewMode
    />
  );
}

type LessonEntry = {
  lesson: LessonDoc;
  chapter: ChapterDoc & { lessons: LessonDoc[] };
};

type LessonLayoutProps = {
  courseSlug: string;
  courseTitle: string;
  currentLesson: LessonEntry;
  previousEntry: LessonEntry | null;
  nextEntry: LessonEntry | null;
  totalLessons: number;
  currentIndex: number;
  embedUrl: string;
  lessonDescription?: string;
  lessonDurationSeconds?: number;
  exerciseLink?: string;
  previewMode?: boolean;
  onMarkCompleted?: () => void;
};

function LessonLayout({
  courseSlug,
  courseTitle,
  currentLesson,
  previousEntry,
  nextEntry,
  totalLessons,
  currentIndex,
  embedUrl,
  lessonDescription,
  lessonDurationSeconds,
  exerciseLink,
  previewMode = false,
  onMarkCompleted,
}: LessonLayoutProps) {
  const courseHref: CoursePath = `/khoa-hoc/${courseSlug}`;
  const previousHref: LessonPath | null = previousEntry
    ? `/khoa-hoc/${courseSlug}/chuong/${previousEntry.lesson.chapterId}/bai/${previousEntry.lesson._id}`
    : null;
  const nextHref: LessonPath | null = nextEntry
    ? `/khoa-hoc/${courseSlug}/chuong/${nextEntry.lesson.chapterId}/bai/${nextEntry.lesson._id}`
    : null;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/khoa-hoc" className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Danh sach khoa hoc
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href={courseHref} className="hover:text-foreground">
          {courseTitle}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">{currentLesson.lesson.title}</span>
      </nav>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold">{currentLesson.lesson.title}</CardTitle>
          <CardDescription>{currentLesson.chapter.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              src={embedUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={currentLesson.lesson.title}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge className="bg-muted text-foreground">
              Bai {currentIndex + 1} / {totalLessons}
            </Badge>
            {lessonDurationSeconds && (
              <Badge variant="outline">~{Math.round(lessonDurationSeconds / 60)} phut</Badge>
            )}
            {previewMode && <Badge className="bg-muted text-foreground">Preview</Badge>}
          </div>

          {lessonDescription && (
            <div className="space-y-2 text-sm text-muted-foreground">
              {lessonDescription.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}

          {exerciseLink && (
            <Button asChild variant="outline" className="gap-2">
              <a href={exerciseLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> Tai lieu / Bai tap
              </a>
            </Button>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {!previewMode && onMarkCompleted && (
              <Button variant="secondary" className="gap-2" onClick={onMarkCompleted}>
                <CheckCircle2 className="h-4 w-4" /> Da hoan thanh bai nay
              </Button>
            )}
            <Separator orientation="vertical" className="hidden h-6 sm:block" />
            <div className="flex flex-1 flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                {currentIndex + 1} / {totalLessons} bai
              </span>
              <span>•</span>
              <span>{currentLesson.chapter.title}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {previousEntry ? (
              <Button asChild variant="outline" className="gap-2">
                <Link href={previousHref!}>
                  <ArrowLeft className="h-4 w-4" />
                  Bai truoc
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {nextEntry ? (
              <Button asChild className="gap-2">
                <Link href={nextHref!}>
                  Bai tiep theo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Badge className="bg-muted text-foreground gap-2">
                <BookOpen className="h-4 w-4" /> Ban da hoan thanh tat ca bai hoc!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getYoutubeEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return url;
      }
    }
    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    return url;
  } catch {
    return url;
  }
}

function LessonNotFound() {
  return (
    <Card className="border-dashed text-center shadow-none">
      <CardHeader>
        <CardTitle>Khong tim thay bai hoc</CardTitle>
        <CardDescription>
          Kiem tra lai duong dan hoac quay ve trang khoa hoc.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/khoa-hoc">
            <ArrowLeft className="h-4 w-4" /> Quay ve khoa hoc
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LessonSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-40" />
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}





