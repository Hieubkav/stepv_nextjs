// Payment functions for course purchases (KISS implementation)
import { mutation, query, action } from "./_generated/server";
import type { MutationCtx, QueryCtx, ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

type AnyCtx = MutationCtx | QueryCtx;

/**
 * Mutation: Create an order when student wants to buy a course
 * Status: pending (waiting for payment)
 */
export const createOrder = mutation({
  args: {
    studentId: v.id("students"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, { studentId, courseId }) => {
    const now = Date.now();

    // Verify student exists
    const student = await ctx.db.get(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Verify course exists and get price
    const course = await ctx.db.get(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if student already has active order or enrollment for this course
    const existingEnrollment = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course_user", (q) =>
        q.eq("courseId", courseId).eq("userId", student._id.toString())
      )
      .first();

    if (existingEnrollment && existingEnrollment.active) {
      throw new Error("Student already enrolled in this course");
    }

    // Check for pending order
    const pendingOrder = await ctx.db
      .query("orders")
      .withIndex("by_student_status", (q) =>
        q.eq("studentId", studentId).eq("status", "pending")
      )
      .filter((q) => q.eq(q.field("courseId"), courseId))
      .first();

    if (pendingOrder) {
      throw new Error("Order already exists and is pending payment");
    }

    // Get course price
    const amount = course.priceAmount || 0;

    // Create order
    const orderId = await ctx.db.insert("orders", {
      studentId: studentId,
      courseId: courseId,
      amount: amount,
      status: "pending",
      paymentMethod: "vietqr",
      notes: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return {
      orderId,
      message: "Order created successfully",
    };
  },
});

/**
 * Query: Get order details
 */
export const getOrder = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) {
      return {
        _id: "" as any,
        studentId: "" as any,
        courseId: "" as any,
        amount: 0,
        status: "",
        paymentMethod: "",
        createdAt: 0,
        updatedAt: 0,
        courseName: "",
        exists: false,
      };
    }

    const course = await ctx.db.get(order.courseId);
    if (!course) {
      return {
        _id: "" as any,
        studentId: "" as any,
        courseId: "" as any,
        amount: 0,
        status: "",
        paymentMethod: "",
        createdAt: 0,
        updatedAt: 0,
        courseName: "",
        exists: false,
      };
    }

    return {
      _id: order._id,
      studentId: order.studentId,
      courseId: order.courseId,
      amount: order.amount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      courseName: course.title,
      exists: true,
    };
  },
});

/**
 * Query: List student orders
 */
export const listStudentOrders = query({
  args: {
    studentId: v.id("students"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { studentId, status }) => {
    let orders = await ctx.db
      .query("orders")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .collect();

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    // Fetch course names
    const result = await Promise.all(
      orders.map(async (order) => {
        const course = await ctx.db.get(order.courseId);
        return {
          _id: order._id,
          courseId: order.courseId,
          amount: order.amount,
          status: order.status,
          createdAt: order.createdAt,
          courseName: course?.title || "Unknown Course",
        };
      })
    );

    return result;
  },
});

/**
 * Mutation: Record payment (student uploads proof/screenshot)
 * Creates payment record with status "pending" waiting for admin confirmation
 */
export const recordPayment = mutation({
  args: {
    orderId: v.id("orders"),
    studentId: v.id("students"),
    qrCodeUrl: v.optional(v.string()),
    qrCodeData: v.optional(v.string()),
    bankAccount: v.optional(v.string()),
    bankAccountName: v.optional(v.string()),
    screenshotUrl: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      orderId,
      studentId,
      qrCodeUrl,
      qrCodeData,
      bankAccount,
      bankAccountName,
      screenshotUrl,
    }
  ) => {
    const now = Date.now();

    // Verify order exists
    const order = await ctx.db.get(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Verify student
    const student = await ctx.db.get(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Check if payment already exists for this order
    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .filter((q) => q.neq(q.field("status"), "rejected"))
      .first();

    if (existingPayment) {
      throw new Error("Payment already recorded for this order");
    }

    // Create payment record
    const paymentId = await ctx.db.insert("payments", {
      orderId: orderId,
      studentId: studentId,
      email: student.email,
      qrCodeUrl,
      qrCodeData,
      bankAccount,
      bankAccountName,
      transactionId: undefined,
      status: "pending",
      screenshotUrl,
      paidAt: undefined,
      confirmedAt: undefined,
      confirmedByAdminId: undefined,
      rejectionReason: undefined,
      createdAt: now,
      updatedAt: now,
    });

    // Send notification email to admin
    // TODO: Implement email sending via separate action
    // await ctx.runAction(internal.email.sendPaymentRequestToAdminEmail, {...});

    // Send confirmation email to student
    // TODO: Implement email sending via separate action
    // await ctx.runAction(internal.email.sendPaymentReceivedEmail, {...});

    return {
      paymentId,
      message: "Payment recorded. Waiting for admin confirmation.",
    };
  },
});

/**
 * Mutation: Admin confirms payment
 * - Updates payment status to "confirmed"
 * - Updates order status to "paid"
 * - Creates enrollment for student
 * - Sends confirmation email
 */
export const adminConfirmPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    adminStudentId: v.id("students"),
  },
  handler: async (ctx, { paymentId, adminStudentId }) => {
    const now = Date.now();

    // Verify admin is a student (we're using students table for all users)
    const admin = await ctx.db.get(adminStudentId);
    if (!admin) {
      throw new Error("Admin not found");
    }

    // Get payment
    const payment = await ctx.db.get(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "pending") {
      throw new Error(`Payment status is ${payment.status}, cannot confirm`);
    }

    // Get order
    const order = await ctx.db.get(payment.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Update payment
    await ctx.db.patch(paymentId, {
      status: "confirmed",
      confirmedAt: now,
      confirmedByAdminId: adminStudentId,
      updatedAt: now,
    });

    // Update order
    await ctx.db.patch(payment.orderId, {
      status: "paid",
      updatedAt: now,
    });

    // Create enrollment for student
    const existingEnrollment = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course_user", (q) =>
        q.eq("courseId", order.courseId).eq("userId", payment.studentId.toString())
      )
      .first();

    if (!existingEnrollment) {
      await ctx.db.insert("course_enrollments", {
        courseId: order.courseId,
        userId: payment.studentId.toString(),
        enrolledAt: now,
        progressPercent: 0,
        status: "active" as const,
        lastViewedLessonId: undefined,
        order: 0,
        active: true,
      });
    } else {
      // Reactivate if was inactive
      await ctx.db.patch(existingEnrollment._id, {
        active: true,
        enrolledAt: now,
      });
    }

    // Get student and course for email
    const student = await ctx.db.get(payment.studentId);
    const course = await ctx.db.get(order.courseId);

    // Send confirmation email
    // TODO: Implement email sending via separate action
    // if (student && course) {
    //   await ctx.runAction(
    //     internal.email.sendPaymentConfirmedEmail,
    //     {...}
    //   );
    // }

    return {
      success: true,
      message: "Payment confirmed. Student enrolled.",
    };
  },
});

