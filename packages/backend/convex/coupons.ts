import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Coupons & Promotions System
 * - Tạo coupon với discount %  hoặc fixed amount
 * - Validate coupon (check expiry, usage limit, applicability)
 * - Apply coupon vào order
 * - Tracking coupon usage
 */

// ==================== QUERIES ====================

/**
 * Validate coupon code
 */
export const validateCoupon = query({
  args: {
    code: v.string(),
    courseId: v.optional(v.id("courses")),
    amount: v.optional(v.number()), // order amount
    studentId: v.optional(v.id("students")),
  },
  async handler(ctx, args) {
    // Lấy coupon
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!coupon) {
      return {
        valid: false,
        error: "Mã giảm giá không tồn tại",
      };
    }

    // Kiểm tra active
    if (!coupon.active) {
      return {
        valid: false,
        error: "Mã giảm giá này không còn hoạt động",
      };
    }

    // Kiểm tra hết hạn
    if (coupon.expiresAt && Date.now() > coupon.expiresAt) {
      return {
        valid: false,
        error: "Mã giảm giá đã hết hạn",
      };
    }

    // Kiểm tra số lần sử dụng
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return {
        valid: false,
        error: "Mã giảm giá đã được sử dụng hết",
      };
    }

    // Kiểm tra min amount
    if (coupon.minAmount && args.amount && args.amount < coupon.minAmount) {
      return {
        valid: false,
        error: `Mã giảm giá yêu cầu đơn hàng tối thiểu ${coupon.minAmount.toLocaleString()} VND`,
      };
    }

    // Kiểm tra applies to courses
    if (coupon.appliesTo === "specific_courses" && args.courseId) {
      if (!coupon.specificCourseIds?.includes(args.courseId)) {
        return {
          valid: false,
          error: "Mã giảm giá không áp dụng cho khóa học này",
        };
      }
    }

    // Kiểm tra specific users (personal coupons)
    if (coupon.specificUserIds && args.studentId) {
      if (!coupon.specificUserIds.includes(args.studentId)) {
        return {
          valid: false,
          error: "Mã giảm giá này không áp dụng cho bạn",
        };
      }
    }

    // Tính discount amount
    let discountAmount = 0;
    if (coupon.discountPercent) {
      discountAmount = args.amount ? Math.round((args.amount * coupon.discountPercent) / 100) : 0;
    } else if (coupon.discountFixed) {
      discountAmount = coupon.discountFixed;
    }

    // Đảm bảo discount không vượt quá original amount
    if (args.amount && discountAmount > args.amount) {
      discountAmount = args.amount;
    }

    return {
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountPercent: coupon.discountPercent,
        discountFixed: coupon.discountFixed,
        discountAmount,
      },
    };
  },
});

/**
 * Lấy thông tin coupon (admin)
 */
export const getCoupon = query({
  args: {
    couponId: v.id("coupons"),
  },
  async handler(ctx, args) {
    const coupon = await ctx.db.get(args.couponId);
    return coupon || null;
  },
});

/**
 * Liệt kê coupons (admin)
 */
export const listCoupons = query({
  args: {
    active: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const limit = args.limit || 50;

    let query = ctx.db.query("coupons");

    if (args.active !== undefined) {
      query = query.withIndex("by_active", (q) => q.eq("active", args.active || false));
    }

    const coupons = await query.order("desc").take(limit);
    return coupons;
  },
});

/**
 * Lấy thống kê coupon
 */
export const getCouponStats = query({
  args: {
    couponId: v.id("coupons"),
  },
  async handler(ctx, args) {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Mã giảm giá không tồn tại");
    }

    // Lấy tất cả usages
    const uses = await ctx.db
      .query("coupon_uses")
      .withIndex("by_coupon", (q) => q.eq("couponId", args.couponId))
      .collect();

    const totalDiscountGiven = uses.reduce((sum, use) => sum + use.discountAmount, 0);

    return {
      couponId: args.couponId,
      code: coupon.code,
      totalUsed: coupon.usedCount,
      maxUses: coupon.maxUses,
      remainingUses: coupon.maxUses ? coupon.maxUses - coupon.usedCount : null,
      totalDiscountGiven,
      uses: uses.length,
    };
  },
});

// ==================== MUTATIONS ====================

/**
 * Tạo coupon mới (admin)
 */
