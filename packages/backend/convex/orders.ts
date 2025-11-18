import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

export const listOrders = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("orders"),
      studentId: v.id("students"),
      studentName: v.string(),
      studentEmail: v.optional(v.string()),
      studentPhone: v.optional(v.string()),
      courseId: v.id("courses"),
      courseTitle: v.string(),
      courseSlug: v.optional(v.string()),
      amount: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      paymentMethod: v.string(),
      notes: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      paymentStatus: v.optional(
        v.union(v.literal("pending"), v.literal("confirmed"), v.literal("rejected"))
      ),
      paymentId: v.optional(v.id("payments")),
      paymentRecordedAt: v.optional(v.number()),
      paymentScreenshotUrl: v.optional(v.string()),
    })
  ),
  handler: async (ctx, { limit }) => {
    const safeLimit = Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

    const orders = await ctx.db.query("orders").order("desc").take(safeLimit);

    const studentIds = uniqueIds(orders.map((order) => order.studentId));
    const courseIds = uniqueIds(orders.map((order) => order.courseId));

    const [students, courses] = await Promise.all([
      Promise.all(studentIds.map(async (id) => ({ id, doc: await ctx.db.get(id) }))),
      Promise.all(courseIds.map(async (id) => ({ id, doc: await ctx.db.get(id) }))),
    ]);

    const studentMap = new Map<Id<"students">, Doc<"students">>();
    const courseMap = new Map<Id<"courses">, Doc<"courses">>();

    for (const { id, doc } of students) {
      if (doc) {
        studentMap.set(id, doc);
      }
    }

    for (const { id, doc } of courses) {
      if (doc) {
        courseMap.set(id, doc);
      }
    }

    const payments = await Promise.all(
      orders.map(async (order) => ({
        orderId: order._id,
        payment: await ctx.db
          .query("payments")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .order("desc")
          .first(),
      }))
    );

    const paymentMap = new Map<Id<"orders">, Doc<"payments">>();
    for (const { orderId, payment } of payments) {
      if (payment) {
        paymentMap.set(orderId, payment);
      }
    }

    return orders.map((order) => {
      const student = studentMap.get(order.studentId);
      const course = courseMap.get(order.courseId);
      const payment = paymentMap.get(order._id);

      return {
        _id: order._id,
        studentId: order.studentId,
        studentName: student?.fullName || student?.account || "Học viên ẩn danh",
        studentEmail: student?.email,
        studentPhone: student?.phone,
        courseId: order.courseId,
        courseTitle: course?.title || "Khóa học chưa đặt tên",
        courseSlug: course?.slug,
        amount: order.amount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paymentStatus: payment?.status,
        paymentId: payment?._id,
        paymentRecordedAt: payment?.createdAt,
        paymentScreenshotUrl: payment?.screenshotUrl,
      };
    });
  },
});

function uniqueIds<T>(ids: T[]): T[] {
  return [...new Set(ids)];
}

export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("orders"),
      studentId: v.id("students"),
      studentName: v.string(),
      studentEmail: v.optional(v.string()),
      studentPhone: v.optional(v.string()),
      courseId: v.id("courses"),
      courseTitle: v.string(),
      courseSlug: v.optional(v.string()),
      amount: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      paymentMethod: v.string(),
      notes: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      paymentStatus: v.optional(
        v.union(v.literal("pending"), v.literal("confirmed"), v.literal("rejected"))
      ),
      paymentId: v.optional(v.id("payments")),
      paymentRecordedAt: v.optional(v.number()),
      paymentScreenshotUrl: v.optional(v.string()),
    })
  ),
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) {
      return null;
    }

    const [student, course, payment] = await Promise.all([
      ctx.db.get(order.studentId),
      ctx.db.get(order.courseId),
      ctx.db
        .query("payments")
        .withIndex("by_order", (q) => q.eq("orderId", orderId))
        .order("desc")
        .first(),
    ]);

    return {
      _id: order._id,
      studentId: order.studentId,
      studentName: student?.fullName || student?.account || "Học viên ẩn danh",
      studentEmail: student?.email,
      studentPhone: student?.phone,
      courseId: order.courseId,
      courseTitle: course?.title || "Khóa học chưa đặt tên",
      courseSlug: course?.slug,
      amount: order.amount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paymentStatus: payment?.status,
      paymentId: payment?._id,
      paymentRecordedAt: payment?.createdAt,
      paymentScreenshotUrl: payment?.screenshotUrl,
    };
  },
});

