// Chứng chỉ hoàn thành khóa học
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Issue certificate - phát chứng chỉ khi hoàn thành
 */
export const issueCertificate = mutation({
  args: {
    studentId: v.id("students"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, { studentId, courseId }) => {
    // Check if already issued
    const existing = await ctx.db
      .query("certificates")
      .withIndex("by_student_course", (q) =>
        q.eq("studentId", studentId).eq("courseId", courseId)
      )
      .first();

    if (existing) {
      return { success: false, message: "Chứng chỉ đã phát trước đó", certificateId: existing._id };
    }

    // Issue new certificate
    const certificateCode = generateCertificateCode();
    const now = Date.now();

    const certificateId = await ctx.db.insert("certificates", {
      studentId,
      courseId,
      certificateCode,
      issuedAt: now,
      createdAt: now,
    });

    return {
      success: true,
      message: "Chứng chỉ đã phát",
      certificateId,
      certificateCode,
    };
  },
});

/**
 * Get certificate by code - xác minh chứng chỉ
 */
export const getCertificateByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, { code }) => {
    const certificate = await ctx.db
      .query("certificates")
      .withIndex("by_code", (q) => q.eq("certificateCode", code))
      .first();

    if (!certificate) {
      return { exists: false, message: "Chứng chỉ không tồn tại" };
    }

    // Get student and course info
    const student = await ctx.db.get(certificate.studentId);
    const course = await ctx.db.get(certificate.courseId);

    return {
      exists: true,
      certificateId: certificate._id,
      certificateCode: certificate.certificateCode,
      studentName: student?.fullName || "N/A",
      studentEmail: student?.email,
      courseName: course?.title || "N/A",
      issuedAt: certificate.issuedAt,
      expiresAt: certificate.expiresAt,
      createdAt: certificate.createdAt,
    };
  },
});

/**
 * Get student's certificates
 */
export const getStudentCertificates = query({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, { studentId }) => {
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .collect();

    const result = await Promise.all(
      certificates.map(async (cert: any) => {
        const course = await ctx.db.get(cert.courseId);
        return {
          certificateId: cert._id,
          certificateCode: cert.certificateCode,
          courseName: (course as any)?.title || "N/A",
          courseId: cert.courseId,
          issuedAt: cert.issuedAt,
          expiresAt: cert.expiresAt,
        };
      })
    );

    return result;
  },
});

/**
 * Download certificate (returns metadata for PDF generation)
 */
export const downloadCertificate = query({
  args: {
    certificateId: v.id("certificates"),
  },
  handler: async (ctx, { certificateId }) => {
    const certificate = await ctx.db.get(certificateId);
    if (!certificate) {
      throw new Error("Certificate not found");
    }

    const student = await ctx.db.get(certificate.studentId);
    const course = await ctx.db.get(certificate.courseId);

    // Get enrollment for completion percentage
    const enrollment = await ctx.db
      .query("course_enrollments")
      .withIndex("by_course_user", (q) =>
        q.eq("courseId", certificate.courseId).eq("userId", certificate.studentId as string)
      )
      .first();

    if (!student || !course) {
      throw new Error("Student or course not found");
    }

    return {
      certificateCode: certificate.certificateCode,
      studentName: student.fullName,
      studentEmail: student.email,
      courseName: course.title,
      issuedAt: new Date(certificate.issuedAt).toLocaleDateString("vi-VN"),
      issuedAtTimestamp: certificate.issuedAt,
      completionPercentage: enrollment?.completionPercentage || 100,
      dohy_logo_url: "https://example.com/logo.png", // Update with actual logo
      template: "default",
    };
  },
});

/**
 * Generate certificate code: DOHY-2024-XXXXX
 */
function generateCertificateCode(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `DOHY-${year}-${random}`;
}
