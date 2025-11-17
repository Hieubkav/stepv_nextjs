"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/.source";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Heart, Reply, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface LessonCommentsProps {
  lessonId: string;
  courseId: string;
  studentId: string;
  studentName: string;
}

export function LessonComments({
  lessonId,
  courseId,
  studentId,
  studentName,
}: LessonCommentsProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Queries
  const comments = useQuery(api.comments.listLessonComments, {
    lessonId: lessonId as any,
  });
  const commentCount = useQuery(api.comments.getCommentCount, {
    lessonId: lessonId as any,
  });

  // Mutations
  const createCommentMutation = useMutation(api.comments.createComment);
  const likeCommentMutation = useMutation(api.comments.likeComment);
  const deleteCommentMutation = useMutation(api.comments.deleteComment);

  // Handle submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Lỗi",
        description: "Nội dung bình luận không được trống",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createCommentMutation({
        studentId: studentId as any,
        lessonId: lessonId as any,
        courseId: courseId as any,
        content: content.trim(),
      });

      setContent("");
      toast({
        title: "Thành công",
        description: "Bình luận đã được đăng",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submit reply
  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) {
      toast({
        title: "Lỗi",
        description: "Nội dung trả lời không được trống",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createCommentMutation({
        studentId: studentId as any,
        lessonId: lessonId as any,
        courseId: courseId as any,
        content: replyContent.trim(),
        parentCommentId: parentCommentId as any,
      });

      setReplyContent("");
      setReplyingTo(null);
      toast({
        title: "Thành công",
        description: "Trả lời đã được đăng",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like comment
  const handleLike = async (commentId: string) => {
    try {
      await likeCommentMutation({
        commentId: commentId as any,
        studentId: studentId as any,
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle delete comment
  const handleDelete = async (commentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    try {
      await deleteCommentMutation({
        commentId: commentId as any,
        studentId: studentId as any,
      });

      toast({
        title: "Thành công",
        description: "Bình luận đã bị xóa",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Toggle replies visibility
  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  if (!comments) {
    return <div className="text-center py-4">Đang tải bình luận...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-3">Bình luận ({commentCount || 0})</h3>
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            placeholder="Viết bình luận của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
            rows={3}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {content.length}/5000
            </span>
            <Button type="submit" disabled={isSubmitting} size="sm">
              {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3"
            >
              {/* Comment Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">
                    {comment.author?.fullName || "Ẩn danh"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                </div>

                {comment.studentId === studentId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Comment Content */}
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>

              {/* Comment Actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(comment._id)}
                  className="text-xs"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {comment.likesCount}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment._id)}
                  className="text-xs"
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Trả lời
                </Button>

                {comment.repliesCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplies(comment._id)}
                    className="text-xs"
                  >
                    {expandedReplies.has(comment._id) ? (
                      <ChevronUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    )}
                    {comment.repliesCount} trả lời
                  </Button>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo === comment._id && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2 bg-blue-50 dark:bg-blue-950 p-3 rounded">
                  <Textarea
                    placeholder="Viết trả lời của bạn..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    maxLength={5000}
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment._id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Đang gửi..." : "Gửi trả lời"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {expandedReplies.has(comment._id) && (
                <ReplyList
                  parentCommentId={comment._id}
                  studentId={studentId}
                  onDelete={handleDelete}
                  onLike={handleLike}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface ReplyListProps {
  parentCommentId: string;
  studentId: string;
  onDelete: (commentId: string) => void;
  onLike: (commentId: string) => void;
}

function ReplyList({ parentCommentId, studentId, onDelete, onLike }: ReplyListProps) {
  const replies = useQuery(api.comments.listCommentReplies, {
    parentCommentId: parentCommentId as any,
  });

  if (!replies) {
    return <div className="text-sm text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="ml-4 space-y-3 pt-3 border-l-2 border-gray-200 dark:border-gray-800 pl-4">
      {replies.map((reply) => (
        <div key={reply._id} className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm">
                {reply.author?.fullName || "Ẩn danh"}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(reply.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </p>
            </div>

            {reply.studentId === studentId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(reply._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300">
            {reply.content}
          </p>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(reply._id)}
              className="text-xs"
            >
              <Heart className="h-4 w-4 mr-1" />
              {reply.likesCount}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
