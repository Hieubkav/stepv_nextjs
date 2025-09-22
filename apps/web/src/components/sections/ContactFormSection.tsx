'use client';

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getLucideIcon } from "@/lib/lucide-icons";

type ContactFieldOption = {
  label: string;
  value: string;
};

type ContactField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: ContactFieldOption[];
};

type ContactLink = {
  label: string;
  value?: string;
  href?: string;
};

type ContactCta = {
  label: string;
  url: string;
};

type ContactSocialLink = {
  platform: string;
  url: string;
  icon?: string;
};

interface ContactFormSectionProps {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  socialIntro?: string;
  cta?: ContactCta;
  socialLinks?: ContactSocialLink[];
  contactTitle?: string;
  contactDescription?: string;
  contactLinks?: ContactLink[];
  formTitle?: string;
  formDescription?: string;
  fields?: ContactField[];
  privacyText?: string;
  submitLabel?: string;
  promiseHighlight?: string;
}

type FormState = Record<string, string | boolean>;

const DEFAULT_TITLE = "Cùng hiện thực hóa tầm nhìn của bạn";
const DEFAULT_SUBTITLE =
  "Chúng tôi ở đây để giúp bạn tạo ra những hình ảnh và hoạt hình tuyệt đẹp, thu hút khán giả và nâng tầm thương hiệu của bạn. Dù bạn có câu hỏi, cần báo giá, hay muốn thảo luận về dự án tiếp theo, chúng tôi rất mong được lắng nghe.";
const DEFAULT_SOCIAL_INTRO =
  "Theo dõi chúng tôi trên mạng xã hội để cập nhật tin tức mới nhất, dự án và nội dung hậu trường.";
const DEFAULT_CTA: ContactCta = {
  label: "Dịch vụ của chúng tôi",
  url: "#services",
};
const DEFAULT_CONTACT_TITLE = "Cách liên hệ với chúng tôi";
const DEFAULT_CONTACT_DESCRIPTION =
  "Gọi trực tiếp hoặc gửi email, đội ngũ StepV luôn sẵn sàng hỗ trợ.";
const DEFAULT_FORM_TITLE = "Hoặc gửi tin nhắn cho chúng tôi";
const DEFAULT_FORM_DESCRIPTION =
  "Điền vào biểu mẫu bên dưới để chúng tôi có thể hỗ trợ nhanh nhất.";
const DEFAULT_PROMISE_HIGHLIGHT = "Chúng tôi sẽ phản hồi trong 24 giờ làm việc.";
const DEFAULT_PRIVACY_TEXT = "Tôi đồng ý với CHÍNH SÁCH BẢO MẬT";
const DEFAULT_SUBMIT_LABEL = "GỬI";

const DEFAULT_CONTACT_LINKS: ContactLink[] = [
  {
    label: "Email",
    value: "contact@stepv.studio",
    href: "mailto:contact@stepv.studio",
  },
  {
    label: "Phone",
    value: "+49-176-21129718",
    href: "tel:+4917621129718",
  },
];

const DEFAULT_FIELDS: ContactField[] = [
  {
    name: "name",
    label: "Họ và tên*",
    type: "text",
    placeholder: "Nhập họ và tên",
    required: true,
  },
  {
    name: "email",
    label: "E-Mail*",
    type: "email",
    placeholder: "name@example.com",
    required: true,
  },
  {
    name: "serviceCategory",
    label: "Danh mục dịch vụ",
    type: "select",
    placeholder: "Chọn danh mục dịch vụ",
    options: [
      { label: "Hình ảnh 3D sản phẩm", value: "3d-product-visual" },
      { label: "Sản xuất VFX / AR", value: "vfx-ar" },
      { label: "Motion Graphics", value: "motion-graphics" },
      { label: "Hoạt hình thương hiệu", value: "brand-animation" },
      { label: "Hình ảnh kiến trúc", value: "architecture-visual" },
      { label: "Hoạt hình nhân vật", value: "character-animation" },
    ],
  },
  {
    name: "message",
    label: "Tin nhắn",
    type: "textarea",
    placeholder: "Chia sẻ nhu cầu hoặc câu hỏi của bạn",
    required: true,
  },
];

