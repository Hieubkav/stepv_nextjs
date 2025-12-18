import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Track a new image added to content
export const trackImage = mutation({
  args: {
    contentType: v.string(),
    contentId: v.string(),
    storageId: v.id("_storage"),
    mediaId: v.optional(v.id("media")),
    src: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if already tracked
    const existing = await ctx.db
      .query("content_images")
      .withIndex("by_storage", (q) => q.eq("storageId", args.storageId))
      .first();
    
    if (existing) {
      // Update if content changed
      if (existing.contentId !== args.contentId || existing.contentType !== args.contentType) {
        await ctx.db.patch(existing._id, {
          contentType: args.contentType,
          contentId: args.contentId,
          deletedAt: undefined,
        });
      }
      return existing._id;
    }

    return await ctx.db.insert("content_images", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Get all images for a specific content
export const getContentImages = query({
  args: {
    contentType: v.string(),
    contentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("content_images")
      .withIndex("by_content", (q) => 
        q.eq("contentType", args.contentType).eq("contentId", args.contentId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
  },
});

// Sync content images - mark unused images for deletion
export const syncContentImages = mutation({
  args: {
    contentType: v.string(),
    contentId: v.string(),
    currentImageSrcs: v.array(v.string()), // Current image URLs in content
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("content_images")
      .withIndex("by_content", (q) => 
        q.eq("contentType", args.contentType).eq("contentId", args.contentId)
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const currentSrcSet = new Set(args.currentImageSrcs);
    const toDelete: string[] = [];

    for (const img of existing) {
      if (!currentSrcSet.has(img.src)) {
        // Image no longer in content - mark for deletion
        await ctx.db.patch(img._id, { deletedAt: Date.now() });
        toDelete.push(img.storageId);
      }
    }

    return { markedForDeletion: toDelete.length };
  },
});

// Cleanup deleted images from storage (run periodically or on-demand)
export const cleanupDeletedImages = mutation({
  args: {
    olderThanMs: v.optional(v.number()), // Only delete images marked deleted older than this
  },
  handler: async (ctx, args) => {
    const threshold = Date.now() - (args.olderThanMs ?? 24 * 60 * 60 * 1000); // Default 24h
    
    const toCleanup = await ctx.db
      .query("content_images")
      .withIndex("by_deleted")
      .filter((q) => 
        q.and(
          q.neq(q.field("deletedAt"), undefined),
          q.lt(q.field("deletedAt"), threshold)
        )
      )
      .take(50); // Batch size

    let cleaned = 0;
    for (const img of toCleanup) {
      try {
        // Delete from storage
        await ctx.storage.delete(img.storageId);
        // Delete tracking record
        await ctx.db.delete(img._id);
        cleaned++;
      } catch (e) {
        // Storage might already be deleted, just remove tracking
        await ctx.db.delete(img._id);
        cleaned++;
      }
    }

    return { cleaned };
  },
});

// Remove tracking when content is deleted
export const removeContentTracking = mutation({
  args: {
    contentType: v.string(),
    contentId: v.string(),
    deleteStorage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("content_images")
      .withIndex("by_content", (q) => 
        q.eq("contentType", args.contentType).eq("contentId", args.contentId)
      )
      .collect();

    for (const img of images) {
      if (args.deleteStorage) {
        try {
          await ctx.storage.delete(img.storageId);
        } catch (e) {
          // Ignore if already deleted
        }
      }
      await ctx.db.delete(img._id);
    }

    return { removed: images.length };
  },
});
