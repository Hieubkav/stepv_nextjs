import type { Id } from "@dohy/backend/convex/_generated/dataModel";

export type ProjectDoc = {
  _id: Id<"projects">;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  thumbnailId?: Id<"media">;
  videoMediaId?: Id<"media">;
  videoUrl?: string;
  categoryId?: Id<"project_categories">;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type ProjectImageDoc = {
  _id: Id<"project_images">;
  projectId: Id<"projects">;
  mediaId: Id<"media">;
  caption?: string;
  altText?: string;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type ProjectCategoryDoc = {
  _id: Id<"project_categories">;
  name: string;
  slug: string;
  description?: string;
  thumbnailId?: Id<"media">;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type MediaDoc = {
  _id: Id<"media">;
  url?: string;
  externalUrl?: string;
  title?: string;
  kind?: "image" | "video";
};

export type ProjectDetail = {
  project: ProjectDoc;
  category: ProjectCategoryDoc | null;
  images: ProjectImageDoc[];
};

