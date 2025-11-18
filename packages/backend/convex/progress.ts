// Tracking học tập: tiến độ, xem video, hoàn thành bài
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Record lesson view - ghi nhận học viên xem bài
 */
export const recordLessonView = mutation({
  args: {
    studentId: v.id("students"),
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
    studentId: v.id("students"),
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

    // Auto-issue certificate if completed
    if (completionPercentage === 100) {
      await ctx.db.insert("certificates", {
        studentId: userId as Id<"students">,
        courseId,
        certificateCode: generateCertificateCode(),
        issuedAt: now,
        createdAt: now,
      });
    }
  }
}

/**
 * Get enrollment progress - lấy tiến độ chi tiết
 */
export const getEnrollmentProgress = query({
  args: {
    courseId: v.id("courses"),
    studentId: v.id("students"),
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
    studentId: v.id("students"),
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
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
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

/**
 * Generate certificate code: DOHY-2024-XXXXX
 */
function generateCertificateCode(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `DOHY-${year}-${random}`;
}
