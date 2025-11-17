// VietQR QR Code Generation
// Using VietQR API: https://vietqr.io/
import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate VietQR code for bank transfer
 * VietQR API endpoint: https://api.vietqr.io/v2/generate
 *
 * Required params:
 * - accountNo: Bank account number
 * - accountName: Account holder name
 * - acqId: Bank code (ACQ ID)
 * - amount: Amount in VND
 * - addInfo: Additional info (e.g., invoice number)
 *
 * Response:
 * - qrDataURL: Base64 encoded QR code
 * - qrUrl: Direct URL to QR image
 */
export const generateVietQRCode = action({
  args: {
    accountNumber: v.string(),
    accountName: v.string(),
    bankCode: v.string(), // e.g., "970422" for VietCombank, "970407" for Vietinbank
    amount: v.number(),
    transactionInfo: v.string(), // e.g., invoice number, order ID
  },
  returns: v.object({
    success: v.boolean(),
    qrCodeUrl: v.optional(v.string()),
    qrDataUrl: v.optional(v.string()),
    message: v.string(),
  }),
  handler: async (ctx, { accountNumber, accountName, bankCode, amount, transactionInfo }) => {
    try {
      // Validate inputs
      if (!accountNumber || !accountName || !bankCode || amount <= 0 || !transactionInfo) {
        return {
          success: false,
          message: "Invalid input parameters",
        };
      }

      // VietQR API endpoint
      const vietqrUrl = "https://api.vietqr.io/v2/generate";

      // Prepare request body for VietQR API
      const payload = {
        accountNo: accountNumber,
        accountName: accountName,
        acqId: bankCode,
        amount: amount,
        addInfo: transactionInfo,
        templateId: "compact", // or "default"
      };

      // Call VietQR API
      const response = await fetch(vietqrUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("VietQR API error:", error);
        return {
          success: false,
          message: `VietQR API error: ${error.message || "Unknown error"}`,
        };
      }

      const result = await response.json();

      // VietQR API returns:
      // {
      //   code: "00",
      //   message: "success",
      //   data: {
      //     qrDataURL: "base64_encoded_image",
      //     qrUrl: "https://img.vietqr.io/..."
      //   }
      // }

      if (result.code === "00" && result.data) {
        return {
          success: true,
          qrDataUrl: result.data.qrDataURL, // Base64
          qrCodeUrl: result.data.qrUrl, // Direct URL
          message: "QR code generated successfully",
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to generate QR code",
        };
      }
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
