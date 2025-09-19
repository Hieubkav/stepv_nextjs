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
        title: { type: "string", title: "Tieu de" },
        subtitle: { type: "string", title: "Mo ta" },
        items: {
          type: "array",
          title: "Dich vu",
          items: {
            type: "object",
            properties: {
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF },
              title: { type: "string", title: "Tieu de" },
              description: { type: "string", title: "Mo ta" },
              image: { type: "string", title: "Anh" },
              linkUrl: { type: "string", title: "Lien ket", format: "uri" },
            },
            required: ["title"],
          },
        },
      },
    },
    uiSchema: {
      subtitle: { "ui:widget": "textarea" },
      items: {
        "ui:options": { addButtonLabel: "Them dich vu" },
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
        backgroundColor: { type: "string", title: "Mau nen" },
        items: {
          type: "array",
          title: "Chi so",
          minItems: 4,
          maxItems: 4,
          default: BLOCK_DEFAULT_DATA["stats"].items,
          items: {
            type: "object",
            properties: {
              number: { type: "string", title: "Gia tri" },
              label: { type: "string", title: "Nhan" },
              delay: { type: "number", title: "Do tre (ms)" },
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
        title: { type: "string", title: "Tiêu d?" },
        subtitle: { type: "string", title: "Mô t?" },
        videoUrl: { type: "string", title: "Video" },
        videoAlt: { type: "string", title: "Video alt" },
        items: {
          type: "array",
          title: "Ly do",
          items: {
            type: "object",
            properties: {
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF },
              title: { type: "string", title: "Tiêu d?" },
              description: { type: "string", title: "Mô t?" },
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
        title: { type: "string", title: "Tiêu d?" },
        subtitle: { type: "string", title: "Mô t?" },
        ctas: {
          type: "array",
          title: "CTA",
          items: {
            type: "object",
            properties: {
              label: { type: "string", title: "Nhan nút" },
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
              title: { type: "string", title: "Tiêu d?" },
              description: { type: "string", title: "Mô t?" },
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
              icon: { type: "string", title: "Icon", oneOf: ICON_ONE_OF }
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
      logo: {
        "ui:widget": "mediaImage",
        "ui:options": { placeholder: "https://..." }
      },
      backgroundImage: {
        "ui:widget": "mediaImage",
        "ui:options": { placeholder: "/images/header-bg.jpg" }
      },
      menuItems: {
        "ui:options": { addButtonLabel: "Them menu" },
        items: {
          url: { "ui:placeholder": "https://..." }
        }
      },
      socials: {
        "ui:options": { addButtonLabel: "Them social" },
        items: {
          icon: { "ui:widget": "iconPicker" }
        }
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
            label: { type: "string", title: "Nhan nut" },
            url: { type: "string", title: "Duong dan", format: "uri" }
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
          icon: { "ui:widget": "iconPicker" }
        }
      },
      locationLines: {
        "ui:options": { addButtonLabel: "Them dong" }
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
];





