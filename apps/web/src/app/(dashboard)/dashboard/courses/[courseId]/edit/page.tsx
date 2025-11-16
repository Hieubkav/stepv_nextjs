"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getYoutubeThumbnailUrl } from "@/lib/youtube";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";

import { CourseForm } from "../../_components/course-form";
import type { CourseFormValues } from "../../_components/course-form";
import { ChapterForm } from "../../_components/chapter-form";
import type { ChapterFormValues } from "../../_components/chapter-form";
import { LessonForm } from "../../_components/lesson-form";
import type { LessonFormValues } from "../../_components/lesson-form";

type LessonDoc = {
  _id: Id<"course_lessons">;
  chapterId: Id<"course_chapters">;
  title: string;
  description?: string;
  youtubeUrl: string;
  durationSeconds?: number;
  isPreview?: boolean;
  exerciseLink?: string;
  order: number;
  active: boolean;
};

type ChapterDoc = {
  _id: Id<"course_chapters">;
  title: string;
  summary?: string;
  order: number;
  active: boolean;
  lessons: LessonDoc[];
};

type CourseDetail = {
  course: {
    _id: Id<"courses">;
    title: string;
    slug: string;
    subtitle?: string;
    description?: string;
    thumbnailMediaId?: Id<"media">;
    introVideoUrl?: string;
    pricingType: "free" | "paid";
    priceAmount?: number;
    priceNote?: string;
    isPriceVisible: boolean;
    order: number;
    active: boolean;
  };
  chapters: ChapterDoc[];
};

type EnrollmentDoc = {
  _id: Id<"course_enrollments">;
  courseId: Id<"courses">;
  userId: string;
  enrolledAt: number;
  progressPercent?: number;
  lastViewedLessonId?: Id<"course_lessons">;
  order: number;
  active: boolean;
};


type StudentSummary = {
  _id: Id<"students">;
  account: string;
  fullName: string;
  email?: string;
  phone?: string;
  active: boolean;
};

type CourseTab = "info" | "content" | "students";

const COURSE_TABS: { key: CourseTab; label: string }[] = [
  { key: "info", label: "Thông tin khóa học" },
  { key: "content", label: "Nội dung khóa học" },
  { key: "students", label: "Học viên" },
];


const buildCourseInitial = (course?: CourseDetail["course"]): CourseFormValues => ({
  title: course?.title ?? "",
  slug: course?.slug ?? "",
  subtitle: course?.subtitle ?? "",
  description: course?.description ?? "",
  thumbnailMediaId: course?.thumbnailMediaId ? String(course.thumbnailMediaId) : "",
  introVideoUrl: course?.introVideoUrl ?? "",
  pricingType: course?.pricingType ?? "free",
  priceAmount: course?.priceAmount !== undefined ? String(course.priceAmount) : "",
  priceNote: course?.priceNote ?? "",
  isPriceVisible: course?.isPriceVisible ?? false,
  order: String(course?.order ?? 0),
  active: course?.active ?? true,
});

const buildChapterInitial = (chapter?: ChapterDoc): ChapterFormValues => ({
  title: chapter?.title ?? "",
  summary: chapter?.summary ?? "",
  order: String(chapter?.order ?? 0),
  active: chapter?.active ?? true,
});

const buildLessonInitial = (lesson?: LessonDoc): LessonFormValues => ({
  title: lesson?.title ?? "",
  description: lesson?.description ?? "",
  youtubeUrl: lesson?.youtubeUrl ?? "",
  durationSeconds: lesson?.durationSeconds ? String(lesson.durationSeconds) : "",
  exerciseLink: lesson?.exerciseLink ?? "",
  isPreview: lesson?.isPreview ?? false,
  order: String(lesson?.order ?? 0),
  active: lesson?.active ?? true,
});