export const updateOrder = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { orderId, status, notes }) => {
    const order = await ctx.db.get(orderId);
    if (!order) {
      throw new Error("Đơn hàng không tồn tại");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (status !== undefined) {
      updates.status = status;
    }
    if (notes !== undefined) {
      updates.notes = notes;
    }

    await ctx.db.patch(orderId, updates);
    return { success: true };
  },
});

export const deleteOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) {
      throw new Error("Đơn hàng không tồn tại");
    }

    // Remove enrollment if order was completed
    if (order.status === "completed") {
      const enrollment = await ctx.db
        .query("course_enrollments")
        .withIndex("by_course_user", (q) =>
          q.eq("courseId", order.courseId).eq("userId", order.studentId.toString())
        )
        .first();

      if (enrollment) {
        await ctx.db.delete(enrollment._id);
      }
    }

    // Hard delete order
    await ctx.db.delete(orderId);
    return { success: true };
  },
});
export const getOrderDetail = query({
  args: {
    orderId: v.id("orders"),
  },
  returns: v.object({
    exists: v.boolean(),
    order: v.optional(
      v.object({
        _id: v.id("orders"),
        amount: v.number(),
        status: v.union(
          v.literal("pending"),
          v.literal("paid"),
          v.literal("completed"),
          v.literal("cancelled"),
        ),
        paymentMethod: v.string(),
        notes: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
    ),
    student: v.optional(
      v.object({
        _id: v.id("students"),
        fullName: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
      }),
    ),
    course: v.optional(
      v.object({
        _id: v.id("courses"),
        title: v.string(),
        slug: v.optional(v.string()),
        pricingType: v.union(v.literal("free"), v.literal("paid")),
        priceAmount: v.optional(v.number()),
      }),
    ),
    payment: v.optional(
      v.object({
        _id: v.id("payments"),
        status: v.union(
          v.literal("pending"),
          v.literal("confirmed"),
          v.literal("rejected"),
        ),
        screenshotUrl: v.optional(v.string()),
        createdAt: v.number(),
        confirmedAt: v.optional(v.number()),
        rejectionReason: v.optional(v.string()),
      }),
    ),
    enrollment: v.object({
      exists: v.boolean(),
      active: v.boolean(),
      enrolledAt: v.optional(v.number()),
    }),
  }),
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) {
      return {
        exists: false,
        enrollment: {
          exists: false,
          active: false,
          enrolledAt: undefined,
        },
      };
    }

    const [student, course, payment, enrollment] = await Promise.all([
      ctx.db.get(order.studentId),
      ctx.db.get(order.courseId),
      ctx.db
        .query("payments")
        .withIndex("by_order", (q) => q.eq("orderId", orderId))
        .order("desc")
        .first(),
      ctx.db
        .query("course_enrollments")
        .withIndex("by_course_user", (q) =>
          q.eq("courseId", order.courseId).eq("userId", order.studentId.toString()),
        )
        .first(),
    ]);

    const studentPayload = student
      ? {
          _id: student._id,
          fullName: student.fullName || student.account,
          email: student.email,
          phone: student.phone,
        }
      : undefined;

    const coursePayload = course
      ? {
          _id: course._id,
          title: course.title,
          slug: course.slug,
          pricingType: course.pricingType,
          priceAmount: course.priceAmount,
        }
      : undefined;

    const paymentPayload = payment
      ? {
          _id: payment._id,
          status: payment.status,
          screenshotUrl: payment.screenshotUrl,
          createdAt: payment.createdAt,
          confirmedAt: payment.confirmedAt,
          rejectionReason: payment.rejectionReason,
        }
      : undefined;

    const enrollmentPayload = enrollment
      ? {
          exists: true,
          active: Boolean(enrollment.active),
          enrolledAt: enrollment.enrolledAt,
        }
      : {
          exists: false,
          active: false,
          enrolledAt: undefined,
        };

    return {
      exists: true,
      order: {
        _id: order._id,
        amount: order.amount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      student: studentPayload,
      course: coursePayload,
      payment: paymentPayload,
      enrollment: enrollmentPayload,
    };
  },
});
