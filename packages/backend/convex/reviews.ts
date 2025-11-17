import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Course Reviews System
 * - Học viên có thể đánh giá khóa học (1-5 sao)
 * - Viết tiêu đề + nội dung đánh giá
 * - Đánh dấu review có hữu ích hay không
 */

// ==================== QUERIES ====================

/**
 * Lấy danh sách reviews của một khóa
 */
export const listCourseReviews = query({
  args: {
    courseId: v.id("courses"),
    sortBy: v.optional(v.union(v.literal("helpful"), v.literal("newest"), v.literal("rating"))),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const limit = args.limit || 20;
    const sortBy = args.sortBy || "helpful";

    const reviews = (
      await ctx.db
        .query("course_reviews")
        .withIndex("by_course_time", (q) => q.eq("courseId", args.courseId))
        .order("desc")
        .collect()
    )
      .filter((review) => !review.deletedAt)
      .slice(0, limit);

    // Sort by criteria
    let sorted = reviews;
    if (sortBy === "helpful") {
      sorted = reviews.sort(
        (a, b) => (b.helpfulCount - b.unhelpfulCount) - (a.helpfulCount - a.unhelpfulCount)
      );
    } else if (sortBy === "rating") {
      sorted = reviews.sort((a, b) => b.rating - a.rating);
    }
    // "newest" is already sorted by createdAt desc

    // Lấy tác giả cho mỗi review
    const reviewsWithDetails = await Promise.all(
      sorted.map(async (review) => {
        const author = await ctx.db.get(review.studentId);
        return {
          ...review,
          author: author ? { _id: author._id, fullName: author.fullName } : null,
        };
      })
    );

    return reviewsWithDetails;
  },
});

/**
 * Lấy thống kê đánh giá của khóa (rating trung bình, phân bố)
 */
export const getCourseRating = query({
  args: {
    courseId: v.id("courses"),
  },
  async handler(ctx, args) {
    const reviews = (
      await ctx.db
        .query("course_reviews")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect()
    ).filter((review) => !review.deletedAt);

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        helpfulPercent: 0,
      };
    }

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    let totalHelpful = 0;
    let totalVotes = 0;

    reviews.forEach((review) => {
      totalRating += review.rating;
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      totalHelpful += review.helpfulCount;
      totalVotes += review.helpfulCount + review.unhelpfulCount;
    });

    return {
      averageRating: Number((totalRating / reviews.length).toFixed(1)),
      totalReviews: reviews.length,
      distribution,
      helpfulPercent: totalVotes > 0 ? Math.round((totalHelpful / totalVotes) * 100) : 0,
    };
  },
});

/**
 * Kiểm tra học viên đã đánh giá khóa này chưa
 */
export const getStudentCourseReview = query({
  args: {
    courseId: v.id("courses"),
    studentId: v.id("students"),
  },
  async handler(ctx, args) {
    const review = (
      await ctx.db
        .query("course_reviews")
        .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
        .collect()
    ).find((doc) => doc.courseId === args.courseId && !doc.deletedAt);

    return review ?? null;
  },
});

/**
 * Kiểm tra học viên đã vote helpful cho review này chưa
 */
export const getHelpfulVote = query({
  args: {
    reviewId: v.id("course_reviews"),
    studentId: v.id("students"),
  },
  async handler(ctx, args) {
    const vote = await ctx.db
      .query("review_helpful")
      .withIndex("by_pair", (q) => q.eq("studentId", args.studentId).eq("reviewId", args.reviewId))
      .first();

    return vote?.isHelpful || null;
  },
});

// ==================== MUTATIONS ====================

/**
 * Tạo review mới
 */
export const createReview = mutation({
  args: {
    studentId: v.id("students"),
    courseId: v.id("courses"),
    rating: v.number(), // 1-5
    title: v.string(),
    content: v.string(),
  },
  async handler(ctx, args) {
    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Đánh giá phải từ 1-5 sao");
    }

    // Validate title
    if (!args.title || args.title.trim().length === 0) {
      throw new Error("Tiêu đề đánh giá không được trống");
    }

    if (args.title.length > 200) {
      throw new Error("Tiêu đề quá dài (tối đa 200 ký tự)");
    }

    // Validate content
    if (!args.content || args.content.trim().length === 0) {
      throw new Error("Nội dung đánh giá không được trống");
    }

    if (args.content.length > 5000) {
      throw new Error("Nội dung quá dài (tối đa 5000 ký tự)");
    }

    // Kiểm tra đã đánh giá chưa
    const existing = (
      await ctx.db
        .query("course_reviews")
        .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
        .collect()
    ).find((doc) => doc.courseId === args.courseId && !doc.deletedAt);

    if (existing) {
      throw new Error("Bạn đã đánh giá khóa này rồi. Vui lòng cập nhật đánh giá cũ.");
    }

    // Kiểm tra học viên đã hoàn thành khóa này (optional)
    const enrollment = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course_user", (q) =>
        q.eq("courseId", args.courseId).eq("userId", args.studentId)
      )
      .first();

    if (!enrollment) {
      throw new Error("Bạn phải tham gia khóa này mới được đánh giá");
    }

    const reviewId = await ctx.db.insert("course_reviews", {
      studentId: args.studentId,
      courseId: args.courseId,
      rating: args.rating,
      title: args.title.trim(),
      content: args.content.trim(),
      helpfulCount: 0,
      unhelpfulCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return reviewId;
  },
});

