// OTP functions cho password reset (KISS implementation)
import { mutation, query, action } from "./_generated/server";
import type { MutationCtx, QueryCtx, ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

type AnyCtx = MutationCtx | QueryCtx;

// Constants
const OTP_EXPIRY_MINUTES = 15;
const OTP_MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 30;
const RATE_LIMIT_MINUTES = 5;
const RATE_LIMIT_PER_HOUR = 3;

/**
 * Generate 6-digit OTP code
 */
const generateOTPCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Mutation: Request OTP for password reset
 * - Check rate limit
 * - Generate 6-digit OTP
 * - Save to DB with expiry
 * - Send email
 */
export const requestPasswordResetOTP = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Find student by email
    const student = await ctx.db
      .query("students")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!student) {
      // Don't reveal if email exists (security best practice)
      return {
        success: true,
        message: "Nếu email tồn tại, OTP sẽ được gửi trong vài giây.",
      };
    }

    // Check if blocked (brute force protection)
    if (student.lastOtpBlockedUntil && student.lastOtpBlockedUntil > now) {
      const remainingMinutes = Math.ceil(
        (student.lastOtpBlockedUntil - now) / 60000
      );
      return {
        success: false,
        message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${remainingMinutes} phút.`,
      };
    }

    // Check rate limit: count requests in last hour
    const recentOtps = await ctx.db
      .query("otp_tokens")
      .withIndex("by_email_unused", (q) => q.eq("email", email))
      .collect();

    const recentCount = recentOtps.filter(
      (otp) => otp.createdAt > oneHourAgo
    ).length;

    if (recentCount >= RATE_LIMIT_PER_HOUR) {
      // Block for 1 hour
      await ctx.db.patch(student._id, {
        lastOtpBlockedUntil: now + 60 * 60 * 1000,
      });
      return {
        success: false,
        message: "Quá nhiều yêu cầu trong 1 giờ. Vui lòng thử lại sau 1 giờ.",
      };
    }

    // Generate OTP
    const otpCode = generateOTPCode();
    const expiresAt = now + OTP_EXPIRY_MINUTES * 60 * 1000;

    // Save OTP token to DB
    await ctx.db.insert("otp_tokens", {
      studentId: student._id,
      email: email,
      otpCode: otpCode,
      expiresAt: expiresAt,
      usedAt: undefined,
      attempts: 0,
      blockedUntil: undefined,
      createdAt: now,
    });

    // Update last OTP sent timestamp
    await ctx.db.patch(student._id, {
      lastOtpSentAt: now,
    });

    const studentEmail = student.email ?? email;
    const studentName = student.fullName ?? studentEmail;

    if (studentEmail) {
      await ctx.scheduler.runAfter(0, internal.email.sendOTPEmail, {
        studentEmail,
        studentName,
        otpCode,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      });
    }
    return {
      success: true,
      message: "OTP đã được gửi đến email của bạn. Vui lòng check email.",
    };
  },
});

/**
 * Mutation: Validate OTP (check if valid, not expired, not used)
 * Also updates attempts counter if wrong
 */
export const validateOTP = mutation({
  args: {
    email: v.string(),
    otpCode: v.string(),
  },
  handler: async (ctx, { email, otpCode }) => {
    const now = Date.now();

    // Find OTP token
    const otp = await ctx.db
      .query("otp_tokens")
      .withIndex("by_email_unused", (q) => q.eq("email", email))
      .filter((q) => q.not(q.neq(q.field("usedAt"), undefined)))
      .order("desc")
      .first();

    if (!otp) {
      return {
        valid: false,
        message: "Không tìm thấy OTP. Vui lòng yêu cầu OTP mới.",
      };
    }

    // Check if expired
    if (otp.expiresAt < now) {
      return {
        valid: false,
        message: "OTP đã hết hạn. Vui lòng yêu cầu OTP mới.",
      };
    }

    // Check if already used
    if (otp.usedAt) {
      return {
        valid: false,
        message: "OTP này đã được sử dụng. Vui lòng yêu cầu OTP mới.",
      };
    }

    // Check if blocked due to attempts
    if (otp.blockedUntil && otp.blockedUntil > now) {
      const remainingMinutes = Math.ceil(
        (otp.blockedUntil - now) / 60000
      );
      return {
        valid: false,
        message: `Quá nhiều lần nhập sai. Vui lòng thử lại sau ${remainingMinutes} phút.`,
      };
    }

    // Check if code matches
    if (otp.otpCode !== otpCode) {
      const newAttempts = otp.attempts + 1;

      // Block if max attempts reached
      let blockedUntil: number | undefined = undefined;
      if (newAttempts >= OTP_MAX_ATTEMPTS) {
        blockedUntil = now + BLOCK_DURATION_MINUTES * 60 * 1000;
      }

      await ctx.db.patch(otp._id, {
        attempts: newAttempts,
        blockedUntil: blockedUntil,
      });

      const remainingAttempts = OTP_MAX_ATTEMPTS - newAttempts;
      if (remainingAttempts <= 0) {
        return {
          valid: false,
          message: `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${BLOCK_DURATION_MINUTES} phút.`,
        };
      }

      return {
        valid: false,
        message: `OTP không chính xác. Còn ${remainingAttempts} lần nhập.`,
      };
    }

    // OTP is valid
    return {
      valid: true,
      message: "OTP hợp lệ.",
    };
  },
});

/**
 * Mutation: Verify OTP and reset password
 */
export const verifyOTPAndResetPassword = mutation({
  args: {
    email: v.string(),
    otpCode: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { email, otpCode, newPassword }) => {
    const now = Date.now();

    // Find student
    const student = await ctx.db
      .query("students")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!student) {
      return {
        success: false,
        message: "Người dùng không tồn tại.",
      };
    }

    // Find OTP token
    const otp = await ctx.db
      .query("otp_tokens")
      .withIndex("by_email_unused", (q) => q.eq("email", email))
      .filter((q) => q.not(q.neq(q.field("usedAt"), undefined)))
      .order("desc")
      .first();

    if (!otp) {
      return {
        success: false,
        message: "OTP không tồn tại. Vui lòng yêu cầu OTP mới.",
      };
    }

    // Check if expired
    if (otp.expiresAt < now) {
      return {
        success: false,
        message: "OTP đã hết hạn. Vui lòng yêu cầu OTP mới.",
      };
    }

    // Check if already used
    if (otp.usedAt) {
      return {
        success: false,
        message: "OTP này đã được sử dụng. Vui lòng yêu cầu OTP mới.",
      };
    }

    // Check if blocked
    if (otp.blockedUntil && otp.blockedUntil > now) {
      const remainingMinutes = Math.ceil(
        (otp.blockedUntil - now) / 60000
      );
      return {
        success: false,
        message: `Quá nhiều lần nhập sai. Vui lòng thử lại sau ${remainingMinutes} phút.`,
      };
    }

    // Validate OTP code
    if (otp.otpCode !== otpCode) {
      const newAttempts = otp.attempts + 1;

      // Block if max attempts reached
      let blockedUntil: number | undefined = undefined;
      if (newAttempts >= OTP_MAX_ATTEMPTS) {
        blockedUntil = now + BLOCK_DURATION_MINUTES * 60 * 1000;
      }

      await ctx.db.patch(otp._id, {
        attempts: newAttempts,
        blockedUntil: blockedUntil,
      });

      const remainingAttempts = OTP_MAX_ATTEMPTS - newAttempts;
      if (remainingAttempts <= 0) {
        return {
          success: false,
          message: `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${BLOCK_DURATION_MINUTES} phút.`,
        };
      }

      return {
        success: false,
        message: `OTP không chính xác. Còn ${remainingAttempts} lần nhập.`,
      };
    }

    // Validate password (basic validation)
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      };
    }

    // Update password
    await ctx.db.patch(student._id, {
      password: newPassword,
      updatedAt: now,
    });

    // Mark OTP as used
    await ctx.db.patch(otp._id, {
      usedAt: now,
    });

    // Clear OTP block
    await ctx.db.patch(student._id, {
      lastOtpBlockedUntil: undefined,
    });

    return {
      success: true,
      message: "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.",
    };
  },
});

/**
 * Query: Get OTP status (for frontend UI - timer, attempts, etc.)
 */
export const getOTPStatus = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const now = Date.now();

    // Find latest OTP for this email
    const otp = await ctx.db
      .query("otp_tokens")
      .withIndex("by_email_unused", (q) => q.eq("email", email))
      .filter((q) => q.not(q.neq(q.field("usedAt"), undefined)))
      .order("desc")
      .first();

    if (!otp) {
      return {
        exists: false,
        isBlocked: false,
      };
    }

    // Check if expired
    if (otp.expiresAt < now) {
      return {
        exists: false,
        isBlocked: false,
      };
    }

    // Check if used
    if (otp.usedAt) {
      return {
        exists: false,
        isBlocked: false,
      };
    }

    const expiresInSeconds = Math.ceil((otp.expiresAt - now) / 1000);
    const remainingAttempts = Math.max(
      0,
      OTP_MAX_ATTEMPTS - otp.attempts
    );

    const isBlocked =
      otp.blockedUntil !== undefined && otp.blockedUntil > now;
    const blockedUntilSeconds = isBlocked
      ? Math.ceil((otp.blockedUntil! - now) / 1000)
      : undefined;

    return {
      exists: true,
      expiresInSeconds,
      remainingAttempts,
      isBlocked,
      blockedUntilSeconds,
    };
  },
});