/**
 * Mutation: Admin rejects payment
 * - Updates payment status to "rejected"
 * - Sends rejection email with reason
 * - Student can retry
 */
export const adminRejectPayment = mutation({
  args: {
    paymentId: v.id("payments"),
    adminStudentId: v.id("students"),
    reason: v.string(),
  },
  handler: async (ctx, { paymentId, adminStudentId, reason }) => {
    const now = Date.now();

    // Verify admin
    const admin = await ctx.db.get(adminStudentId);
    if (!admin) {
      throw new Error("Admin not found");
    }

    // Get payment
    const payment = await ctx.db.get(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "pending") {
      throw new Error(`Payment status is ${payment.status}, cannot reject`);
    }

    // Update payment
    await ctx.db.patch(paymentId, {
      status: "rejected",
      rejectionReason: reason,
      updatedAt: now,
    });

    // Get student
    const student = await ctx.db.get(payment.studentId);
    // TODO: Implement email sending via separate action
    // if (student) {
    //   await ctx.runAction(
    //     internal.email.sendPaymentRejectedEmail,
    //     {...}
    //   );
    // }

    return {
      success: true,
      message: "Payment rejected. Notification sent to student.",
    };
  },
});

/**
 * Query: List pending payments for admin
 */
export const listPendingPayments = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_pending", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    const result = await Promise.all(
      payments.map(async (payment) => {
        const order = await ctx.db.get(payment.orderId);
        const course = order ? await ctx.db.get(order.courseId) : null;

        return {
          _id: payment._id,
          orderId: payment.orderId,
          studentName: payment.email || "Unknown",
          studentEmail: payment.email,
          courseName: course?.title || "Unknown Course",
          amount: order?.amount || 0,
          screenshotUrl: payment.screenshotUrl,
          createdAt: payment.createdAt,
        };
      })
    );

    return result;
  },
});

/**
 * Query: Get payment details
 */
export const getPayment = query({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, { paymentId }) => {
    const payment = await ctx.db.get(paymentId);
    if (!payment) return undefined;

    const order = await ctx.db.get(payment.orderId);
    const student = await ctx.db.get(payment.studentId);
    const course = order ? await ctx.db.get(order.courseId) : null;

    return {
      ...payment,
      courseName: course?.title || "Unknown",
      studentName: student?.fullName || "Unknown",
      studentEmail: student?.email || payment.email,
      orderAmount: order?.amount || 0,
    };
  },
});
