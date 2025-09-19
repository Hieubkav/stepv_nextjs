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

  // Media: anh (upload vao Convex storage) va video (link ngoai)
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

  // Library resources (digital assets cho trang /thu-vien)
  library_resources: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    pricingType: v.union(v.literal("free"), v.literal("paid")),
    coverImageId: v.optional(v.id("media")),
    downloadUrl: v.optional(v.string()),
    isDownloadVisible: v.boolean(),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_pricing_order", ["pricingType", "order"])
    .index("by_active_order", ["active", "order"]),

  // Library resource detail images
  library_resource_images: defineTable({
    resourceId: v.id("library_resources"),
    mediaId: v.id("media"),
    caption: v.optional(v.string()),
    altText: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_resource_order", ["resourceId", "order"])
    .index("by_media", ["mediaId"]),

  // Library softwares (danh sach phan mem lien quan)
  library_softwares: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    iconImageId: v.optional(v.id("media")),
    officialUrl: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_order", ["active", "order"]),

  // Library resource to software mapping
  library_resource_softwares: defineTable({
    resourceId: v.id("library_resources"),
    softwareId: v.id("library_softwares"),
    note: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
    assignedAt: v.number(),
  })
    .index("by_resource_order", ["resourceId", "order"])
    .index("by_software", ["softwareId"])
    .index("by_pair", ["resourceId", "softwareId"]),


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
