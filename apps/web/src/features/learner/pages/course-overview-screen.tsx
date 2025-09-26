"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { useStudentAuth } from "@/features/learner/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpenCheck, LogOut, PlayCircle } from "lucide-react";

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

type LearnerCourseSummary = {
  course: CourseDoc;
  enrollment: EnrollmentDoc;
  progress: {
    totalLessons: number;
    completedLessons: number;
    percent: number;
    lastViewedLessonId: Id<'course_lessons'> | null;
  };
  counts: {
    chapters: number;
    lessons: number;
  };
  firstLesson: LessonDoc | null;
  nextLesson: LessonDoc | null;
  lastLesson: LessonDoc | null;
};

type CoursePath = `/khoa-hoc/${string}`;
type LessonPath = `/khoa-hoc/${string}/chuong/${string}/bai/${string}`;

const emptyForm = { account: '', password: '' } as const;

type AuthStatus = 'idle' | 'loading' | 'authenticated';

type StudentAccount = {
  _id: Id<'students'>;
  account: string;
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

type MediaImageDoc = {
  _id: Id<'media'>;
  title?: string;
  url?: string;
  format?: string;
  width?: number;
  height?: number;
};

export function CourseOverviewScreen() {
  const { student, status, error, login, logout } = useStudentAuth();
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const learnerCourses = useQuery(
    api.courses.listLearnerCourses,
    student ? { userId: String(student._id) } : ('skip' as const),
  ) as LearnerCourseSummary[] | undefined;

  const publicCourses = useQuery(
    api.courses.listCourses,
    student ? ('skip' as const) : { includeInactive: false },
  ) as CourseDoc[] | undefined;

  const thumbnailIdList = useMemo(() => {
    const ids = new Set<string>();
    if (learnerCourses) {
      learnerCourses.forEach((item) => {
        if (item.course.thumbnailMediaId) {
          ids.add(String(item.course.thumbnailMediaId));
        }
      });
    }
    if (publicCourses) {
      publicCourses.forEach((course) => {
        if (course.thumbnailMediaId) {
          ids.add(String(course.thumbnailMediaId));
        }
      });
    }
    return Array.from(ids);
  }, [learnerCourses, publicCourses]);

  const mediaImages = useQuery(
    api.media.list,
    thumbnailIdList.length > 0 ? { kind: 'image' } : ('skip' as const),
  ) as MediaImageDoc[] | undefined;

  const thumbnailMap = useMemo(() => {
    if (!mediaImages || thumbnailIdList.length === 0) {
      return new Map<string, string>();
    }
    const allowed = new Set(thumbnailIdList);
    const map = new Map<string, string>();
    mediaImages.forEach((media) => {
      const id = String(media._id);
      if (allowed.has(id) && media.url) {
        map.set(id, media.url);
      }
    });
    return map;
  }, [mediaImages, thumbnailIdList]);

  const getThumbnailUrl = useCallback(
    (id?: Id<'media'>) => {
      if (!id) return undefined;
      return thumbnailMap.get(String(id));
    },
    [thumbnailMap],
  );

  const handleChange = (field: 'account' | 'password') => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);
    const result = await login({ account: form.account, password: form.password });
    if (!result.ok) {
      setFormError(result.error ?? 'Dang nhap that bai. Vui long thu lai.');
    } else {
      setForm(emptyForm);
    }
    setSubmitting(false);
  };

  if (student) {
    const isInitializing = status === 'loading' && learnerCourses === undefined;

    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-12 pt-32">
        {isInitializing ? (
          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <CourseListSkeleton />
          </div>
        ) : (
          <AuthenticatedView
            student={student}
            logout={logout}
            courses={learnerCourses}
            globalError={error}
            getThumbnailUrl={getThumbnailUrl}
          />
        )}
      </div>
    );
  }

  return (
    <GuestCourseView
      courses={publicCourses}
      status={status}
      form={form}
      formError={formError}
      contextError={error}
      submitting={submitting}
      onChange={handleChange}
      onSubmit={handleSubmit}
      getThumbnailUrl={getThumbnailUrl}
    />
  );
}