const DEFAULT_SOCIAL_LINKS: ContactSocialLink[] = [
  { platform: "YouTube", url: "https://www.youtube.com/@stepvstudio", icon: "Youtube" },
  { platform: "Instagram", url: "https://www.instagram.com/stepvstudio", icon: "Instagram" },
  { platform: "TikTok", url: "https://www.tiktok.com/@stepvstudio", icon: "Tiktok" },
  { platform: "Pinterest", url: "https://www.pinterest.com/stepvstudio", icon: "Pinterest" },
  { platform: "Telegram", url: "https://t.me/stepvstudio", icon: "Telegram" },
  { platform: "X", url: "https://x.com/stepvstudio", icon: "X" },
  { platform: "Zalo", url: "https://zalo.me/stepvstudio", icon: "Zalo" },
];

function buildInitialFormState(fields: ContactField[]): FormState {
  return fields.reduce<FormState>((acc, field) => {
    acc[field.name] = field.type === "checkbox" ? false : "";
    return acc;
  }, {});
}

function splitPrivacyText(text: string) {
  if (!text) {
    return { before: "", highlight: "", after: "" };
  }

  const variants = [
    "chính sách bảo mật",
    "chinh sach bao mat",
    "CHÍNH SÁCH BẢO MẬT",
  ];

  const lower = text.toLowerCase();
  for (const variant of variants) {
    const index = lower.indexOf(variant.toLowerCase());
    if (index !== -1) {
      const highlight = text.slice(index, index + variant.length);
      return {
        before: text.slice(0, index),
        highlight,
        after: text.slice(index + highlight.length),
      };
    }
  }

  return { before: text, highlight: "", after: "" };
}

