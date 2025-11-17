"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/.source";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Star, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";

interface CourseReviewsProps {
  courseId: string;
  studentId: string;
  studentName: string;
}

export function CourseReviews({
  courseId,
  studentId,
  studentName,
}: CourseReviewsProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<"helpful" | "newest" | "rating">(
    "helpful"
  );

  // Queries
  const reviews = useQuery(api.reviews.listCourseReviews, {
    courseId: courseId as any,
    sortBy,
  });
  const courseRating = useQuery(api.reviews.getCourseRating, {
    courseId: courseId as any,
  });
  const studentReview = useQuery(api.reviews.getStudentCourseReview, {
    courseId: courseId as any,
    studentId: studentId as any,
  });

  // Mutations
  const createReviewMutation = useMutation(api.reviews.createReview);
  const updateReviewMutation = useMutation(api.reviews.updateReview);
  const deleteReviewMutation = useMutation(api.reviews.deleteReview);

  // Handle submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Lỗi",
        description: "Tiêu đề và nội dung không được trống",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (studentReview) {
        // Update existing review
        await updateReviewMutation({
          reviewId: studentReview._id,
          studentId: studentId as any,
          rating,
          title: title.trim(),
          content: content.trim(),
        });
        toast({
          title: "Thành công",
          description: "Đánh giá đã cập nhật",
        });
      } else {
        // Create new review
        await createReviewMutation({
          studentId: studentId as any,
          courseId: courseId as any,
          rating,
          title: title.trim(),
          content: content.trim(),
        });
        toast({
          title: "Thành công",
          description: "Đánh giá đã được đăng",
        });
        setTitle("");
        setContent("");
        setRating(5);
      }
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

  // Handle delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;

    try {
      await deleteReviewMutation({
        reviewId: reviewId as any,
        studentId: studentId as any,
      });
      toast({
        title: "Thành công",
        description: "Đánh giá đã bị xóa",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!courseRating || !reviews) {
    return <div className="text-center py-4">Đang tải đánh giá...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {courseRating.averageRating}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(courseRating.averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {courseRating.totalReviews} đánh giá
            </p>
          </div>

          {/* Distribution */}
          <div className="md:col-span-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = courseRating.distribution[star] || 0;
              const percentage =
                courseRating.totalReviews > 0
                  ? Math.round((count / courseRating.totalReviews) * 100)
                  : 0;

              return (
                <div key={star} className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{star}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Form */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-lg mb-4">
          {studentReview ? "Cập nhật đánh giá của bạn" : "Viết đánh giá"}
        </h3>

        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Đánh giá</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Tiêu đề</label>
            <Input
              placeholder="Tiêu đề đánh giá của bạn"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/200</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Nội dung</label>
            <Textarea
              placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={5000}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length}/5000
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            {studentReview && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDeleteReview(studentReview._id)}
              >
                Xóa đánh giá
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">
            Đánh giá từ người học ({courseRating.totalReviews})
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
          >
            <option value="helpful">Hữu ích nhất</option>
            <option value="rating">Đánh giá cao nhất</option>
            <option value="newest">Mới nhất</option>
          </select>
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
            </p>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                isOwn={review.studentId === studentId}
                onDelete={() => handleDeleteReview(review._id)}
                courseId={courseId}
                studentId={studentId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface ReviewCardProps {
  review: any;
  isOwn: boolean;
  onDelete: () => void;
  courseId: string;
  studentId: string;
}

function ReviewCard({
  review,
  isOwn,
  onDelete,
  courseId,
  studentId,
}: ReviewCardProps) {
  const { toast } = useToast();
  const [userVote, setUserVote] = useState<boolean | null>(null);

  const markHelpfulMutation = useMutation(api.reviews.markReviewHelpful);
  const existingVote = useQuery(api.reviews.getHelpfulVote, {
    reviewId: review._id,
    studentId: studentId as any,
  });

  if (existingVote !== undefined && userVote === null) {
    setUserVote(existingVote);
  }

  const handleMarkHelpful = async (isHelpful: boolean) => {
    try {
      await markHelpfulMutation({
        reviewId: review._id,
        studentId: studentId as any,
        isHelpful,
      });
      setUserVote(isHelpful);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-sm">{review.title}</span>
          </div>
          <p className="text-xs text-gray-500">
            {review.author?.fullName || "Ẩn danh"} •{" "}
            {formatDistanceToNow(new Date(review.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </p>
        </div>

        {isOwn && (
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 dark:text-gray-300">{review.content}</p>

      {/* Helpful Votes */}
      <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <Button
          variant={userVote === true ? "default" : "ghost"}
          size="sm"
          onClick={() => handleMarkHelpful(true)}
          className="text-xs"
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          {review.helpfulCount}
        </Button>
        <Button
          variant={userVote === false ? "default" : "ghost"}
          size="sm"
          onClick={() => handleMarkHelpful(false)}
          className="text-xs"
        >
          <ThumbsDown className="h-4 w-4 mr-1" />
          {review.unhelpfulCount}
        </Button>
      </div>
    </div>
  );
}
