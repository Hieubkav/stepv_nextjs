import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Helper: recursively find all URLs in an object
function extractUrlsFromData(data: any, urls: Set<string>) {
  if (!data) return;
  if (typeof data === "string") {
    // Check if it's a URL (http/https)
    if (data.startsWith("http://") || data.startsWith("https://")) {
      urls.add(data);
    }
    return;
  }
  if (Array.isArray(data)) {
    data.forEach(item => extractUrlsFromData(item, urls));
    return;
  }
  if (typeof data === "object") {
    Object.values(data).forEach(value => extractUrlsFromData(value, urls));
  }
}

// Scan all media records and find which ones are not referenced by any content
export const findOrphanMedia = query({
  args: {},
  handler: async (ctx) => {
    // 1. Get all media records with their URLs
    const allMedia = await ctx.db.query("media").collect();
    const mediaWithUrls = await Promise.all(
      allMedia.map(async (m) => {
        let url: string | null = null;
        if (m.storageId) {
          try {
            url = await ctx.storage.getUrl(m.storageId);
          } catch (_) {}
        }
        return { ...m, url };
      })
    );
    
    // Build URL to media ID map for page_blocks lookup
    const urlToMediaId = new Map<string, string>();
    mediaWithUrls.forEach(m => {
      if (m.url) urlToMediaId.set(m.url, m._id);
      if (m.externalUrl) urlToMediaId.set(m.externalUrl, m._id);
    });
    
    // 2. Collect all referenced media IDs from various tables
    const referencedIds = new Set<string>();
    
    // library_resources.coverImageId
    const resources = await ctx.db.query("library_resources").collect();
    resources.forEach(r => r.coverImageId && referencedIds.add(r.coverImageId));
    
    // library_resource_images.mediaId
    const resourceImages = await ctx.db.query("library_resource_images").collect();
    resourceImages.forEach(r => referencedIds.add(r.mediaId));
    
    // library_softwares.iconImageId
    const softwares = await ctx.db.query("library_softwares").collect();
    softwares.forEach(s => s.iconImageId && referencedIds.add(s.iconImageId));
    
    // projects.thumbnailId, videoMediaId
    const projects = await ctx.db.query("projects").collect();
    projects.forEach(p => {
      p.thumbnailId && referencedIds.add(p.thumbnailId);
      p.videoMediaId && referencedIds.add(p.videoMediaId);
    });
    
    // project_images.mediaId
    const projectImages = await ctx.db.query("project_images").collect();
    projectImages.forEach(pi => referencedIds.add(pi.mediaId));
    
    // vfx_products.thumbnailId, previewVideoId, downloadFileId
    const vfxProducts = await ctx.db.query("vfx_products").collect();
    vfxProducts.forEach(v => {
      v.thumbnailId && referencedIds.add(v.thumbnailId);
      referencedIds.add(v.previewVideoId);
      referencedIds.add(v.downloadFileId);
    });
    
    // vfx_assets.mediaId
    const vfxAssets = await ctx.db.query("vfx_assets").collect();
    vfxAssets.forEach(va => referencedIds.add(va.mediaId));
    
    // course_categories.imageId
    const courseCategories = await ctx.db.query("course_categories").collect();
    courseCategories.forEach(cc => cc.imageId && referencedIds.add(cc.imageId));
    
    // courses.thumbnailMediaId
    const courses = await ctx.db.query("courses").collect();
    courses.forEach(c => c.thumbnailMediaId && referencedIds.add(c.thumbnailMediaId));
    
    // posts.thumbnailId
    const posts = await ctx.db.query("posts").collect();
    posts.forEach(p => p.thumbnailId && referencedIds.add(p.thumbnailId));
    
    // content_images.mediaId (if used)
    const contentImages = await ctx.db.query("content_images").collect();
    contentImages.forEach(ci => ci.mediaId && referencedIds.add(ci.mediaId));
    
    // page_blocks.data - extract URLs and match with media
    const pageBlocks = await ctx.db.query("page_blocks").collect();
    const blockUrls = new Set<string>();
    pageBlocks.forEach(block => {
      if (block.data) {
        extractUrlsFromData(block.data, blockUrls);
      }
    });
    // Match URLs to media IDs
    blockUrls.forEach(url => {
      const mediaId = urlToMediaId.get(url);
      if (mediaId) referencedIds.add(mediaId);
    });
    
    // 3. Find orphan media (not referenced anywhere)
    const orphanMedia = mediaWithUrls.filter(m => !referencedIds.has(m._id));
    
    return {
      totalMedia: allMedia.length,
      referencedCount: referencedIds.size,
      orphanCount: orphanMedia.length,
      orphanMedia: orphanMedia.map(m => ({ ...m, isOrphan: true })),
    };
  },
});

