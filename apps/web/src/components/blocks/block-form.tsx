"use client";

import { useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import { BLOCK_PRESETS, type BlockPreset } from "./block-presets";
import { ChevronDown, ChevronUp, Image as ImageIcon, Plus, Trash2, Video as VideoIcon, X } from "lucide-react";

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

  return (
    <div className="space-y-3">
      {title || description ? (
        <div className="space-y-1">
          {title ? <Label className="text-sm font-medium">{title}</Label> : null}
          {description}
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.key}>
            <CardContent className="space-y-3 pt-4">
              {item.children}
              <div className="flex flex-wrap items-center justify-end gap-2">
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
              </div>
            </CardContent>
          </Card>
        ))}
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isVideo ? "Chọn video từ Media" : "Chọn ảnh từ Media"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media?.map((item: any) => {
            const mediaUrl = isVideo ? item.externalUrl : item.url;
            const title = item.title || (isVideo ? "Video" : "Ảnh");
            return (
              <button
                key={String(item._id)}
                type="button"
                onClick={() => mediaUrl && onSelect(mediaUrl)}
                className="rounded border p-1 text-left transition hover:ring-2 hover:ring-ring"
              >
                {mediaUrl ? (
                  isVideo ? (
                    <video src={mediaUrl} className="h-24 w-full rounded object-cover" />
                  ) : (
                    <img src={mediaUrl} alt={title} className="h-24 w-full rounded object-cover" />
                  )
                ) : (
                  <div className="flex h-24 w-full items-center justify-center rounded bg-muted text-xs">Không có URL</div>
                )}
                <div className="mt-1 truncate px-1 text-xs">{title}</div>
              </button>
            );
          })}
          {!media ? <div className="text-sm text-muted-foreground">Đang tải...</div> : null}
          {media && media.length === 0 ? <div className="text-sm text-muted-foreground">Chưa có media</div> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
