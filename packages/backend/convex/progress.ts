// Tracking học tập: tiến độ, xem video, hoàn thành bài
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Record lesson view - ghi nhận học viên xem bài
 */
export const recordLessonView = mutation({
  args: {
    studentId: v.string(),
    lessonId: v.id("course_lessons"),
    courseId: v.id("courses"),
    watchTimeSeconds: v.optional(v.number()),
  },
  handler: async (ctx, { studentId, lessonId, courseId, watchTimeSeconds = 0 }) => {
    // Tìm hoặc tạo lesson completion record
    const existing = await ctx.db
      .query("lesson_completions")
      .withIndex("by_student_lesson", (q) =>
        q.eq("studentId", studentId).eq("lessonId", lessonId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Update: cộng thêm watch time, update lastWatchedAt
      await ctx.db.patch(existing._id, {
        watchTimeSeconds: (existing.watchTimeSeconds || 0) + watchTimeSeconds,
        lastWatchedAt: now,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new
      const completionId = await ctx.db.insert("lesson_completions", {
        studentId,
        lessonId,
        courseId,
        watchTimeSeconds,
        lastWatchedAt: now,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      });
      return completionId;
    }
  },
});

/**
 * Complete lesson - đánh dấu bài là hoàn thành nếu xem đủ 80% thời lượng
 */
export const completeLessonIfDone = mutation({
  args: {
    studentId: v.string(),
    lessonId: v.id("course_lessons"),
  },
  handler: async (ctx, { studentId, lessonId }) => {
    // Get lesson duration
    const lesson = await ctx.db.get(lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const durationSeconds = lesson.durationSeconds || 0;
    const watchThreshold = Math.floor(durationSeconds * 0.8); // 80%

    // Get completion record
    const completion = await ctx.db
      .query("lesson_completions")
      .withIndex("by_student_lesson", (q) =>
        q.eq("studentId", studentId).eq("lessonId", lessonId)
      )
      .first();

    if (!completion) {
      return { isCompleted: false, message: "No completion record found" };
    }

    const watchedSeconds = completion.watchTimeSeconds || 0;

    if (watchedSeconds >= watchThreshold && !completion.isCompleted) {
      const now = Date.now();
      await ctx.db.patch(completion._id, {
        isCompleted: true,
        completedAt: now,
        updatedAt: now,
      });

      // Update enrollment progress
      await updateEnrollmentProgress(ctx, lesson.courseId, studentId);

      return { isCompleted: true, message: `Bài học hoàn thành: ${watchedSeconds}/${durationSeconds}s` };
    }

    return {
      isCompleted: completion.isCompleted,
      message: `Cần xem ${watchThreshold - watchedSeconds} giây nữa`,
      currentWatch: watchedSeconds,
      required: watchThreshold,
    };
  },
});

/**
 * Mark lesson as complete - đánh dấu bài hoàn thành (user tick checkbox)
 */
export const markLessonComplete = mutation({
  args: {
    studentId: v.string(),
    lessonId: v.id("course_lessons"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, { studentId, lessonId, courseId }) => {
    // Tìm hoặc tạo lesson completion record
    const existing = await ctx.db
      .query("lesson_completions")
      .withIndex("by_student_lesson", (q) =>
        q.eq("studentId", studentId).eq("lessonId", lessonId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Update: set isCompleted = true
      await ctx.db.patch(existing._id, {
        isCompleted: true,
        completedAt: now,
        updatedAt: now,
      });
    } else {
      // Create new with isCompleted = true
      await ctx.db.insert("lesson_completions", {
        studentId,
        lessonId,
        courseId,
        watchTimeSeconds: 0,
        lastWatchedAt: now,
        isCompleted: true,
        completedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update enrollment progress
    await updateEnrollmentProgress(ctx, courseId, studentId);
  },
});

/**
 * Unmark lesson as complete - bỏ tick checkbox
 */
export const unmarkLessonComplete = mutation({
  args: {
    studentId: v.string(),
    lessonId: v.id("course_lessons"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, { studentId, lessonId, courseId }) => {
    // Tìm lesson completion record
    const existing = await ctx.db
      .query("lesson_completions")
      .withIndex("by_student_lesson", (q) =>
        q.eq("studentId", studentId).eq("lessonId", lessonId)
      )
      .first();

    if (existing) {
      const now = Date.now();
      // Update: set isCompleted = false
      await ctx.db.patch(existing._id, {
        isCompleted: false,
        completedAt: undefined,
        updatedAt: now,
      });

      // Update enrollment progress
      await updateEnrollmentProgress(ctx, courseId, studentId);
    }
  },
});

/**
 * Update enrollment progress - tính lại tiến độ khóa học
 */
async function updateEnrollmentProgress(
  ctx: any,
  courseId: Id<"courses">,
  userId: string
) {
  // Get all lessons in course
  const lessons = await ctx.db
    .query("course_lessons")
    .withIndex("by_course_order", (q: any) => q.eq("courseId", courseId))
    .collect();

  if (lessons.length === 0) return;

  // Count completed lessons
  const completions = await ctx.db
    .query("lesson_completions")
    .withIndex("by_student_course", (q: any) =>
      q.eq("studentId", userId).eq("courseId", courseId)
    )
    .collect();

  const completedCount = completions.filter((c: any) => c.isCompleted).length;
  const completionPercentage = Math.round((completedCount / lessons.length) * 100);

  // Sync progress sang customer_purchases (neu la khach hang)
  try {
    const purchase = (await ctx.db
      .query("customer_purchases")
      .withIndex("by_product", (q: any) =>
        q.eq("productType", "course").eq("productId", courseId)
      )
      .collect()).find((p: any) => String(p.customerId) === userId);

    if (purchase) {
      await ctx.db.patch(purchase._id, {
        progressPercent: completionPercentage,
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.warn("Sync progress purchase failed", error);
  }

  // Update enrollment
  const enrollment = await ctx.db
    .query("course_enrollments")
    .withIndex("by_course_user", (q: any) =>
      q.eq("courseId", courseId).eq("userId", userId)
    )
    .first();

  if (enrollment) {
    const now = Date.now();
    const newStatus =
      completionPercentage === 100 ? "completed" : enrollment.status;

    await ctx.db.patch(enrollment._id, {
      completionPercentage,
      progressPercent: completionPercentage,
      status: newStatus,
      completedAt: newStatus === "completed" ? now : enrollment.completedAt,
    });

    // Auto-issue certificate if completed (chi tao neu dung studentId hop le)
    if (completionPercentage === 100) {
      try {
        const studentId = userId as Id<"students">;
        const hasCertificate = await ctx.db
          .query("certificates")
          .withIndex("by_student_course", (q: any) =>
            q.eq("studentId", studentId).eq("courseId", courseId)
          )
          .first();

        if (!hasCertificate) {
          await ctx.db.insert("certificates", {
            studentId,
            courseId,
            certificateCode: generateCertificateCode(),
            issuedAt: now,
            createdAt: now,
          });
        }
      } catch (error) {
        console.warn("Bo qua tao certificate vi studentId khong hop le", error);
      }
    }
  }
}

/**
 * Get enrollment progress - lấy tiến độ chi tiết
 */
export const getEnrollmentProgress = query({
  args: {
    courseId: v.id("courses"),
    studentId: v.string(),
  },
  handler: async (ctx, { courseId, studentId }) => {
    const userId = studentId as string;

    // Get enrollment
    const enrollment = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course_user", (q) =>
        q.eq("courseId", courseId).eq("userId", userId)
      )
      .first();

    if (!enrollment) {
      return {
        exists: false,
        message: "Chưa đăng ký khóa học",
      };
    }

    // Get chapters and lessons
    const chapters = await ctx.db
      .query("course_chapters")
      .withIndex("by_course_order", (q) => q.eq("courseId", courseId))
      .collect();

    const lessonsAll = await ctx.db
      .query("course_lessons")
      .withIndex("by_course_order", (q) => q.eq("courseId", courseId))
      .collect();

    // Get completions
    const completions = await ctx.db
      .query("lesson_completions")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", studentId).eq("courseId", courseId)
      )
      .collect();

    // Build chapter progress
    const chaptersProgress = chapters.map((chapter: any) => {
      const chapterLessons = lessonsAll.filter((l: any) => l.chapterId === chapter._id);
      const completedLessons = completions.filter((c: any) =>
        chapterLessons.some((l: any) => l._id === c.lessonId && c.isCompleted)
      );

      return {
        chapterId: chapter._id,
        title: chapter.title,
        totalLessons: chapterLessons.length,
        completedLessons: completedLessons.length,
        percentage: chapterLessons.length > 0
          ? Math.round((completedLessons.length / chapterLessons.length) * 100)
          : 0,
        lessons: chapterLessons.map((lesson: any) => {
          const completion = completions.find((c: any) => c.lessonId === lesson._id);
          return {
            lessonId: lesson._id,
            title: lesson.title,
            isCompleted: completion?.isCompleted || false,
            watchedSeconds: completion?.watchTimeSeconds || 0,
            duration: lesson.durationSeconds || 0,
          };
        }),
      };
    });

    return {
      exists: true,
      enrollmentId: enrollment._id,
      status: enrollment.status,
      completionPercentage: enrollment.completionPercentage || 0,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      lastViewedLessonId: enrollment.lastViewedLessonId,
      chaptersProgress,
    };
  },
});

/**
 * Get learner statistics - thống kê học tập
 */
export const getLearnerStats = query({
  args: {
    studentId: v.string(),
  },
  handler: async (ctx, { studentId }) => {
    const userId = studentId as string;

    // Get all enrollments
    const enrollments = await ctx.db
      .query("course_enrollments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get all lesson completions
    const allCompletions = await ctx.db
      .query("lesson_completions")
      .withIndex("by_student_course", (q: any) =>
        q.eq("studentId", studentId)
      )
      .collect();

    // Calculate stats
    const totalCoursesEnrolled = enrollments.length;
    const completedCourses = enrollments.filter(
      (e: any) => e.status === "completed"
    ).length;
    const inProgressCourses = enrollments.filter(
      (e: any) => e.status === "active"
    ).length;

    const totalWatchTimeSeconds = allCompletions.reduce(
      (sum: number, c: any) => sum + (c.watchTimeSeconds || 0),
      0
    );

    // Get certificates
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_student", (q: any) => q.eq("studentId", studentId as any))
      .collect();

    return {
      totalCoursesEnrolled,
      completedCourses,
      inProgressCourses,
      totalWatchTimeHours: Math.round(totalWatchTimeSeconds / 3600),
      totalWatchTimeSeconds,
      certificatesEarned: certificates.length,
      averageCompletionPercent: enrollments.length > 0
        ? Math.round(
            enrollments.reduce((sum: number, e: any) => sum + (e.completionPercentage || 0), 0) /
              enrollments.length
          )
        : 0,
    };
  },
});

type LessonProgress = {
  lessonId: Id<"course_lessons">;
  title: string;
  chapterTitle: string;
  isCompleted: boolean;
  watchedSeconds: number;
  durationSeconds: number;
};

type CourseProgressEntry = {
  purchaseId: Id<"customer_purchases">;
  courseId: Id<"courses">;
  courseTitle: string;
  progressPercent: number;
  status: string;
  totalWatchSeconds: number;
  bestScore: number | null;
  lessons: LessonProgress[];
  completedLessonIds: Id<"course_lessons">[];
  pendingLessonIds: Id<"course_lessons">[];
  enrolledAt: number;
  updatedAt?: number;
};

export const getCustomerCourseProgress = query({
  args: { customerId: v.id("customers") },
  returns: v.array(
    v.object({
      purchaseId: v.id("customer_purchases"),
      courseId: v.id("courses"),
      courseTitle: v.string(),
      progressPercent: v.number(),
      status: v.string(),
      totalWatchSeconds: v.number(),
      bestScore: v.union(v.number(), v.null()),
      lessons: v.array(
        v.object({
          lessonId: v.id("course_lessons"),
          title: v.string(),
          chapterTitle: v.string(),
          isCompleted: v.boolean(),
          watchedSeconds: v.number(),
          durationSeconds: v.number(),
        })
      ),
      completedLessonIds: v.array(v.id("course_lessons")),
      pendingLessonIds: v.array(v.id("course_lessons")),
      enrolledAt: v.number(),
      updatedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, { customerId }) => {
    const purchases = await ctx.db
      .query("customer_purchases")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .collect();

    const coursePurchases = purchases.filter((p) => p.productType === "course");
    const studentId = String(customerId);

    return Promise.all(
      coursePurchases.map((purchase) =>
        buildCourseProgress(ctx, purchase, studentId)
      )
    );
  },
});

async function buildCourseProgress(
  ctx: any,
  purchase: any,
  studentId: string
): Promise<CourseProgressEntry> {
  const courseId = purchase.productId as Id<"courses">;
  const data = await loadCourseCollections(ctx, courseId, studentId);
  const lessons = mapLessonsProgress(
    data.chapters,
    data.lessons,
    data.completions
  );
  const completed = lessons.filter((l) => l.isCompleted).map((l) => l.lessonId);
  const pending = lessons.filter((l) => !l.isCompleted).map((l) => l.lessonId);
  const totalWatchSeconds = data.completions.reduce(
    (sum: number, c: any) => sum + (c.watchTimeSeconds || 0),
    0
  );
  const progressPercent =
    data.enrollment?.completionPercentage ?? purchase.progressPercent ?? 0;

  return {
    purchaseId: purchase._id,
    courseId,
    courseTitle: data.course?.title ?? "Khoa hoc",
    progressPercent: Math.round(progressPercent || 0),
    status: data.enrollment?.status ?? (progressPercent === 100 ? "completed" : "active"),
    totalWatchSeconds,
    bestScore: pickBestScore(data.attempts, studentId),
    lessons,
    completedLessonIds: completed,
    pendingLessonIds: pending,
    enrolledAt: data.enrollment?.enrolledAt ?? purchase.createdAt,
    updatedAt: purchase.updatedAt,
  };
}

async function loadCourseCollections(
  ctx: any,
  courseId: Id<"courses">,
  studentId: string
) {
  const [course, enrollment, chapters, lessons, completions, attempts] =
    await Promise.all([
      ctx.db.get(courseId),
      ctx.db
        .query("course_enrollments")
        .withIndex("by_course_user", (q: any) =>
          q.eq("courseId", courseId).eq("userId", studentId)
        )
        .first(),
      ctx.db
        .query("course_chapters")
        .withIndex("by_course_order", (q: any) => q.eq("courseId", courseId))
        .collect(),
      ctx.db
        .query("course_lessons")
        .withIndex("by_course_order", (q: any) => q.eq("courseId", courseId))
        .collect(),
      ctx.db
        .query("lesson_completions")
        .withIndex("by_student_course", (q: any) =>
          q.eq("studentId", studentId).eq("courseId", courseId)
        )
        .collect(),
      ctx.db
        .query("quiz_attempts")
        .withIndex("by_course", (q: any) => q.eq("courseId", courseId))
        .collect(),
    ]);

  return { course, enrollment, chapters, lessons, completions, attempts };
}

function mapLessonsProgress(
  chapters: any[],
  lessons: any[],
  completions: any[]
): LessonProgress[] {
  const withChapter = lessons.map((lesson: any) => ({
    lessonId: lesson._id as Id<"course_lessons">,
    title: lesson.title as string,
    chapterTitle:
      chapters.find((c) => c._id === lesson.chapterId)?.title ?? "Chuong",
    isCompleted: false,
    watchedSeconds: 0,
    durationSeconds: lesson.durationSeconds || 0,
  }));

  return withChapter.map((lesson) => {
    const completion = completions.find(
      (c) => String(c.lessonId) === String(lesson.lessonId)
    );
    return {
      ...lesson,
      isCompleted: completion?.isCompleted ?? false,
      watchedSeconds: completion?.watchTimeSeconds ?? 0,
    };
  });
}

function pickBestScore(attempts: any[], studentId: string): number | null {
  const mine = attempts.filter((a) => String(a.studentId) === studentId);
  if (mine.length === 0) return null;
  return mine.reduce(
    (max: number | null, attempt: any) =>
      max === null || attempt.score > max ? attempt.score : max,
    null
  );
}

/**
 * Generate certificate code: DOHY-2024-XXXXX
 */
function generateCertificateCode(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `DOHY-${year}-${random}`;
}
