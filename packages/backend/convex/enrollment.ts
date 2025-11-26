// Enrollment progress tracking
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Query: Get student's enrollment progress for a course
 */
export const getEnrollmentProgress = query({
  args: {
    courseId: v.id("courses"),
    userId: v.string(),
  },
  handler: async (ctx, { courseId, userId }) => {
    const enrollment = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course_user", (q) =>
        q.eq("courseId", courseId).eq("userId", userId)
      )
      .first();

    if (!enrollment) {
      return {
        _id: "" as any,
        progressPercent: undefined,
        lastViewedLessonId: undefined,
        enrolledAt: 0,
        active: false,
        exists: false,
      };
    }

    return {
      _id: enrollment._id,
      progressPercent: enrollment.progressPercent,
      lastViewedLessonId: enrollment.lastViewedLessonId,
      enrolledAt: enrollment.enrolledAt,
      active: enrollment.active,
      exists: true,
    };
  },
});

/**
 * Mutation: Update progress for a course enrollment
 * Tracks which lesson was last viewed and overall progress
 */
export const updateEnrollmentProgress = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.string(),
    lastViewedLessonId: v.optional(v.id("course_lessons")),
    progressPercent: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { courseId, userId, lastViewedLessonId, progressPercent }
  ) => {
    const enrollment = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course_user", (q) =>
        q.eq("courseId", courseId).eq("userId", userId)
      )
      .first();

    if (!enrollment) {
      throw new ConvexError("Enrollment not found for this course");
    }

    if (!enrollment.active) {
      throw new ConvexError("Enrollment is not active");
    }

    const patch: Record<string, any> = {};

    if (lastViewedLessonId !== undefined) {
      patch.lastViewedLessonId = lastViewedLessonId;
    }

    if (progressPercent !== undefined) {
      // Validate progress is between 0 and 100
      const normalized = Math.max(0, Math.min(100, progressPercent));
      patch.progressPercent = normalized;
    }

    await ctx.db.patch(enrollment._id, patch);

    return {
      success: true,
      message: "Enrollment progress updated",
    };
  },
});

/**
 * Query: Get student's enrolled courses with progress
 */
export const getStudentEnrolledCourses = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const enrollments = await ctx.db
      .query("course_enrollments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const result = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        return {
          enrollmentId: enrollment._id,
          courseId: enrollment.courseId,
          courseName: course?.title || "Unknown Course",
          progressPercent: enrollment.progressPercent,
          lastViewedLessonId: enrollment.lastViewedLessonId,
          enrolledAt: enrollment.enrolledAt,
          active: enrollment.active,
        };
      })
    );

    return result;
  },
});

/**
 * Mutation: Mark course as completed
 * Sets progress to 100% and marks enrollment as completed if applicable
 */
export const markCourseCompleted = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.string(),
  },
  handler: async (ctx, { courseId, userId }) => {
    const enrollment = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course_user", (q) =>
        q.eq("courseId", courseId).eq("userId", userId)
      )
      .first();

    if (!enrollment) {
      throw new ConvexError("Enrollment not found");
    }

    await ctx.db.patch(enrollment._id, {
      progressPercent: 100,
    });

    return {
      success: true,
      message: "Course marked as completed",
    };
  },
});

/**
 * Query: Get course statistics for admin
 * Shows how many students are enrolled, completion rates, etc.
 */
export const getCourseEnrollmentStats = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, { courseId }) => {
    const enrollments = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();

    const totalEnrolled = enrollments.length;
    const activeEnrolled = enrollments.filter((e) => e.active).length;
    const completed = enrollments.filter(
      (e) => e.progressPercent === 100
    ).length;

    const totalProgress = enrollments.reduce((sum, e) => {
      return sum + (e.progressPercent || 0);
    }, 0);
    const averageProgress =
      totalEnrolled > 0 ? Math.round(totalProgress / totalEnrolled) : 0;

    return {
      totalEnrolled,
      activeEnrolled,
      completed,
      averageProgress,
    };
  },
});
