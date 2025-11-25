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
    price: v.optional(v.union(v.number(), v.null())),
    originalPrice: v.optional(v.union(v.number(), v.null())),
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

  // VFX Products (hiệu ứng video 1-5s)
  vfx_products: defineTable({
    // Basic info
    slug: v.string(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    
    // Category
    category: v.union(
      v.literal("explosion"),    // Vụ nổ
      v.literal("fire"),         // Lửa
      v.literal("smoke"),        // Khói
      v.literal("water"),        // Nước
      v.literal("magic"),        // Ma thuật
      v.literal("particle"),     // Hạt
      v.literal("transition"),   // Chuyển cảnh
      v.literal("other")         // Khác
    ),
    
    // Media
    thumbnailId: v.optional(v.id("media")),
    previewVideoId: v.id("media"),  // Video preview 1-5s trong storage
    downloadFileId: v.id("media"),  // File download (.zip, .mov, .mp4, v.v.)
    
    // Pricing
    pricingType: v.union(v.literal("free"), v.literal("paid")),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    
    // Technical specs
    duration: v.number(), // seconds (1-5)
    resolution: v.string(), // "1920x1080", "4K", etc.
    frameRate: v.number(), // 30, 60
    format: v.string(), // "MOV", "MP4", "ProRes", etc.
    hasAlpha: v.boolean(), // Có alpha channel không
    fileSize: v.number(), // bytes
    
    // Stats
    downloadCount: v.number(),
    averageRating: v.optional(v.number()),
    totalReviews: v.optional(v.number()),
    
    // Metadata
    tags: v.optional(v.array(v.string())),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_active_order", ["active", "order"])
    .index("by_pricing_order", ["pricingType", "order"]),

  // VFX assets (nhiều preview/download cho mỗi VFX)
  vfx_assets: defineTable({
    vfxId: v.id("vfx_products"),
    mediaId: v.id("media"),
    kind: v.union(v.literal("preview"), v.literal("download")),
    label: v.optional(v.string()),
    variant: v.optional(v.string()), // ví dụ: "4K ProRes", "1080p H264"
    isPrimary: v.optional(v.boolean()),
    sizeBytes: v.optional(v.number()),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_vfx_kind_order", ["vfxId", "kind", "order"])
    .index("by_media", ["mediaId"]),

  // Course categories (danh muc khoa hoc)
  course_categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()), // emoji hoac icon name
    imageId: v.optional(v.id("media")),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_order", ["active", "order"]),

  // Courses (khoa hoc chinh)
  courses: defineTable({
    slug: v.string(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("course_categories")),
    thumbnailMediaId: v.optional(v.id("media")),
    introVideoUrl: v.optional(v.string()),
    pricingType: v.union(v.literal("free"), v.literal("paid")),
    priceAmount: v.optional(v.number()),
    comparePriceAmount: v.optional(v.number()), // Original price for comparison (sale pricing)
    priceNote: v.optional(v.string()), // Promotion program notes
    isPriceVisible: v.boolean(),
    averageRating: v.optional(v.number()), // Denormalized for quick access
    totalReviews: v.optional(v.number()), // Denormalized
    enrollmentCount: v.optional(v.number()), // Denormalized
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_order", ["active", "order"])
    .index("by_category", ["categoryId"])
    .index("by_category_order", ["categoryId", "order"])
    .index("by_rating", ["averageRating"]),

  // Course chapters (chuong cua khoa hoc)
  course_chapters: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    summary: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_course_order", ["courseId", "order"]),

  // Course lessons (video tung bai hoc)
  course_lessons: defineTable({
    courseId: v.id("courses"),
    chapterId: v.id("course_chapters"),
    title: v.string(),
    description: v.optional(v.string()),
    videoType: v.optional(v.union(v.literal("youtube"), v.literal("drive"), v.literal("none"))),
    videoUrl: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()), // Deprecated, kept for backwards compatibility
    durationSeconds: v.optional(v.number()),
    isPreview: v.optional(v.boolean()),
    exerciseLink: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_chapter_order", ["chapterId", "order"])
    .index("by_course_order", ["courseId", "order"]),


  // Students (hoc vien) - DEPRECATED: use customers instead
  students: defineTable({
    account: v.string(),
    password: v.string(),
    fullName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    // Password reset fields
    resetToken: v.optional(v.string()),
    resetTokenExpiry: v.optional(v.number()),
    // Remember me fields
    rememberToken: v.optional(v.string()),
    rememberTokenExpiry: v.optional(v.number()),
    // OTP rate limiting
    lastOtpSentAt: v.optional(v.number()),
    lastOtpBlockedUntil: v.optional(v.number()),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_account", ["account"])
    .index("by_email", ["email"])
    .index("by_active_order", ["active", "order"]),

  // Customers (khách hàng) - unified customer table for all product types
  customers: defineTable({
    // Authentication
    account: v.string(),
    email: v.string(),
    password: v.string(),
    
    // Profile
    fullName: v.string(),
    phone: v.optional(v.string()),
    
    // Auth tokens
    resetToken: v.optional(v.string()),
    resetTokenExpiry: v.optional(v.number()),
    rememberToken: v.optional(v.string()),
    rememberTokenExpiry: v.optional(v.number()),
    
    // Admin management
    order: v.number(),        // để kéo thả vị trí
    notes: v.optional(v.string()), // ghi chú admin
    
    // System
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_account", ["account"])
    .index("by_email", ["email"])
    .index("by_active_order", ["active", "order"]),

  // OTP tokens (dung cho password reset)
  otp_tokens: defineTable({
    studentId: v.optional(v.id("students")),
    email: v.string(),
    otpCode: v.string(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    attempts: v.number(),
    blockedUntil: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email_unused", ["email"])
    .index("by_student", ["studentId"])
    .index("by_expires", ["expiresAt"]),

  // Orders (đơn hàng - multi-item, one order can have many items via order_items table)
  orders: defineTable({
    // Customer (optional for migration from old schema with studentId)
    customerId: v.optional(v.id("customers")),
    
    // Order details (optional for migration from old schema)
    orderNumber: v.optional(v.string()), // DH-2411-001 format
    totalAmount: v.optional(v.number()),  // tổng tiền
    amount: v.optional(v.number()),       // legacy alias (giữ để migrate dữ liệu cũ)
    
    // Status flow: pending → paid → activated (+ cancelled)
    status: v.union(
      v.literal("pending"),    // chờ thanh toán / xác nhận chứng từ
      v.literal("paid"),       // đã ghi nhận thanh toán
      v.literal("activated"),  // đã tạo purchases / mở quyền truy cập
      v.literal("cancelled"),  // admin hủy hoặc hoàn tiền
    ),
    
    // Admin notes
    notes: v.optional(v.string()), // ghi chú thanh toán, chuyển khoản info, etc
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"])
    .index("by_customer_status", ["customerId", "status"])
    .index("by_order_number", ["orderNumber"]),

  // Order Items (chi tiết từng sản phẩm trong đơn hàng)
  order_items: defineTable({
    orderId: v.id("orders"),
    
    // Product reference
    productType: v.union(v.literal("course"), v.literal("resource"), v.literal("vfx")),
    productId: v.string(),  // generic ID - map theo productType
    
    // Pricing at purchase time
    price: v.number(),
    
    createdAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_product", ["productType", "productId"]),

  // Payments (chi tiet thanh toan, goi QR code va chung minh)
  payments: defineTable({
    orderId: v.id("orders"),
    studentId: v.id("students"),
    email: v.string(),
    qrCodeUrl: v.optional(v.string()),
    qrCodeData: v.optional(v.string()),
    bankAccount: v.optional(v.string()),
    bankAccountName: v.optional(v.string()),
    transactionId: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("rejected")),
    screenshotUrl: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    confirmedAt: v.optional(v.number()),
    confirmedByAdminId: v.optional(v.id("students")), // admin student id
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_student", ["studentId"])
    .index("by_status", ["status"])
    .index("by_pending", ["status", "createdAt"]),

  // Course enrollments (quan he user - khoa hoc) - DEPRECATED: use customer_purchases instead
  course_enrollments: defineTable({
    courseId: v.id("courses"),
    userId: v.string(),
    enrolledAt: v.number(),
    progressPercent: v.optional(v.number()),
    completionPercentage: v.optional(v.number()),
    lastViewedLessonId: v.optional(v.id("course_lessons")),
    completedAt: v.optional(v.number()),
    status: v.optional(v.union(v.literal("free"), v.literal("pending"), v.literal("active"), v.literal("completed"), v.literal("expired"))),
    paidAmount: v.optional(v.number()),
    order: v.number(),
    active: v.boolean(),
  })
    .index("by_course_user", ["courseId", "userId"])
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_status", ["status"]),

  // Customer Purchases (quyền truy cập sau khi mua - lifetime access)
  customer_purchases: defineTable({
    customerId: v.id("customers"),
    orderId: v.id("orders"),
    
    // Product reference
    productType: v.string(), // "course", "resource", "vfx"
    productId: v.string(),   // generic ID - map theo productType
    
    // Usage tracking
    downloadCount: v.optional(v.number()), // resources & vfx only
    
    // Course specific (nil for resources/vfx)
    progressPercent: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    certificateId: v.optional(v.id("certificates")),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_customer", ["customerId"])
    .index("by_order", ["orderId"])
    .index("by_customer_product", ["customerId", "productType", "productId"]),

  // Course favorites (danh sach yeu thich hoc vien)
  course_favorites: defineTable({
    studentId: v.id("students"),
    courseId: v.id("courses"),
    createdAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_course", ["courseId"])
    .index("by_student_course", ["studentId", "courseId"]),

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

  // Lesson completions (ghi nhan tien do chi tiet tung bai hoc)
  lesson_completions: defineTable({
    studentId: v.id("students"),
    lessonId: v.id("course_lessons"),
    courseId: v.id("courses"),
    completedAt: v.optional(v.number()),
    watchTimeSeconds: v.optional(v.number()),
    lastWatchedAt: v.number(),
    isCompleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student_lesson", ["studentId", "lessonId"])
    .index("by_student_course", ["studentId", "courseId"])
    .index("by_lesson", ["lessonId"]),

  // Certificates (chung chi hoan thanh khoa)
  certificates: defineTable({
    studentId: v.id("students"),
    courseId: v.id("courses"),
    certificateCode: v.string(), // DOHY-2024-XXXXX
    issuedAt: v.number(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_course", ["courseId"])
    .index("by_code", ["certificateCode"])
    .index("by_student_course", ["studentId", "courseId"]),

  // Course quizzes (bai trac nghiem)
  course_quizzes: defineTable({
    courseId: v.id("courses"),
    chapterId: v.optional(v.id("course_chapters")),
    title: v.string(),
    description: v.optional(v.string()),
    passingScore: v.number(), // 50 = 50%
    timeLimit: v.optional(v.number()), // seconds
    allowRetake: v.boolean(),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_chapter", ["chapterId"])
    .index("by_active", ["active"]),

  // Quiz questions (cau hoi trong quiz)
  quiz_questions: defineTable({
    quizId: v.id("course_quizzes"),
    questionText: v.string(),
    questionType: v.union(v.literal("multiple_choice"), v.literal("short_answer"), v.literal("true_false")),
    options: v.optional(v.array(v.string())), // For multiple choice
    correctAnswer: v.string(), // Index or text
    explanation: v.optional(v.string()),
    order: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_quiz", ["quizId"]),

  // Quiz attempts (bai lam va diem)
  quiz_attempts: defineTable({
    studentId: v.id("students"),
    quizId: v.id("course_quizzes"),
    courseId: v.id("courses"),
    answers: v.array(v.object({
      questionId: v.id("quiz_questions"),
      answer: v.string(),
    })),
    score: v.number(), // 0-100
    passed: v.boolean(),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_student_quiz", ["studentId", "quizId"])
    .index("by_student", ["studentId"])
    .index("by_quiz", ["quizId"])
    .index("by_course", ["courseId"]),

  // Payment settings (cau hinh tai khoan ngan hang va VietQR)
  payment_settings: defineTable({
    bankAccountNumber: v.string(),
    bankAccountName: v.string(),
    bankCode: v.string(), // VietQR ACQ ID
    bankBranch: v.optional(v.string()),
    adminEmail: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // ==================== TIER 3: ENGAGEMENT FEATURES ====================

  // Comments & Discussions (binh luan trong bai hoc)
  comments: defineTable({
    studentId: v.id("students"),
    courseId: v.id("courses"),
    lessonId: v.id("course_lessons"),
    parentCommentId: v.optional(v.id("comments")), // For replies
    content: v.string(),
    likesCount: v.number(), // Denormalized for performance
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_student", ["studentId"])
    .index("by_course", ["courseId"])
    .index("by_parent", ["parentCommentId"])
    .index("by_lesson_time", ["lessonId", "createdAt"]),

  // Comment likes (like binh luan)
  comment_likes: defineTable({
    studentId: v.id("students"),
    commentId: v.id("comments"),
    createdAt: v.number(),
  })
    .index("by_comment", ["commentId"])
    .index("by_student", ["studentId"])
    .index("by_pair", ["studentId", "commentId"]),

  // Course reviews (danh gia khoa)
  course_reviews: defineTable({
    studentId: v.id("students"),
    courseId: v.id("courses"),
    rating: v.number(), // 1-5
    title: v.string(),
    content: v.string(),
    helpfulCount: v.number(), // Denormalized
    unhelpfulCount: v.number(), // Denormalized
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_student", ["studentId"])
    .index("by_rating", ["courseId", "rating"])
    .index("by_course_time", ["courseId", "createdAt"]),

  // Review helpful votes (danh gia review la co ich hay khong)
  review_helpful: defineTable({
    studentId: v.id("students"),
    reviewId: v.id("course_reviews"),
    isHelpful: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_review", ["reviewId"])
    .index("by_student", ["studentId"])
    .index("by_pair", ["studentId", "reviewId"]),

  // Notifications (thong bao cho hoc vien)
  notifications: defineTable({
    studentId: v.id("students"),
    type: v.union(
      v.literal("order_confirmed"),
      v.literal("payment_rejected"),
      v.literal("certificate_issued"),
      v.literal("new_comment_reply"),
      v.literal("course_updated"),
      v.literal("course_new_lesson"),
      v.literal("enrollment_status_changed"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    metadata: v.optional(v.any()), // Store extra data (courseId, commentId, etc.)
    isRead: v.boolean(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_student_read", ["studentId", "isRead"])
    .index("by_student_time", ["studentId", "createdAt"]),

  // Coupons & Promotions (ma giam gia)
  coupons: defineTable({
    code: v.string(), // SUMMER2024, WELCOME50, etc.
    description: v.optional(v.string()),
    discountPercent: v.optional(v.number()), // 20 = 20%
    discountFixed: v.optional(v.number()), // 100000 = 100k VND
    maxUses: v.optional(v.number()), // null = unlimited
    usedCount: v.number(), // Denormalized
    minAmount: v.optional(v.number()), // Min order value required
    appliesTo: v.union(
      v.literal("all_courses"),
      v.literal("specific_courses")
    ),
    specificCourseIds: v.optional(v.array(v.id("courses"))),
    specificUserIds: v.optional(v.array(v.id("students"))), // For personal coupons
    expiresAt: v.optional(v.number()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_active", ["active"])
    .index("by_expires", ["expiresAt"]),

  // Coupon uses (lich su su dung coupon)
  coupon_uses: defineTable({
    couponId: v.id("coupons"),
    studentId: v.id("students"),
    orderId: v.id("orders"),
    discountAmount: v.number(),
    appliedAt: v.number(),
  })
    .index("by_coupon", ["couponId"])
    .index("by_student", ["studentId"])
    .index("by_order", ["orderId"])
    .index("by_coupon_student", ["couponId", "studentId"]),
});
