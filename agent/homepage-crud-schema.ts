// ============================================================================
// HOMEPAGE CRUD SCHEMA - Tham khảo cho các dự án khác
// ============================================================================
// Schema này implement SAP pattern cho việc quản lý giao diện trang chủ qua CRUD
// Đặc điểm: Block-based, Dynamic, Type-safe, Real-time updates

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ========================================================================
  // 1. PAGES MANAGEMENT - Quản lý các trang
  // ========================================================================
  pages: defineTable({
    slug: v.string(),                    // URL slug (vd: 'home', 'about')
    title: v.string(),                   // Tiêu đề trang
    description: v.optional(v.string()), // Mô tả trang
    active: v.boolean(),                 // Kích hoạt/ẩn trang
    order: v.number(),                   // Thứ tự sắp xếp
    
    // SEO Override
    seoOverride: v.optional(v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      keywords: v.optional(v.array(v.string())),
      image: v.optional(v.string()),
      canonicalUrl: v.optional(v.string()),
    })),
    
    // Metadata
    templateType: v.optional(v.string()), // 'homepage', 'landing', 'content'
    locale: v.optional(v.string()),       // i18n support
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_order", ["active", "order"])
    .index("by_locale", ["locale"]),

  // ========================================================================
  // 2. PAGE BLOCKS - Các block/section của trang (CORE của hệ thống)
  // ========================================================================
  page_blocks: defineTable({
    pageId: v.id("pages"),               // Thuộc trang nào
    kind: v.string(),                    // Loại block (hero, stats, contact...)
    order: v.number(),                   // Thứ tự hiển thị (để drag & drop)
    
    // Visibility controls
    isVisible: v.boolean(),              // Hiển thị/ẩn block
    active: v.boolean(),                 // Kích hoạt block (admin control)
    
    // Block data (flexible JSON)
    data: v.any(),                       // Dữ liệu content của block
    
    // Block settings
    settings: v.optional(v.object({
      backgroundColor: v.optional(v.string()),
      textColor: v.optional(v.string()),
      padding: v.optional(v.string()),
      margin: v.optional(v.string()),
      customClass: v.optional(v.string()),
      animation: v.optional(v.string()),
    })),
    
    // Responsive settings
    responsive: v.optional(v.object({
      hideOnMobile: v.optional(v.boolean()),
      hideOnTablet: v.optional(v.boolean()),
      hideOnDesktop: v.optional(v.boolean()),
      mobileOrder: v.optional(v.number()),
    })),
    
    // Metadata
    locale: v.optional(v.string()),      // i18n support
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),   // User ID who made changes
  })
    .index("by_page_order", ["pageId", "order"])
    .index("by_page_kind", ["pageId", "kind"])
    .index("by_visible", ["isVisible"])
    .index("by_active", ["active"])
    .index("by_locale", ["locale"]),

  // ========================================================================
  // 3. BLOCK TEMPLATES - Templates cho các loại block
  // ========================================================================
  block_templates: defineTable({
    kind: v.string(),                    // Tên template (hero, stats, etc.)
    name: v.string(),                    // Display name
    description: v.optional(v.string()), // Mô tả template
    category: v.string(),                // Danh mục (header, content, footer)
    
    // Template schema definition
    schema: v.object({
      fields: v.array(v.object({
        name: v.string(),                // Field name
        label: v.string(),               // Display label
        type: v.string(),                // Field type (text, textarea, image, etc.)
        required: v.optional(v.boolean()),
        default: v.optional(v.any()),
        options: v.optional(v.array(v.any())), // For select/radio fields
        validation: v.optional(v.object({
          min: v.optional(v.number()),
          max: v.optional(v.number()),
          pattern: v.optional(v.string()),
        })),
      })),
    }),
    
    // Template settings
    preview: v.optional(v.string()),     // Preview image URL
    icon: v.optional(v.string()),        // Icon for UI
    tags: v.optional(v.array(v.string())), // Tags for filtering
    
    // Control flags
    active: v.boolean(),
    order: v.number(),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_kind", ["kind"])
    .index("by_category_order", ["category", "order"])
    .index("by_active", ["active"]),

  // ========================================================================
  // 4. MEDIA MANAGEMENT - Quản lý media cho blocks
  // ========================================================================
  media: defineTable({
    kind: v.union(
      v.literal("image"), 
      v.literal("video"), 
      v.literal("document"),
      v.literal("icon")
    ),
    
    // File info
    title: v.string(),
    description: v.optional(v.string()),
    fileName: v.optional(v.string()),
    
    // For Convex storage files
    storageId: v.optional(v.id("_storage")),
    format: v.optional(v.string()),      // jpg, png, mp4, etc.
    sizeBytes: v.optional(v.number()),
    
    // For images
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    altText: v.optional(v.string()),
    
    // For external files (videos, etc.)
    externalUrl: v.optional(v.string()),
    
    // Organization
    folder: v.optional(v.string()),      // Folder organization
    tags: v.optional(v.array(v.string())), // Tags for search
    
    // Control flags
    active: v.boolean(),
    order: v.number(),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
    deletedAt: v.optional(v.number()),   // Soft delete
  })
    .index("by_kind", ["kind"])
    .index("by_folder", ["folder"])
    .index("by_active", ["active"])
    .index("by_deleted", ["deletedAt"])
    .index("by_tags", ["tags"]),

  // ========================================================================
  // 5. SITE SETTINGS - Cài đặt toàn site
  // ========================================================================
  settings: defineTable({
    key: v.string(),                     // Setting key (site, theme, seo, etc.)
    value: v.any(),                      // Setting value (flexible JSON)
    
    // Metadata
    description: v.optional(v.string()),
    category: v.optional(v.string()),    // 'site', 'theme', 'seo', 'social'
    isPublic: v.optional(v.boolean()),   // Public settings (for frontend)
    
    // Control
    active: v.boolean(),
    
    // Audit trail
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"]),

  // ========================================================================
  // 6. THEMES - Theme management (optional advanced feature)
  // ========================================================================
  themes: defineTable({
    name: v.string(),                    // Theme name
    displayName: v.string(),             // Display name
    description: v.optional(v.string()),
    
    // Theme configuration
    config: v.object({
      colors: v.object({
        primary: v.string(),
        secondary: v.string(),
        background: v.string(),
        text: v.string(),
        // ... more color definitions
      }),
      fonts: v.object({
        heading: v.string(),
        body: v.string(),
        // ... font definitions
      }),
      spacing: v.optional(v.object({
        // Custom spacing values
      })),
      borderRadius: v.optional(v.string()),
      // ... more theme settings
    }),
    
    // Theme assets
    previewImage: v.optional(v.string()),
    
    // Control flags
    isDefault: v.boolean(),
    active: v.boolean(),
    order: v.number(),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_default", ["isDefault"])
    .index("by_active_order", ["active", "order"]),

  // ========================================================================
  // 7. FORM SUBMISSIONS - Lưu form submissions từ contact forms
  // ========================================================================
  form_submissions: defineTable({
    formId: v.string(),                  // ID của form (contact, newsletter, etc.)
    pageId: v.optional(v.id("pages")),   // Trang chứa form
    blockId: v.optional(v.id("page_blocks")), // Block chứa form
    
    // Submission data
    data: v.any(),                       // Form data (flexible)
    
    // Contact info (commonly used fields)
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    message: v.optional(v.string()),
    
    // Status tracking
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("replied"),
      v.literal("archived")
    ),
    
    // Metadata
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
  })
    .index("by_form", ["formId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_page", ["pageId"]),

  // ========================================================================
  // 8. AUDIT LOGS - Theo dõi thay đổi (optional)
  // ========================================================================
  audit_logs: defineTable({
    entityType: v.string(),              // 'page_blocks', 'settings', etc.
    entityId: v.string(),                // ID của entity
    action: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("reorder"),
      v.literal("toggle_visibility")
    ),
    
    // Change details
    oldValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
    changes: v.optional(v.array(v.string())), // List of changed fields
    
    // User info
    userId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    
    // Metadata
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_action", ["action"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  // ========================================================================
  // 9. USERS - User management cho dashboard (optional)
  // ========================================================================
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    
    // Permissions
    role: v.union(
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer")
    ),
    permissions: v.optional(v.array(v.string())), // Granular permissions
    
    // Status
    active: v.boolean(),
    emailVerified: v.boolean(),
    
    // Metadata
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["active"]),
});

// ============================================================================
// TYPE DEFINITIONS - Export types cho frontend sử dụng
// ============================================================================

// Common field types cho block templates
export type BlockFieldType = 
  | 'text' 
  | 'textarea' 
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'image'
  | 'video'
  | 'url'
  | 'email'
  | 'date'
  | 'datetime'
  | 'color'
  | 'array'
  | 'object'
  | 'json';

// Block categories
export type BlockCategory = 
  | 'header'
  | 'hero'
  | 'content'
  | 'gallery' 
  | 'testimonials'
  | 'stats'
  | 'contact'
  | 'footer'
  | 'custom';

// Responsive breakpoints
export type BreakpointSettings = {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;  
  hideOnDesktop?: boolean;
  mobileOrder?: number;
  tabletOrder?: number;
};

// Form validation rules
export type ValidationRule = {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: string; // Custom validation function name
};

// ============================================================================
// USAGE EXAMPLES - Cách sử dụng schema này
// ============================================================================

/*
1. Tạo trang mới:
await ctx.db.insert("pages", {
  slug: "home",
  title: "Trang chủ",
  active: true,
  order: 1,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

2. Tạo block cho trang:
await ctx.db.insert("page_blocks", {
  pageId: pageId,
  kind: "hero",
  order: 1,
  isVisible: true,
  active: true,
  data: {
    title: "Welcome to our site",
    subtitle: "We create amazing experiences",
    cta: { text: "Get Started", url: "/contact" }
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

3. Query blocks cho trang:
const blocks = await ctx.db
  .query("page_blocks")
  .withIndex("by_page_order", q => q.eq("pageId", pageId))
  .filter(q => q.eq(q.field("isVisible"), true))
  .filter(q => q.eq(q.field("active"), true))
  .collect();

4. Reorder blocks:
const orderedIds = ["block1", "block2", "block3"];
for (let i = 0; i < orderedIds.length; i++) {
  await ctx.db.patch(orderedIds[i], { 
    order: i + 1,
    updatedAt: Date.now() 
  });
}
*/
