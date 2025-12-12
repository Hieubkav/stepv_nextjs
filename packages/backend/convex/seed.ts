// KISS: Seed dữ liệu tối thiểu để trang chủ đọc từ Convex
import { mutation } from "./_generated/server";

export const seedHome = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // 1) Upsert settings 'site' nếu chưa có
    const site = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .first();
    if (!site) {
      await ctx.db.insert("settings", {
        key: "site",
        value: {
          siteName: "Dohy",
          logoUrl: "/logo.png",
          contactEmail: "hello@example.com",
          address: "",
          zaloUrl: "",
          facebookUrl: "",
          instagramUrl: "",
          xUrl: "",
          youtubeUrl: "",
          tiktokUrl: "",
          pinterestUrl: "",
          bankAccountNumber: "",
          bankAccountName: "",
          bankCode: "",
        },
        updatedAt: now,
      });
    }

    // 2) Upsert page 'home'
    let page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", "home"))
      .first();
    if (!page) {
      const pageId = await ctx.db.insert("pages", {
        slug: "home",
        title: "Trang chủ",
        active: true,
        updatedAt: now,
      });
      page = await ctx.db.get(pageId);
    }
    if (!page) return { ok: false, reason: "PAGE_CREATE_FAILED" } as const;

    // 3) Nếu đã có blocks thì không seed lại (tránh nhân đôi)
    const existingBlocks = await ctx.db
      .query("page_blocks")
      .withIndex("by_page_order", (q) => q.eq("pageId", page._id))
      .collect();
    if (existingBlocks.length > 0) {
      return { ok: true, seeded: false } as const;
    }

    // 4) Seed danh sách blocks khớp thứ tự UI hiện tại
    const kinds = [
      "hero",
      "wordSlider",
      "gallery",
      "yourAdvice",
      "stats",
      "services",
      "whyChooseUs",
      "why3DVisuals",
      "turning",
      "weWork",
      "stayControl",
      "contactForm",
    ];

    for (let i = 0; i < kinds.length; i++) {
      const kind = kinds[i];
      await ctx.db.insert("page_blocks", {
        pageId: page._id,
        kind,
        order: i,
        isVisible: true,
        active: true,
        // data tối thiểu; dashboard sẽ chỉnh sau
        data: {},
        updatedAt: now,
      });
    }

    return { ok: true, seeded: true } as const;
  },
});

// Seed du lieu cho trang About (voi du lieu thuc tu component defaults)
export const seedAbout = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // 1) Upsert page 'about'
    let page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", "about"))
      .first();
    if (!page) {
      const pageId = await ctx.db.insert("pages", {
        slug: "about",
        title: "Về chúng tôi",
        active: true,
        updatedAt: now,
      });
      page = await ctx.db.get(pageId);
    }
    if (!page) return { ok: false, reason: "PAGE_CREATE_FAILED" } as const;

    // 2) Nếu đã có blocks thì không seed lại
    const existingBlocks = await ctx.db
      .query("page_blocks")
      .withIndex("by_page_order", (q) => q.eq("pageId", page._id))
      .collect();
    if (existingBlocks.length > 0) {
      return { ok: true, seeded: false } as const;
    }

    // 3) Seed danh sách blocks cho trang about với dữ liệu thực
    const blocksData = [
      {
        kind: "heroAbout",
        data: {
          badge: "Dohy Studio Official",
          titleLine1: "Kiến Tạo",
          titleLine2: "Digital World",
          description: "Hệ sinh thái sáng tạo toàn diện dành cho Creators chuyên nghiệp: Đào tạo 3D, Kho tài nguyên & Sản xuất VFX.",
          services: [
            { icon: "BookOpen", title: "Khóa Học", desc: "Đầy đủ các khóa học về thiết kế và 3D" },
            { icon: "Package", title: "Tài Nguyên", desc: "Kho plugin và asset premium" },
            { icon: "Film", title: "VFX", desc: "Kho VFX phong phú" },
          ],
        },
      },
      {
        kind: "statsAbout",
        data: {
          stats: [
            { value: "03", label: "Hệ Sinh Thái" },
            { value: "5K+", label: "Học Viên" },
            { value: "100%", label: "Chất Lượng" },
          ],
        },
      },
      {
        kind: "bentoGridAbout",
        data: {
          badge: "Dohy Ecosystem",
          title: "Giải Pháp",
          titleHighlight: "Toàn Diện",
          subtitle: "Ba trụ cột vững chắc kiến tạo nên thành công của một Digital Artist: Tư duy - Công cụ - Thực chiến.",
          services: [
            {
              id: "academy",
              icon: "MonitorPlay",
              label: "EDUCATION",
              title: "Dohy Academy",
              description: "Hệ thống đào tạo tư duy mỹ thuật và kỹ năng 3D/VFX bài bản. Lộ trình từ cơ bản đến chuyên sâu.",
              features: ["Tư duy hình ảnh", "Kỹ năng 3D", "Quy trình Studio"],
              image: "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              ctaText: "Xem Lộ Trình",
              href: "/khoa-hoc",
            },
            {
              id: "store",
              icon: "Box",
              label: "RESOURCES",
              title: "Dohy Store",
              description: "Hệ sinh thái tài nguyên số tối ưu hóa quy trình: Plugin độc quyền, Model và Texture chất lượng cao.",
              features: ["Plugins", "3D Assets", "Textures"],
              image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=1964&auto=format&fit=crop",
              ctaText: "Kho Tài Nguyên",
              href: "/thu-vien",
            },
            {
              id: "production",
              icon: "Layers",
              label: "PRODUCTION",
              title: "Dohy VFX",
              description: "Studio sản xuất CGI & VFX. Hiện thực hóa ý tưởng phức tạp cho các chiến dịch quảng cáo toàn cầu.",
              features: ["CGI/3D", "Visual Effects", "Animation"],
              image: "https://images.unsplash.com/photo-1616788549597-93571a1058cc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              ctaText: "Xem kho VFX",
              href: "/vfx",
            },
          ],
        },
      },
      {
        kind: "visionAbout",
        data: {
          badge: "Dohy Vision",
          titleLine1: "Chất Lượng Là",
          titleLine2: "Tiêu Chuẩn Duy Nhất",
          description: "Mỗi sản phẩm: Art Direction + Advanced Tech",
          features: [
            { title: "Sáng Tạo", description: "Tư duy thiết kế mới" },
            { title: "Hiệu Suất", description: "Gấp 2 lần nhanh" },
          ],
          image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
          imageAlt: "Abstract Texture",
          yearEstablished: "Est. 2019",
          tagline: "Premium Standard",
        },
      },
      {
        kind: "ctaAbout",
        data: {},
      },
    ];

    for (let i = 0; i < blocksData.length; i++) {
      const { kind, data } = blocksData[i];
      await ctx.db.insert("page_blocks", {
        pageId: page._id,
        kind,
        order: i,
        isVisible: true,
        active: true,
        data,
        updatedAt: now,
      });
    }

    return { ok: true, seeded: true } as const;
  },
});

// Xoa toan bo du lieu CMS (pages + page_blocks)
export const resetCMS = mutation({
  handler: async (ctx) => {
    const pages = await ctx.db.query("pages").collect();
    for (const p of pages) await ctx.db.delete(p._id);
    const blocks = await ctx.db.query("page_blocks").collect();
    for (const b of blocks) await ctx.db.delete(b._id);
    return { ok: true } as const;
  },
});
