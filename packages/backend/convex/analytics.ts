import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Admin Analytics Dashboard
 * - Revenue tracking
 * - Student statistics
 * - Course enrollment analytics
 * - Financial reports
 */

/**
 * Get revenue statistics
 */
export const getRevenueStats = query({
  args: {
    period: v.optional(v.union(v.literal("month"), v.literal("year"))), // current month/year
  },
  async handler(ctx, args) {
    const period = args.period || "month";
    const now = Date.now();

    let startTime = now;
    if (period === "month") {
      // Start of current month
      const date = new Date(now);
      startTime = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    } else {
      // Start of current year
      const date = new Date(now);
      startTime = new Date(date.getFullYear(), 0, 1).getTime();
    }

    // Get all confirmed payments in period
    const payments = (
      await ctx.db
        .query("payments")
        .withIndex("by_status", (q) => q.eq("status", "confirmed"))
        .collect()
    ).filter((payment) => payment.confirmedAt && payment.confirmedAt >= startTime);

    // Get all orders for reference
    const allOrders = await ctx.db.query("orders").collect();

    // Calculate revenue
    const totalRevenue = payments.reduce((sum, payment) => {
      const order = allOrders.find((o) => o._id === payment.orderId);
      return sum + (order?.totalAmount || 0);
    }, 0);

    const totalTransactions = payments.length;

    // Calculate by product
    const revenueByCategory: Record<string, number> = {};
    for (const payment of payments) {
      const order = allOrders.find((o) => o._id === payment.orderId);
      if (order) {
        // Get order items to find products
        const orderItems = await ctx.db
          .query("order_items")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();
        
        for (const item of orderItems) {
          const key = `${item.productType}:${item.productId}`;
          revenueByCategory[key] = (revenueByCategory[key] || 0) + item.price;
        }
      }
    }

    return {
      period,
      totalRevenue,
      totalTransactions,
      averageTransactionValue:
        totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0,
      revenueByCategory,
    };
  },
});

/**
 * Get student statistics
 */
export const getStudentStats = query({
  args: {},
  async handler(ctx) {
    // Get all students
    const students = await ctx.db.query("students").collect();

    // Get enrollments
    const enrollments = await ctx.db.query("course_enrollments").collect();

    // Get certificates
    const certificates = await ctx.db.query("certificates").collect();

    // Calculate stats
    const totalStudents = students.filter((s) => s.active).length;

    // New students (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const newStudents = students.filter(
      (s) => s.active && s.createdAt >= thirtyDaysAgo
    ).length;

    // Active students (enrolled in courses)
    const activeStudents = new Set(enrollments.map((e) => e.userId)).size;

    // Students with certificates
    const studentsWithCertificates = new Set(certificates.map((c) => c.studentId)).size;

    // Average courses per student
    const averageCoursesPerStudent =
      activeStudents > 0
        ? (enrollments.length / activeStudents).toFixed(2)
        : "0";

    return {
      totalStudents,
      newStudents,
      activeStudents,
      studentsWithCertificates,
      averageCoursesPerStudent: parseFloat(averageCoursesPerStudent as string),
    };
  },
});

/**
 * Get course enrollment statistics
 */
export const getCourseEnrollmentStats = query({
  args: {},
  async handler(ctx) {
    // Get all courses
    const courses = await ctx.db.query("courses").collect();

    // Get enrollments
    const enrollments = await ctx.db.query("course_enrollments").collect();

    // Get certificates
    const certificates = await ctx.db.query("certificates").collect();

    // Calculate stats per course
    const courseStats = courses
      .filter((c) => c.active)
      .map((course) => {
        const courseEnrollments = enrollments.filter(
          (e) => e.courseId.toString() === course._id.toString()
        );
        const courseCompletions = certificates.filter(
          (c) => c.courseId.toString() === course._id.toString()
        );

        return {
          courseId: course._id,
          courseTitle: course.title,
          enrollments: courseEnrollments.length,
          completions: courseCompletions.length,
          completionRate:
            courseEnrollments.length > 0
              ? ((courseCompletions.length / courseEnrollments.length) * 100).toFixed(1)
              : "0",
          pricingType: course.pricingType,
          averageRating: course.averageRating || 0,
          totalReviews: course.totalReviews || 0,
        };
      })
      .sort((a, b) => b.enrollments - a.enrollments);

    return {
      totalCourses: courseStats.length,
      topCourses: courseStats.slice(0, 10),
      stats: courseStats,
    };
  },
});

