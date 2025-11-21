// Payment functions for course purchases (KISS implementation)
import { mutation, query, action } from "./_generated/server";
import type { MutationCtx, QueryCtx, ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

type AnyCtx = MutationCtx | QueryCtx;

// Helper: Get courseId from order_items
async function getCourseIdFromOrder(ctx: AnyCtx, orderId: Id<"orders">) {
  try {
    const item = await ctx.db
      .query("order_items")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .first();
    return item?.productType === "course" ? (item.productId as Id<"courses">) : null;
  } catch {
    return null;
  }
}

// Helper: Generate order number
function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

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

    const student = await ctx.db.get(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    const course = await ctx.db.get(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const existingEnrollment = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course_user", (q) =>
        q.eq("courseId", courseId).eq("userId", student._id.toString()),
      )
      .first();

    // Check existing orders via filter (no by_student index)
    const existingOrders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("customerId"), studentId as any))
      .collect();

    // Check if order for this course exists
    const existingOrder = await Promise.all(
      existingOrders.map(async (order) => {
        const cId = await getCourseIdFromOrder(ctx, order._id);
        return cId === courseId ? order : null;
      })
    ).then((results) => results.find((o) => o !== null));

    if (existingEnrollment && existingEnrollment.active && existingOrder) {
      return {
        orderId: existingOrder._id,
        message: "Student already enrolled in this course",
        alreadyPending: false,
        activated: true,
      };
    }

    // Check status - only valid statuses are "pending", "paid", "activated"
    if (existingOrder && !existingOrder.notes?.includes("CANCELLED")) {
      return {
        orderId: existingOrder._id,
        message: "Order already exists",
        alreadyPending: existingOrder.status === "pending" || existingOrder.status === "paid",
        activated: false,
      };
    }

    const amount = (course as any).priceAmount || 0;

    const orderNumber = generateOrderNumber();
    const orderId = await ctx.db.insert("orders", {
      customerId: studentId as any,
      orderNumber,
      totalAmount: amount,
      status: "pending",
      notes: `courseId:${courseId.toString()}|method:manual`,
      createdAt: now,
      updatedAt: now,
    });

    // Create order item
    await ctx.db.insert("order_items", {
      orderId,
      productType: "course",
      productId: courseId.toString(),
      price: amount,
      createdAt: now,
    });

    // Schedule order placed email
    await ctx.scheduler.runAfter(0, internal.email.sendOrderPlacedEmail, {
      studentEmail: student.email,
      studentName: student.fullName || "Học viên",
      courseName: course.title,
      coursePrice: amount,
      orderId: orderId.toString(),
    });

    return {
      orderId,
      message: "Order created successfully",
      alreadyPending: true,
      activated: false,
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
    const order = await ctx.db.get(orderId) as any;
    if (!order) {
      return {
        _id: "" as any,
        customerId: "" as any,
        courseId: "" as any,
        totalAmount: 0,
        status: "",
        createdAt: 0,
        updatedAt: 0,
        courseName: "",
        exists: false,
      };
    }

    const courseId = await getCourseIdFromOrder(ctx, orderId);
    const course = courseId ? (await ctx.db.get(courseId)) as any : null;
    
    if (!course) {
      return {
        _id: order._id,
        customerId: order.customerId,
        courseId: courseId || ("" as any),
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        courseName: "Unknown Course",
        exists: true,
      };
    }

    return {
      _id: order._id,
      customerId: order.customerId,
      courseId: courseId || ("" as any),
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      courseName: course.title || "Unknown",
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
      .filter((q) => q.eq(q.field("customerId"), studentId as any))
      .collect();

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    orders.sort((a, b) => b.createdAt - a.createdAt);

    // Fetch course names and thumbnails
    const result = await Promise.all(
      orders.map(async (order: any) => {
        const courseId = await getCourseIdFromOrder(ctx, order._id);
        const course = courseId ? (await ctx.db.get(courseId)) as any : null;
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .order("desc")
          .first();
        
        let thumbnailUrl = undefined;
        if (course?.thumbnailMediaId) {
          try {
            const media = await ctx.db.get(course.thumbnailMediaId) as any;
            if (media?.storageId) {
              thumbnailUrl = await ctx.storage.getUrl(media.storageId);
            }
          } catch (_) {
            // Storage file not found, continue without thumbnail
          }
        }
        
        return {
          _id: order._id,
          courseId: courseId || ("" as any),
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          courseName: course?.title || "Unknown Course",
          courseSlug: course?.slug,
          thumbnailUrl,
          paymentStatus: (payment as any)?.status,
          paymentId: payment?._id,
          paymentScreenshotUrl: (payment as any)?.screenshotUrl,
          paymentSubmittedAt: payment?.createdAt,
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

    // Get course info for email
    const courseId = await getCourseIdFromOrder(ctx, orderId);
    const course = courseId ? await ctx.db.get(courseId) : null;

    // Schedule notification email to admin
    if (course) {
      await ctx.scheduler.runAfter(0, internal.email.sendPaymentRequestToAdminEmail, {
        studentName: student.fullName || "Học viên",
        studentEmail: student.email,
        courseId: courseId!.toString(),
        amount: (order as any).totalAmount,
        paymentId: paymentId.toString(),
      });
    }

    // Schedule confirmation email to student
    await ctx.scheduler.runAfter(0, internal.email.sendPaymentReceivedEmail, {
      studentEmail: student.email,
      studentName: student.fullName || "Học viên",
      amount: (order as any).totalAmount,
    });

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

    // Get courseId from order_items
    const courseId = await getCourseIdFromOrder(ctx, payment.orderId);
    if (!courseId) {
      throw new Error("Course not found in order");
    }

    // Get student for enrollment
    const student = await ctx.db.get((payment as any).studentId || (order as any).customerId);
    const studentId = (payment as any).studentId || (order as any).customerId;

    // Create enrollment for student (inactive - waiting for admin to activate)
    const existingEnrollment = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course_user", (q) =>
        q.eq("courseId", courseId).eq("userId", studentId.toString())
      )
      .first();

    if (!existingEnrollment) {
      await ctx.db.insert("course_enrollments", {
        courseId,
        userId: studentId.toString(),
        enrolledAt: now,
        progressPercent: 0,
        status: "pending" as const,
        lastViewedLessonId: undefined,
        order: 0,
        active: false,
      });
    } else if (!existingEnrollment.active) {
      // Enrollment exists but is inactive - keep it inactive for now
      // Admin will activate it by changing order status to "completed"
      await ctx.db.patch(existingEnrollment._id, {
        enrolledAt: now,
      });
    }

    // Get course for email
    const course = courseId ? (await ctx.db.get(courseId)) as any : null;

    // Schedule confirmation email to student
    if (student && course) {
      await ctx.scheduler.runAfter(0, internal.email.sendCourseOnboardingEmail, {
        studentEmail: (student as any).email,
        studentName: (student as any).fullName || "Học viên",
        courseName: course?.title || "Unknown",
        courseSlug: course?.slug || "",
      });
    }

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

    // Get student and schedule rejection email
    const studentId = (payment as any).studentId;
    const student = studentId ? await ctx.db.get(studentId) : null;
    if (student) {
      await ctx.scheduler.runAfter(0, internal.email.sendPaymentRejectedEmail, {
        studentEmail: (student as any).email,
        studentName: (student as any).fullName || "Học viên",
        reason: reason,
      });
    }

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
      payments.map(async (payment: any) => {
        const order = await ctx.db.get(payment.orderId) as any;
        const courseId = order ? await getCourseIdFromOrder(ctx, order._id) : null;
        const course = courseId ? (await ctx.db.get(courseId)) as any : null;

        return {
          _id: payment._id,
          orderId: payment.orderId,
          studentName: (payment as any).email || "Unknown",
          studentEmail: (payment as any).email,
          courseName: course?.title || "Unknown Course",
          amount: (order as any)?.totalAmount || 0,
          screenshotUrl: (payment as any).screenshotUrl,
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
    const payment = await ctx.db.get(paymentId) as any;
    if (!payment) return undefined;

    const order = await ctx.db.get(payment.orderId) as any;
    const studentId = payment.studentId;
    const student = studentId ? await ctx.db.get(studentId) : null;
    const courseId = order ? await getCourseIdFromOrder(ctx, order._id) : null;
    const course = courseId ? (await ctx.db.get(courseId)) as any : null;

    return {
      ...payment,
      courseName: course?.title || "Unknown",
      studentName: (student as any)?.fullName || "Unknown",
      studentEmail: (student as any)?.email || (payment as any).email,
      orderAmount: order?.totalAmount || 0,
    };
  },
});
