"use client";

import { useEffect, useMemo, useState } from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import type {
  ArrayFieldTemplateProps,
  FieldTemplateProps,
  ObjectFieldTemplateProps,
  RegistryWidgetsType,
  TemplatesType,
  UiSchema,
  WidgetProps,
} from "@rjsf/utils";
import { api } from "@dohy/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ICON_OPTIONS, type IconKey } from "@/lib/lucide-icons";
import { cn } from "@/lib/utils";
import { BLOCK_PRESETS, type BlockPreset } from "./block-presets";
import { ChevronDown, ChevronUp, Image as ImageIcon, Plus, Sparkles, Trash2, Video as VideoIcon, X } from "lucide-react";

type BlockFormProps = {
  kind: string;
  value: any;
  onChange: (v: any) => void;
};

const BLOCK_REGISTRY = new Map<string, BlockPreset>(BLOCK_PRESETS.map((preset) => [preset.kind, preset]));

export function hasBlockSchema(kind: string) {
  return BLOCK_REGISTRY.has(kind);
}

export function formSupportedKinds() {
  return BLOCK_PRESETS.map((preset) => preset.kind);
}

// Kinds cho trang Home (không bao gồm about blocks)
const HOME_KINDS = [
  "hero", "wordSlider", "gallery", "yourAdvice", "stats", "services",
  "whyChooseUs", "why3DVisuals", "turning", "weWork", "stayControl",
  "contactForm", "siteHeader", "siteFooter", "careSection"
];

// Kinds cho trang About
const ABOUT_KINDS = ["heroAbout", "statsAbout", "bentoGridAbout", "visionAbout", "ctaAbout"];

export function getKindsForPage(pageType: "home" | "about") {
  if (pageType === "about") {
    return BLOCK_PRESETS.filter((preset) => ABOUT_KINDS.includes(preset.kind)).map((p) => p.kind);
  }
  return BLOCK_PRESETS.filter((preset) => HOME_KINDS.includes(preset.kind)).map((p) => p.kind);
}

export function BlockForm({ kind, value, onChange }: BlockFormProps) {
  const preset = BLOCK_REGISTRY.get(kind);

  if (!preset) {
    return (
      <div className="text-sm text-muted-foreground">
        Chưa có form cho kind "{kind}". Vui lòng dùng tab JSON.
      </div>
    );
  }

  return (
    <Form
      key={kind}
      schema={preset.schema}
      uiSchema={preset.uiSchema as UiSchema | undefined}
      formData={value ?? {}}
      validator={validator}
      templates={templates}
      widgets={widgets}
      showErrorList={false}
      noHtml5Validate
      onChange={(event) => {
        const nextValue = event.formData ?? {};
        onChange(nextValue);
      }}
    >
      <div />
    </Form>
  );
}

const templates: Partial<TemplatesType> = {
  FieldTemplate: (props) => <FieldTemplate {...props} />,
  ObjectFieldTemplate: (props) => <ObjectFieldTemplate {...props} />,
  ArrayFieldTemplate: (props) => <ArrayFieldTemplate {...props} />,
};

const widgets: RegistryWidgetsType = {
  TextWidget: (props) => <BaseInputWidget {...props} />,
  PasswordWidget: (props) => <BaseInputWidget {...props} type="password" />,
  EmailWidget: (props) => <BaseInputWidget {...props} type="email" />,
  URLWidget: (props) => <BaseInputWidget {...props} type="url" />,
  TextareaWidget: (props) => <TextareaWidget {...props} />,
  SelectWidget: (props) => <SelectWidget {...props} />,
  CheckboxWidget: (props) => <CheckboxWidget {...props} />,
  NumberWidget: (props) => <BaseInputWidget {...props} type="number" />,
  UpDownWidget: (props) => <BaseInputWidget {...props} type="number" />,
  iconPicker: (props) => <IconPickerWidget {...props} />,
  mediaImage: (props) => <MediaWidget {...props} mediaKind="image" />,
  mediaVideo: (props) => <MediaWidget {...props} mediaKind="video" />,
};

function FieldTemplate({ id, classNames, label, required, description, rawErrors, children, displayLabel, help }: FieldTemplateProps) {
  const hasErrors = Array.isArray(rawErrors) && rawErrors.length > 0;
  return (
    <div className={cn("space-y-2", classNames)}>
      {displayLabel && label ? (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required ? <span className="ms-1 text-destructive">*</span> : null}
        </Label>
      ) : null}
      {description}
      {children}
      {hasErrors ? (
        <ul className="space-y-1 text-sm text-destructive">
          {rawErrors!.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      ) : null}
      {help}
    </div>
  );
}

