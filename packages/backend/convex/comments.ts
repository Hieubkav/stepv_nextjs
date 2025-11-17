import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Comments & Discussions System
 * - Ghi nhận bình luận từ học viên trong bài học
 * - Hỗ trợ reply (nested comments)
 * - Like/unlike bình luận
 */

// ==================== QUERIES ====================

/**
 * Lấy danh sách bình luận của một bài học (nested structure)
 */
export const listLessonComments = query({
  args: {
    lessonId: v.id("course_lessons"),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const limit = args.limit || 20;

    // Lấy bình luận chính (không phải reply)
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_lesson_time", (q) => q.eq("lessonId", args.lessonId).eq("parentCommentId", undefined))
      .order("desc")
      .take(limit);

    // Với mỗi bình luận, lấy tác giả + replies
    const commentsWithDetails = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.studentId);
        const repliesCount = await ctx.db
          .query("comments")
          .withIndex("by_parent", (q) => q.eq("parentCommentId", comment._id))
          .count();

        return {
          ...comment,
          author: author ? { _id: author._id, fullName: author.fullName } : null,
          repliesCount,
        };
      })
    );

    return commentsWithDetails;
  },
});

/**
 * Lấy danh sách reply cho một bình luận
 */
export const listCommentReplies = query({
  args: {
    parentCommentId: v.id("comments"),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const limit = args.limit || 10;

    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentCommentId", args.parentCommentId))
      .order("asc")
      .take(limit);

    // Lấy tác giả cho mỗi reply
    const repliesWithDetails = await Promise.all(
      replies.map(async (reply) => {
        const author = await ctx.db.get(reply.studentId);
        return {
          ...reply,
          author: author ? { _id: author._id, fullName: author.fullName } : null,
        };
      })
    );

    return repliesWithDetails;
  },
});

/**
 * Đếm số bình luận trong bài học
 */
export const getCommentCount = query({
  args: {
    lessonId: v.id("course_lessons"),
  },
  async handler(ctx, args) {
    const count = await ctx.db
      .query("comments")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .count();

    return count;
  },
});

/**
 * Kiểm tra học viên đã like bình luận này chưa
 */
export const checkCommentLiked = query({
  args: {
    commentId: v.id("comments"),
    studentId: v.id("students"),
  },
  async handler(ctx, args) {
    const like = await ctx.db
      .query("comment_likes")
      .withIndex("by_pair", (q) =>
        q.eq("studentId", args.studentId).eq("commentId", args.commentId)
      )
      .first();

    return !!like;
  },
});

// ==================== MUTATIONS ====================

/**
 * Tạo bình luận mới
 */
export const createComment = mutation({
  args: {
    studentId: v.id("students"),
    lessonId: v.id("course_lessons"),
    courseId: v.id("courses"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
  },
  async handler(ctx, args) {
    // Validate content
    if (!args.content || args.content.trim().length === 0) {
      throw new Error("Nội dung bình luận không được trống");
    }

    if (args.content.length > 5000) {
      throw new Error("Nội dung bình luận quá dài (tối đa 5000 ký tự)");
    }

    // Validate parent comment exists nếu là reply
    if (args.parentCommentId) {
      const parentComment = await ctx.db.get(args.parentCommentId);
      if (!parentComment) {
        throw new Error("Bình luận gốc không tồn tại");
      }
    }

    const commentId = await ctx.db.insert("comments", {
      studentId: args.studentId,
      lessonId: args.lessonId,
      courseId: args.courseId,
      parentCommentId: args.parentCommentId,
      content: args.content.trim(),
      likesCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Nếu là reply, tạo notification cho chủ bình luận gốc
    if (args.parentCommentId) {
      const parentComment = await ctx.db.get(args.parentCommentId);
      if (parentComment) {
        const author = await ctx.db.get(args.studentId);
        await ctx.db.insert("notifications", {
          studentId: parentComment.studentId,
          type: "new_comment_reply",
          title: "Có reply mới",
          message: `${author?.fullName || "Ai đó"} đã trả lời bình luận của bạn`,
          link: `/khoa-hoc/${args.courseId}/bai-hoc/${args.lessonId}`,
          metadata: {
            lessonId: args.lessonId,
            commentId: args.parentCommentId,
            replyId: commentId,
          },
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    return commentId;
  },
});

/**
 * Cập nhật bình luận
 */
export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    studentId: v.id("students"),
    content: v.string(),
  },
  async handler(ctx, args) {
    // Lấy bình luận
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Bình luận không tồn tại");
    }

    // Kiểm tra quyền (chỉ chủ sở hữu mới được sửa)
    if (comment.studentId !== args.studentId) {
      throw new Error("Bạn không có quyền sửa bình luận này");
    }

    // Validate content
    if (!args.content || args.content.trim().length === 0) {
      throw new Error("Nội dung bình luận không được trống");
    }

    if (args.content.length > 5000) {
      throw new Error("Nội dung bình luận quá dài (tối đa 5000 ký tự)");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content.trim(),
      updatedAt: Date.now(),
    });

    return args.commentId;
  },
});

/**
 * Xóa bình luận (soft delete)
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
    studentId: v.id("students"),
  },
  async handler(ctx, args) {
    // Lấy bình luận
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Bình luận không tồn tại");
    }

    // Kiểm tra quyền
    if (comment.studentId !== args.studentId) {
      throw new Error("Bạn không có quyền xóa bình luận này");
    }

    // Soft delete
    await ctx.db.patch(args.commentId, {
      deletedAt: Date.now(),
    });

    return args.commentId;
  },
});

/**
 * Like bình luận
 */
export const likeComment = mutation({
  args: {
    commentId: v.id("comments"),
    studentId: v.id("students"),
  },
  async handler(ctx, args) {
    // Kiểm tra đã like chưa
    const existingLike = await ctx.db
      .query("comment_likes")
      .withIndex("by_pair", (q) =>
        q.eq("studentId", args.studentId).eq("commentId", args.commentId)
      )
      .first();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);

      // Giảm likesCount
      const comment = await ctx.db.get(args.commentId);
      if (comment) {
        await ctx.db.patch(args.commentId, {
          likesCount: Math.max(0, comment.likesCount - 1),
        });
      }

      return { liked: false };
    } else {
      // Like
      await ctx.db.insert("comment_likes", {
        studentId: args.studentId,
        commentId: args.commentId,
        createdAt: Date.now(),
      });

      // Tăng likesCount
      const comment = await ctx.db.get(args.commentId);
      if (comment) {
        await ctx.db.patch(args.commentId, {
          likesCount: comment.likesCount + 1,
        });
      }

      return { liked: true };
    }
  },
});
