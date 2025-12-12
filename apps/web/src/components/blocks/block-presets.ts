import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { BLOCK_DEFAULT_DATA } from "./block-defaults";
import { ICON_ONE_OF } from "@/lib/lucide-icons";


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
        template: BLOCK_DEFAULT_DATA["hero"],
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
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF },
              title: { type: "string", title: "Tiêu đề" },
              description: { type: "string", title: "Mô tả" },
              image: { type: "string", title: "Ảnh" },
              linkUrl: { type: "string", title: "Liên kết", format: "uri" },
            },
            required: ["title"],
          },
        },
      },
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      items: {
        "ui:options": { addButtonLabel: "Thêm dịch vụ" },
        items: {
          icon: { "ui:widget": "iconPicker" },
          description: { "ui:widget": "textarea" },
          image: { "ui:widget": "mediaImage" },
          linkUrl: { "ui:placeholder": "https://..." },
        },
      },
    } satisfies UiSchema,
    template: BLOCK_DEFAULT_DATA["services"],
  },

    {
    kind: "stats",
    name: "Stats",
    schema: {
      type: "object",
      properties: {
        backgroundColor: { type: "string", title: "Màu nền" },
        items: {
          type: "array",
          title: "Chỉ số",
          minItems: 4,
          maxItems: 4,
          default: BLOCK_DEFAULT_DATA["stats"].items,
          items: {
            type: "object",
            properties: {
              number: { type: "string", title: "Giá trị" },
              label: { type: "string", title: "Nhãn" },
              delay: { type: "number", title: "Độ trễ (ms)" },
            },
            required: ["number", "label"],
          },
        },
      },
      required: ["items"],
    },
    uiSchema: {
      items: {
        "ui:options": { addable: false, orderable: false, removable: false },
        items: {
          number: { "ui:placeholder": "5+" },
          label: { "ui:placeholder": "Years of Experience" },
          delay: { "ui:placeholder": "100" },
        },
      },
      backgroundColor: { "ui:placeholder": "bg-gray-900" },
    } satisfies UiSchema,
    template: BLOCK_DEFAULT_DATA["stats"],
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
        template: BLOCK_DEFAULT_DATA["gallery"],
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
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF },
              title: { type: "string", title: "Tiêu đề" },
              description: { type: "string", title: "Mô tả" },
            },
            required: ["title", "description"],
          },
        },
      },
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      videoUrl: { "ui:widget": "mediaVideo" },
      items: {
        "ui:options": { addButtonLabel: "Thêm ly do" },
        items: {
          icon: { "ui:widget": "iconPicker" },
          description: { "ui:widget": "textarea" },
        },
      },
    } satisfies UiSchema,
    template: BLOCK_DEFAULT_DATA["whyChooseUs"],
  },

  {
    kind: "why3DVisuals",
    name: "Why 3D Visuals",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Tiêu đề" },
        subtitle: { type: "string", title: "Phụ đề" },
        buttonText: { type: "string", title: "Nút CTA" },
        buttonLink: { type: "string", title: "Liên kết CTA" },
        topCards: {
          type: "array",
          title: "Thẻ hàng trên",
          items: {
            type: "object",
            properties: {
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF },
              title: { type: "string", title: "Tiêu đề" },
              items: {
                type: "array",
                title: "Accordion",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", title: "Tiêu đề" },
                    content: { type: "string", title: "Nội dung" },
                  },
                  required: ["title", "content"],
                },
              },
            },
            required: ["title", "items"],
          },
        },
        bottomCards: {
          type: "array",
          title: "Thẻ hàng dưới",
          items: {
            type: "object",
            properties: {
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF },
              title: { type: "string", title: "Tiêu đề" },
              items: {
                type: "array",
                title: "Accordion",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", title: "Tiêu đề" },
                    content: { type: "string", title: "Nội dung" },
                  },
                  required: ["title", "content"],
                },
              },
            },
            required: ["title", "items"],
          },
        },
      },
      required: ["title", "buttonText", "buttonLink"],
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      buttonText: { "ui:placeholder": "LIÊN HỆ CHÚNG TÔI" },
      buttonLink: { "ui:placeholder": "#contact" },
      topCards: {
        "ui:options": { addButtonLabel: "Thêm thẻ hàng trên" },
        items: {
          icon: { "ui:widget": "iconPicker" },
          title: { "ui:placeholder": "Tiêu đề thẻ" },
          items: {
            "ui:options": { addButtonLabel: "Thêm nội dung" },
            items: {
              title: { "ui:placeholder": "Tiêu đề mục" },
              content: { "ui:widget": "textarea", "ui:placeholder": "Mô tả chi tiết" },
            },
          },
        },
      },
      bottomCards: {
        "ui:options": { addButtonLabel: "Thêm thẻ hàng dưới" },
        items: {
          icon: { "ui:widget": "iconPicker" },
          title: { "ui:placeholder": "Tiêu đề thẻ" },
          items: {
            "ui:options": { addButtonLabel: "Thêm nội dung" },
            items: {
              title: { "ui:placeholder": "Tiêu đề mục" },
              content: { "ui:widget": "textarea", "ui:placeholder": "Mô tả chi tiết" },
            },
          },
        },
      },
    } satisfies UiSchema,
        template: BLOCK_DEFAULT_DATA["why3DVisuals"],
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
        template: BLOCK_DEFAULT_DATA["turning"],
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
              url: { type: "string", title: "Du?ng d?n", format: "uri" },
            },
          },
        },
        items: {
          type: "array",
          title: "Quy trình",
          items: {
            type: "object",
            properties: {
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF },
              title: { type: "string", title: "Tiêu đề" },
              description: { type: "string", title: "Mô tả" },
            },
            required: ["title", "description"],
          },
        },
      },
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      ctas: {
        "ui:options": { addButtonLabel: "Thêm CTA" },
        items: {
          label: { "ui:placeholder": "B?t d?u" },
          url: { "ui:placeholder": "https://..." },
        },
      },
      items: {
        "ui:options": { addButtonLabel: "Thêm bước" },
        items: {
          icon: { "ui:widget": "iconPicker" },
          description: { "ui:widget": "textarea" },
        },
      },
    } satisfies UiSchema,
    template: BLOCK_DEFAULT_DATA["weWork"],
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
        template: BLOCK_DEFAULT_DATA["stayControl"],
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
            label: { type: "string", title: "Nhãn nút" },
            url: { type: "string", title: "Đường dẫn", format: "uri" }
          }
        },
        contactTitle: { type: "string", title: "Tieu de lien he" },
        contactDescription: { type: "string", title: "Mo ta lien he" },
        contactLinks: {
          type: "array",
          title: "Liên hệ trực tiếp",
          items: {
            type: "object",
            properties: {
              label: { type: "string", title: "Nhãn" },
              value: { type: "string", title: "Gia tri" },
              href: { type: "string", title: "Lien ket" }
            }
          }
        },
        formTitle: { type: "string", title: "Tieu de form" },
        formDescription: { type: "string", title: "Mo ta form" },
        fields: {
          type: "array",
          title: "Trường form",
          items: {
            type: "object",
            properties: {
              name: { type: "string", title: "Ten truong" },
              label: { type: "string", title: "Nhãn hiển thị" },
              type: {
                type: "string",
                title: "Kieu",
                enum: ["text", "email", "textarea", "tel", "select"]
              },
              placeholder: { type: "string", title: "Placeholder" },
              required: { type: "boolean", title: "Bat buoc" },
              options: {
                type: "array",
                title: "Lựa chọn (với select)",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string", title: "Nhãn" },
                    value: { type: "string", title: "Gia tri" }
                  }
                }
              }
            },
            required: ["name", "label", "type"]
          }
        },
        privacyText: { type: "string", title: "Noi dung dong y" },
        submitLabel: { type: "string", title: "Nhãn nút gửi" },
        promiseHighlight: { type: "string", title: "Thong diep cam ket" },
        socialLinks: {
          type: "array",
          title: "Mang xa hoi (contact)",
          items: {
            type: "object",
            properties: {
              platform: { type: "string", title: "Nen tang" },
              url: { type: "string", title: "Đường dẫn", format: "uri" },
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF }
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
        "ui:options": { addButtonLabel: "Thêm liên hệ" },
        items: {
          value: { "ui:placeholder": "contact@domain.com" },
          href: { "ui:placeholder": "mailto:..." }
        }
      },
      fields: {
        "ui:options": { addButtonLabel: "Thêm trường" },
        items: {
          options: {
            "ui:options": { addButtonLabel: "Thêm lựa chọn" },
            items: {
              label: { "ui:placeholder": "Lựa chọn" },
              value: { "ui:placeholder": "value" }
            }
          }
        }
      },
      socialLinks: {
        "ui:options": { addButtonLabel: "Thêm social" },
        items: {
          icon: { "ui:widget": "iconPicker" }
        }
      }
    } satisfies UiSchema,
        template: BLOCK_DEFAULT_DATA["contactForm"],},
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
              label: { type: "string", title: "Nhãn" },
              url: { type: "string", title: "Đường dẫn" },
              highlight: { type: "boolean", title: "Nổi bật" }
            }
          }
        },
        socials: {
          type: "array",
          title: "Social",
          items: {
            type: "object",
            properties: {
              platform: { type: "string", title: "Nền tảng" },
              url: { type: "string", title: "Đường dẫn" },
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF }
            }
          }
        },
        auth: {
          type: "object",
          title: "Tài khoản khách hàng",
          properties: {
            enabled: { type: "boolean", title: "Hiển thị khu vực khách hàng", default: true }
          }
        }
      }
    },
    uiSchema: {
      logo: {
        "ui:widget": "mediaImage",
        "ui:options": { placeholder: "https://..." }
      },
      backgroundImage: {
        "ui:widget": "mediaImage",
        "ui:options": { placeholder: "/images/header-bg.jpg" }
      },
      menuItems: {
        "ui:options": { addButtonLabel: "Thêm menu" },
        items: {
          url: { "ui:placeholder": "https://... hoặc /project" }
        }
      },
      socials: {
        "ui:options": { addButtonLabel: "Thêm social" },
        items: {
          icon: { "ui:widget": "iconPicker" }
        }
      },
      auth: {
        "ui:order": ["enabled"],
        enabled: { "ui:widget": "checkbox" }
      }
    } satisfies UiSchema,
        template: BLOCK_DEFAULT_DATA["siteHeader"],},
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
            label: { type: "string", title: "Nhãn nút" },
            url: { type: "string", title: "Đường dẫn", format: "uri" }
          }
        }
      }
    },
    uiSchema: {
      description: { "ui:widget": "textarea" }
    } satisfies UiSchema,
        template: BLOCK_DEFAULT_DATA["careSection"],},
  {
    kind: "siteFooter",
    name: "Site Footer",
    schema: {
      type: "object",
      properties: {
        logo: { type: "string", title: "Logo" },
        columns: {
          type: "array",
          title: "Cột",
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
                    label: { type: "string", title: "Nhãn" },
                    url: { type: "string", title: "Đường dẫn", format: "uri" },
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
              url: { type: "string", title: "Đường dẫn", format: "uri" },
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF }
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
        "ui:options": { addButtonLabel: "Thêm cột" },
        items: {
          links: {
            "ui:options": { addButtonLabel: "Thêm link" },
            items: {
              url: { "ui:placeholder": "https://..." }
            }
          }
        }
      },
      socialLinks: {
        "ui:options": { addButtonLabel: "Thêm social" },
        items: {
          icon: { "ui:widget": "iconPicker" }
        }
      },
      locationLines: {
        "ui:options": { addButtonLabel: "Thêm dòng" }
      }
    } satisfies UiSchema,
        template: BLOCK_DEFAULT_DATA["siteFooter"],},
  {
    kind: "wordSlider",
    name: "Word Slider",
    schema: {
      type: "object",
      properties: {
        words: {
          type: "array",
          title: "Từ khóa",
          items: {
            type: "string",
            title: "Tu"
          }
        }
      }
    },
    uiSchema: {
      words: {
        "ui:options": { addButtonLabel: "Thêm từ" },
        items: { "ui:placeholder": "Từ khóa" }
      }
    } satisfies UiSchema,
        template: BLOCK_DEFAULT_DATA["wordSlider"],},
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
        template: BLOCK_DEFAULT_DATA["yourAdvice"],
  },
  // ==================== ABOUT PAGE BLOCKS ====================
  {
    kind: "heroAbout",
    name: "Hero About",
    schema: {
      type: "object",
      properties: {
        siteName: { type: "string", title: "Tên site" },
        logoUrl: { type: "string", title: "Logo URL" },
        badge: { type: "string", title: "Badge text" },
        titleLine1: { type: "string", title: "Tiêu đề dòng 1" },
        titleLine2: { type: "string", title: "Tiêu đề dòng 2 (highlight)" },
        description: { type: "string", title: "Mô tả" },
        services: {
          type: "array",
          title: "Dịch vụ",
          items: {
            type: "object",
            properties: {
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF },
              title: { type: "string", title: "Tiêu đề" },
              desc: { type: "string", title: "Mô tả" },
            },
            required: ["title", "desc"],
          },
        },
      },
    },
    uiSchema: {
      logoUrl: { "ui:widget": "mediaImage" },
      description: { "ui:widget": "textarea" },
      services: {
        "ui:options": { addButtonLabel: "Thêm dịch vụ" },
        items: {
          icon: { "ui:widget": "iconPicker" },
          desc: { "ui:widget": "textarea" },
        },
      },
    } satisfies UiSchema,
    template: {
      siteName: "Dohy Studio",
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
    name: "Stats About",
    schema: {
      type: "object",
      properties: {
        stats: {
          type: "array",
          title: "Thống kê",
          items: {
            type: "object",
            properties: {
              value: { type: "string", title: "Giá trị" },
              label: { type: "string", title: "Nhãn" },
            },
            required: ["value", "label"],
          },
        },
      },
    },
    uiSchema: {
      stats: {
        "ui:options": { addButtonLabel: "Thêm thống kê" },
      },
    } satisfies UiSchema,
    template: {
      stats: [
        { value: "03", label: "Hệ Sinh Thái" },
        { value: "5K+", label: "Học Viên" },
        { value: "100%", label: "Chất Lượng" },
      ],
    },
  },
  {
    kind: "bentoGridAbout",
    name: "Bento Grid About",
    schema: {
      type: "object",
      properties: {
        badge: { type: "string", title: "Badge" },
        title: { type: "string", title: "Tiêu đề" },
        titleHighlight: { type: "string", title: "Tiêu đề highlight" },
        subtitle: { type: "string", title: "Mô tả" },
        services: {
          type: "array",
          title: "Dịch vụ",
          items: {
            type: "object",
            properties: {
              id: { type: "string", title: "ID" },
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF },
              label: { type: "string", title: "Label" },
              title: { type: "string", title: "Tiêu đề" },
              description: { type: "string", title: "Mô tả" },
              features: {
                type: "array",
                title: "Features",
                items: { type: "string" },
              },
              image: { type: "string", title: "Ảnh" },
              ctaText: { type: "string", title: "CTA text" },
              href: { type: "string", title: "Link" },
            },
            required: ["label", "title", "description", "image", "ctaText", "href"],
          },
        },
      },
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      services: {
        "ui:options": { addButtonLabel: "Thêm dịch vụ" },
        items: {
          icon: { "ui:widget": "iconPicker" },
          description: { "ui:widget": "textarea" },
          image: { "ui:widget": "mediaImage" },
          features: { "ui:options": { addButtonLabel: "Thêm feature" } },
        },
      },
    } satisfies UiSchema,
    template: {
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
          description: "Hệ thống đào tạo tư duy mỹ thuật và kỹ năng 3D/VFX bài bản.",
          features: ["Tư duy hình ảnh", "Kỹ năng 3D", "Quy trình Studio"],
          image: "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?q=80&w=687&auto=format&fit=crop",
          ctaText: "Xem Lộ Trình",
          href: "/khoa-hoc",
        },
      ],
    },
  },
  {
    kind: "visionAbout",
    name: "Vision About",
    schema: {
      type: "object",
      properties: {
        badge: { type: "string", title: "Badge" },
        titleLine1: { type: "string", title: "Tiêu đề dòng 1" },
        titleLine2: { type: "string", title: "Tiêu đề dòng 2 (highlight)" },
        description: { type: "string", title: "Mô tả" },
        features: {
          type: "array",
          title: "Features",
          items: {
            type: "object",
            properties: {
              title: { type: "string", title: "Tiêu đề" },
              description: { type: "string", title: "Mô tả" },
            },
            required: ["title", "description"],
          },
        },
        image: { type: "string", title: "Ảnh" },
        imageAlt: { type: "string", title: "Alt ảnh" },
        yearEstablished: { type: "string", title: "Năm thành lập" },
        tagline: { type: "string", title: "Tagline" },
      },
    },
    uiSchema: {
      description: { "ui:widget": "textarea" },
      image: { "ui:widget": "mediaImage" },
      features: {
        "ui:options": { addButtonLabel: "Thêm feature" },
        items: {
          description: { "ui:widget": "textarea" },
        },
      },
    } satisfies UiSchema,
    template: {
      badge: "Dohy Vision",
      titleLine1: "Chất Lượng Là",
      titleLine2: "Tiêu Chuẩn Duy Nhất",
      description: "Mỗi sản phẩm: Art Direction + Advanced Tech",
      features: [
        { title: "Sáng Tạo", description: "Tư duy thiết kế mới" },
        { title: "Hiệu Suất", description: "Gấp 2 lần nhanh" },
      ],
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
      yearEstablished: "Est. 2019",
      tagline: "Premium Standard",
    },
  },
  {
    kind: "ctaAbout",
    name: "CTA About",
    schema: {
      type: "object",
      properties: {
        siteName: { type: "string", title: "Tên site" },
        contactEmail: { type: "string", title: "Email liên hệ", format: "email" },
        address: { type: "string", title: "Địa chỉ" },
        zaloUrl: { type: "string", title: "Zalo URL", format: "uri" },
        facebookUrl: { type: "string", title: "Facebook URL", format: "uri" },
        instagramUrl: { type: "string", title: "Instagram URL", format: "uri" },
        youtubeUrl: { type: "string", title: "YouTube URL", format: "uri" },
        tiktokUrl: { type: "string", title: "TikTok URL", format: "uri" },
        bankAccountNumber: { type: "string", title: "Số tài khoản" },
        bankAccountName: { type: "string", title: "Tên chủ tài khoản" },
        bankCode: { type: "string", title: "Mã ngân hàng" },
      },
    },
    uiSchema: {
      address: { "ui:widget": "textarea" },
    } satisfies UiSchema,
    template: {},
  },
];