/**
 * Get payment statistics
 */
export const getPaymentStats = query({
  args: {},
  async handler(ctx) {
    // Get all payments
    const payments = await ctx.db.query("payments").collect();

    // Get orders
    const orders = await ctx.db.query("orders").collect();

    // Calculate stats
    const totalPayments = payments.length;
    const confirmedPayments = payments.filter((p) => p.status === "confirmed").length;
    const pendingPayments = payments.filter((p) => p.status === "pending").length;
    const rejectedPayments = payments.filter((p) => p.status === "rejected").length;

    // Calculate confirmation rate
    const confirmationRate =
      totalPayments > 0 ? ((confirmedPayments / totalPayments) * 100).toFixed(1) : "0";

    // Calculate average time to confirmation
    const confirmedPaymentsWithTime = payments
      .filter((p) => p.status === "confirmed" && p.confirmedAt && p.createdAt)
      .map((p) => (p.confirmedAt! - p.createdAt) / (1000 * 60 * 60)); // in hours

    const averageConfirmationTime =
      confirmedPaymentsWithTime.length > 0
        ? (
            confirmedPaymentsWithTime.reduce((a, b) => a + b, 0) /
            confirmedPaymentsWithTime.length
          ).toFixed(2)
        : "0";

    return {
      totalPayments,
      confirmedPayments,
      pendingPayments,
      rejectedPayments,
      confirmationRate: parseFloat(confirmationRate as string),
      averageConfirmationTimeHours: parseFloat(averageConfirmationTime as string),
    };
  },
});

/**
 * Get learner progress statistics
 */
export const getLearnerProgressStats = query({
  args: {},
  async handler(ctx) {
    // Get lesson completions
    const completions = await ctx.db.query("lesson_completions").collect();

    // Get course enrollments
    const enrollments = await ctx.db.query("course_enrollments").collect();

    // Get quiz attempts
    const quizAttempts = await ctx.db.query("quiz_attempts").collect();

    // Calculate stats
    const totalWatchHours = Math.round(
      completions.reduce((sum, c) => sum + (c.watchTimeSeconds || 0), 0) / 3600
    );

    const completedLessons = completions.filter((c) => c.isCompleted).length;
    const totalLessons = completions.length;

    const completedCourses = enrollments.filter(
      (e) => e.completionPercentage === 100
    ).length;

    const totalQuizzes = quizAttempts.length;
    const passedQuizzes = quizAttempts.filter((q) => q.passed).length;
    const quizPassRate =
      totalQuizzes > 0 ? ((passedQuizzes / totalQuizzes) * 100).toFixed(1) : "0";

    return {
      totalWatchHours,
      completedLessons,
      totalLessons,
      lessonCompletionRate:
        totalLessons > 0 ? ((completedLessons / totalLessons) * 100).toFixed(1) : "0",
      completedCourses,
      totalQuizzes,
      passedQuizzes,
      quizPassRate: parseFloat(quizPassRate as string),
    };
  },
});

/**
 * Get engagement statistics (comments, reviews, etc.)
 */
export const getEngagementStats = query({
  args: {},
  async handler(ctx) {
    // Get comments
    const comments = await ctx.db.query("comments").collect();
    const activeComments = comments.filter((c) => !c.deletedAt);

    // Get reviews
    const reviews = await ctx.db.query("course_reviews").collect();
    const activeReviews = reviews.filter((r) => !r.deletedAt);

    // Get notifications
    const notifications = await ctx.db.query("notifications").collect();

    return {
      totalComments: activeComments.length,
      totalReplies: activeComments.filter((c) => c.parentCommentId).length,
      averageLikesPerComment:
        activeComments.length > 0
          ? (
              activeComments.reduce((sum, c) => sum + c.likesCount, 0) /
              activeComments.length
            ).toFixed(2)
          : "0",
      totalReviews: activeReviews.length,
      averageRating:
        activeReviews.length > 0
          ? (activeReviews.reduce((sum, r) => sum + r.rating, 0) / activeReviews.length).toFixed(1)
          : "0",
      totalNotificationsSent: notifications.length,
      unreadNotifications: notifications.filter((n) => !n.isRead).length,
    };
  },
});