const ContactFormSection = ({
  title,
  subtitle,
  backgroundColor,
  socialIntro,
  cta,
  socialLinks,
  contactTitle,
  contactDescription,
  contactLinks,
  formTitle,
  formDescription,
  fields,
  privacyText,
  submitLabel,
  promiseHighlight,
}: ContactFormSectionProps) => {
  const resolvedBackground =
    backgroundColor && backgroundColor.trim().length > 0
      ? backgroundColor
      : "bg-gradient-to-br from-black via-gray-950 to-black";
  const shouldOverlay = !backgroundColor || backgroundColor.trim().length === 0;

  const effectiveFields = useMemo(
    () => (fields && fields.length > 0 ? fields : DEFAULT_FIELDS),
    [fields],
  );

  const initialState = useMemo(() => buildInitialFormState(effectiveFields), [effectiveFields]);
  const [formState, setFormState] = useState<FormState>(initialState);
  useEffect(() => {
    setFormState(initialState);
  }, [initialState]);

  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const displayedSocialLinks = useMemo(() => {
    if (socialLinks && socialLinks.length > 0) {
      const filtered = socialLinks.filter((link) => link?.url && link.url.trim().length > 0);
      if (filtered.length > 0) {
        return filtered;
      }
    }
    return DEFAULT_SOCIAL_LINKS;
  }, [socialLinks]);

  const displayedContactLinks = useMemo(() => {
    if (contactLinks && contactLinks.length > 0) {
      const filtered = contactLinks.filter(
        (link) =>
          (link?.value && link.value.trim().length > 0) ||
          (link?.href && link.href.trim().length > 0),
      );
      if (filtered.length > 0) {
        return filtered;
      }
    }
    return DEFAULT_CONTACT_LINKS;
  }, [contactLinks]);

  const resolvedTitle = title ?? DEFAULT_TITLE;
  const resolvedSubtitle = subtitle ?? DEFAULT_SUBTITLE;
  const resolvedSocialIntro = socialIntro ?? DEFAULT_SOCIAL_INTRO;
  const resolvedCta = cta ?? DEFAULT_CTA;
  const resolvedContactTitle = contactTitle ?? DEFAULT_CONTACT_TITLE;
  const resolvedContactDescription = contactDescription ?? DEFAULT_CONTACT_DESCRIPTION;
  const resolvedFormTitle = formTitle ?? DEFAULT_FORM_TITLE;
  const resolvedFormDescription = formDescription ?? DEFAULT_FORM_DESCRIPTION;
  const resolvedPromiseHighlight = promiseHighlight ?? DEFAULT_PROMISE_HIGHLIGHT;
  const resolvedPrivacyText = privacyText ?? DEFAULT_PRIVACY_TEXT;
  const resolvedSubmitLabel = submitLabel ?? DEFAULT_SUBMIT_LABEL;

  const { before: privacyBefore, highlight: privacyHighlight, after: privacyAfter } =
    splitPrivacyText(resolvedPrivacyText);

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const isCheckbox = target instanceof HTMLInputElement && target.type === "checkbox";
    const nextValue = isCheckbox ? target.checked : target.value;

    setFormState((prev) => ({
      ...prev,
      [target.name]: nextValue,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!privacyAgreed) {
      alert("Vui lòng đồng ý với chính sách bảo mật trước khi gửi.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitStatus("success");
      setFormState(initialState);
      setPrivacyAgreed(false);
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className={`relative py-20 text-white min-h-screen ${resolvedBackground}`}>
      {shouldOverlay && <div className="absolute inset-0 bg-black/55" aria-hidden="true" />}
      <div className="relative container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_120px_rgba(0,0,0,0.6)]">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="flex flex-col gap-12 bg-black/50 px-8 py-12 sm:px-12 lg:py-16 border-b border-white/10 lg:border-b-0 lg:border-r">
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-thin leading-tight tracking-wide text-white">
                    {resolvedTitle}
                  </h1>
                  <p className="max-w-lg text-xl font-light leading-relaxed text-white/80">
                    {resolvedSubtitle}
                  </p>
                </div>

                <div className="h-px w-full bg-white/15" />

                <div className="space-y-6">
                  <p className="text-white/70 text-lg font-light leading-relaxed">
                    {resolvedSocialIntro}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {displayedSocialLinks.map((social, index) => {
                      const IconComponent = getLucideIcon(
                        social.icon ?? social.platform.replace(/\s+/g, ""),
                      );
                      return (
                        <a
                          key={`${social.platform}-${index}`}
                          // key={social.platform}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:border-[#FFD700] hover:text-[#FFD700]"
                        >
                          <IconComponent className="h-4 w-4" aria-hidden="true" />
                          <span className="text-sm uppercase tracking-wide">{social.platform}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>

                {resolvedCta?.label && resolvedCta?.url && (
                  <div>
                    <Button
                      asChild
                      className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-lg font-medium tracking-wide uppercase transition-all duration-300"
                    >
                      <a href={resolvedCta.url}>{resolvedCta.label}</a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="lg:pl-16 py-12 flex flex-col justify-center">
                <div className="space-y-12">
                  <div>
                    <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-6">
                      {resolvedContactTitle}
                    </h3>
                    <p className="text-white/70 text-sm mb-6">
                      {resolvedContactDescription}
                    </p>
                    <div className="space-y-4">
                      {displayedContactLinks.map((link, index) => {
                        const linkKey = link.label ?? link.href ?? link.value ?? String(index);
                        const isExternalLink =
                          !!link.href &&
                          !link.href.startsWith("mailto:") &&
                          !link.href.startsWith("tel:");

                        return (
                          <div key={`${linkKey}-${index}`} className="space-y-1">
                            {link.label && (
                              <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                                {link.label}
                              </div>
                            )}
                            {link.href ? (
                              <a
                                href={link.href}
                                className="text-[#FFD700] hover:underline text-lg"
                                rel={isExternalLink ? "noopener noreferrer" : undefined}
                                target={isExternalLink ? "_blank" : undefined}
                              >
                                {link.value ?? link.href}
                              </a>
                            ) : (
                              <span className="text-[#FFD700] text-lg">{link.value ?? link.label}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-2">
                      {resolvedFormTitle}
                    </h3>
                    <p className="text-white mb-8">
                      {resolvedFormDescription}{" "}
                      {resolvedPromiseHighlight && (
                        <span className="text-[#FFD700]">{resolvedPromiseHighlight}</span>
                      )}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {effectiveFields.map((field) => {
                        const fieldValue = formState[field.name];

                        if (field.type === "textarea") {
                          return (
                            <Textarea
                              key={field.name}
                              name={field.name}
                              rows={5}
                              required={field.required}
                              value={String(fieldValue ?? "")}
                              onChange={handleFieldChange}
                              className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#FFD700] focus:ring-[#FFD700]/30 focus:ring-2 focus:outline-none transition resize-none"
                              placeholder={field.placeholder}
                            />
                          );
                        }

                        if (field.type === "select") {
                          return (
                            <select
                              key={field.name}
                              name={field.name}
                              required={field.required}
                              value={String(fieldValue ?? "")}
                              onChange={handleFieldChange}
                              className="h-12 w-full rounded-2xl border border-white/20 bg-white/5 px-3 text-sm text-white placeholder-white/40 focus:border-[#FFD700] focus:ring-[#FFD700]/30 focus:ring-2 focus:outline-none transition"
                            >
                              <option value="">
                                {field.placeholder ?? "Chọn một tùy chọn"}
                              </option>
                              {field.options?.map((option) => (
                                <option key={option.value} value={option.value} className="text-white bg-black">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (field.type === "checkbox") {
                          return (
                            <label
                              key={field.name}
                              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                            >
                              <input
                                type="checkbox"
                                name={field.name}
                                checked={Boolean(fieldValue)}
                                onChange={handleFieldChange}
                                className="h-4 w-4 rounded border-white/40 bg-black/70 text-[#FFD700] focus:ring-[#FFD700] focus:ring-offset-0"
                              />
                              <span>{field.label}</span>
                            </label>
                          );
                        }

                        return (
                          <Input
                            key={field.name}
                            name={field.name}
                            type={field.type ?? "text"}
                            required={field.required}
                            value={String(fieldValue ?? "")}
                            onChange={handleFieldChange}
                            className="h-12 w-full rounded-2xl border border-white/20 bg-white/5 px-3 text-sm text-white placeholder-white/40 focus:border-[#FFD700] focus:ring-[#FFD700]/30 focus:ring-2 focus:outline-none transition"
                            placeholder={field.placeholder}
                          />
                        );
                      })}

                      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <input
                          type="checkbox"
                          name="privacyAgreed"
                          checked={privacyAgreed}
                          onChange={(event) => setPrivacyAgreed(event.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-white/40 bg-black/70 text-[#FFD700] focus:ring-[#FFD700] focus:ring-offset-0"
                          required
                        />
                        <span className="text-sm text-white/80">
                          {privacyBefore}
                          {privacyHighlight ? (
                            <a href="#" className="text-[#FFD700] hover:underline">
                              {privacyHighlight}
                            </a>
                          ) : null}
                          {privacyAfter}
                        </span>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-full border border-[#FFD700] bg-[#FFD700] py-3 px-6 font-medium uppercase tracking-wide text-black transition-all duration-300 hover:bg-transparent hover:text-[#FFD700] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div
                              className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                              style={{ borderColor: "#FFD700", borderTopColor: "transparent" }}
                            />
                            <span>Đang gửi...</span>
                          </div>
                        ) : (
                          resolvedSubmitLabel
                        )}
                      </Button>

                      {submitStatus === "success" && (
                        <div
                          className="rounded-2xl border px-5 py-4 text-center text-sm"
                          style={{
                            backgroundColor: "rgba(255, 215, 0, 0.15)",
                            borderColor: "rgba(255, 215, 0, 0.65)",
                            color: "#FFD700",
                          }}
                        >
                          Cảm ơn bạn! Tin nhắn của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất.
                        </div>
                      )}

                      {submitStatus === "error" && (
                        <div className="rounded-2xl border border-red-500/60 bg-red-500/15 px-5 py-4 text-center text-sm text-red-300">
                          Xin lỗi, đã có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
