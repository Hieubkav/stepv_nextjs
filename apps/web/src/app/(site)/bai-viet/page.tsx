import type { Metadata } from "next";
import PostListView from "@/features/post/post-list-view";
import { createMetadata } from "@/lib/seo/metadata";
import { generateCanonicalUrl } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Bài viết | DOHY Media",
  description: "Khám phá các bài viết, hướng dẫn và chia sẻ kinh nghiệm về thiết kế 3D, VFX và sản xuất nội dung số từ DOHY Media.",
  keywords: ["bài viết", "blog", "hướng dẫn", "design", "3D", "VFX"],
  url: generateCanonicalUrl("/bai-viet"),
});

export default function PostListPage() {
  return <PostListView />;
}
