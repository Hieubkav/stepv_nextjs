"use client";

import { useQuery } from "convex/react";
import { api } from "@/.source";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Users,
  BookOpen,
  BarChart3,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

export default function AnalyticsPage() {
  // Queries
  const revenueStats = useQuery(api.analytics.getRevenueStats, {
    period: "month",
  });
  const studentStats = useQuery(api.analytics.getStudentStats, {});
  const enrollmentStats = useQuery(api.analytics.getCourseEnrollmentStats, {});
  const paymentStats = useQuery(api.analytics.getPaymentStats, {});
  const progressStats = useQuery(api.analytics.getLearnerProgressStats, {});
  const engagementStats = useQuery(api.analytics.getEngagementStats, {});

  const isLoading =
    !revenueStats ||
    !studentStats ||
    !enrollmentStats ||
    !paymentStats ||
    !progressStats ||
    !engagementStats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tổng quan thống kê và phân tích hoạt động nền tảng
        </p>
      </div>

      {/* Revenue Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Doanh Thu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tổng Doanh Thu (Tháng Này)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {revenueStats!.totalRevenue.toLocaleString()} VND
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {revenueStats!.totalTransactions} giao dịch
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Giá Trị Giao Dịch Trung Bình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {revenueStats!.averageTransactionValue.toLocaleString()} VND
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Trên mỗi giao dịch
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tổng Giao Dịch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {revenueStats!.totalTransactions}
              </div>
              <p className="text-xs text-gray-500 mt-1">Trong tháng này</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Students Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Học Viên
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tổng Học Viên</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {studentStats!.totalStudents}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Học Viên Mới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                +{studentStats!.newStudents}
              </div>
              <p className="text-xs text-gray-500 mt-1">30 ngày gần đây</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Học Viên Hoạt Động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {studentStats!.activeStudents}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(
                  (studentStats!.activeStudents / studentStats!.totalStudents) *
                  100
                ).toFixed(1)}
                % hoạt động
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Với Chứng Chỉ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {studentStats!.studentsWithCertificates}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(
                  (studentStats!.studentsWithCertificates /
                    studentStats!.totalStudents) *
                  100
                ).toFixed(1)}
                % tổng số
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Courses Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Khóa Học
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Khóa Phổ Biến</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enrollmentStats!.topCourses.slice(0, 5).map((course, idx) => (
                  <div key={course.courseId} className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">
                        {idx + 1}. {course.courseTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        {course.enrollments} đăng ký · {course.completions} hoàn thành
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {parseFloat(course.completionRate as any)}%
                      </div>
                      <p className="text-xs text-gray-500">hoàn thành</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống Kê Khóa Học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng Khóa</span>
                <span className="font-bold">{enrollmentStats!.totalCourses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trung Bình Đánh Giá</span>
                <span className="font-bold">
                  {(
                    enrollmentStats!.stats.reduce((sum, c) => sum + c.averageRating, 0) /
                    enrollmentStats!.stats.length
                  ).toFixed(1)}
                  ⭐
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng Đánh Giá</span>
                <span className="font-bold">
                  {enrollmentStats!.stats.reduce((sum, c) => sum + c.totalReviews, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng Đăng Ký</span>
                <span className="font-bold">
                  {enrollmentStats!.stats.reduce((sum, c) => sum + c.enrollments, 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Thanh Toán
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Xác Nhận</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {paymentStats!.confirmedPayments}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {paymentStats!.confirmationRate}% tỷ lệ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Chờ Xác Nhận</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {paymentStats!.pendingPayments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bị Từ Chối</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {paymentStats!.rejectedPayments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Thời Gian TBC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {paymentStats!.averageConfirmationTimeHours}
              </div>
              <p className="text-xs text-gray-500 mt-1">giờ để xác nhận</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Learning Progress Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="h-6 w-6" />
          Tiến Độ Học Tập
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tổng Giờ Học</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {progressStats!.totalWatchHours}
              </div>
              <p className="text-xs text-gray-500 mt-1">giờ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bài Hoàn Thành</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {progressStats!.completedLessons}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {parseFloat(progressStats!.lessonCompletionRate as any)}% hoàn thành
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Khóa Hoàn Thành</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {progressStats!.completedCourses}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Engagement Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Tương Tác
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bình Luận</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng</span>
                <span className="font-bold">
                  {engagementStats!.totalComments}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trả Lời</span>
                <span className="font-bold">
                  {engagementStats!.totalReplies}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Like</span>
                <span className="font-bold">
                  {engagementStats!.averageLikesPerComment}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Đánh Giá</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng</span>
                <span className="font-bold">
                  {engagementStats!.totalReviews}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trung Bình</span>
                <span className="font-bold">
                  {engagementStats!.averageRating} ⭐
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Thông Báo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Gửi</span>
                <span className="font-bold">
                  {engagementStats!.totalNotificationsSent}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chưa Đọc</span>
                <span className="font-bold text-blue-600">
                  {engagementStats!.unreadNotifications}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
