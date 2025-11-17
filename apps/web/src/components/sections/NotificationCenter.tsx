"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/.source";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Bell,
  Trash2,
  Mail,
  CheckCircle,
  AlertCircle,
  Award,
  MessageCircle,
  BookOpen,
  X,
} from "lucide-react";

interface NotificationCenterProps {
  studentId: string;
}

export function NotificationCenter({ studentId }: NotificationCenterProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);

  // Queries
  const notifications = useQuery(api.notifications.listNotifications, {
    studentId: studentId as any,
    limit: 20,
  });

  const unreadCount = useQuery(api.notifications.getUnreadCount, {
    studentId: studentId as any,
  });

  const filteredNotifications = filterType
    ? notifications?.filter((n) => n.type === filterType)
    : notifications;

  // Mutations
  const markAsReadMutation = useMutation(api.notifications.markAsRead);
  const deleteNotificationMutation = useMutation(
    api.notifications.deleteNotification
  );
  const markMultipleAsReadMutation = useMutation(
    api.notifications.markMultipleAsRead
  );

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation({ notificationId: notificationId as any });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotificationMutation({
        notificationId: notificationId as any,
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

    if (unreadIds.length === 0) return;

    try {
      await markMultipleAsReadMutation({ notificationIds: unreadIds as any });
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

  const getNotificationIcon = (type: string) => {
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
      default:
        return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  const typeLabels: Record<string, string> = {
    order_confirmed: "Đơn hàng xác nhận",
    payment_rejected: "Thanh toán bị từ chối",
    certificate_issued: "Chứng chỉ phát hành",
    new_comment_reply: "Trả lời bình luận",
    course_updated: "Khóa học cập nhật",
    course_new_lesson: "Bài học mới",
    enrollment_status_changed: "Trạng thái đăng ký thay đổi",
  };

  if (!notifications || unreadCount === undefined) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Thông báo</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500">{unreadCount} chưa đọc</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex gap-2 overflow-x-auto">
            <Button
              variant={filterType === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(null)}
            >
              Tất cả
            </Button>
            <Button
              variant={
                filterType === "order_confirmed" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setFilterType("order_confirmed")}
            >
              Đơn hàng
            </Button>
            <Button
              variant={
                filterType === "certificate_issued" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setFilterType("certificate_issued")}
            >
              Chứng chỉ
            </Button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications && filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer ${
                      !notification.isRead
                        ? "bg-blue-50 dark:bg-blue-950"
                        : ""
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification._id);
                      }
                      if (notification.link) {
                        window.location.href = notification.link;
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                                locale: vi,
                              }
                            )}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification._id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Không có thông báo</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="flex-1"
                >
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Xem tất cả
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
