import { query } from "./_generated/server";
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
