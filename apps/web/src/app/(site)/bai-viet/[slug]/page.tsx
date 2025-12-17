import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@dohy/backend/convex/_generated/api";
import PostDetailView from "@/features/post/post-detail-view";
import type { PostDetail } from "@/features/post/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function loadInitialDetail(
  slug: string,
): Promise<PostDetail | null | undefined> {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.warn("Không tìm thấy CONVEX_URL để preload detail");
    return undefined;
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const detail = await client.query(api.posts.getPostDetail, {
      slug,
      includeInactive: false,
    });
    return detail as PostDetail | null;
  } catch (error) {
    console.error("Không thể preload post detail", error);
    return undefined;
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await loadInitialDetail(slug);

  if (detail === null) {
    notFound();
  }

  return <PostDetailView slug={slug} initialDetail={detail} />;
}
