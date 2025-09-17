import type { RJSFSchema, UiSchema } from "@rjsf/utils";

export type BlockPreset = {
  kind: string;
  name: string;
  schema: RJSFSchema;
  uiSchema?: UiSchema;
  template?: Record<string, unknown>;
};

export const BLOCK_PRESETS: BlockPreset[] = [
  {
    kind: "hero",
    name: "Hero",
    schema: {
      type: "object",
      properties: {
        titleLines: {
          type: "array",
          title: "Dòng tiêu đề",
          items: {
            type: "string",
            title: "Dòng",
          },
        },
        subtitle: {
          type: "string",
          title: "Mô tả ngắn",
        },
        brandLogos: {
          type: "array",
          title: "Logo thương hiệu",
          items: {
            type: "object",
            properties: {
              url: { type: "string", title: "Ảnh logo" },
              alt: { type: "string", title: "Alt" },
            },
            required: ["url"],
          },
        },
        videoUrl: {
          type: "string",
          title: "URL video",
          format: "uri",
        },
        posterUrl: {
          type: "string",
          title: "Ảnh poster",
        },
        ctas: {
          type: "array",
          title: "Nút kêu gọi",
          items: {
            type: "object",
            properties: {
              label: { type: "string", title: "Nhãn nút" },
              url: { type: "string", title: "Đường dẫn", format: "uri" },
            },
          },
        },
      },
    },
    uiSchema: {
      subtitle: {
        "ui:widget": "textarea",
      },
      posterUrl: {
        "ui:widget": "mediaImage",
      },
      brandLogos: {
        "ui:options": { addButtonLabel: "Thêm logo" },
        items: {
          url: { "ui:widget": "mediaImage" },
          alt: { "ui:placeholder": "Mô tả alt" },
        },
      },
      ctas: {
        "ui:options": { addButtonLabel: "Thêm CTA" },
        items: {
          label: { "ui:placeholder": "Xem thêm" },
          url: { "ui:placeholder": "https://..." },
        },
      },
      titleLines: {
        "ui:options": { addButtonLabel: "Thêm dòng" },
        items: { "ui:placeholder": "Nội dung dòng" },
      },
      videoUrl: { "ui:placeholder": "https://..." },
    } satisfies UiSchema,
    template: {
      titleLines: ["TẠO RA.", "THU HÚT.", "CHUYỂN ĐỔI."],
      subtitle: "CHUYÊN GIA HÌNH ẢNH 3D...",
      brandLogos: [{ url: "/images/brands/brand-1.png", alt: "Brand 1" }],
      videoUrl: "/hero-glass-video.mp4",
      posterUrl: "/hero-glass.jpg",
      ctas: [
        { label: "Xem thêm", url: "#services" },
        { label: "Tư vấn", url: "#contact" },
      ],
    },
  },
  {
    kind: "services",
    name: "Services",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Tiêu đề" },
        subtitle: { type: "string", title: "Mô tả" },
        items: {
          type: "array",
          title: "Dịch vụ",
          items: {
            type: "object",
            properties: {
              icon: { type: "string", title: "Icon" },
              title: { type: "string", title: "Tiêu đề" },
              description: { type: "string", title: "Mô tả" },
            },
          },
        },
      },
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      items: {
        "ui:options": { addButtonLabel: "Thêm dịch vụ" },
        items: {
          description: { "ui:widget": "textarea" },
        },
      },
    } satisfies UiSchema,
    template: {
      title: "Dịch vụ",
      subtitle: "Những gì chúng tôi làm",
      items: [{ icon: "", title: "Render 3D", description: "Mô tả ngắn" }],
    },
  },
  {
    kind: "stats",
    name: "Stats",
    schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          title: "Chỉ số",
          items: {
            type: "object",
            properties: {
              label: { type: "string", title: "Nhãn" },
              value: { type: "number", title: "Giá trị" },
            },
          },
        },
      },
    },
    uiSchema: {
      items: {
        "ui:options": { addButtonLabel: "Thêm chỉ số" },
        items: {
          label: { "ui:placeholder": "Dự án" },
          value: { "ui:placeholder": "120" },
        },
      },
    } satisfies UiSchema,
    template: {
      items: [{ label: "Dự án", value: 120 }],
    },
  },
  {
    kind: "gallery",
    name: "Gallery",
    schema: {
      type: "object",
      properties: {
        images: {
          type: "array",
          title: "Ảnh",
          items: {
            type: "object",
            properties: {
              url: { type: "string", title: "Ảnh" },
              alt: { type: "string", title: "Alt" },
            },
            required: ["url"],
          },
        },
      },
    },
    uiSchema: {
      images: {
        "ui:options": { addButtonLabel: "Thêm ảnh" },
        items: {
          url: { "ui:widget": "mediaImage" },
          alt: { "ui:placeholder": "Mô tả alt" },
        },
      },
    } satisfies UiSchema,
    template: {
      images: [{ url: "/images/sample.jpg", alt: "Mẫu" }],
    },
  },
  {
    kind: "whyChooseUs",
    name: "Why Choose Us",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Tiêu đề" },
        subtitle: { type: "string", title: "Mô tả" },
        videoUrl: { type: "string", title: "Video" },
        videoAlt: { type: "string", title: "Video alt" },
        items: {
          type: "array",
          title: "Lý do",
          items: {
            type: "object",
            properties: {
              title: { type: "string", title: "Tiêu đề" },
              description: { type: "string", title: "Mô tả" },
            },
          },
        },
      },
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      videoUrl: { "ui:widget": "mediaVideo" },
      items: {
        "ui:options": { addButtonLabel: "Thêm lý do" },
        items: {
          description: { "ui:widget": "textarea" },
        },
      },
    } satisfies UiSchema,
    template: {
      title: "Vì sao chọn chúng tôi",
      subtitle: "Mô tả ngắn",
      videoUrl: "",
      videoAlt: "",
      items: [{ title: "Chất lượng", description: "..." }],
    },
  },
  {
    kind: "why3DVisuals",
    name: "Why 3D Visuals",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Tiêu đề" },
        items: {
          type: "array",
          title: "Điểm nổi bật",
          items: {
            type: "object",
            properties: {
              title: { type: "string", title: "Tiêu đề" },
              description: { type: "string", title: "Mô tả" },
            },
          },
        },
      },
    },
    uiSchema: {
      items: {
        "ui:options": { addButtonLabel: "Thêm điểm" },
        items: {
          description: { "ui:widget": "textarea" },
        },
      },
    } satisfies UiSchema,
    template: {
      title: "Tại sao 3D?",
      items: [{ title: "Nổi bật", description: "..." }],
    },
  },
  {
    kind: "turning",
    name: "Turning",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Tiêu đề" },
        description: { type: "string", title: "Mô tả" },
        buttonText: { type: "string", title: "Nút CTA" },
        buttonUrl: { type: "string", title: "Liên kết CTA", format: "uri" },
        backgroundColor: { type: "string", title: "Lớp nền" },
        textSize: { type: "string", title: "Kích thước chữ" },
        signatureImage: { type: "string", title: "Ảnh chữ ký" },
        founderName: { type: "string", title: "Tên founder" },
        founderTitle: { type: "string", title: "Chức danh founder" },
        clientLogos: {
          type: "array",
          title: "Logo khách hàng",
          items: {
            type: "object",
            properties: {
              image: { type: "string", title: "Ảnh" },
              alt: { type: "string", title: "Alt" },
              client_name: { type: "string", title: "Tên khách hàng" },
            },
            required: ["image"],
          },
        },
      },
    },
    uiSchema: {
      description: { "ui:widget": "textarea" },
      buttonUrl: { "ui:placeholder": "https://..." },
      signatureImage: { "ui:widget": "mediaImage" },
      clientLogos: {
        "ui:options": { addButtonLabel: "Thêm logo" },
        items: {
          image: { "ui:widget": "mediaImage" },
          alt: { "ui:placeholder": "Mô tả alt" },
        },
      },
    } satisfies UiSchema,
    template: {
      title: "BIẾN ĐAM MÊ THÀNH HOÀN HẢO",
      description:
        "Tại DOHY Media, mỗi thứ chúng tôi tạo ra đều bắt đầu từ niềm đam mê kể chuyện và đổi mới. Được thành lập tại Stuttgart, Đức, studio của chúng tôi ra đời từ mong muốn biến những ý tưởng táo bạo thành hình ảnh 3D và hoạt hình tuyệt đẹp. Những gì bắt đầu như một giấc mơ vượt qua ranh giới của thiết kế 3D đã phát triển thành đối tác sáng tạo đáng tin cậy cho các thương hiệu cao cấp và những người có tầm nhìn trên toàn thế giới. Mỗi dự án chúng tôi thực hiện đều là một sự hợp tác-tầm nhìn của bạn, được hiện thực hóa thông qua chuyên môn của chúng tôi.",
      buttonText: "LIÊN HỆ",
      buttonUrl: "#contact",
      backgroundColor: "bg-black",
      textSize: "text-[60.8px]",
      signatureImage: "https://stepv.studio/wp-content/uploads/2025/04/signaturewhite.png",
      founderName: "VASILII GUREV",
      founderTitle: "CEO & FOUNDER OF STEP V STUDIO",
      clientLogos: [
        { image: "https://stepv.studio/wp-content/uploads/2025/04/wn-x.png", alt: "WN-X Logo", client_name: "WN-X" },
        { image: "https://stepv.studio/wp-content/uploads/2025/04/dna.png", alt: "DNA Logo", client_name: "DNA" },
        { image: "https://stepv.studio/wp-content/uploads/2025/04/gdivine.png", alt: "G'DIVINE Logo", client_name: "G'DIVINE" },
        { image: "https://stepv.studio/wp-content/uploads/2025/04/hyaluronce.png", alt: "Hyaluronce Logo", client_name: "HYALURONCE" },
        { image: "https://stepv.studio/wp-content/uploads/2025/04/fivo.png", alt: "FIVO Logo", client_name: "FIVO" },
        { image: "https://stepv.studio/wp-content/uploads/2025/04/thedarkages.png", alt: "The Dark Ages Logo", client_name: "THE DARK AGES" },
        { image: "https://stepv.studio/wp-content/uploads/2025/04/gazzaz.png", alt: "GAZZAZ Logo", client_name: "GAZZAZ" },
        { image: "https://stepv.studio/wp-content/uploads/2025/04/sdvstudios.png", alt: "SDV Studios Logo", client_name: "SDV STUDIOS" },
        { image: "https://stepv.studio/wp-content/uploads/2025/04/caronparis.png", alt: "CARON PARIS Logo", client_name: "CARON PARIS" }
      ],
    },
  },
  {
    kind: "weWork",
    name: "We Work",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Tiêu đề" },
        subtitle: { type: "string", title: "Mô tả" },
        ctas: {
          type: "array",
          title: "CTA",
          items: {
            type: "object",
            properties: {
              label: { type: "string", title: "Nhãn nút" },
              url: { type: "string", title: "Đường dẫn", format: "uri" },
            },
          },
        },
        items: {
          type: "array",
          title: "Quy trình",
          items: {
            type: "object",
            properties: {
              title: { type: "string", title: "Tiêu đề" },
              description: { type: "string", title: "Mô tả" },
            },
          },
        },
      },
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      ctas: {
        "ui:options": { addButtonLabel: "Thêm CTA" },
        items: {
          label: { "ui:placeholder": "Bắt đầu" },
          url: { "ui:placeholder": "https://..." },
        },
      },
      items: {
        "ui:options": { addButtonLabel: "Thêm bước" },
        items: {
          description: { "ui:widget": "textarea" },
        },
      },
    } satisfies UiSchema,
    template: {
      title: "Cách chúng tôi làm việc",
      subtitle: "Quy trình rõ ràng giúp bạn yên tâm",
      ctas: [
        { label: "Bắt đầu dự án", url: "#contact" }
      ],
      items: [
        { title: "Khởi động", description: "Trao đổi yêu cầu, mục tiêu" },
        { title: "Sáng tạo", description: "Xây dựng concept và storyboard" },
        { title: "Sản xuất", description: "Render, hoàn thiện, bàn giao" }
      ],
    },
  },
  {
    kind: "stayControl",
    name: "Stay Control",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Tiêu đề" },
        subtitle: { type: "string", title: "Phụ đề" },
        items: {
          type: "array",
          title: "Điểm kiểm soát",
          items: {
            type: "object",
            properties: {
              title: { type: "string", title: "Tiêu đề" },
              description: { type: "string", title: "Mô tả" },
            },
          },
        },
      },
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      items: {
        "ui:options": { addButtonLabel: "Thêm điểm" },
        items: {
          description: { "ui:widget": "textarea" },
        },
      },
    } satisfies UiSchema,
    template: {
      title: "KIỂM SOÁT HOÀN TOÀN VỚI BẢNG ĐIỀU KHIỂN KHÁCH HÀNG",
      subtitle: "Chúng tôi đã giúp bạn dễ dàng kết nối và kiểm soát mọi thứ!",
      items: [
        {
          title: "Truy cập tất cả file của bạn",
          description: "Tải xuống file dự án, sản phẩm bàn giao và phiên bản chỉnh sửa bất cứ lúc nào trong một nơi bảo mật.",
        },
        {
          title: "Theo dõi tiến độ dự án",
          description: "Cập nhật thời gian thực về tiến độ, cột mốc và deadline để bạn luôn nắm được tình hình.",
        },
        {
          title: "Giao tiếp dễ dàng",
          description: "Gửi phản hồi, đặt câu hỏi trực tiếp trong dashboard — không còn chuỗi email rườm rà.",
        },
        {
          title: "Tổ chức tốt cho dự án tương lai",
          description: "Kho lưu trữ dài hạn giúp xem lại dự án cũ hoặc bắt đầu dự án mới mà không mất thông tin.",
        },
      ],
    },
  },
  {
    kind: "contactForm",
    name: "Contact Form",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Tieu de" },
        subtitle: { type: "string", title: "Mo ta" },
        socialIntro: { type: "string", title: "Doan mang xa hoi" },
        cta: {
          type: "object",
          title: "CTA",
          properties: {
            label: { type: "string", title: "Nhan nut" },
            url: { type: "string", title: "Duong dan", format: "uri" }
          }
        },
        contactTitle: { type: "string", title: "Tieu de lien he" },
        contactDescription: { type: "string", title: "Mo ta lien he" },
        contactLinks: {
          type: "array",
          title: "Lien he truc tiep",
          items: {
            type: "object",
            properties: {
              label: { type: "string", title: "Nhan" },
              value: { type: "string", title: "Gia tri" },
              href: { type: "string", title: "Lien ket" }
            }
          }
        },
        formTitle: { type: "string", title: "Tieu de form" },
        formDescription: { type: "string", title: "Mo ta form" },
        fields: {
          type: "array",
          title: "Truong form",
          items: {
            type: "object",
            properties: {
              name: { type: "string", title: "Ten truong" },
              label: { type: "string", title: "Nhan hien thi" },
              type: {
                type: "string",
                title: "Kieu",
                enum: ["text", "email", "textarea", "tel", "select"]
              },
              placeholder: { type: "string", title: "Placeholder" },
              required: { type: "boolean", title: "Bat buoc" },
              options: {
                type: "array",
                title: "Lua chon (voi select)",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string", title: "Nhan" },
                    value: { type: "string", title: "Gia tri" }
                  }
                }
              }
            },
            required: ["name", "label", "type"]
          }
        },
        privacyText: { type: "string", title: "Noi dung dong y" },
        submitLabel: { type: "string", title: "Nhan nut gui" },
        promiseHighlight: { type: "string", title: "Thong diep cam ket" },
        socialLinks: {
          type: "array",
          title: "Mang xa hoi (contact)",
          items: {
            type: "object",
            properties: {
              platform: { type: "string", title: "Nen tang" },
              url: { type: "string", title: "Duong dan", format: "uri" },
              icon: { type: "string", title: "Icon" }
            }
          }
        }
      }
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      socialIntro: { "ui:widget": "textarea" },
      contactDescription: { "ui:widget": "textarea" },
      formDescription: { "ui:widget": "textarea" },
      privacyText: { "ui:widget": "textarea" },
      contactLinks: {
        "ui:options": { addButtonLabel: "Them lien he" },
        items: {
          value: { "ui:placeholder": "contact@domain.com" },
          href: { "ui:placeholder": "mailto:..." }
        }
      },
      fields: {
        "ui:options": { addButtonLabel: "Them truong" },
        items: {
          options: {
            "ui:options": { addButtonLabel: "Them lua chon" },
            items: {
              label: { "ui:placeholder": "Lua chon" },
              value: { "ui:placeholder": "value" }
            }
          }
        }
      },
      socialLinks: {
        "ui:options": { addButtonLabel: "Them social" },
        items: {
          icon: { "ui:placeholder": "lucide-youtube" }
        }
      }
    } satisfies UiSchema,
    template: {
      title: "CUNG HIEN THUC HOA TAM NHIN CUA BAN",
      subtitle: "Chung toi o day de giup ban tao ra nhung hinh anh va hoat hinh tuyet dep, thu hut khan gia va nang tam thuong hieu cua ban. Du ban co cau hoi, can bao gia, hay muon thao luan ve du an tiep theo, chung toi rat mong duoc lang nghe tu ban.",
      socialIntro: "Theo doi chung toi tren mang xa hoi de cap nhat tin tuc moi nhat, du an va noi dung hau truong",
      cta: {
        label: "DICH VU CUA CHUNG TOI",
        url: "#services"
      },
      contactTitle: "CACH LIEN HE VOI CHUNG TOI",
      contactDescription: "Hoac gui tin nhan cho chung toi. Dien vao bieu mau ben duoi, chung toi se phan hoi ban trong vong 24 gio.",
      contactLinks: [
        { label: "Email", value: "contact@stepv.studio", href: "mailto:contact@stepv.studio" },
        { label: "Phone", value: "+49-176-21129718", href: "tel:+4917621129718" }
      ],
      formTitle: "Gui tin nhan",
      formDescription: "Dien thong tin de chung toi co the tu van nhanh nhat.",
      fields: [
        { name: "name", label: "Ho va ten*", type: "text", placeholder: "Ten cua ban", required: true },
        { name: "email", label: "E-Mail*", type: "email", placeholder: "name@example.com", required: true },
        { name: "service", label: "Danh muc dich vu", type: "select", placeholder: "Chon dich vu", required: false, options: [
          { label: "3D Product Animation", value: "product-animation" },
          { label: "3D Still Image", value: "still-image" },
          { label: "Consulting", value: "consulting" }
        ] },
        { name: "message", label: "Tin nhan", type: "textarea", placeholder: "Ban muon chung toi ho tro dieu gi?", required: false }
      ],
      privacyText: "Toi dong y voi CHINH SACH BAO MAT",
      submitLabel: "GUI",
      promiseHighlight: "Chung toi se phan hoi trong 24 gio lam viec.",
      socialLinks: [
        { platform: "YouTube", url: "https://youtube.com/@stepv", icon: "youtube" },
        { platform: "TikTok", url: "https://tiktok.com/@stepv", icon: "tiktok" },
        { platform: "Facebook", url: "https://facebook.com/stepvstudio", icon: "facebook" },
        { platform: "Instagram", url: "https://instagram.com/stepvstudio", icon: "instagram" }
      ]
    }
  },
  {
    kind: "siteHeader",
    name: "Site Header",
    schema: {
      type: "object",
      properties: {
        logo: { type: "string", title: "Logo" },
        backgroundImage: { type: "string", title: "Background" },
        menuItems: {
          type: "array",
          title: "Menu",
          items: {
            type: "object",
            properties: {
              label: { type: "string", title: "Nhan" },
              url: { type: "string", title: "Duong dan", format: "uri" },
              highlight: { type: "boolean", title: "Noi bat" }
            }
          }
        },
        socials: {
          type: "array",
          title: "Social",
          items: {
            type: "object",
            properties: {
              platform: { type: "string", title: "Nen tang" },
              url: { type: "string", title: "Duong dan", format: "uri" },
              icon: { type: "string", title: "Icon" }
            }
          }
        },
        cta: {
          type: "object",
          title: "CTA",
          properties: {
            label: { type: "string", title: "Nhan nut" },
            url: { type: "string", title: "Duong dan", format: "uri" }
          }
        }
      }
    },
    uiSchema: {
      backgroundImage: { "ui:placeholder": "/images/header-bg.jpg" },
      menuItems: {
        "ui:options": { addButtonLabel: "Them menu" },
        items: {
          url: { "ui:placeholder": "https://..." }
        }
      },
      socials: {
        "ui:options": { addButtonLabel: "Them social" },
        items: {
          icon: { "ui:placeholder": "youtube" }
        }
      }
    } satisfies UiSchema,
    template: {
      logo: "/images/logo-gold.png",
      backgroundImage: "/images/header-bg.jpg",
      menuItems: [
        { label: "TRANG CHU", url: "/", highlight: true },
        { label: "KHOA HOC", url: "/courses" },
        { label: "DU AN", url: "/projects" },
        { label: "VE CHUNG TOI", url: "/about" },
        { label: "THU VIEN", url: "/library" },
        { label: "THEM", url: "/more" }
      ],
      socials: [
        { platform: "YouTube", url: "https://youtube.com/@stepv", icon: "youtube" },
        { platform: "TikTok", url: "https://tiktok.com/@stepv", icon: "tiktok" },
        { platform: "Facebook", url: "https://facebook.com/stepvstudio", icon: "facebook" },
        { platform: "Instagram", url: "https://instagram.com/stepvstudio", icon: "instagram" },
        { platform: "Pinterest", url: "https://pinterest.com/stepvstudio", icon: "pinterest" },
        { platform: "X", url: "https://x.com/stepvstudio", icon: "twitter" }
      ],
      cta: { label: "LIEN HE", url: "#contact" }
    }
  },
  {
    kind: "careSection",
    name: "Care Section",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Tieu de" },
        description: { type: "string", title: "Mo ta" },
        button: {
          type: "object",
          title: "CTA",
          properties: {
            label: { type: "string", title: "Nhan nut" },
            url: { type: "string", title: "Duong dan", format: "uri" }
          }
        }
      }
    },
    uiSchema: {
      description: { "ui:widget": "textarea" }
    } satisfies UiSchema,
    template: {
      title: "HAY DE CHUNG TOI CHAM SOC BAN",
      description: "Step V Studio - Doi tac cua ban cho cac du an hinh anh 3D cao cap, hoat hinh va giai phap marketing. Hien thuc hoa tam nhin cua ban voi do chinh xac, sang tao va doi moi.",
      button: { label: "DAT LICH HEN", url: "#booking" }
    }
  },
  {
    kind: "siteFooter",
    name: "Site Footer",
    schema: {
      type: "object",
      properties: {
        logo: { type: "string", title: "Logo" },
        columns: {
          type: "array",
          title: "Cot",
          items: {
            type: "object",
            properties: {
              title: { type: "string", title: "Tieu de" },
              links: {
                type: "array",
                title: "Links",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string", title: "Nhan" },
                    url: { type: "string", title: "Duong dan", format: "uri" },
                    highlight: { type: "boolean", title: "Noi bat" }
                  }
                }
              }
            }
          }
        },
        socialTitle: { type: "string", title: "Tieu de social" },
        socialLinks: {
          type: "array",
          title: "Mang xa hoi",
          items: {
            type: "object",
            properties: {
              platform: { type: "string", title: "Nen tang" },
              url: { type: "string", title: "Duong dan", format: "uri" },
              icon: { type: "string", title: "Icon" }
            }
          }
        },
        locationTitle: { type: "string", title: "Tieu de tru so" },
        locationLines: {
          type: "array",
          title: "Noi dung tru so",
          items: { type: "string" }
        },
        contactTitle: { type: "string", title: "Tieu de lien he" },
        contactEmail: { type: "string", title: "Email", format: "email" },
        copyright: { type: "string", title: "Copyright" }
      }
    },
    uiSchema: {
      columns: {
        "ui:options": { addButtonLabel: "Them cot" },
        items: {
          links: {
            "ui:options": { addButtonLabel: "Them link" },
            items: {
              url: { "ui:placeholder": "https://..." }
            }
          }
        }
      },
      socialLinks: {
        "ui:options": { addButtonLabel: "Them social" },
        items: {
          icon: { "ui:placeholder": "youtube" }
        }
      },
      locationLines: {
        "ui:options": { addButtonLabel: "Them dong" }
      }
    } satisfies UiSchema,
    template: {
      logo: "/images/logo-gold.png",
      columns: [
        {
          title: "STUDIO CUA CHUNG TOI",
          links: [
            { label: "Trang chu", url: "/", highlight: true },
            { label: "Gioi thieu", url: "/about" },
            { label: "Dich vu", url: "/services" },
            { label: "Tuyen dung", url: "/careers" }
          ]
        },
        {
          title: "DICH VU CUA CHUNG TOI",
          links: [
            { label: "Marketing", url: "/services/marketing" },
            { label: "Hinh anh kien truc", url: "/services/architecture" },
            { label: "Hinh anh san pham", url: "/services/product" },
            { label: "Hoat hinh 3D", url: "/services/animation" }
          ]
        },
        {
          title: "DIEU KHOAN CHUNG",
          links: [
            { label: "Dieu khoan su dung", url: "/terms" },
            { label: "Chinh sach bao mat", url: "/privacy" }
          ]
        }
      ],
      socialTitle: "THEO DOI CHUNG TOI",
      socialLinks: [
        { platform: "YouTube", url: "https://youtube.com/@stepv", icon: "youtube" },
        { platform: "TikTok", url: "https://tiktok.com/@stepv", icon: "tiktok" },
        { platform: "Facebook", url: "https://facebook.com/stepvstudio", icon: "facebook" },
        { platform: "Instagram", url: "https://instagram.com/stepvstudio", icon: "instagram" }
      ],
      locationTitle: "TRU SO TAI",
      locationLines: ["Stuttgart, Duc", "+49-176-21129718"],
      contactTitle: "LIEN HE",
      contactEmail: "contact@stepv.studio",
      copyright: "© Ban quyen 2025 - Step V Studio. Tat ca quyen duoc bao luu"
    }
  },
  {
    kind: "wordSlider",
    name: "Word Slider",
    schema: {
      type: "object",
      properties: {
        words: {
          type: "array",
          title: "Tu khoa",
          items: {
            type: "string",
            title: "Tu"
          }
        }
      }
    },
    uiSchema: {
      words: {
        "ui:options": { addButtonLabel: "Them tu" },
        items: { "ui:placeholder": "Tu khoa" }
      }
    } satisfies UiSchema,
    template: {
      words: ["Tu khoa 1", "Tu khoa 2"]
    }
  },
  {
    kind: "yourAdvice",
    name: "Your Advice",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Tiêu đề" },
        subtitle: { type: "string", title: "Phụ đề" },
        buttons: {
          type: "array",
          title: "Nút bấm",
          items: {
            type: "object",
            properties: {
              text: { type: "string", title: "Nhãn nút" },
              url: { type: "string", title: "Đường dẫn", format: "uri" },
              style: { type: "string", title: "Style" },
            },
          },
        },
        videos: {
          type: "array",
          title: "Video",
          items: {
            type: "object",
            properties: {
              videoId: { type: "string", title: "Video ID" },
              title: { type: "string", title: "Tiêu đề" },
              linkUrl: { type: "string", title: "Đường dẫn", format: "uri" },
            },
          },
        },
        mobileHeight: { type: "number", title: "Chiều cao mobile" },
        content: { type: "string", title: "Nội dung (legacy)" },
      },
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      content: { "ui:widget": "textarea" },
      buttons: {
        "ui:options": { addButtonLabel: "Thêm nút" },
        items: {
          url: { "ui:placeholder": "https://..." },
        },
      },
      videos: {
        "ui:options": { addButtonLabel: "Thêm video" },
        items: {
          linkUrl: { "ui:placeholder": "https://..." },
        },
      },
    } satisfies UiSchema,
    template: {
      title: "QUẢNG CÁO CỦA BẠN CÓ THỂ TRÔNG NHƯ THẾ NÀY",
      subtitle:
        "Khám phá cách chúng tôi đã giúp các thương hiệu cao cấp và ngành công nghiệp sáng tạo biến tầm nhìn của họ thành hiện thực với những hình ảnh 3D tuyệt đẹp và được thiết kế riêng.",
      buttons: [
        { text: "KHÁM PHÁ THÊM DỰ ÁN", url: "/projects", style: "primary" },
        { text: "LIÊN HỆ CHÚNG TÔI", url: "#contact", style: "secondary" },
      ],
      videos: [
        { videoId: "EZwwRmLAg90", title: "Oro Bianco | BOIS 1920 | Step V Studio | 3D Animation", linkUrl: "/projects" },
        { videoId: "M7lc1UVf-VE", title: "3D Product Animation - Perfume Bottle", linkUrl: "/projects" },
      ],
      mobileHeight: 400,
      content: "",
    },
  },
];




