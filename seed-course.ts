// Script để tạo dữ liệu mẫu
// Chạy sau khi đã khởi động Convex backend với: bun run dev:server
// Sau đó chạy: bunx convex dev --once
// Copy-paste nội dung này vào Convex dashboard hoặc tạo mutation mới

/*
// Trong convex/courses.ts, thêm mutation này:

export const seedSampleCourse = mutation({
  handler: async (ctx) => {
    // Create a sample course
    const courseId = await ctx.db.insert("courses", {
      slug: "khoa-hoc-mau",
      title: "Khóa học mẫu",
      subtitle: "Khóa học demo để kiểm tra",
      description: "Đây là khóa học mẫu để kiểm tra tính năng trang chi tiết khóa học.",
      pricingType: "free",
      isPriceVisible: true,
      order: 1,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create a chapter
    const chapterId = await ctx.db.insert("course_chapters", {
      courseId: courseId,
      title: "Chương 1: Giới thiệu",
      order: 1,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create a lesson
    const lessonId = await ctx.db.insert("course_lessons", {
      courseId: courseId,
      chapterId: chapterId,
      title: "Bài 1: Lời mở đầu",
      description: "Giới thiệu tổng quan về khóa học",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      isPreview: true,
      order: 1,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { courseId, chapterId, lessonId };
  },
});
*/
