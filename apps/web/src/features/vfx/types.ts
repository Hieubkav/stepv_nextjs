import type { Id } from "@dohy/backend/convex/_generated/dataModel";

export type VfxCategory =
  | "explosion"
  | "fire"
  | "smoke"
  | "water"
  | "magic"
  | "particle"
  | "transition"
  | "other";

export type VfxProductDoc = {
  _id: Id<"vfx_products">;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: VfxCategory;
  thumbnailId?: Id<"media">;
  previewVideoId: Id<"media">;
  downloadFileId: Id<"media">;
  pricingType: "free" | "paid";
  price?: number;
  originalPrice?: number;
  duration: number;
  resolution: string;
  frameRate: number;
  format: string;
  hasAlpha: boolean;
  fileSize: number;
  downloadCount?: number;
  averageRating?: number;
  totalReviews?: number;
  tags?: string[];
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type VfxAssetDoc = {
  _id: Id<"vfx_assets">;
  vfxId: Id<"vfx_products">;
  mediaId: Id<"media">;
  kind: "preview" | "download";
  label?: string;
  variant?: string;
  isPrimary?: boolean;
  sizeBytes?: number;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type MediaDoc = {
  _id: Id<"media">;
  kind?: "image" | "video" | string;
  title?: string | null;
  url?: string | null;
  externalUrl?: string | null;
  format?: string | null;
  width?: number | null;
  height?: number | null;
};
