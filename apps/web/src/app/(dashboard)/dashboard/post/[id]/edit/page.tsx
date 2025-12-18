"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PostForm, type PostFormValues } from "../../_components/post-form";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ArrowLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditPostPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const post = useQuery(api.posts.getPostDetail, { id: id as any, includeInactive: true });
  const updatePost = useMutation(api.posts.updatePost);

  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<PostFormValues | null>(null);

  useEffect(() => {
    if (post?.post) {
      setInitialValues({
        title: post.post.title,
        slug: post.post.slug,
        content: post.post.content,
        author: post.post.author ?? "",
        thumbnailId: post.post.thumbnailId ? String(post.post.thumbnailId) : "",
        categoryId: post.post.categoryId ? String(post.post.categoryId) : "",
        active: post.post.active,
        order: String(post.post.order ?? 0),
      });
    }
  }, [post]);

  async function handleSubmit(values: PostFormValues) {
    setSubmitting(true);
    try {
      await updatePost({
        id: id as any,
        title: values.title,
        content: values.content,
        thumbnailId: values.thumbnailId as any,
        categoryId: values.categoryId ? (values.categoryId as any) : undefined,
        author: values.author || undefined,
        active: values.active,
      });

      toast.success("Đã cập nhật bài viết");
      // Stay on edit page - don't redirect
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật bài viết");
    } finally {
      setSubmitting(false);
    }
  }

  const frontendUrl = post?.post?.slug ? `/bai-viet/${post.post.slug}` : null;

  if (post === undefined) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Đang tải...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (post === null || !post.post) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Không tìm thấy bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Bài viết này không tồn tại hoặc đã bị xóa.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!initialValues) {
    return null;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard/post")}
                title="Quay lại danh sách"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle>Chỉnh sửa bài viết</CardTitle>
            </div>
            {frontendUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={frontendUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Xem bài viết
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <PostForm
            initialValues={initialValues}
            submitting={submitting}
            submitLabel="Lưu thay đổi"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/post")}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
