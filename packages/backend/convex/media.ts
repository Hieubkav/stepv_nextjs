import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

// Generate an upload URL for client/server to POST a file buffer
export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    const url = await ctx.storage.generateUploadUrl();
    return { uploadUrl: url };
  },
});

// Persist an image record after file uploaded to storage
export const saveImage = mutation({
  args: {
    title: v.optional(v.string()),
    storageId: v.id("_storage"),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    format: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const doc = await ctx.db.insert("media", {
      kind: "image",
      title: args.title,
      storageId: args.storageId,
      width: args.width,
      height: args.height,
      format: args.format ?? "webp",
      sizeBytes: args.sizeBytes,
      createdAt: now,
    } as any);
    return doc;
  },
});

// Persist a video record after uploading to storage
export const saveVideo = mutation({
  args: {
    title: v.optional(v.string()),
    storageId: v.id("_storage"),
    format: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    duration: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const doc = await ctx.db.insert("media", {
      kind: "video",
      title: args.title,
      storageId: args.storageId,
      format: args.format,
      sizeBytes: args.sizeBytes,
      duration: args.duration,
      width: args.width,
      height: args.height,
      createdAt: now,
    } as any);
    return doc;
  },
});

// Create a video record (external link only)
export const createVideo = mutation({
  args: {
    title: v.optional(v.string()),
    externalUrl: v.string(),
  },
  handler: async (ctx, { title, externalUrl }) => {
    const now = Date.now();
    const doc = await ctx.db.insert("media", {
      kind: "video",
      title,
      externalUrl,
      createdAt: now,
    } as any);
    return doc;
  },
});

// List media (optionally by kind). Includes ephemeral URL for images.
export const list = query({
  args: { kind: v.optional(v.union(v.literal("image"), v.literal("video"))) },
  handler: async (ctx, { kind }) => {
    const results = await ctx.db
      .query("media")
      .withIndex("by_kind", (q) => (kind ? q.eq("kind", kind) : q))
      .collect();

    const items = await Promise.all(
      results
        .filter((m) => !m.deletedAt)
        .map(async (m) => {
          if (m.storageId) {
            try {
              const url = await ctx.storage.getUrl(m.storageId);
              return { ...m, url };
            } catch (_) {
              // Storage blob có thể đã bị xoá thủ công -> bỏ qua URL
              return { ...m };
            }
          }
          return m;
        })
    );
    return items;
  },
});

// Remove media. If image -> delete storage blob first.
export const remove = mutation({
  args: { id: v.id("media") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return false;
    if ((doc.kind === "image" || doc.kind === "video") && doc.storageId) {
      try {
        await ctx.storage.delete(doc.storageId);
      } catch (_) {
        // Blob không còn trong storage -> vẫn cho xoá record
      }
    }
    await ctx.db.delete(id);
    return true;
  },
});

// Update media record (KISS: allow title or video URL change)
export const update = mutation({
  args: {
    id: v.id("media"),
    title: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
  },
  handler: async (ctx, { id, title, externalUrl }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    await ctx.db.patch(id, { title, externalUrl });
    return id;
  },
});

// Replace an image's storage file, cleaning up old blob
export const replaceImage = mutation({
  args: {
    id: v.id("media"),
    storageId: v.id("_storage"),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    format: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
  },
  handler: async (ctx, { id, storageId, width, height, format, sizeBytes }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    if (doc.kind !== "image") throw new Error("Not an image");
    if (doc.storageId && doc.storageId !== storageId) {
      try {
        await ctx.storage.delete(doc.storageId);
      } catch (_) {
        // Blob cũ không còn -> bỏ qua
      }
    }
    await ctx.db.patch(id, { storageId, width, height, format, sizeBytes });
    return id;
  },
});

// Resolve image URL by storageId (if needed separately)
export const getImageUrl = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    return { url };
  },
});

// Xóa cứng record media, bỏ qua storage (dùng khi blob đã bị xóa thủ công)
export const forceRemove = mutation({
  args: { id: v.id("media") },
  handler: async (ctx, { id }) => {
    const exist = await ctx.db.get(id);
    if (!exist) return false;
    await ctx.db.delete(id);
    return true;
  },
});
