"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { useStudentAuth } from "@/features/learner/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Lock,
  PlayCircle as PlayCircleIcon,
} from "lucide-react";

type CourseDoc = {
  _id: Id<'courses'>;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  introVideoUrl?: string;
  thumbnailMediaId?: Id<'media'>;
  pricingType: 'free' | 'paid';
  priceAmount?: number;
  priceNote?: string;
  isPriceVisible: boolean;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

type ChapterDoc = {
  _id: Id<'course_chapters'>;
  courseId: Id<'courses'>;
  title: string;
  summary?: string;
  order: number;
  active: boolean;
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

const COURSE_CONTAINER_CLASS = "mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pb-16 pt-32";

function CoursePageShell({ children }: { children: ReactNode }) {
  return <div className={COURSE_CONTAINER_CLASS}>{children}</div>;
}

type EnrollmentDoc = {
  _id: Id<'course_enrollments'>;
  courseId: Id<'courses'>;
  userId: string;
  enrolledAt: number;
  progressPercent?: number;
  lastViewedLessonId?: Id<'course_lessons'>;
  order: number;
  active: boolean;
};

type LearnerCourseDetail = {
  course: CourseDoc;
  chapters: Array<ChapterDoc & { lessons: LessonDoc[] }>;
  enrollment: EnrollmentDoc;
  progress: {
    totalLessons: number;
    completedLessons: number;
    percent: number;
    lastLesson: LessonDoc | null;
    nextLesson: LessonDoc | null;
    firstLesson: LessonDoc | null;
  };
};

type PublicCourseDetail = {
  course: CourseDoc;
  chapters: Array<ChapterDoc & { lessons: LessonDoc[] }>;
};

type CoursePath = `/khoa-hoc/${string}`;
type LessonPath = `/khoa-hoc/${string}/chuong/${string}/bai/${string}`;

type CourseDetailScreenProps = {
  courseSlug: string;
};

export function CourseDetailScreen({ courseSlug }: CourseDetailScreenProps) {
  const { student } = useStudentAuth();

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
      return (
        <CoursePageShell>
          <CourseDetailSkeleton />
        </CoursePageShell>
      );
    }
    if (learnerDetail === null) {
      if (!publicDetail) {
        return (
          <CoursePageShell>
            <NoCourseAccess />
          </CoursePageShell>
        );
      }
      return (
        <CoursePageShell>
          <GuestCourseDetailView detail={publicDetail} status="notEnrolled" />
        </CoursePageShell>
      );
    }
    return (
      <CoursePageShell>
        <LearnerCourseDetailView detail={learnerDetail} />
      </CoursePageShell>
    );
  }

  if (publicDetail === undefined) {
    return (
      <CoursePageShell>
        <CourseDetailSkeleton />
      </CoursePageShell>
    );
  }
  if (publicDetail === null) {
    return (
      <CoursePageShell>
        <GuestCourseNotFound />
      </CoursePageShell>
    );
  }
  return (
    <CoursePageShell>
      <GuestCourseDetailView detail={publicDetail} />
    </CoursePageShell>
  );
}

type LearnerCourseDetailViewProps = {
  detail: LearnerCourseDetail;
};

