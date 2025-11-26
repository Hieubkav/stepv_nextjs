import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";

const notificationTypeValidator = v.union(
  v.literal("order_confirmed"),
  v.literal("payment_rejected"),
  v.literal("certificate_issued"),
  v.literal("new_comment_reply"),
  v.literal("course_updated"),
  v.literal("course_new_lesson"),
  v.literal("enrollment_status_changed"),
  v.literal("system")
);

/**
 * Notifications System
 * - Tạo thông báo cho học viên
 * - Đánh dấu đã đọc
 * - Xóa thông báo
 * - Real-time subscriptions
 */

// ==================== QUERIES ====================

/**
 * Lấy danh sách thông báo của học viên (unread first, newest first)
 */
export const listNotifications = query({
  args: {
    studentId: v.id("students"),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const limit = args.limit || 20;

    // Lấy unread thông báo trước
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_student_read", (q) =>
        q.eq("studentId", args.studentId).eq("isRead", false)
      )
      .order("desc")
      .take(limit);

    // Nếu unread < limit, lấy thêm read thông báo
    let result = unread;
    if (unread.length < limit) {
      const read = await ctx.db
        .query("notifications")
        .withIndex("by_student_read", (q) =>
          q.eq("studentId", args.studentId).eq("isRead", true)
        )
        .order("desc")
        .take(limit - unread.length);

      result = [...unread, ...read];
    }

    return result;
  },
});

/**
 * Đếm số thông báo chưa đọc
 */
export const getUnreadCount = query({
  args: {
    studentId: v.id("students"),
  },
  async handler(ctx, args) {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_student_read", (q) =>
        q.eq("studentId", args.studentId).eq("isRead", false)
      )
      .collect();

    return unread.length;
  },
});

/**
 * Lấy chi tiết một thông báo
 */
export const getNotification = query({
  args: {
    notificationId: v.id("notifications"),
  },
  async handler(ctx, args) {
    const notification = await ctx.db.get(args.notificationId);
    return notification || null;
  },
});

/**
 * Lấy thông báo theo loại (để filter)
 */
export const getNotificationsByType = query({
  args: {
    studentId: v.id("students"),
    type: notificationTypeValidator,
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const limit = args.limit || 20;

    const notifications = (
      await ctx.db
        .query("notifications")
        .withIndex("by_student_time", (q) =>
          q.eq("studentId", args.studentId)
        )
        .order("desc")
        .collect()
    ).filter((notification) => notification.type === args.type);

    return notifications.slice(0, limit);
  },
});

// ==================== MUTATIONS ====================

/**
 * Tạo thông báo mới
 */
export const createNotification = mutation({
  args: {
    studentId: v.id("students"),
    type: notificationTypeValidator,
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  async handler(ctx, args) {
    // Validate
    if (!args.title || args.title.trim().length === 0) {
      throw new ConvexError("Tiêu đề thông báo không được trống");
    }

    if (!args.message || args.message.trim().length === 0) {
      throw new ConvexError("Nội dung thông báo không được trống");
    }

    const notificationId = await ctx.db.insert("notifications", {
      studentId: args.studentId,
      type: args.type,
      title: args.title.trim(),
      message: args.message.trim(),
      link: args.link,
      metadata: args.metadata,
      isRead: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

/**
 * Batch tạo thông báo (cho multiple users)
 */
export const createNotificationBatch = mutation({
  args: {
    studentIds: v.array(v.id("students")),
    type: notificationTypeValidator,
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  async handler(ctx, args) {
    const notificationIds = await Promise.all(
      args.studentIds.map((studentId) =>
        ctx.db.insert("notifications", {
          studentId,
          type: args.type,
          title: args.title.trim(),
          message: args.message.trim(),
          link: args.link,
          metadata: args.metadata,
          isRead: false,
          createdAt: Date.now(),
        })
      )
    );

    return notificationIds;
  },
});

/**
 * Đánh dấu thông báo đã đọc
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  async handler(ctx, args) {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new ConvexError("Thông báo không tồn tại");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });

    return args.notificationId;
  },
});

/**
 * Batch đánh dấu thông báo đã đọc
 */
export const markMultipleAsRead = mutation({
  args: {
    notificationIds: v.array(v.id("notifications")),
  },
  async handler(ctx, args) {
    const now = Date.now();
    await Promise.all(
      args.notificationIds.map((id) =>
        ctx.db.patch(id, {
          isRead: true,
          readAt: now,
        })
      )
    );

    return args.notificationIds;
  },
});

/**
 * Xóa thông báo
 */
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  async handler(ctx, args) {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new ConvexError("Thông báo không tồn tại");
    }

    await ctx.db.delete(args.notificationId);
    return args.notificationId;
  },
});

/**
 * Batch xóa thông báo
 */
export const deleteMultipleNotifications = mutation({
  args: {
    notificationIds: v.array(v.id("notifications")),
  },
  async handler(ctx, args) {
    await Promise.all(args.notificationIds.map((id) => ctx.db.delete(id)));
    return args.notificationIds;
  },
});

/**
 * Xóa tất cả thông báo của một học viên
 */
export const clearAllNotifications = mutation({
  args: {
    studentId: v.id("students"),
  },
  async handler(ctx, args) {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_student_time", (q) => q.eq("studentId", args.studentId))
      .collect();

    await Promise.all(notifications.map((n) => ctx.db.delete(n._id)));
    return notifications.length;
  },
});

/**
 * Xóa thông báo cũ hơn N ngày
 */
export const deleteOldNotifications = mutation({
  args: {
    studentId: v.id("students"),
    daysOld: v.number(), // e.g., 30 = delete notifications older than 30 days
  },
  async handler(ctx, args) {
    const cutoffTime = Date.now() - args.daysOld * 24 * 60 * 60 * 1000;

    const notifications = (
      await ctx.db
        .query("notifications")
        .withIndex("by_student_time", (q) => q.eq("studentId", args.studentId))
        .collect()
    ).filter((notification) => notification.createdAt < cutoffTime);

    await Promise.all(notifications.map((n) => ctx.db.delete(n._id)));
    return notifications.length;
  },
});
