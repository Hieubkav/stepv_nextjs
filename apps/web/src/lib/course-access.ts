// Access control utility for course enrollment
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@dohy/backend/convex/_generated/api';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';

/**
 * Check if a student has access to a course
 * - Free courses: always accessible
 * - Paid courses: only if enrolled (active enrollment)
 */
export async function checkCourseAccess(
  courseId: Id<'courses'>,
  studentId: string,
  convexUrl: string
): Promise<{
  hasAccess: boolean;
  isPaid: boolean;
  enrolled: boolean;
  reason?: string;
}> {
  try {
    const client = new ConvexHttpClient(convexUrl);

    // Get course details
    const course = await client.query(api.courses.getCourse, { id: courseId });
    if (!course) {
      return { hasAccess: false, isPaid: false, enrolled: false, reason: 'Course not found' };
    }

    const isPaid = course.pricingType === 'paid';

    // Free courses - no enrollment needed
    if (!isPaid) {
      return { hasAccess: true, isPaid: false, enrolled: true };
    }

    // Paid course - check enrollment
    const enrollments = await client.query(
      api.courses.getCourseEnrollments,
      { courseId }
    );

    const enrollment = enrollments.find((e: any) => e.userId === studentId && e.active);

    if (!enrollment) {
      return {
        hasAccess: false,
        isPaid: true,
        enrolled: false,
        reason: 'Need to purchase this course',
      };
    }

    return { hasAccess: true, isPaid: true, enrolled: true };
  } catch (error) {
    console.error('Error checking course access:', error);
    return {
      hasAccess: false,
      isPaid: false,
      enrolled: false,
      reason: 'Error checking access',
    };
  }
}

/**
 * Get access denied message for course
 */
export function getAccessDeniedMessage(courseId: Id<'courses'>, isPaid: boolean): {
  title: string;
  description: string;
  action: 'purchase' | 'enroll' | 'login';
} {
  if (isPaid) {
    return {
      title: 'Khóa học trả phí',
      description: 'Bạn cần mua khóa học này để truy cập nội dung.',
      action: 'purchase',
    };
  }

  return {
    title: 'Chưa đăng nhập',
    description: 'Vui lòng đăng nhập để truy cập khóa học.',
    action: 'login',
  };
}