function LearnerCourseDetailView({ detail }: LearnerCourseDetailViewProps) {
  const flattened = useMemo(() => {
    const entries: Array<{ lesson: LessonDoc; chapter: ChapterDoc & { lessons: LessonDoc[] }; index: number }> = [];
    detail.chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        entries.push({ lesson, chapter, index: entries.length });
      });
    });
    return entries;
  }, [detail.chapters]);

  const detailHref: CoursePath = `/khoa-hoc/${detail.course.slug}`;
  const continueLesson = detail.progress.nextLesson ?? detail.progress.firstLesson ?? flattened[0]?.lesson ?? null;
  const continueHref: LessonPath | CoursePath = continueLesson
    ? `/khoa-hoc/${detail.course.slug}/chuong/${continueLesson.chapterId}/bai/${continueLesson._id}`
    : detailHref;
  const lastLesson = detail.progress.lastLesson;
  const lastLessonHref: LessonPath | null = lastLesson
    ? `/khoa-hoc/${detail.course.slug}/chuong/${lastLesson.chapterId}/bai/${lastLesson._id}`
    : null;

  const progressValue = Math.min(100, Math.max(0, detail.progress.percent ?? 0));
  const updatedAtLabel = formatDate(detail.course.updatedAt);

  const heroStats = [
    { label: 'Chương', value: detail.chapters.length },
    { label: 'Bài học', value: flattened.length },
    { label: 'Hoàn thành', value: `${progressValue}%` },
  ];
  const isNotEnrolled = status === "notEnrolled";

  return (
    <div className="space-y-12">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0b0b] via-[#1a1207] to-[#32200f] p-8 text-white shadow-2xl ring-1 ring-amber-500/40">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-200/80">
              <span>DOHY Academy</span>
              <span className="inline-flex h-1 w-1 rounded-full bg-amber-300" />
              <span>{detail.course.pricingType === 'free' ? 'Miễn phí' : 'Premium'}</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{detail.course.title}</h1>
              {detail.course.subtitle && (
                <p className="text-lg text-amber-100/90">{detail.course.subtitle}</p>
              )}
              {detail.course.description && (
                <p className="max-w-3xl text-sm leading-relaxed text-amber-50/80 line-clamp-4">
                  {detail.course.description}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-amber-400/30 bg-white/5 p-4 shadow-inner backdrop-blur"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">
                    {stat.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full max-w-sm space-y-5 rounded-2xl border border-white/15 bg-black/50 p-6 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                <span>Tiến độ</span>
                <span>{progressValue}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-200"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              <div className="text-xs text-white/70">
                Hoàn thành {detail.progress.completedLessons}/{detail.progress.totalLessons} bài học
              </div>
            </div>
            <Button
              asChild
              className="w-full gap-2 bg-amber-400 text-black shadow-lg shadow-amber-500/30 hover:bg-amber-300"
            >
              <Link href={continueHref}>
                <PlayCircleIcon className="h-4 w-4" />
                {progressValue === 0 ? 'Bắt đầu học ngay' : progressValue === 100 ? 'Ôn luyện lại khóa học' : 'Tiếp tục học'}
              </Link>
            </Button>
            {lastLessonHref && (
              <Button
                asChild
                variant="outline"
                className="w-full border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href={lastLessonHref}>Xem lại bài gần nhất</Link>
              </Button>
            )}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              <div className="font-semibold text-white">Lần cập nhật gần nhất</div>
              <div>{updatedAtLabel}</div>
              {lastLesson && (
                <div className="mt-2 space-y-1">
                  <div className="font-semibold text-white">Đang học</div>
                  <div className="text-white/80">{lastLesson.title}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          {detail.course.description && (
            <section className="rounded-2xl border border-white/10 bg-background/80 p-6 shadow-xl backdrop-blur">
              <h2 className="text-lg font-semibold text-foreground">Bạn sẽ học được gì?</h2>
              <Separator className="my-4" />
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {detail.course.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-white/10 bg-background/80 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Chương trình học</h2>
                <p className="text-sm text-muted-foreground">
                  Theo dõi lộ trình chi tiết, mỗi bài học đều mở khóa sau khi hoàn thành bài trước.
                </p>
              </div>
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-200">
                {flattened.length} bài học
              </Badge>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              {detail.chapters.map((chapter) => {
                const chapterLessons = chapter.lessons;
                return (
                  <div
                    key={String(chapter._id)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{chapter.title}</h3>
                        {chapter.summary && (
                          <p className="text-sm text-muted-foreground">{chapter.summary}</p>
                        )}
                      </div>
                      <Badge variant="outline">{chapterLessons.length} bài</Badge>
                    </div>
                    <div className="mt-4 space-y-2">
                      {chapterLessons.map((lesson) => {
                        const lessonIndex = flattened.findIndex((entry) => entry.lesson._id === lesson._id);
                        const completed = lessonIndex >= 0 && lessonIndex < detail.progress.completedLessons;
                        const isCurrent = detail.progress.lastLesson?._id === lesson._id;
                        const isNext = detail.progress.nextLesson?._id === lesson._id;
                        const lessonHref: LessonPath = `/khoa-hoc/${detail.course.slug}/chuong/${lesson.chapterId}/bai/${lesson._id}`;

                        return (
                          <Link
                            key={String(lesson._id)}
                            href={lessonHref}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border border-white/5 bg-background/60 px-4 py-3 text-sm shadow-sm transition hover:border-amber-300/60 hover:bg-amber-50/50 dark:hover:bg-white/10",
                              completed && "border-amber-400/60 bg-amber-400/10",
                              isNext && !completed && "border-amber-400 bg-amber-400/15",
                            )}
                          >
                            <LessonStatus completed={completed} current={isCurrent} upcoming={isNext && !completed} />
                            <div className="flex-1 space-y-1">
                              <div className="font-medium text-foreground">{lesson.title}</div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                {lesson.durationSeconds && (
                                  <span>
                                    <Clock className="mr-1 inline h-3 w-3" />
                                    {formatDuration(lesson.durationSeconds)}
                                  </span>
                                )}
                                {lesson.isPreview && (
                                  <Badge className="bg-amber-400/20 text-amber-700 dark:text-amber-200">Preview
                                  </Badge>
                                )}
                              </div>
                              {lesson.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{lesson.description}</p>
                              )}
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <Card className="rounded-2xl border border-white/10 bg-background/80 shadow-xl backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Thông tin khóa học</CardTitle>
              <CardDescription>Trạng thái truy cập và thông tin quan trọng.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <InfoRow label="Trạng thái" value={detail.course.active ? 'Đang mở' : 'Đã ẩn'} />
              <InfoRow label="Loại khóa" value={detail.course.pricingType === 'free' ? 'Miễn phí' : 'Có phí'} />
              {detail.course.priceNote && <InfoRow label="Ghi chú" value={detail.course.priceNote} />}
              <InfoRow label="Đã kích hoạt" value={formatDate(detail.enrollment.enrolledAt)} />
              <InfoRow label="Cập nhật" value={updatedAtLabel} />
              {detail.progress.lastLesson && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground">Bài gần nhất</div>
                  <div className="text-foreground/80">{detail.progress.lastLesson.title}</div>
                  <div>{formatDate(detail.enrollment.enrolledAt)}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

type GuestCourseDetailViewProps = {
  detail: PublicCourseDetail;
  status?: "guest" | "notEnrolled";
};

function GuestCourseDetailView({ detail, status = "guest" }: GuestCourseDetailViewProps) {
  const totalLessons = detail.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0);
  const previewChapters = detail.chapters
    .map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.filter((lesson) => lesson.isPreview),
    }))
    .filter((chapter) => chapter.lessons.length > 0);
  const previewEntries = previewChapters.flatMap((chapter) => chapter.lessons.map((lesson) => ({ lesson, chapter })));
  const previewLessons = previewEntries.length;
  const lockedLessons = totalLessons - previewLessons;
  const firstPreview = previewEntries[0]?.lesson ?? null;

  const heroStats = [
    { label: 'Chương', value: detail.chapters.length },
    { label: 'Bài học', value: totalLessons },
    { label: 'Preview', value: previewLessons },
  ];
  const isNotEnrolled = status === "notEnrolled";

  return (
    <div className="space-y-12">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0b0b] via-[#1b1307] to-[#3b240d] p-8 text-white shadow-2xl ring-1 ring-amber-500/40">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-200">
              Khóa học DOHY
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{detail.course.title}</h1>
              {detail.course.subtitle && (
                <p className="text-lg text-amber-100/90">{detail.course.subtitle}</p>
              )}
              {detail.course.description && (
                <p className="max-w-3xl text-sm leading-relaxed text-amber-50/80 line-clamp-4">
                  {detail.course.description}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-amber-400/30 bg-white/5 p-4 shadow-inner backdrop-blur"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">
                    {stat.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full max-w-sm space-y-5 rounded-2xl border border-white/15 bg-black/50 p-6 shadow-xl">
            <div className="space-y-3 text-sm text-white/80">
              <p>
                {isNotEnrolled
                  ? 'Tài khoản của bạn chưa được cấp quyền đầy đủ cho khóa này. Liên hệ quản trị viên để được kích hoạt.'
                  : 'Đăng nhập để mở khóa toàn bộ nội dung, lưu tiến độ học và nhận những cập nhật mới nhất từ đội ngũ DOHY.'}
              </p>
              {previewLessons > 0 ? (
                <p>
                  {isNotEnrolled
                    ? `Trong lúc chờ kích hoạt, bạn vẫn có thể xem ${previewLessons} bài học preview bên dưới.`
                    : `Bạn có thể xem ngay ${previewLessons} bài học preview bên dưới.`}
                </p>
              ) : (
                <p>Kết nối với đội ngũ để được cấp quyền truy cập vào khóa học.</p>
              )}
            </div>
            {isNotEnrolled ? (
              <Button
                asChild
                className="w-full gap-2 bg-amber-400 text-black shadow-lg shadow-amber-500/30 hover:bg-amber-300"
              >
                <Link href="/khoa-hoc">
                  <ArrowRight className="h-4 w-4" />
                  Quay lại danh sách khóa học
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="w-full gap-2 bg-amber-400 text-black shadow-lg shadow-amber-500/30 hover:bg-amber-300"
              >
                <Link href="/khoa-hoc">
                  <ArrowRight className="h-4 w-4" />
                  Đăng nhập để học ngay
                </Link>
              </Button>
            )}
            {firstPreview && (
              <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                <Link href={`/khoa-hoc/${detail.course.slug}/chuong/${firstPreview.chapterId}/bai/${firstPreview._id}`}>
                  Xem bài preview đầu tiên
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-white/10 bg-background/80 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Bài học preview</h2>
                <p className="text-sm text-muted-foreground">
                  Tận hưởng một vài bài học miễn phí để cảm nhận phong cách giảng dạy.
                </p>
              </div>
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-200">{previewLessons} bài</Badge>
            </div>
            <Separator className="my-4" />
            {previewLessons === 0 ? (
              <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-muted-foreground">
                Khóa học này chưa mở bài preview. Vui lòng đăng nhập bằng tài khoản được cấp để truy cập toàn bộ nội
                dung.
              </div>
            ) : (
              <div className="space-y-4">
                {previewChapters.map((chapter) => (
                  <div key={String(chapter._id)} className="space-y-3">
                    <h3 className="text-base font-semibold text-foreground">{chapter.title}</h3>
                    <div className="space-y-2">
                      {chapter.lessons.map((lesson) => {
                        const lessonHref: LessonPath = `/khoa-hoc/${detail.course.slug}/chuong/${lesson.chapterId}/bai/${lesson._id}`;
                        return (
                          <Link
                            key={String(lesson._id)}
                            href={lessonHref}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm shadow-sm transition hover:border-amber-400/40 hover:bg-amber-50/40 dark:hover:bg-white/10"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-foreground">{lesson.title}</span>
                              {lesson.description && (
                                <span className="text-xs text-muted-foreground line-clamp-2">{lesson.description}</span>
                              )}
                            </div>
                            <Badge className="bg-amber-400/20 text-amber-700 dark:text-amber-200">Preview</Badge>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {lockedLessons > 0 && (
            <section className="rounded-2xl border border-dashed border-white/15 bg-background/70 p-6 shadow-lg backdrop-blur">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Nội dung nâng cao</h2>
                  <p className="text-sm text-muted-foreground">
                    {isNotEnrolled
                      ? `Còn ${lockedLessons} bài học cao cấp cần quyền truy cập từ quản trị viên.`
                      : `Còn ${lockedLessons} bài học cao cấp chỉ dành cho học viên đã đăng nhập.`}
                  </p>
                </div>
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button asChild variant="outline" className="mt-5 border-amber-400/40 text-foreground hover:bg-amber-50/40">
                <Link href="/khoa-hoc">
                  <ArrowRight className="mr-2 h-4 w-4" /> {isNotEnrolled ? 'Liên hệ quản trị viên' : 'Đăng nhập để mở khóa'}
                </Link>
              </Button>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="rounded-2xl border border-white/10 bg-background/80 shadow-xl backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Thông tin khóa học</CardTitle>
              <CardDescription>Các thông tin tổng quan dành cho khách.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <InfoRow label="Loại khóa" value={detail.course.pricingType === 'free' ? 'Miễn phí' : 'Có phí'} />
              {detail.course.priceNote && <InfoRow label="Ghi chú" value={detail.course.priceNote} />}
              <InfoRow label="Cập nhật" value={formatDate(detail.course.updatedAt)} />
              <InfoRow label="Trạng thái" value={detail.course.active ? 'Đang mở' : 'Đã ẩn'} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

type LessonStatusProps = {
  completed: boolean;
  current: boolean;
  upcoming: boolean;
};

function LessonStatus({ completed, current, upcoming }: LessonStatusProps) {
  if (completed) {
    return <CheckCircle2 className="mt-1 h-4 w-4 text-amber-400" />;
  }
  if (upcoming) {
    return <PlayIcon className="mt-1 h-4 w-4 text-amber-400" />;
  }
  if (current) {
    return <PlayIcon className="mt-1 h-4 w-4 text-muted-foreground" />;
  }
  return <Circle className="mt-1 h-4 w-4 text-muted-foreground" />;
}

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={cn("h-4 w-4", className)} viewBox="0 0 16 16" fill="currentColor" aria-hidden height="16" width="16">
    <path d="M4.5 3.5v9l7-4.5-7-4.5z" />
  </svg>
);

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground/80">{label}</span>
      <span className="text-right text-foreground/70">{value}</span>
    </div>
  );
}

function NoCourseAccess() {
  return (
    <Card className="border-dashed text-center shadow-none">
      <CardHeader>
        <CardTitle>Không tìm thấy khóa học</CardTitle>
        <CardDescription>
          Tài khoản của bạn chưa được cấp quyền cho khóa học này hoặc khóa học đã bị ẩn.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function GuestCourseNotFound() {
  return (
    <Card className="border-dashed text-center shadow-none">
      <CardHeader>
        <CardTitle>Không tìm thấy khóa học</CardTitle>
        <CardDescription>
          Khóa học có thể đã bị ẩn hoặc chưa sẵn sàng để công khai. Liên hệ quản trị viên để biết thêm chi tiết.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-40" />
      <Card className="shadow-sm">
        <CardHeader className="space-y-2">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function formatDuration(seconds?: number) {
  if (!seconds) return undefined;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} phút`;
}

function formatDate(timestamp?: number) {
  if (!timestamp) return undefined;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('vi-VN');
}
