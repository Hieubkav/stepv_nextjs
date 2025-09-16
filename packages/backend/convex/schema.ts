// KISS: schema cho CMS block-based chi dung 'active' boolean
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Demo table giu nguyen
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),

  // Settings toan site theo key
  settings: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // Page meta (chi dung 'active')
  pages: defineTable({
    slug: v.string(),
    title: v.string(),
    active: v.boolean(),
    updatedAt: v.number(),
    seoOverride: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        image: v.optional(v.string()),
      })
    ),
  }).index("by_slug", ["slug"]),

  // Page blocks (section) - dung 'active' + 'isVisible'
  page_blocks: defineTable({
    pageId: v.id("pages"),
    kind: v.string(),
    order: v.number(),
    isVisible: v.boolean(),
    active: v.boolean(),
    data: v.any(),
    locale: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
    .index("by_page_order", ["pageId", "order"]) 
    .index("by_page_kind", ["pageId", "kind"]),

  // Media: ảnh (upload vào Convex storage) và video (link ngoài)
  media: defineTable({
    kind: v.union(v.literal("image"), v.literal("video")),
    title: v.optional(v.string()),
    // Image fields
    storageId: v.optional(v.id("_storage")),
    format: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    sizeBytes: v.optional(v.number()),
    // Video fields
    externalUrl: v.optional(v.string()),
    // Common
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  }).index("by_kind", ["kind"]).index("by_deleted", ["deletedAt"]),

  // Visitor tracking sessions
  visitor_sessions: defineTable({
    visitorId: v.string(),
    sessionId: v.string(),
    userAgent: v.optional(v.string()),
    ipHash: v.optional(v.string()),
    firstSeen: v.number(),
    lastSeen: v.number(),
    pageCount: v.number(),
    order: v.number(),
    active: v.boolean(),
  })
    .index("by_session", ["sessionId"])
    .index("by_visitor", ["visitorId"])
    .index("by_lastSeen", ["lastSeen"])
    .index("by_active", ["active"]),

  // Visitor events (page views + heartbeat)
  visitor_events: defineTable({
    sessionId: v.string(),
    visitorId: v.string(),
    path: v.string(),
    referrer: v.optional(v.string()),
    occurredAt: v.number(),
    eventType: v.string(),
    order: v.number(),
    active: v.boolean(),
  })
    .index("by_session_time", ["sessionId", "occurredAt"])
    .index("by_occurred", ["occurredAt"]),
});
