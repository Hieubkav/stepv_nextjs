"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PostForm, type PostFormValues } from "../_components/post-form";

const initialValues: PostFormValues = {
  title: "",
  slug: "",
  content: "",
  author: "",
  thumbnailId: "",
  categoryId: "",
  active: true, // Mặc định công khai
  order: "0",
};

export default function NewPostPage() {
  const router = useRouter();
  const createPost = useMutation(api.posts.createPost);
  const posts = useQuery(api.posts.listPosts, {});

  const [submitting, setSubmitting] = useState(false);

  // Calculate next order
  const nextOrder = posts ? Math.max(0, ...posts.map((p: any) => p.order ?? 0)) + 1 : 0;
  const formInitial = { ...initialValues, order: String(nextOrder) };

  async function handleSubmit(values: PostFormValues) {
    setSubmitting(true);
    try {
      await createPost({
        title: values.title,
        slug: values.slug,
        content: values.content,
        thumbnailId: values.thumbnailId as any,
        categoryId: values.categoryId ? (values.categoryId as any) : undefined,
        author: values.author || undefined,
        order: parseInt(values.order) || 0,
        active: values.active,
      });

      toast.success("Đã tạo bài viết");
      router.push("/dashboard/post");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể tạo bài viết");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Thêm bài viết mới</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm
            initialValues={formInitial}
            submitting={submitting}
            submitLabel="Tạo bài viết"
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/post")}
            mode="new"
          />
        </CardContent>
      </Card>
    </div>
  );
}