function ObjectFieldTemplate({ description, properties, title }: ObjectFieldTemplateProps) {
  return (
    <div className="space-y-4">
      {title ? <div className="text-sm font-semibold">{title}</div> : null}
      {description}
      <div className="space-y-4">
        {properties.map((prop) =>
          prop.hidden ? prop.content : <div key={prop.name}>{prop.content}</div>,
        )}
      </div>
    </div>
  );
}

function ArrayFieldTemplate({ canAdd, items, onAddClick, title, schema, uiSchema }: ArrayFieldTemplateProps) {
  const description = schema?.description;
  const addLabel = useMemo(() => {
    const opts = (uiSchema?.["ui:options"] ?? {}) as Record<string, unknown>;
    return typeof opts.addButtonLabel === "string" ? opts.addButtonLabel : "Thêm mục";
  }, [uiSchema]);

  const itemKeys = useMemo(() => items.map((item) => item.key).join("|"), [items]);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenItems((prev) => {
      const next: Record<string, boolean> = {};
      for (const item of items) {
        next[item.key] = prev[item.key] ?? false;
      }
      return next;
    });
  }, [itemKeys, items]);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderHeaderTitle = (index: number) => {
    const arraySchema = schema?.items as unknown;

    if (Array.isArray(arraySchema)) {
      const tupleItem = arraySchema[index] as { title?: unknown } | undefined;
      if (tupleItem && typeof tupleItem.title === "string") {
        return tupleItem.title;
      }
    } else if (arraySchema && typeof (arraySchema as { title?: unknown }).title === "string") {
      return `${(arraySchema as { title: string }).title} ${index + 1}`;
    }

    return `Mục ${index + 1}`;
  };

  return (
    <div className="space-y-3">
      {title || description ? (
        <div className="space-y-1">
          {title ? <Label className="text-sm font-medium">{title}</Label> : null}
          {description}
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => {
          const isOpen = openItems[item.key] ?? false;
          const headerTitle = renderHeaderTitle(item.index);

          return (
            <Card key={item.key}>
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="text-sm font-medium text-foreground">{headerTitle}</div>
                <div className="flex flex-wrap items-center gap-2">
                  {item.hasMoveUp ? (
                    <Button type="button" variant="outline" size="sm" onClick={item.onReorderClick(item.index, item.index - 1)}>
                      <ChevronUp className="me-1 size-4" /> Lên
                    </Button>
                  ) : null}
                  {item.hasMoveDown ? (
                    <Button type="button" variant="outline" size="sm" onClick={item.onReorderClick(item.index, item.index + 1)}>
                      <ChevronDown className="me-1 size-4" /> Xuống
                    </Button>
                  ) : null}
                  {item.hasRemove ? (
                    <Button type="button" variant="destructive" size="sm" onClick={item.onDropIndexClick(item.index)}>
                      <Trash2 className="me-1 size-4" /> Xóa
                    </Button>
                  ) : null}
                  <Button type="button" variant="ghost" size="sm" onClick={() => toggleItem(item.key)}>
                    {isOpen ? <ChevronUp className="me-1 size-4" /> : <ChevronDown className="me-1 size-4" />}
                    <span className="text-xs">{isOpen ? "Thu gọn" : "Mở"}</span>
                  </Button>
                </div>
              </div>
              {isOpen ? <CardContent className="space-y-3 pt-0">{item.children}</CardContent> : null}
            </Card>
          );
        })}
      </div>

      {canAdd ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.preventDefault();
            onAddClick(event);
          }}
        >
          <Plus className="me-1 size-4" /> {addLabel}
        </Button>
      ) : null}
    </div>
  );
}

function BaseInputWidget(props: WidgetProps & { type?: string }) {
  const { id, required, disabled, readonly, value, onChange, onBlur, onFocus, options, placeholder, type } = props;
  const inputType = (type || (options.inputType as string) || "text").toLowerCase();
  const stringValue = value === undefined || value === null ? "" : String(value);

  return (
    <Input
      id={id}
      type={inputType}
      required={required}
      disabled={disabled}
      readOnly={readonly}
      value={stringValue}
      placeholder={String(options.placeholder ?? placeholder ?? "")}
      onChange={(event) => {
        const next = event.target.value;
        if (inputType === "number") {
          if (next === "") {
            onChange(options.emptyValue ?? undefined);
          } else {
            const parsed = Number(next);
            onChange(Number.isNaN(parsed) ? options.emptyValue ?? undefined : parsed);
          }
        } else {
          if (next === "" && options.emptyValue !== undefined) {
            onChange(options.emptyValue);
          } else {
            onChange(next);
          }
        }
      }}
      onBlur={onBlur && ((event) => onBlur(id, event.target.value))}
      onFocus={onFocus && ((event) => onFocus(id, event.target.value))}
    />
  );
}

