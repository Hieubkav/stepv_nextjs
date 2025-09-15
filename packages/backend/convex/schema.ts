// KISS: Khai báo schema tối giản, có comment rõ ràng.
// Mô hình dữ liệu quản trị giao diện theo blocks:
// - settings: cấu hình toàn site (singleton theo key, vd: 'site')
// - pages: meta cho từng trang (vd: 'home')
// - page_blocks: các khối (section) thuộc 1 trang, có thứ tự

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Demo sẵn có, giữ lại để không ảnh hưởng chỗ khác
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),

  // Cấu hình toàn site theo key/value để linh hoạt
  settings: defineTable({
    key: v.string(), // ví dụ: 'site'
    value: v.any(), // object tuỳ ý (KISS, linh hoạt cho dashboard)
    updatedAt: v.number(), // timestamp ms
  }).index("by_key", ["key"]),

  // Thông tin trang (vd: trang chủ có slug 'home')
  pages: defineTable({
    slug: v.string(), // unique per page
    title: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
    // SEO override tối giản (tuỳ chọn)
    seoOverride: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        image: v.optional(v.string()),
      })
    ),
  }).index("by_slug", ["slug"]),

  // Các section thuộc 1 trang, có thứ tự và trạng thái
  page_blocks: defineTable({
    pageId: v.id("pages"),
    kind: v.string(), // ví dụ: 'hero' | 'services' | ...
    order: v.number(), // dùng để sắp xếp
    isVisible: v.boolean(), // ẩn/hiện nhanh
    status: v.union(v.literal("draft"), v.literal("published")),
    data: v.any(), // payload tuỳ section (KISS)
    locale: v.optional(v.string()), // i18n nếu cần
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
    .index("by_page_order", ["pageId", "order"]) // phục vụ sort nhanh
    .index("by_page_kind", ["pageId", "kind"]),
});