// Find media records where storage blob is missing
export const findBrokenMedia = query({
  args: {},
  handler: async (ctx) => {
    const allMedia = await ctx.db.query("media").collect();
    const brokenMedia: typeof allMedia = [];
    
    for (const m of allMedia) {
      if (m.storageId && !m.deletedAt) {
        try {
          const url = await ctx.storage.getUrl(m.storageId);
          if (!url) {
            brokenMedia.push(m);
          }
        } catch (_) {
          // Storage blob does not exist
          brokenMedia.push(m);
        }
      }
    }
    
    return {
      totalMedia: allMedia.length,
      brokenCount: brokenMedia.length,
      brokenMedia,
    };
  },
});

// Get all unique storageIds in use (for manual comparison with Convex dashboard)
export const listAllStorageIds = query({
  args: {},
  handler: async (ctx) => {
    const allMedia = await ctx.db.query("media").collect();
    const contentImages = await ctx.db.query("content_images").collect();
    
    const storageIds = new Set<string>();
    
    allMedia.forEach(m => {
      if (m.storageId) storageIds.add(m.storageId);
    });
    
    contentImages.forEach(ci => {
      storageIds.add(ci.storageId);
    });
    
    return {
      count: storageIds.size,
      storageIds: Array.from(storageIds),
    };
  },
});

// Delete a single orphan media record and its storage blob
export const deleteOneMedia = mutation({
  args: {
    mediaId: v.id("media"),
  },
  handler: async (ctx, { mediaId }) => {
    const media = await ctx.db.get(mediaId);
    if (!media) return { ok: false, error: "Media not found" };
    
    // Delete storage blob if exists
    if (media.storageId) {
      try {
        await ctx.storage.delete(media.storageId);
      } catch (_) {
        // Blob may not exist
      }
    }
    
    // Delete media record
    await ctx.db.delete(mediaId);
    return { ok: true };
  },
});

// Delete multiple orphan media records and their storage blobs
export const deleteOrphanMedia = mutation({
  args: {
    mediaIds: v.array(v.id("media")),
  },
  handler: async (ctx, { mediaIds }) => {
    let deleted = 0;
    let storageDeleted = 0;
    
    for (const id of mediaIds) {
      const media = await ctx.db.get(id);
      if (!media) continue;
      
      // Delete storage blob if exists
      if (media.storageId) {
        try {
          await ctx.storage.delete(media.storageId);
          storageDeleted++;
        } catch (_) {
          // Blob may not exist
        }
      }
      
      // Delete media record
      await ctx.db.delete(id);
      deleted++;
    }
    
    return { deleted, storageDeleted };
  },
});

// Delete broken media records (where storage blob is missing)
export const deleteBrokenMedia = mutation({
  args: {
    mediaIds: v.array(v.id("media")),
  },
  handler: async (ctx, { mediaIds }) => {
    let deleted = 0;
    
    for (const id of mediaIds) {
      const exists = await ctx.db.get(id);
      if (exists) {
        await ctx.db.delete(id);
        deleted++;
      }
    }
    
    return { deleted };
  },
});