function TextareaWidget(props: WidgetProps) {
  const { id, required, disabled, readonly, value, onChange, onBlur, onFocus, options, placeholder } = props;
  const stringValue = value === undefined || value === null ? "" : String(value);
  return (
    <Textarea
      id={id}
      required={required}
      disabled={disabled}
      readOnly={readonly}
      value={stringValue}
      placeholder={String(options.placeholder ?? placeholder ?? "")}
      rows={(options.rows as number) || 4}
      onChange={(event) => {
        const next = event.target.value;
        if (next === "" && options.emptyValue !== undefined) {
          onChange(options.emptyValue);
        } else {
          onChange(next);
        }
      }}
      onBlur={onBlur && ((event) => onBlur(id, event.target.value))}
      onFocus={onFocus && ((event) => onFocus(id, event.target.value))}
    />
  );
}

function SelectWidget(props: WidgetProps) {
  const { id, required, disabled, readonly, value, onChange, options, placeholder, onBlur, onFocus } = props;
  const enumOptions = Array.isArray(options.enumOptions) ? options.enumOptions : [];
  return (
    <select
      id={id}
      required={required}
      disabled={disabled}
      className="border-input bg-background text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex h-9 w-full rounded-md border px-3 py-1"
      value={value ?? ""}
      onChange={(event) => {
        const next = event.target.value;
        if (next === "" && options.emptyValue !== undefined) {
          onChange(options.emptyValue);
        } else {
          onChange(next);
        }
      }}
      onBlur={onBlur && ((event) => onBlur(id, event.target.value))}
      onFocus={onFocus && ((event) => onFocus(id, event.target.value))}
    >
      <option value="">{String(placeholder ?? options.placeholder ?? "Chọn")}</option>
      {enumOptions.map((opt: any, index: number) => (
        <option key={index} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function CheckboxWidget(props: WidgetProps) {
  const { id, value, required, disabled, readonly, label, onChange } = props;
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={!!value}
        disabled={disabled || readonly}
        onCheckedChange={(checked) => onChange(Boolean(checked))}
      />
      {label ? (
        <Label htmlFor={id} className="text-sm">
          {label}
          {required ? <span className="ms-1 text-destructive">*</span> : null}
        </Label>
      ) : null}
    </div>
  );
}

type MediaWidgetProps = WidgetProps & { mediaKind: "image" | "video" };

function IconPickerWidget({ value, onChange, disabled, readonly, options }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const iconOptions = useMemo(() => {
    const enumOptions = options.enumOptions as { label: string; value: string }[] | undefined;

    if (Array.isArray(enumOptions) && enumOptions.length > 0) {
      const labelMap = new Map(enumOptions.map((option) => [String(option.value), option.label]));

      return ICON_OPTIONS.filter((option) => labelMap.has(option.value)).map((option) => ({
        ...option,
        label: labelMap.get(option.value) ?? option.label,
      }));
    }

    return ICON_OPTIONS;
  }, [options]);

  const selected = iconOptions.find((option) => option.value === value);

  const handleSelect = (next?: IconKey) => {
    if (disabled || readonly) {
      return;
    }

    const fallback = (options.emptyValue as string | undefined) ?? undefined;
    onChange(next ?? fallback);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="flex w-full items-center justify-between"
        disabled={disabled || readonly}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-2">
          {selected ? <selected.Icon className="size-4" /> : <Sparkles className="size-4 text-muted-foreground" />}
          <span className="text-sm">{selected ? selected.label : "Chọn icon"}</span>
        </span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen ? "rotate-180" : "rotate-0")} />
      </Button>
      {isOpen ? (
        <div className="rounded-md border bg-card">
          <div className="grid grid-cols-3 gap-2 p-3">
            {iconOptions.map((option, index) => {
              const IconComponent = option.Icon;
              const isActive = option.value === value;

              return (
                <button
                  key={`${option.value}-${index}`}
                  type="button"
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md border px-3 py-2 text-xs transition",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                  onClick={() => handleSelect(option.value)}
                  disabled={disabled || readonly}
                >
                  <IconComponent className="size-5" />
                  <span className="text-center leading-tight">{option.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end border-t px-3 py-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => handleSelect(undefined)} disabled={disabled || readonly}>
              Xóa icon
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MediaWidget({ mediaKind, id, value, required, disabled, readonly, onChange, onBlur, onFocus, options, placeholder }: MediaWidgetProps) {
  const [open, setOpen] = useState(false);
  const stringValue = value === undefined || value === null ? "" : String(value);
  const isVideo = mediaKind === "video";
  const buttonLabel = isVideo ? "Chọn video" : "Chọn ảnh";
  const preview = !stringValue
    ? null
    : isVideo ? (
        <video src={stringValue} controls className="mt-2 w-full max-h-48 rounded border object-cover" />
      ) : (
        <img src={stringValue} alt="preview" className="mt-2 max-h-48 w-auto rounded border object-contain" />
      );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          id={id}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          value={stringValue}
          placeholder={String(options.placeholder ?? placeholder ?? "https://...")}
          onChange={(event) => {
            const next = event.target.value;
            if (next === "" && options.emptyValue !== undefined) {
              onChange(options.emptyValue);
            } else {
              onChange(next);
            }
          }}
          onBlur={onBlur && ((event) => onBlur(id, event.target.value))}
          onFocus={onFocus && ((event) => onFocus(id, event.target.value))}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} disabled={disabled || readonly}>
          {isVideo ? <VideoIcon className="me-1 size-4" /> : <ImageIcon className="me-1 size-4" />} {buttonLabel}
        </Button>
        {stringValue ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onChange(options.emptyValue ?? undefined)}
            disabled={disabled || readonly}
            aria-label="Xóa giá trị"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
      {preview}
      <MediaPickerDialog
        kind={mediaKind}
        open={open}
        onOpenChange={setOpen}
        onSelect={(url) => {
          onChange(url);
          setOpen(false);
        }}
      />
    </div>
  );
}

type MediaPickerDialogProps = {
  kind: "image" | "video";
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSelect: (url: string) => void;
};

function MediaPickerDialog({ kind, open, onOpenChange, onSelect }: MediaPickerDialogProps) {
  const media = useQuery(api.media.list, { kind: kind as any });
  const isVideo = kind === "video";
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMedia = useMemo(() => {
    if (!media) return [];
    if (!searchQuery.trim()) return media;
    
    const query = searchQuery.toLowerCase();
    return media.filter((item: any) => {
      const title = item.title || "";
      return title.toLowerCase().includes(query);
    });
  }, [media, searchQuery]);

  const isLoading = !media;
  const isEmpty = media && media.length === 0;
  const hasNoResults = filteredMedia.length === 0 && searchQuery;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] md:max-w-6xl lg:max-w-7xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{isVideo ? "Chọn video từ Media" : "Chọn ảnh từ Media"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder={isVideo ? "Tìm kiếm video..." : "Tìm kiếm ảnh..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8"
              aria-label={isVideo ? "Tìm kiếm video" : "Tìm kiếm ảnh"}
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Media Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-lg border bg-muted animate-pulse">
                    <div className="h-40 w-full rounded-t-lg bg-muted-foreground/10" />
                    <div className="p-3">
                      <div className="h-4 w-3/4 rounded bg-muted-foreground/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  {isVideo ? "Chưa có video nào" : "Chưa có ảnh nào"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Hãy thêm media từ trang Quản lý Media
                </p>
              </div>
            ) : hasNoResults ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Không tìm thấy kết quả
                </p>
                <p className="text-sm text-muted-foreground">
                  Thử tìm kiếm với từ khóa khác
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((item: any) => {
                  const mediaUrl = isVideo ? item.externalUrl : item.url;
                  const title = item.title || (isVideo ? "Video" : "Ảnh");
                  return (
                    <button
                      key={String(item._id)}
                      type="button"
                      onClick={() => mediaUrl && onSelect(mediaUrl)}
                      className="
                        group
                        rounded-lg border bg-card
                        text-left
                        transition-all
                        hover:border-primary
                        focus:outline-none
                        focus:ring-2 focus:ring-ring focus:ring-offset-2
                        min-h-[44px] min-w-[44px]
                      "
                      aria-label={`Chọn ${title}`}
                    >
                      {mediaUrl ? (
                        <div className="relative h-40 w-full rounded-t-lg overflow-hidden bg-[repeating-conic-gradient(#d4d4d4_0%_25%,_white_0%_50%)] [background-size:20px_20px]">
                          {isVideo ? (
                            <video 
                              src={mediaUrl} 
                              className="h-full w-full object-contain"
                              preload="metadata"
                            />
                          ) : (
                            <img 
                              src={mediaUrl} 
                              alt={title} 
                              className="h-full w-full object-contain p-2"
                              loading="lazy"
                            />
                          )}
                          <div className="
                            absolute inset-0 
                            bg-black/0 
                            group-hover:bg-black/10 
                            transition-colors
                          " />
                        </div>
                      ) : (
                        <div className="flex h-40 w-full items-center justify-center rounded-t-lg bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Info */}
          {!isLoading && !isEmpty && (
            <div className="text-sm text-muted-foreground text-center pt-2 border-t">
              Hiển thị {filteredMedia.length} {isVideo ? "video" : "ảnh"}
              {searchQuery && ` (từ ${media?.length || 0} tổng cộng)`}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