export const createCoupon = mutation({
  args: {
    code: v.string(),
    description: v.optional(v.string()),
    discountPercent: v.optional(v.number()),
    discountFixed: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    minAmount: v.optional(v.number()),
    appliesTo: v.union(v.literal("all_courses"), v.literal("specific_courses")),
    specificCourseIds: v.optional(v.array(v.id("courses"))),
    expiresAt: v.optional(v.number()),
  },
  async handler(ctx, args) {
    // Validate code
    if (!args.code || args.code.trim().length === 0) {
      throw new Error("Mã giảm giá không được trống");
    }

    const upperCode = args.code.toUpperCase();

    // Kiểm tra code đã tồn tại
    const existing = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", upperCode))
      .first();

    if (existing) {
      throw new Error("Mã giảm giá này đã tồn tại");
    }

    // Validate discount
    if (!args.discountPercent && !args.discountFixed) {
      throw new Error("Cần có discount % hoặc discount fixed amount");
    }

    if (args.discountPercent && (args.discountPercent < 1 || args.discountPercent > 100)) {
      throw new Error("Discount % phải từ 1-100");
    }

    if (args.discountFixed && args.discountFixed < 1000) {
      throw new Error("Discount fixed amount tối thiểu 1000 VND");
    }

    // Validate appliesTo
    if (args.appliesTo === "specific_courses" && !args.specificCourseIds?.length) {
      throw new Error("Vui lòng chọn khóa học áp dụng");
    }

    const couponId = await ctx.db.insert("coupons", {
      code: upperCode,
      description: args.description,
      discountPercent: args.discountPercent,
      discountFixed: args.discountFixed,
      maxUses: args.maxUses,
      usedCount: 0,
      minAmount: args.minAmount,
      appliesTo: args.appliesTo,
      specificCourseIds: args.specificCourseIds,
      expiresAt: args.expiresAt,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return couponId;
  },
});

/**
 * Cập nhật coupon (admin)
 */
export const updateCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    discountPercent: v.optional(v.number()),
    discountFixed: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    minAmount: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Mã giảm giá không tồn tại");
    }

    const updates: any = {};

    if (args.code !== undefined) {
      const upperCode = args.code.toUpperCase();
      if (upperCode !== coupon.code) {
        // Kiểm tra code mới không bị trùng
        const existing = await ctx.db
          .query("coupons")
          .withIndex("by_code", (q) => q.eq("code", upperCode))
          .first();

        if (existing) {
          throw new Error("Mã giảm giá này đã tồn tại");
        }
      }
      updates.code = upperCode;
    }

    if (args.discountPercent !== undefined) {
      if (args.discountPercent < 1 || args.discountPercent > 100) {
        throw new Error("Discount % phải từ 1-100");
      }
      updates.discountPercent = args.discountPercent;
    }

    if (args.discountFixed !== undefined) {
      if (args.discountFixed < 1000) {
        throw new Error("Discount fixed amount tối thiểu 1000 VND");
      }
      updates.discountFixed = args.discountFixed;
    }

    if (args.description !== undefined) {
      updates.description = args.description;
    }

    if (args.maxUses !== undefined) {
      updates.maxUses = args.maxUses;
    }

    if (args.minAmount !== undefined) {
      updates.minAmount = args.minAmount;
    }

    if (args.expiresAt !== undefined) {
      updates.expiresAt = args.expiresAt;
    }

    if (args.active !== undefined) {
      updates.active = args.active;
    }

    updates.updatedAt = Date.now();

    await ctx.db.patch(args.couponId, updates);
    return args.couponId;
  },
});

/**
 * Apply coupon vào order
 */
export const applyCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
    studentId: v.id("students"),
    orderId: v.id("orders"),
  },
  async handler(ctx, args) {
    // Lấy coupon
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Mã giảm giá không tồn tại");
    }

    // Lấy order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Đơn hàng không tồn tại");
    }

    // Kiểm tra student ownership
    if (order.studentId !== args.studentId) {
      throw new Error("Đơn hàng không thuộc về bạn");
    }

    // Validate coupon
    const validation = await ctx.queryGeneric("validateCoupon", {
      code: coupon.code,
      courseId: order.courseId,
      amount: order.amount,
      studentId: args.studentId,
    });

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const discountAmount = validation.coupon.discountAmount;

    // Tạo coupon use record
    const useId = await ctx.db.insert("coupon_uses", {
      couponId: args.couponId,
      studentId: args.studentId,
      orderId: args.orderId,
      discountAmount,
      appliedAt: Date.now(),
    });

    // Tăng usedCount
    await ctx.db.patch(args.couponId, {
      usedCount: coupon.usedCount + 1,
    });

    return {
      useId,
      discountAmount,
      newTotal: Math.max(0, order.amount - discountAmount),
    };
  },
});

/**
 * Xóa coupon (admin)
 */
export const deleteCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
  },
  async handler(ctx, args) {
    const coupon = await ctx.db.get(args.couponId);
    if (!coupon) {
      throw new Error("Mã giảm giá không tồn tại");
    }

    await ctx.db.delete(args.couponId);
    return args.couponId;
  },
});
