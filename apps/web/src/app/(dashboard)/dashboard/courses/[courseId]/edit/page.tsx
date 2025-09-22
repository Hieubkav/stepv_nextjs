"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
  const setEnrollmentActive = useMutation(api.courses.setEnrollmentActive);
  const updateEnrollmentProgress = useMutation(api.courses.updateEnrollmentProgress);

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

  const [enrollForm, setEnrollForm] = useState({ userId: "", order: "", lessonId: "" });
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);

  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [enrollmentEditSubmitting, setEnrollmentEditSubmitting] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<EnrollmentDoc | null>(null);
  const [enrollmentEditForm, setEnrollmentEditForm] = useState({ progress: "", lessonId: "" });

  const course = detail?.course;
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
      setEnrollForm((prev) => ({ ...prev, userId: studentOptions[0].id }));
    }
  }, [studentOptions, enrollForm.userId]);

  async function handleCourseSubmit(values: CourseFormValues) {
    if (!course) return;
    const title = values.title.trim();
    const slug = values.slug.trim();
    if (!title || !slug) {
      toast.error("Can nhap title va slug");
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
      toast.success("Da cap nhat khoa hoc");
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the cap nhat");
    } finally {
      setCourseSubmitting(false);
    }
  }

  async function toggleCourseActive() {
    if (!course) return;
    try {
      await setCourseActive({ id: course._id, active: !course.active });
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the cap nhat trang thai");
    }
  }

  async function handleDeleteCourse() {
    if (!course) return;
    if (!window.confirm(`Xoa khoa hoc "${course.title}"?`)) return;
    try {
      const result = await deleteCourse({ id: course._id });
      if (!result?.ok) {
        toast.error("Khong the xoa khoa hoc");
        return;
      }
      toast.success("Da xoa khoa hoc");
      router.push("/dashboard/courses");
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the xoa khoa hoc");
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
      toast.error("Can nhap ten chuong");
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
        toast.success("Da cap nhat chuong");
      } else {
        await createChapter({
          courseId,
          title,
          summary: values.summary.trim() || undefined,
          order,
          active: values.active,
        });
        toast.success("Da tao chuong");
      }
      setChapterDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the luu chuong");
    } finally {
      setChapterSubmitting(false);
    }
  }

  async function toggleChapterActive(chapter: ChapterDoc) {
    try {
      await setChapterActive({ id: chapter._id, active: !chapter.active });
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the cap nhat chuong");
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
      toast.error(error?.message ?? "Khong the doi thu tu");
    }
  }

  async function removeChapter(chapter: ChapterDoc) {
    if (!window.confirm(`Xoa chuong "${chapter.title}"?`)) return;
    try {
      const result = await deleteChapter({ id: chapter._id });
      if (!result?.ok) {
        toast.error("Khong the xoa chuong");
        return;
      }
      toast.success("Da xoa chuong");
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the xoa chuong");
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
      toast.error("Can nhap ten va YouTube URL");
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
        toast.success("Da cap nhat bai hoc");
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
        toast.success("Da tao bai hoc");
      }
      setLessonDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the luu bai hoc");
    } finally {
      setLessonSubmitting(false);
    }
  }

  async function toggleLessonActive(lesson: LessonDoc) {
    try {
      await setLessonActive({ id: lesson._id, active: !lesson.active });
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the cap nhat bai hoc");
    }
  }

  async function toggleLessonPreview(lesson: LessonDoc) {
    try {
      await updateLesson({ id: lesson._id, isPreview: !lesson.isPreview });
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the cap nhat preview");
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
      toast.error(error?.message ?? "Khong the doi thu tu");
    }
  }

  async function removeLesson(lesson: LessonDoc) {
    if (!window.confirm(`Xoa bai hoc "${lesson.title}"?`)) return;
    try {
      const result = await deleteLesson({ id: lesson._id });
      if (!result?.ok) {
        toast.error("Khong the xoa bai hoc");
        return;
      }
      toast.success("Da xoa bai hoc");
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the xoa bai hoc");
    }
  }

  async function handleAddEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = enrollForm.userId;
    if (!userId) {
      toast.error("Vui long chon hoc vien");
      return;
    }
    const studentInfo = studentMap.get(userId);
    if (!studentInfo) {
      toast.error("Khong tim thay thong tin hoc vien");
      return;
    }
    const orderNumber = Number.parseInt(enrollForm.order, 10);
    const order = Number.isFinite(orderNumber)
      ? orderNumber
      : (enrollments?.length ?? 0);
    const lessonId = enrollForm.lessonId;
    setEnrollSubmitting(true);
    try {
      await upsertEnrollment({
        courseId,
        userId,
        order,
        lastViewedLessonId: lessonId ? (lessonId as Id<"course_lessons">) : null,
      } as any);
      toast.success(`a them ${studentInfo.fullName} vao khoa hoc`);
      setEnrollForm({ userId: "", order: "", lessonId: "" });
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the them hoc vien");
    } finally {
      setEnrollSubmitting(false);
    }
  }

  async function toggleEnrollmentActive(enrollment: EnrollmentDoc) {
    const studentInfo = studentMap.get(enrollment.userId);
    const studentLabel = studentInfo ? `${studentInfo.fullName} (${studentInfo.account})` : enrollment.userId;
    try {
      await setEnrollmentActive({ courseId, userId: enrollment.userId, active: !enrollment.active });
      toast.success(!enrollment.active ? `Da mo quyen cho ${studentLabel}` : `Da khoa quyen cua ${studentLabel}`);
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the cap nhat enrollment");
    }
  }

  function editEnrollment(enrollment: EnrollmentDoc) {
    setEditingEnrollment(enrollment);
    setEnrollmentEditForm({
      progress: enrollment.progressPercent !== undefined ? String(enrollment.progressPercent) : "",
      lessonId: enrollment.lastViewedLessonId ? String(enrollment.lastViewedLessonId) : "",
    });
    setEnrollmentDialogOpen(true);
  }

  function closeEnrollmentDialog() {
    setEnrollmentDialogOpen(false);
    setEnrollmentEditSubmitting(false);
    setEditingEnrollment(null);
    setEnrollmentEditForm({ progress: "", lessonId: "" });
  }

  async function handleEnrollmentEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingEnrollment) return;
    const studentInfo = studentMap.get(editingEnrollment.userId);
    const studentLabel = studentInfo ? `${studentInfo.fullName} (${studentInfo.account})` : editingEnrollment.userId;
    const progressTrim = enrollmentEditForm.progress.trim();
    const progressNumber = progressTrim ? Number(progressTrim) : undefined;
    if (progressNumber !== undefined) {
      if (!Number.isFinite(progressNumber) || progressNumber < 0 || progressNumber > 100) {
        toast.error("Progress phai trong khoang 0-100");
        return;
      }
    }
    setEnrollmentEditSubmitting(true);
    try {
      await updateEnrollmentProgress({
        courseId,
        userId: editingEnrollment.userId,
        progressPercent: progressNumber,
        lastViewedLessonId: enrollmentEditForm.lessonId
          ? (enrollmentEditForm.lessonId as Id<"course_lessons">)
          : null,
      } as any);
      toast.success("Da cap nhat progress");
      closeEnrollmentDialog();
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the cap nhat progress");
    } finally {
      setEnrollmentEditSubmitting(false);
    }
  }


  async function removeEnrollmentEntry(enrollment: EnrollmentDoc) {
    const studentInfo = studentMap.get(enrollment.userId);
    const studentLabel = studentInfo ? `${studentInfo.fullName} (${studentInfo.account})` : enrollment.userId;
    if (!window.confirm(`Xoa quyen cua ${studentLabel}?`)) return;
    try {
      const result = await removeEnrollment({ courseId, userId: enrollment.userId });
      if (!result?.ok) {
        toast.error("Khong the xoa enrollment");
        return;
      }
      toast.success(`a xoa quyen hoc cua ${studentLabel}`);
    } catch (error: any) {
      toast.error(error?.message ?? "Khong the xoa enrollment");
    }
  }

  if (detail === undefined) {
    return <div className="p-6 text-sm text-muted-foreground">Dang tai khoa hoc...</div>;
  }

  if (!course) {
    return <div className="p-6 text-sm text-muted-foreground">Khong tim thay khoa hoc.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quan ly khoa hoc</h1>
          <p className="text-sm text-muted-foreground">Chinh sua thong tin, chuong va bai hoc.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/courses")}>Quay lai</Button>
          <Button variant="secondary" onClick={toggleCourseActive}>
            {course.active ? "Dang hien" : "Dang an"}
          </Button>
          <Button variant="destructive" onClick={handleDeleteCourse}>
            <Trash2 className="mr-2 size-4" />
            Xoa khoa hoc
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thong tin khoa hoc</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm
            initialValues={buildCourseInitial(course)}
            submitting={courseSubmitting}
            submitLabel="Luu"
            onSubmit={handleCourseSubmit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Chuong</CardTitle>
          <Button size="sm" onClick={openCreateChapter}>
            <Plus className="mr-2 size-4" />
            Them chuong
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {chapters.length === 0 && <div className="text-sm text-muted-foreground">Chua co chuong nao.</div>}
          {chapters.map((chapter, index) => (
            <div key={String(chapter._id)} className="rounded-md border">
              <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{chapter.title}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">order #{chapter.order}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                      {chapter.active ? "active" : "inactive"}
                    </span>
                  </div>
                  {chapter.summary && (
                    <div className="text-xs text-muted-foreground">{chapter.summary}</div>
                  )}
                  <label className="inline-flex items-center gap-2 text-sm">
                    <Checkbox checked={chapter.active} onCheckedChange={() => toggleChapterActive(chapter)} />
                    <span>{chapter.active ? "Dang hien" : "Dang an"}</span>
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditChapter(chapter)}>
                    <Pencil className="mr-2 size-4" />
                    Sua
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveChapter(chapter, "up")}
                    disabled={index === 0}
                    title="Len thu tu"
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveChapter(chapter, "down")}
                    disabled={index === chapters.length - 1}
                    title="Xuong thu tu"
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openCreateLesson(chapter._id)}>
                    <Plus className="mr-2 size-4" />
                    Them bai hoc
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => removeChapter(chapter)} title="Xoa">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              {chapter.lessons.length > 0 && (
                <div className="space-y-2 border-t p-3">
                  {chapter.lessons
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((lesson, lessonIndex) => (
                      <div
                        key={String(lesson._id)}
                        className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{lesson.title}</span>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              order #{lesson.order}
                            </span>
                            {lesson.isPreview && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">preview</span>
                            )}
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                              {lesson.active ? "active" : "inactive"}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">YouTube: {lesson.youtubeUrl}</div>
                          {lesson.description && (
                            <div className="text-xs text-muted-foreground">{lesson.description}</div>
                          )}
                          {lesson.exerciseLink && (
                            <div className="text-xs text-muted-foreground">
                              Bai tap: <a className="text-primary hover:underline" href={lesson.exerciseLink} target="_blank" rel="noreferrer">{lesson.exerciseLink}</a>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <label className="inline-flex items-center gap-1">
                              <Checkbox checked={lesson.active} onCheckedChange={() => toggleLessonActive(lesson)} />
                              <span>Dang hien</span>
                            </label>
                            <label className="inline-flex items-center gap-1">
                              <Checkbox checked={lesson.isPreview ?? false} onCheckedChange={() => toggleLessonPreview(lesson)} />
                              <span>Preview</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditLesson(chapter._id, lesson)}>
                            <Pencil className="mr-2 size-4" />
                            Sua
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveLesson(chapter, lesson, "up")}
                            disabled={lessonIndex === 0}
                            title="Len"
                          >
                            <ChevronUp className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveLesson(chapter, lesson, "down")}
                            disabled={lessonIndex === chapter.lessons.length - 1}
                            title="Xuong"
                          >
                            <ChevronDown className="size-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => removeLesson(lesson)} title="Xoa">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 sm:grid-cols-4" onSubmit={handleAddEnrollment}>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Hoc vien</label>
              {students === undefined ? (
                <div className="text-xs text-muted-foreground">ang tai danh sach hoc vien...</div>
              ) : studentOptions.length === 0 ? (
                <div className="text-xs text-muted-foreground">Chua co hoc vien e gan.</div>
              ) : (
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={enrollForm.userId}
                  onChange={(event) => setEnrollForm((prev) => ({ ...prev, userId: event.target.value }))}
                >
                  <option value="">-- Chon hoc vien --</option>
                  {studentOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Thu tu (tuy chon)</label>
              <Input
                value={enrollForm.order}
                onChange={(event) => setEnrollForm((prev) => ({ ...prev, order: event.target.value }))}
                placeholder="Tu ong"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bai hoc cuoi (tuy chon)</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={enrollForm.lessonId}
                onChange={(event) => setEnrollForm((prev) => ({ ...prev, lessonId: event.target.value }))}
              >
                <option value="">Chua chon</option>
                {lessonOptions.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <Button type="submit" disabled={enrollSubmitting || studentOptions.length === 0}>
                {enrollSubmitting ? "ang luu..." : "Gan hoc vien"}
              </Button>
            </div>
          </form>
          <Separator />
          {!enrollments && <div className="text-sm text-muted-foreground">Dang tai enrollment...</div>}
          {enrollments && enrollments.length === 0 && (
            <div className="text-sm text-muted-foreground">Chua co enrollment nao.</div>
          )}
          {enrollments && enrollments.length > 0 && (
            <div className="space-y-2">
              {enrollments
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((enrollment) => (
                  <div
                    key={String(enrollment._id)}
                    className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      {(() => {
                        const studentInfo = studentMap.get(enrollment.userId);
                        const studentLabel = studentInfo
                          ? `${studentInfo.fullName} (${studentInfo.account})`
                          : enrollment.userId;
                        return (
                          <>
                            <div className="font-medium">Hoc vien: {studentLabel}</div>
                            <div className="text-xs text-muted-foreground">order #{enrollment.order}</div>
                            <div className="text-xs text-muted-foreground">
                              Progress: {enrollment.progressPercent ?? 0}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Bai hoc cuoi:
                              {enrollment.lastViewedLessonId
                                ? lessonOptions.find((lesson) => lesson.id === String(enrollment.lastViewedLessonId))?.label ?? String(enrollment.lastViewedLessonId)
                                : " (chua xem)"}
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={enrollment.active}
                                onCheckedChange={() => toggleEnrollmentActive(enrollment)}
                              />
                              <span>{enrollment.active ? "ang hoat ong" : "Bi khoa"}</span>
                            </label>
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => editEnrollment(enrollment)}>
                        <Pencil className="mr-2 size-4" />
                        Cap nhat
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => removeEnrollmentEntry(enrollment)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={chapterDialogOpen} onOpenChange={setChapterDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingChapter ? "Sua chuong" : "Them chuong"}</DialogTitle>
          </DialogHeader>
          <ChapterForm
            initialValues={buildChapterInitial(editingChapter ?? undefined)}
            submitting={chapterSubmitting}
            submitLabel={editingChapter ? "Luu" : "Tao"}
            onSubmit={handleChapterSubmit}
            onCancel={() => setChapterDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>


      <Dialog open={enrollmentDialogOpen} onOpenChange={(open) => {
        if (open) {
          setEnrollmentDialogOpen(true);
        } else {
          closeEnrollmentDialog();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cap nhat enrollment</DialogTitle>
          </DialogHeader>
          {editingEnrollment ? (
            <form className="space-y-4" onSubmit={handleEnrollmentEditSubmit}>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Hoc vien: {studentMap.get(editingEnrollment.userId)?.fullName ?? editingEnrollment.userId}
                </div>
                <label className="text-sm font-medium">Progress (0-100)</label>
                <Input
                  value={enrollmentEditForm.progress}
                  onChange={(event) => setEnrollmentEditForm((prev) => ({ ...prev, progress: event.target.value }))}
                  placeholder="Vi du: 80"
                  type="number"
                  min="0"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bai hoc cuoi</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={enrollmentEditForm.lessonId}
                  onChange={(event) => setEnrollmentEditForm((prev) => ({ ...prev, lessonId: event.target.value }))}
                >
                  <option value="">Chua chon</option>
                  {lessonOptions.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeEnrollmentDialog} disabled={enrollmentEditSubmitting}>
                  Huy
                </Button>
                <Button type="submit" disabled={enrollmentEditSubmitting}>
                  {enrollmentEditSubmitting ? "Dang luu..." : "Luu"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-muted-foreground">Khong co hoc vien duoc chon.</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{lessonContext?.lesson ? "Sua bai hoc" : "Them bai hoc"}</DialogTitle>
          </DialogHeader>
          <LessonForm
            initialValues={buildLessonInitial(lessonContext?.lesson)}
            submitting={lessonSubmitting}
            submitLabel={lessonContext?.lesson ? "Luu" : "Tao"}
            onSubmit={handleLessonSubmit}
            onCancel={() => setLessonDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
