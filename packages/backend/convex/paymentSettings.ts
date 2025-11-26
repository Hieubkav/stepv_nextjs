// Payment settings for bank account and VietQR configuration
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

/**
 * Query: Get payment settings
 * Returns bank account and VietQR configuration for checkout
 */
export const getPaymentSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("payment_settings")
      .first();

    if (!settings) {
      return {
        _id: "",
        bankAccountNumber: "",
        bankAccountName: "",
        bankCode: "",
        bankBranch: undefined,
        adminEmail: "",
        updatedAt: 0,
        exists: false,
      };
    }

    return {
      _id: settings._id.toString(),
      bankAccountNumber: settings.bankAccountNumber,
      bankAccountName: settings.bankAccountName,
      bankCode: settings.bankCode,
      bankBranch: settings.bankBranch,
      adminEmail: settings.adminEmail,
      updatedAt: settings.updatedAt,
      exists: true,
    };
  },
});

/**
 * Mutation: Update payment settings (admin only)
 * Configures bank account and VietQR details for course payments
 */
export const updatePaymentSettings = mutation({
  args: {
    bankAccountNumber: v.string(),
    bankAccountName: v.string(),
    bankCode: v.string(),
    bankBranch: v.optional(v.string()),
    adminEmail: v.string(),
  },
  handler: async (
    ctx,
    { bankAccountNumber, bankAccountName, bankCode, bankBranch, adminEmail }
  ) => {
    // Validate inputs
    if (!bankAccountNumber || !bankAccountName || !bankCode || !adminEmail) {
      throw new ConvexError("Thông tin tài khoản ngân hàng không hợp lệ");
    }

    // Check if settings exist
    const existing = await ctx.db
      .query("payment_settings")
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        bankAccountNumber,
        bankAccountName,
        bankCode,
        bankBranch,
        adminEmail,
        updatedAt: now,
      });
    } else {
      // Create new
      await ctx.db.insert("payment_settings", {
        bankAccountNumber,
        bankAccountName,
        bankCode,
        bankBranch,
        adminEmail,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      message: "Cấu hình thanh toán đã được lưu thành công",
    };
  },
});
