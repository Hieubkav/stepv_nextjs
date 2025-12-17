import type { Id } from "@dohy/backend/convex/_generated/dataModel";

export type PostDoc = {
  _id: Id<"posts">;
  title: string;
  slug: string;
  content: string;
  thumbnailId?: Id<"media">; // Optional để tương thích dữ liệu cũ
  categoryId?: Id<"post_categories">;
  author?: string;
  // Legacy fields
  excerpt?: string;
  tags?: string[];
  viewCount: number;
  order: number;
  active: boolean;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
};

export type PostWithThumbnail = PostDoc & {
  thumbnailUrl: string | null;
};

export type PostDetail = {
  post: PostDoc;
  thumbnailUrl: string | null;
};
