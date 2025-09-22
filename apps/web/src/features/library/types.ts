import type { Id } from "@dohy/backend/convex/_generated/dataModel";

export type LibraryResourceDoc = {
  _id: Id<"library_resources">;
  title: string;
  slug: string;
  description?: string;
  features?: string[];
  pricingType: "free" | "paid";
  coverImageId?: Id<"media">;
  downloadUrl?: string;
  isDownloadVisible: boolean;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type LibrarySoftwareDoc = {
  _id: Id<"library_softwares">;
  name: string;
  slug: string;
  iconImageId?: Id<"media">;
  officialUrl?: string;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type LibraryResourceImageDoc = {
  _id: Id<"library_resource_images">;
  resourceId: Id<"library_resources">;
  mediaId: Id<"media">;
  caption?: string;
  altText?: string;
  order: number;
  active: boolean;
  createdAt: number;
};

export type LibraryResourceSoftwareLink = {
  software: LibrarySoftwareDoc;
  link: {
    _id: Id<"library_resource_softwares">;
    resourceId: Id<"library_resources">;
    softwareId: Id<"library_softwares">;
    note?: string;
    order: number;
    active: boolean;
    assignedAt: number;
  };
};

export type MediaImageDoc = {
  _id: Id<"media">;
  title?: string;
  url?: string;
  format?: string;
  width?: number;
  height?: number;
};

export type LibraryResourceDetail = {
  resource: LibraryResourceDoc;
  images: LibraryResourceImageDoc[];
  softwares: LibraryResourceSoftwareLink[];
};
