// VietQR QR Code Generation
// Using VietQR Quick Link: https://vietqr.io/
import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate VietQR code URL for bank transfer using Quick Link syntax:
 * https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
 * This syntax is documented publicly so we don't need API keys for most use cases.
 */
export const generateVietQRCode = action({
  args: {
    accountNumber: v.string(),
    accountName: v.string(),
    bankCode: v.string(), // Can be BIN (e.g. "970422") or bank short name (e.g. "vcb")
    amount: v.number(),
    transactionInfo: v.string(), // e.g., invoice number, order ID
  },
  returns: v.object({
    success: v.boolean(),
    qrCodeUrl: v.optional(v.string()),
    qrDataUrl: v.optional(v.string()),
    message: v.string(),
  }),
  handler: async (_ctx, { accountNumber, accountName, bankCode, amount, transactionInfo }) => {
    try {
      const trimmedAccount = accountNumber.trim();
      const trimmedBankCode = bankCode.trim();
      const sanitizedInfo = transactionInfo.trim();
      if (!trimmedAccount || !accountName || !trimmedBankCode || amount <= 0 || !sanitizedInfo) {
        return {
          success: false,
          message: "Invalid input parameters",
        };
      }

      const templateId = "qr_only";
      const qrUrl = new URL(
        `https://img.vietqr.io/image/${encodeURIComponent(trimmedBankCode)}-${encodeURIComponent(
          trimmedAccount,
        )}-${templateId}.png`,
      );
      qrUrl.searchParams.set("amount", Math.round(amount).toString());
      qrUrl.searchParams.set("addInfo", sanitizedInfo);
      qrUrl.searchParams.set("accountName", accountName);

      return {
        success: true,
        qrCodeUrl: qrUrl.toString(),
        qrDataUrl: undefined,
        message: "QR code URL generated successfully",
      };
    } catch (error) {
      console.error("VietQR generation error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to generate QR code",
      };
    }
  },
});

/**
 * Common bank codes for Vietnam
 * These are ACQ IDs used by VietQR
 */
export const BANK_CODES = {
  VIETCOMBANK: "970422",
  VIETINBANK: "970407",
  TECHCOMBANK: "970418",
  ACB: "970016",
  BIDV: "970448",
  VCCB: "970441",
  EXIMBANK: "970431",
  SACOMBANK: "970426",
  AGRIBANK: "970405",
  DongABank: "970406",
  LienVietPostBank: "970432",
  TPBank: "970423",
  PVComBank: "970412",
  MBBank: "970422", // MBBank uses same code as Vietcombank
  VPBank: "970438",
  SHB: "970443",
  VIB: "970454",
  HDBank: "970437",
  OCB: "970448", // OCB
  KIENLONGBANK: "970411",
  NGOAIKHAUTRADIAU: "970425",
  BAOVIET: "970436",
  SAIGONBANK: "970429",
  SHINHANBANK: "970424",
  STANDARDCHARTERED: "970440",
  HSBC: "970435",
  SCBLTD: "970429",
  FUJIBANK: "970428",
  MIZUHO: "970430",
  BANKKOREA: "970421",
  WOORIBANK: "970433",
};