/**
 * Cập nhật review
 */
export const updateReview = mutation({
  args: {
    reviewId: v.id("course_reviews"),
    studentId: v.id("students"),
    rating: v.number(),
    title: v.string(),
    content: v.string(),
  },
  async handler(ctx, args) {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Đánh giá không tồn tại");
    }

    // Kiểm tra quyền
    if (review.studentId !== args.studentId) {
      throw new Error("Bạn không có quyền sửa đánh giá này");
    }

    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Đánh giá phải từ 1-5 sao");
    }

    // Validate title
    if (!args.title || args.title.trim().length === 0) {
      throw new Error("Tiêu đề đánh giá không được trống");
    }

    if (args.title.length > 200) {
      throw new Error("Tiêu đề quá dài (tối đa 200 ký tự)");
    }

    // Validate content
    if (!args.content || args.content.trim().length === 0) {
      throw new Error("Nội dung đánh giá không được trống");
    }

    if (args.content.length > 5000) {
      throw new Error("Nội dung quá dài (tối đa 5000 ký tự)");
    }

    await ctx.db.patch(args.reviewId, {
      rating: args.rating,
      title: args.title.trim(),
      content: args.content.trim(),
      updatedAt: Date.now(),
    });

    return args.reviewId;
  },
});

/**
 * Xóa review (soft delete)
 */
export const deleteReview = mutation({
  args: {
    reviewId: v.id("course_reviews"),
    studentId: v.id("students"),
  },
  async handler(ctx, args) {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Đánh giá không tồn tại");
    }

    // Kiểm tra quyền
    if (review.studentId !== args.studentId) {
      throw new Error("Bạn không có quyền xóa đánh giá này");
    }

    await ctx.db.patch(args.reviewId, {
      deletedAt: Date.now(),
    });

    return args.reviewId;
  },
});

/**
 * Đánh dấu review có hữu ích hay không
 */
export const markReviewHelpful = mutation({
  args: {
    reviewId: v.id("course_reviews"),
    studentId: v.id("students"),
    isHelpful: v.boolean(),
  },
  async handler(ctx, args) {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Đánh giá không tồn tại");
    }

    // Kiểm tra đã vote chưa
    const existingVote = await ctx.db
      .query("review_helpful")
      .withIndex("by_pair", (q) => q.eq("studentId", args.studentId).eq("reviewId", args.reviewId))
      .first();

    if (existingVote) {
      // Nếu vote lại, xóa vote cũ trước
      const oldVote = existingVote.isHelpful;

      // Cập nhật vote
      await ctx.db.patch(existingVote._id, {
        isHelpful: args.isHelpful,
      });

      // Cập nhật counters
      let helpfulDelta = 0;
      let unhelpfulDelta = 0;

      if (oldVote !== args.isHelpful) {
        if (oldVote) {
          // Giảm helpful
          helpfulDelta = -1;
        } else {
          // Giảm unhelpful
          unhelpfulDelta = -1;
        }

        if (args.isHelpful) {
          helpfulDelta += 1;
        } else {
          unhelpfulDelta += 1;
        }
      }

      await ctx.db.patch(args.reviewId, {
        helpfulCount: Math.max(0, review.helpfulCount + helpfulDelta),
        unhelpfulCount: Math.max(0, review.unhelpfulCount + unhelpfulDelta),
      });

      return { updated: true };
    } else {
      // Tạo vote mới
      await ctx.db.insert("review_helpful", {
        studentId: args.studentId,
        reviewId: args.reviewId,
        isHelpful: args.isHelpful,
        createdAt: Date.now(),
      });

      // Tăng counter
      if (args.isHelpful) {
        await ctx.db.patch(args.reviewId, {
          helpfulCount: review.helpfulCount + 1,
        });
      } else {
        await ctx.db.patch(args.reviewId, {
          unhelpfulCount: review.unhelpfulCount + 1,
        });
      }

      return { created: true };
    }
  },
});
