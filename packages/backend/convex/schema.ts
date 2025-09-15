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
});