type LoginViewProps = {
  form: { account: string; password: string };
  formError: string | null;
  contextError?: string;
  submitting: boolean;
  status: AuthStatus;
  onChange: (
    field: 'account' | 'password',
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

type GuestCourseViewProps = {
  courses: CourseDoc[] | undefined;
  status: AuthStatus;
  form: { account: string; password: string };
  formError: string | null;
  contextError?: string;
  submitting: boolean;
  onChange: (
    field: 'account' | 'password',
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  getThumbnailUrl: (id?: Id<'media'>) => string | undefined;
};

function GuestCourseView({
  courses,
  status,
  form,
  formError,
  contextError,
  submitting,
  onChange,
  onSubmit,
  getThumbnailUrl,
}: GuestCourseViewProps) {
  const sorted = useMemo(() => {
    if (!courses) return [] as CourseDoc[];
    return [...courses].sort((a, b) => a.order - b.order);
  }, [courses]);

  const courseGrid = courses === undefined
    ? <CourseListSkeleton />
    : sorted.length === 0
      ? <GuestEmptyCourses />
      : (
        <div className="grid gap-5 md:grid-cols-2">
          {sorted.map((course) => (
            <GuestCourseCard
              key={String(course._id)}
              course={course}
              thumbnailUrl={getThumbnailUrl(course.thumbnailMediaId)}
            />
          ))}
        </div>
      );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-12 pt-32">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Khoa hoc DOHY</h1>
            <p className="text-sm text-muted-foreground">
              Xem truoc cac bai hoc duoc danh dau preview. Dang nhap tai khoan duoc cap de luu tien do va mo khoa toan bo noi dung.
            </p>
          </div>
          {courseGrid}
        </div>
        <div className="lg:sticky lg:top-24">
          <LoginView
            form={form}
            formError={formError}
            contextError={contextError}
            submitting={submitting}
            status={status}
            onChange={onChange}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}

function LoginView({
  form,
  formError,
  contextError,
  submitting,
  status,
  onChange,
  onSubmit,
}: LoginViewProps) {
  const errorMessage = formError ?? contextError ?? null;
  const isLoading = submitting || status === 'loading';

  return (
    <div className="mx-auto w-full max-w-lg">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Dang nhap hoc vien</CardTitle>
          <CardDescription>
            Nhap tai khoan do quan tri cap de truy cap vao chuong trinh hoc cua ban.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="account">Tai khoan</Label>
              <Input
                id="account"
                value={form.account}
                onChange={onChange('account')}
                autoComplete="username"
                placeholder="VD: hocvien01"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mat khau</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={onChange('password')}
                autoComplete="current-password"
                placeholder="Nhap mat khau"
                disabled={isLoading}
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Dang dang nhap...' : 'Dang nhap'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

type AuthenticatedViewProps = {
  student: StudentAccount;
  logout: () => void;
  courses: LearnerCourseSummary[] | undefined;
  globalError?: string;
  getThumbnailUrl: (id?: Id<'media'>) => string | undefined;
};

function AuthenticatedView({ student, logout, courses, globalError, getThumbnailUrl }: AuthenticatedViewProps) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-lg border bg-card px-4 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Xin chao, {student.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            Tiep tuc hanh trinh hoc tap cua ban. Tien do duoc luu tu dong khi xem bai hoc.
          </p>
          {globalError && (
            <p className="text-sm text-destructive">{globalError}</p>
          )}
        </div>
        <Button variant="outline" onClick={logout} className="gap-2 self-start sm:self-auto">
          <LogOut className="h-4 w-4" />
          Dang xuat
        </Button>
      </header>

      {courses === undefined ? (
        <CourseListSkeleton />
      ) : courses.length === 0 ? (
        <EmptyCoursesState />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((item) => (
            <CourseCard
              key={String(item.course._id)}
              summary={item}
              thumbnailUrl={getThumbnailUrl(item.course.thumbnailMediaId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type CourseCardProps = {
  summary: LearnerCourseSummary;
  thumbnailUrl?: string;
};

function CourseCard({ summary, thumbnailUrl }: CourseCardProps) {
  const progressValue = Math.min(100, Math.max(0, summary.progress.percent ?? 0));
  const continueLesson = summary.nextLesson ?? summary.firstLesson;
  const detailHref: CoursePath = `/khoa-hoc/${summary.course.slug}`;
  const continueHref: CoursePath | LessonPath = continueLesson
    ? `/khoa-hoc/${summary.course.slug}/chuong/${continueLesson.chapterId}/bai/${continueLesson._id}`
    : detailHref;

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl">{summary.course.title}</CardTitle>
          <Badge className="bg-muted text-foreground">{summary.counts.lessons} bai</Badge>
        </div>
        {summary.course.subtitle && (
          <CardDescription>{summary.course.subtitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <CourseThumbnail title={summary.course.title} url={thumbnailUrl} />
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{summary.progress.completedLessons}/{summary.progress.totalLessons} bai hoan thanh</span>
            <span>{progressValue}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <p className="font-medium text-foreground">Bai tiep theo</p>
          <p className="text-muted-foreground">
            {continueLesson ? continueLesson.title : 'Bat dau tu bai dau tien'}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button asChild className="gap-2">
            <Link href={continueHref}>
              <PlayCircle className="h-4 w-4" />
              Tiep tuc hoc
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href={detailHref}>
              <BookOpenCheck className="h-4 w-4" />
              Xem chi tiet
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type GuestCourseCardProps = {
  course: CourseDoc;
  thumbnailUrl?: string;
};

function GuestCourseCard({ course, thumbnailUrl }: GuestCourseCardProps) {
  const detailHref: CoursePath = `/khoa-hoc/${course.slug}`;

  return (
    <Card className="flex h-full flex-col shadow-sm transition hover:border-primary/40">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl">{course.title}</CardTitle>
          <Badge variant="outline">{course.pricingType === 'free' ? 'Mien phi' : 'Co phi'}</Badge>
        </div>
        {course.subtitle && <CardDescription>{course.subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <CourseThumbnail title={course.title} url={thumbnailUrl} />
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
        )}
        <div className="text-xs text-muted-foreground">
          Xem chi tiet de truy cap cac bai preview. Dang nhap de mo khoa toan bo noi dung va luu tien do hoc tap.
        </div>
        <Button asChild className="mt-auto gap-2">
          <Link href={detailHref}>
            Xem chi tiet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CourseThumbnail({ title, url }: { title: string; url?: string }) {
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg bg-muted">
      {url ? (
        <img src={url} alt={`Thumbnail khoa hoc ${title}`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-xs uppercase tracking-wide text-muted-foreground">
          Chua co anh
        </div>
      )}
    </div>
  );
}

function CourseListSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-11/12" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyCoursesState() {
  return (
    <Card className="border-dashed text-center shadow-none">
      <CardHeader>
        <CardTitle className="text-xl">Chua co khoa hoc nao duoc cap</CardTitle>
        <CardDescription>
          Lien he quan tri vien de duoc cap quyen cho cac khoa hoc phu hop.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-sm text-muted-foreground">
          <Separator />
          <p>
            Khi duoc cap khoa hoc, ban se thay danh sach khoa hoc va tien do tai day.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function GuestEmptyCourses() {
  return (
    <Card className="border-dashed text-center shadow-none">
      <CardHeader>
        <CardTitle className="text-xl">Chua co khoa hoc duoc cong khai</CardTitle>
        <CardDescription>
          Hien tai chua co khoa hoc nao mo preview. Vui long dang nhap tai <Link href="/khoa-hoc" className="underline">/khoa-hoc</Link> neu ban duoc cap tai khoan.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}