export default function CourseEditPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params.courseId as Id<"courses">;

  const detail = useQuery(api.courses.getCourseDetail, {
    id: courseId,
    includeInactive: true,
  }) as CourseDetail | null | undefined;

  const enrollments = useQuery(api.courses.listEnrollmentsByCourse, {
    courseId,
    includeInactive: true,
  }) as EnrollmentDoc[] | undefined;

  const students = useQuery(api.students.listStudents, { activeOnly: true }) as StudentSummary[] | undefined;

  const updateCourse = useMutation(api.courses.updateCourse);
  const setCourseActive = useMutation(api.courses.setCourseActive);
  const deleteCourse = useMutation(api.courses.deleteCourse);

  const createChapter = useMutation(api.courses.createChapter);
  const updateChapter = useMutation(api.courses.updateChapter);
  const deleteChapter = useMutation(api.courses.deleteChapter);
  const setChapterActive = useMutation(api.courses.setChapterActive);

  const createLesson = useMutation(api.courses.createLesson);
  const updateLesson = useMutation(api.courses.updateLesson);
  const deleteLesson = useMutation(api.courses.deleteLesson);
  const setLessonActive = useMutation(api.courses.setLessonActive);

  const upsertEnrollment = useMutation(api.courses.upsertEnrollment);
  const removeEnrollment = useMutation(api.courses.removeEnrollment);

  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterDoc | null>(null);
  const [chapterSubmitting, setChapterSubmitting] = useState(false);

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [lessonContext, setLessonContext] = useState<{
    chapterId: Id<"course_chapters">;
    lesson?: LessonDoc;
  } | null>(null);

  const [enrollForm, setEnrollForm] = useState({ userId: "" });
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<CourseTab>("info");

  const course = detail?.course;
  const courseDetailHref = useMemo(() => {
    if (!course) return null;
    if (!Number.isFinite(course.order)) {
      return "/khoa-hoc" as const;
    }
    const base = `/khoa-hoc/${course.order}` as const;
    if (course.active) {
      return base;
    }
    return `${base}?preview=1` as const;
  }, [course]);
  const chapters = useMemo(() => {
    if (!detail?.chapters) return [] as ChapterDoc[];
    return [...detail.chapters].sort((a, b) => a.order - b.order);
  }, [detail?.chapters]);

  const lessonOptions = useMemo(() => {
    const options: { id: string; label: string }[] = [];
    for (const chapter of chapters) {
      for (const lesson of chapter.lessons) {
        options.push({ id: String(lesson._id), label: `${lesson.title}` });
      }
    }
    return options;
  }, [chapters]);

  const studentMap = useMemo(() => {
    const map = new Map<string, StudentSummary>();
    (students ?? []).forEach((student) => {
      map.set(String(student._id), student);
    });
    return map;
  }, [students]);

  const studentOptions = useMemo(() => {
    return (students ?? [])
      .slice()
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      .map((student) => ({
        id: String(student._id),
        label: `${student.fullName} (${student.account})`,
      }));
  }, [students]);

  useEffect(() => {
    if (!enrollForm.userId && studentOptions.length > 0) {
      setEnrollForm({ userId: studentOptions[0].id });
    }
  }, [studentOptions, enrollForm.userId]);

  async function handleCourseSubmit(values: CourseFormValues) {
    if (!course) return;
    const title = values.title.trim();
    const slug = values.slug.trim();
    if (!title || !slug) {
      toast.error("Vui lòng nhập tiêu đề và slug");
      return;
    }
    const orderNumber = Number.parseInt(values.order, 10);
    const order = Number.isFinite(orderNumber) ? orderNumber : course.order;

    setCourseSubmitting(true);
    try {
      await updateCourse({
        id: course._id,
        title,
        slug,
        subtitle: values.subtitle.trim() || null,
        description: values.description.trim() || null,
        thumbnailMediaId: values.thumbnailMediaId ? (values.thumbnailMediaId as Id<"media">) : null,
        introVideoUrl: values.introVideoUrl.trim() || null,
        pricingType: values.pricingType,
        priceAmount: values.pricingType === "paid" ? Number(values.priceAmount) || 0 : null,
        priceNote: values.priceNote.trim() || null,
        isPriceVisible: values.pricingType === "paid" ? values.isPriceVisible : false,
        order,
        active: values.active,
      } as any);
      toast.success("Đã cập nhật khóa học");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật");
    } finally {
      setCourseSubmitting(false);
    }
  }

  async function toggleCourseActive() {
    if (!course) return;
    try {
      await setCourseActive({ id: course._id, active: !course.active });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function handleDeleteCourse() {
    if (!course) return;
    if (!window.confirm(`Xóa khóa học "${course.title}"?`)) return;
    try {
      const result = await deleteCourse({ id: course._id });
      if (!result?.ok) {
        toast.error("Không thể xóa khóa học");
        return;
      }
      toast.success("Đã xóa khóa học");
      router.push("/dashboard/courses");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa khóa học");
    }
  }

  function openCreateChapter() {
    setEditingChapter(null);
    setChapterDialogOpen(true);
  }

  function openEditChapter(chapter: ChapterDoc) {
    setEditingChapter(chapter);
    setChapterDialogOpen(true);
  }

  async function handleChapterSubmit(values: ChapterFormValues) {
    const title = values.title.trim();
    if (!title) {
      toast.error("Vui lòng nhập tên chương");
      return;
    }
    const orderNumber = Number.parseInt(values.order, 10);
    const order = Number.isFinite(orderNumber) ? orderNumber : chapters.length;
    setChapterSubmitting(true);
    try {
      if (editingChapter) {
        await updateChapter({
          id: editingChapter._id,
          title,
          summary: values.summary.trim() || null,
          order,
          active: values.active,
        } as any);
        toast.success("Đã cập nhật chương");
      } else {
        await createChapter({
          courseId,
          title,
          summary: values.summary.trim() || undefined,
          order,
          active: values.active,
        });
        toast.success("Đã tạo chương");
      }
      setChapterDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể lưu chương");
    } finally {
      setChapterSubmitting(false);
    }
  }

  async function toggleChapterActive(chapter: ChapterDoc) {
    try {
      await setChapterActive({ id: chapter._id, active: !chapter.active });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật chương");
    }
  }

  async function moveChapter(chapter: ChapterDoc, direction: "up" | "down") {
    const index = chapters.findIndex((item) => item._id === chapter._id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;
    const target = chapters[targetIndex];
    try {
      await updateChapter({ id: chapter._id, order: target.order });
      await updateChapter({ id: target._id, order: chapter.order });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể đổi thứ tự");
    }
  }

  async function removeChapter(chapter: ChapterDoc) {
    if (!window.confirm(`Xóa chương "${chapter.title}"?`)) return;
    try {
      const result = await deleteChapter({ id: chapter._id });
      if (!result?.ok) {
        toast.error("Không thể xóa chương");
        return;
      }
      toast.success("Đã xóa chương");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa chương");
    }
  }

  function openCreateLesson(chapterId: Id<"course_chapters">) {
    setLessonContext({ chapterId });
    setLessonDialogOpen(true);
  }

  function openEditLesson(chapterId: Id<"course_chapters">, lesson: LessonDoc) {
    setLessonContext({ chapterId, lesson });
    setLessonDialogOpen(true);
  }

  async function handleLessonSubmit(values: LessonFormValues) {
    if (!lessonContext) return;
    const title = values.title.trim();
    const youtubeUrl = values.youtubeUrl.trim();
    if (!title || !youtubeUrl) {
      toast.error("Vui lòng nhập tiêu đề và YouTube URL");
      return;
    }
    const orderNumber = Number.parseInt(values.order, 10);
    const order = Number.isFinite(orderNumber) ? orderNumber : 0;
    const durationNumber = Number.parseInt(values.durationSeconds, 10);
    const duration = Number.isFinite(durationNumber) ? durationNumber : undefined;

    setLessonSubmitting(true);
    try {
      if (lessonContext.lesson) {
        await updateLesson({
          id: lessonContext.lesson._id,
          chapterId: lessonContext.chapterId,
          title,
          description: values.description.trim() || null,
          youtubeUrl,
          durationSeconds: duration,
          isPreview: values.isPreview,
          order,
          active: values.active,
        } as any);
        toast.success("Đã cập nhật bài học");
      } else {
        await createLesson({
          courseId,
          chapterId: lessonContext.chapterId,
          title,
          description: values.description.trim() || undefined,
          youtubeUrl,
          durationSeconds: duration,
          isPreview: values.isPreview,
          order,
          active: values.active,
        });
        toast.success("Đã tạo bài học");
      }
      setLessonDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể lưu bài học");
    } finally {
      setLessonSubmitting(false);
    }
  }

  async function toggleLessonActive(lesson: LessonDoc) {
    try {
      await setLessonActive({ id: lesson._id, active: !lesson.active });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật bài học");
    }
  }

  async function toggleLessonPreview(lesson: LessonDoc) {
    try {
      await updateLesson({ id: lesson._id, isPreview: !lesson.isPreview });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật xem trước");
    }
  }

  async function moveLesson(chapter: ChapterDoc, lesson: LessonDoc, direction: "up" | "down") {
    const lessons = [...chapter.lessons].sort((a, b) => a.order - b.order);
    const index = lessons.findIndex((item) => item._id === lesson._id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;
    const target = lessons[targetIndex];
    try {
      await updateLesson({ id: lesson._id, order: target.order });
      await updateLesson({ id: target._id, order: lesson.order });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể đổi thứ tự");
    }
  }

  async function removeLesson(lesson: LessonDoc) {
    if (!window.confirm(`Xóa bài học "${lesson.title}"?`)) return;
    try {
      const result = await deleteLesson({ id: lesson._id });
      if (!result?.ok) {
        toast.error("Không thể xóa bài học");
        return;
      }
      toast.success("Đã xóa bài học");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa bài học");
    }
  }

  async function handleAddEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = enrollForm.userId;
    if (!userId) {
      toast.error("Vui lòng chọn học viên");
      return;
    }
    const studentInfo = studentMap.get(userId);
    if (!studentInfo) {
      toast.error("Không tìm thấy thông tin học viên");
      return;
    }

    setEnrollSubmitting(true);
    try {
      await upsertEnrollment({
        courseId,
        userId,
      } as any);
      toast.success(`Đã thêm ${studentInfo.fullName} vào khóa học`);
      setEnrollForm({ userId: studentOptions[0]?.id ?? "" });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể thêm học viên");
    } finally {
      setEnrollSubmitting(false);
    }
  }

  async function removeEnrollmentEntry(enrollment: EnrollmentDoc) {
    const studentInfo = studentMap.get(enrollment.userId);
    const studentLabel = studentInfo ? `${studentInfo.fullName} (${studentInfo.account})` : enrollment.userId;
    if (!window.confirm(`Xóa quyền học của ${studentLabel}?`)) return;
    try {
      const result = await removeEnrollment({ courseId, userId: enrollment.userId });
      if (!result?.ok) {
        toast.error("Không thể xóa đăng ký");
        return;
        }
        toast.success(`Đã xóa quyền học của ${studentLabel}`);
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa đăng ký");
    }
  }

  if (detail === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Đang tải khóa học...</div>;
  }

  if (!course) {
    return <div className="p-6 text-sm text-muted-foreground">Không tìm thấy khóa học.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quản lý khóa học</h1>
          <p className="text-sm text-muted-foreground">Chỉnh sửa thông tin, chương và bài học.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/courses")}>Quay lại</Button>
          {courseDetailHref && (
            <Button variant="outline" asChild>
                <Link href={courseDetailHref} target="_blank" rel="noopener noreferrer">
                  Xem trang công khai
                </Link>
              </Button>
          )}
          <Button variant="secondary" onClick={toggleCourseActive}>
            {course.active ? "Hiển thị" : "Ẩn"}
          </Button>
          <Button variant="destructive" onClick={handleDeleteCourse}>
            <Trash2 className="mr-2 size-4" />
            Xóa khóa học
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {COURSE_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 min-w-[160px] rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-muted",
                  isActive ? "bg-background text-foreground shadow" : "text-muted-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "info" && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseForm
            initialValues={buildCourseInitial(course)}
            submitting={courseSubmitting}
            submitLabel="Lưu"
            onSubmit={handleCourseSubmit}
          />
          </CardContent>
        </Card>
      )}

      {activeTab === "content" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Chương</CardTitle>
          <Button size="sm" onClick={openCreateChapter}>
            <Plus className="mr-2 size-4" />
            Thêm chương
          </Button>
          </CardHeader>
          <CardContent className="space-y-4">
          {chapters.length === 0 && <div className="text-sm text-muted-foreground">Chưa có chương nào.</div>}
          {chapters.map((chapter, index) => (
            <div key={String(chapter._id)} className="rounded-md border">
              <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{chapter.title}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Thứ tự #{chapter.order}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                        {chapter.active ? "hoạt động" : "bị khóa"}
                    </span>
                  </div>
                  {chapter.summary && (
                    <div className="text-xs text-muted-foreground">{chapter.summary}</div>
                  )}
                  <label className="inline-flex items-center gap-2 text-sm">
                    <Checkbox checked={chapter.active} onCheckedChange={() => toggleChapterActive(chapter)} />
                    <span>{chapter.active ? "Hiển thị" : "Ẩn"}</span>
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditChapter(chapter)}>
                    <Pencil className="mr-2 size-4" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveChapter(chapter, "up")}
                    disabled={index === 0}
                    title="Lên thứ tự"
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveChapter(chapter, "down")}
                    disabled={index === chapters.length - 1}
                    title="Xuống thứ tự"
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openCreateLesson(chapter._id)}>
                    <Plus className="mr-2 size-4" />
                    Thêm bài học
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => removeChapter(chapter)} title="Xóa">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              {chapter.lessons.length > 0 && (
                <div className="space-y-2 border-t p-3">
                  {chapter.lessons
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((lesson, lessonIndex) => {
                      const lessonThumbnail = getYoutubeThumbnailUrl(lesson.youtubeUrl);
                      return (
                      <div
                        key={String(lesson._id)}
                        className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{lesson.title}</span>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              Thứ tự #{lesson.order}
                            </span>
                            {lesson.isPreview && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">xem trước</span>
                            )}
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                              {lesson.active ? "hoạt động" : "bị khóa"}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">YouTube: {lesson.youtubeUrl}</div>
                          {lessonThumbnail && (
                            <a
                              href={lesson.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 rounded-md border border-dashed border-muted-foreground/50 bg-background/80 p-2 text-xs text-muted-foreground transition hover:border-primary/60"
                            >
                              <img
                                src={lessonThumbnail}
                                alt={`Preview ${lesson.title}`}
                                className="h-16 w-28 rounded object-cover"
                              />
                              <div className="space-y-0.5">
                                <div className="font-medium text-foreground">Xem ảnh bìa</div>
                                <div>Xem video trên YouTube</div>
                              </div>
                            </a>
                          )}
                          {lesson.description && (
                            <div className="text-xs text-muted-foreground">{lesson.description}</div>
                          )}
                          {lesson.exerciseLink && (
                            <div className="text-xs text-muted-foreground">
                              Bài tập: <a className="text-primary hover:underline" href={lesson.exerciseLink} target="_blank" rel="noreferrer">{lesson.exerciseLink}</a>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <label className="inline-flex items-center gap-1">
                              <Checkbox checked={lesson.active} onCheckedChange={() => toggleLessonActive(lesson)} />
                              <span>Hiển thị</span>
                              </label>
                            <label className="inline-flex items-center gap-1">
                              <Checkbox checked={lesson.isPreview ?? false} onCheckedChange={() => toggleLessonPreview(lesson)} />
                              <span>Xem trước</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditLesson(chapter._id, lesson)}>
                            <Pencil className="mr-2 size-4" />
                            Sửa
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveLesson(chapter, lesson, "up")}
                            disabled={lessonIndex === 0}
                            title="Lên thứ tự"
                          >
                            <ChevronUp className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveLesson(chapter, lesson, "down")}
                            disabled={lessonIndex === chapter.lessons.length - 1}
                            title="Xuống thứ tự"
                          >
                            <ChevronDown className="size-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => removeLesson(lesson)} title="Xóa">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "students" && (
        <Card>
          <CardHeader>
            <CardTitle>Đăng ký học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleAddEnrollment}>
              <div className="sm:flex-1">
                <label className="text-sm font-medium">Học viên</label>
                {students === undefined ? (
                  <div className="text-xs text-muted-foreground">Đang tải danh sách học viên...</div>
                ) : studentOptions.length === 0 ? (
                  <div className="text-xs text-muted-foreground">Chưa có học viên để gán.</div>
                ) : (
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={enrollForm.userId}
                    onChange={(event) => setEnrollForm((prev) => ({ ...prev, userId: event.target.value }))}
                  >
                    <option value="">-- Chọn một học viên --</option>
                    {studentOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end sm:block">
                <Button type="submit" disabled={enrollSubmitting || studentOptions.length === 0}>
                  {enrollSubmitting ? "Đang lưu..." : "Thêm học viên"}
                </Button>
              </div>
            </form>
            <Separator />
            {!enrollments && <div className="text-sm text-muted-foreground">Đang tải đăng ký...</div>}
            {enrollments && enrollments.length === 0 && (
              <div className="text-sm text-muted-foreground">Chưa có đăng ký nào.</div>
            )}
            {enrollments && enrollments.length > 0 && (
              <div className="space-y-2">
                {enrollments
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((enrollment) => {
                    const studentInfo = studentMap.get(enrollment.userId);
                    const studentLabel = studentInfo
                      ? `${studentInfo.fullName} (${studentInfo.account})`
                      : enrollment.userId;
                    const contactInfo = [studentInfo?.email, studentInfo?.phone]
                      .filter((value) => Boolean(value))
                      .join(" | ");
                    return (
                      <div
                        key={String(enrollment._id)}
                        className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{studentLabel}</div>
                          {contactInfo && (
                            <div className="text-xs text-muted-foreground">{contactInfo}</div>
                          )}
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => removeEnrollmentEntry(enrollment)}>
                          <Trash2 className="mr-2 size-4" />
                          Xóa
                        </Button>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={chapterDialogOpen} onOpenChange={setChapterDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingChapter ? "Sửa chương" : "Thêm chương"}</DialogTitle>
          </DialogHeader>
          <ChapterForm
            initialValues={buildChapterInitial(editingChapter ?? undefined)}
            submitting={chapterSubmitting}
            submitLabel={editingChapter ? "Lưu" : "Tạo"}
            onSubmit={handleChapterSubmit}
            onCancel={() => setChapterDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{lessonContext?.lesson ? "Sửa bài học" : "Thêm bài học"}</DialogTitle>
          </DialogHeader>
          <LessonForm
            initialValues={buildLessonInitial(lessonContext?.lesson)}
            submitting={lessonSubmitting}
            submitLabel={lessonContext?.lesson ? "Lưu" : "Tạo"}
            onSubmit={handleLessonSubmit}
            onCancel={() => setLessonDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
