"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Doc, Id } from "@dohy/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { StudentAuthProvider, useStudentAuth } from "@/features/learner/auth/student-auth-context";
import {
  Bell,
  Trash2,
  Mail,
  CheckCircle,
  AlertCircle,
  Award,
  MessageCircle,
  BookOpen,
  Trash,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

type StudentNotification = Doc<"notifications">;

export default function NotificationsPage() {
  return (
    <StudentAuthProvider>
      <NotificationsPageContent />
    </StudentAuthProvider>
  );
}

function NotificationsPageContent() {
  const { student } = useStudentAuth();

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Thông báo</h1>
      <NotificationsContent studentId={student._id} />
    </div>
  );
}

function NotificationsContent({ studentId }: { studentId: Id<"students"> }) {
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string | null>(null);

  // Queries
  const notifications = useQuery(api.notifications.listNotifications, {
    studentId,
    limit: 100,
  }) as StudentNotification[] | undefined;

  const unreadCount = useQuery(api.notifications.getUnreadCount, {
    studentId,
  });

  const filteredNotifications = filterType
    ? notifications?.filter((n: StudentNotification) => n.type === filterType)
    : notifications;

  // Mutations
  const markAsReadMutation = useMutation(api.notifications.markAsRead);
  const deleteNotificationMutation = useMutation(
    api.notifications.deleteNotification
  );
  const markMultipleAsReadMutation = useMutation(
    api.notifications.markMultipleAsRead
  );
  const deleteMultipleMutation = useMutation(
    api.notifications.deleteMultipleNotifications
  );
  const clearAllMutation = useMutation(api.notifications.clearAllNotifications);

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsReadMutation({ notificationId });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (notificationId: Id<"notifications">) => {
    try {
      await deleteNotificationMutation({
        notificationId,
      });
      toast({
        title: "Thành công",
        description: "Thông báo đã xóa",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!notifications) return;
    const unreadIds = notifications
      .filter((n) => !n.isRead)
      .map((n) => n._id);

    if (unreadIds.length === 0) {
      toast({
        title: "Thông báo",
        description: "Tất cả thông báo đã được đánh dấu là đã đọc",
      });
      return;
    }

    try {
      await markMultipleAsReadMutation({ notificationIds: unreadIds });
      toast({
        title: "Thành công",
        description: "Tất cả thông báo đã được đánh dấu là đã đọc",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa tất cả thông báo? Hành động này không thể hoàn tác."
      )
    )
      return;

    try {
      await clearAllMutation({ studentId });
      toast({
        title: "Thành công",
        description: "Tất cả thông báo đã xóa",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: StudentNotification["type"]) => {
    switch (type) {
      case "order_confirmed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "payment_rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "certificate_issued":
        return <Award className="h-5 w-5 text-blue-500" />;
      case "new_comment_reply":
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      case "course_new_lesson":
        return <BookOpen className="h-5 w-5 text-orange-500" />;
      case "course_updated":
        return <TrendingUp className="h-5 w-5 text-amber-500" />;
      case "enrollment_status_changed":
        return <Users className="h-5 w-5 text-emerald-500" />;
      case "system":
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  const typeLabels: Record<StudentNotification["type"], string> = {
    order_confirmed: "Đơn hàng xác nhận",
    payment_rejected: "Thanh toán bị từ chối",
    certificate_issued: "Chứng chỉ phát hành",
    new_comment_reply: "Trả lời bình luận",
    course_updated: "Khóa học cập nhật",
    course_new_lesson: "B?i h?c m?i",
    enrollment_status_changed: "Tr?ng th?i dang ky thay d?i",
    system: "Th?ng b?o h? th?ng",
  };

  const notificationTypes: {
    value: StudentNotification["type"] | null;
    label: string;
  }[] = [
    { value: null, label: "Tất cả" },
    { value: "order_confirmed", label: "Đơn hàng" },
    { value: "certificate_issued", label: "Chứng chỉ" },
    { value: "new_comment_reply", label: "Bình luận" },
    { value: "course_new_lesson", label: "B?i h?c m?i" },
    { value: "payment_rejected", label: "Thanh to?n b? t? ch?i" },
    { value: "course_updated", label: "Kh?a c?p nh?t" },
    { value: "enrollment_status_changed", label: "Dang ky" },
    { value: "system", label: "H? th?ng" },
  ];

  if (!notifications || unreadCount === undefined) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tất cả thông báo ({notifications.length})
            {unreadCount > 0 && ` · ${unreadCount} chưa đọc`}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600"
            >
              <Trash className="h-4 w-4 mr-1" />
              Xóa tất cả
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {notificationTypes.map((type) => (
          <Button
            key={type.value || "all"}
            variant={filterType === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(type.value)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications && filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification: StudentNotification) => (
            <div
              key={notification._id}
              className={`border rounded-lg p-4 transition ${
                !notification.isRead
                  ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification._id)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2 items-center">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(
                          new Date(notification.createdAt),
                          {
                            addSuffix: true,
                            locale: vi,
                          }
                        )}
                      </p>
                      <span className="text-xs text-gray-500">
                        {typeLabels[notification.type]}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          Đánh dấu đã đọc
                        </Button>
                      )}
                      {notification.link && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => notification.link && window.location.assign(notification.link)}
                        >
                          Xem chi tiểt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {filterType
                ? "Không có thông báo thuộc loại này"
                : "Bạn không có thông báo nào"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


