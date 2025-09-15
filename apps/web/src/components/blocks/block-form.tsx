"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";

type PrimitiveType = "string" | "text" | "number" | "url" | "image" | "stringArray";

type ObjectFieldSchema = { [key: string]: PrimitiveType };

type FieldSchema =
  | { type: PrimitiveType; label: string; placeholder?: string }
  | { type: "array"; label: string; of: ObjectFieldSchema };

export type BlockSchema = { [key: string]: FieldSchema };

const SCHEMAS: Record<string, BlockSchema> = {
  hero: {
    titleLines: { type: "stringArray", label: "Dòng tiêu đề" },
    subtitle: { type: "text", label: "Mô tả ngắn" },
    brandLogos: { type: "array", label: "Logo thương hiệu", of: { url: "image", alt: "string" } },
    videoUrl: { type: "url", label: "URL video" },
    posterUrl: { type: "image", label: "Ảnh poster" },
    ctas: { type: "array", label: "Nút kêu gọi", of: { label: "string", url: "url" } },
  },
  services: {
    title: { type: "string", label: "Tiêu đề" },
    subtitle: { type: "string", label: "Mô tả" },
    items: { type: "array", label: "Dịch vụ", of: { icon: "string", title: "string", description: "text" } },
  },
  stats: {
    items: { type: "array", label: "Chỉ số", of: { label: "string", value: "number" } },
  },
  gallery: {
    images: { type: "array", label: "Ảnh", of: { url: "image", alt: "string" } },
  },
  whyChooseUs: {
    title: { type: "string", label: "Tiêu đề" },
    items: { type: "array", label: "Lý do", of: { title: "string", description: "text" } },
  },
  why3DVisuals: {
    title: { type: "string", label: "Tiêu đề" },
    items: { type: "array", label: "Điểm nổi bật", of: { title: "string", description: "text" } },
  },
  turning: {
    title: { type: "string", label: "Tiêu đề" },
    items: { type: "array", label: "Bước chuyển đổi", of: { title: "string", description: "text" } },
  },
  weWork: {
    title: { type: "string", label: "Tiêu đề" },
    items: { type: "array", label: "Quy trình", of: { title: "string", description: "text" } },
  },
  stayControl: {
    title: { type: "string", label: "Tiêu đề" },
    items: { type: "array", label: "Điểm kiểm soát", of: { title: "string", description: "text" } },
  },
  contactForm: {
    title: { type: "string", label: "Tiêu đề" },
    recipientEmail: { type: "string", label: "Email nhận" },
  },
  wordSlider: {
    words: { type: "stringArray", label: "Từ khóa" },
  },
  yourAdvice: {
    title: { type: "string", label: "Tiêu đề" },
    content: { type: "text", label: "Nội dung" },
  },
};

export function hasBlockSchema(kind: string) {
  return !!SCHEMAS[kind];
}

type BlockFormProps = {
  kind: string;
  value: any;
  onChange: (v: any) => void;
};

export function BlockForm({ kind, value, onChange }: BlockFormProps) {
  const schema = SCHEMAS[kind];
  if (!schema) {
    return (
      <div className="text-sm text-muted-foreground">
        Chưa có form cho kind "{kind}". Vui lòng dùng tab JSON.
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {Object.entries(schema).map(([field, def]) => (
        <FieldRenderer key={field} name={field} def={def as any} value={value?.[field]} onChange={(v) => onChange({ ...(value || {}), [field]: v })} />
      ))}
    </div>
  );
}

function FieldRenderer({ name, def, value, onChange }: { name: string; def: FieldSchema; value: any; onChange: (v: any) => void }) {
  if (def.type === "array") {
    const items: any[] = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2">
        <Label>{def.label}</Label>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <Card key={idx}>
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">#{idx + 1}</div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" disabled={idx === 0} onClick={() => moveIdx(items, idx, idx - 1, onChange)}>
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon" disabled={idx === items.length - 1} onClick={() => moveIdx(items, idx, idx + 1, onChange)}>
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => removeIdx(items, idx, onChange)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                {Object.entries(def.of).map(([k, type]) => (
                  <PrimitiveField key={k} label={labelize(k)} type={type as PrimitiveType} value={item?.[k]} onChange={(v) => onChange(replaceIdx(items, idx, { ...(item || {}), [k]: v }))} />
                ))}
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" size="sm" onClick={() => onChange([...(items || []), emptyOf(def.of)])}>
            <Plus className="size-4 mr-1" /> Thêm
          </Button>
        </div>
      </div>
    );
  }

  // Primitive or stringArray
  return <PrimitiveField label={def.label} type={(def as any).type} value={value} onChange={onChange} placeholder={(def as any).placeholder} />;
}

function PrimitiveField({ label, type, value, onChange, placeholder }: { label: string; type: PrimitiveType; value: any; onChange: (v: any) => void; placeholder?: string }) {
  if (type === "text") {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      </div>
    );
  }
  if (type === "number") {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} placeholder={placeholder} />
      </div>
    );
  }
  if (type === "stringArray") {
    const arr: string[] = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="space-y-2">
          {arr.map((it, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input className="flex-1" value={it ?? ""} onChange={(e) => onChange(replaceIdx(arr, idx, e.target.value))} />
              <Button variant="outline" size="icon" disabled={idx === 0} onClick={() => onChange(moveIdxLocal(arr, idx, idx - 1))}>
                <ChevronUp className="size-4" />
              </Button>
              <Button variant="outline" size="icon" disabled={idx === arr.length - 1} onClick={() => onChange(moveIdxLocal(arr, idx, idx + 1))}>
                <ChevronDown className="size-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => onChange(arr.filter((_, i) => i !== idx))}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => onChange([...(arr || []), ""]) }>
            <Plus className="size-4 mr-1" /> Thêm dòng
          </Button>
        </div>
      </div>
    );
  }
  if (type === "image") {
    return <ImageField label={label} value={value} onChange={onChange} />;
  }
  // string or url
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function labelize(key: string) {
  // simple label from key
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/_/g, " ");
}

function emptyOf(of: ObjectFieldSchema) {
  const obj: any = {};
  for (const [k, t] of Object.entries(of)) {
    if (t === "string" || t === "text" || t === "url" || t === "image") obj[k] = "";
    else if (t === "number") obj[k] = 0;
    else if (t === "stringArray") obj[k] = [];
  }
  return obj;
}

function replaceIdx<T>(arr: T[], idx: number, v: T) {
  const next = [...arr];
  next[idx] = v;
  return next;
}

function removeIdx<T>(arr: T[], idx: number, onChange: (v: T[]) => void) {
  const next = arr.filter((_, i) => i !== idx);
  onChange(next);
}

function moveIdx<T>(arr: T[], from: number, to: number, onChange: (v: T[]) => void) {
  const next = moveIdxLocal(arr, from, to);
  onChange(next);
}

function moveIdxLocal<T>(arr: T[], from: number, to: number) {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function ImageField({ label, value, onChange }: { label: string; value?: string; onChange: (v?: string) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input className="flex-1" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="https://... hoặc chọn từ Media" />
        <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
          <ImageIcon className="size-4 mr-1" /> Chọn ảnh
        </Button>
      </div>
      {value ? (
        <img src={value} alt="preview" className="mt-2 max-h-40 rounded border object-contain" />
      ) : null}
      <ImagePickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(url) => { onChange(url); setPickerOpen(false); }} />
    </div>
  );
}

function ImagePickerDialog({ open, onOpenChange, onSelect }: { open: boolean; onOpenChange: (v: boolean) => void; onSelect: (url: string) => void }) {
  const media = useQuery(api.media.list, { kind: "image" as any });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chọn ảnh từ Media</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media?.map((m: any) => (
            <button
              key={String(m._id)}
              type="button"
              onClick={() => m.url && onSelect(m.url)}
              className="border rounded p-1 hover:ring-2 hover:ring-ring transition"
              title={m.title || "image"}
            >
              {m.url ? (
                <img src={m.url} alt={m.title || "image"} className="w-full h-24 object-cover rounded" />
              ) : (
                <div className="w-full h-24 bg-muted rounded flex items-center justify-center text-xs">No URL</div>
              )}
              <div className="text-xs truncate mt-1 px-1">{m.title || ""}</div>
            </button>
          ))}
          {!media && <div className="text-sm text-muted-foreground">Đang tải...</div>}
          {media && media.length === 0 && <div className="text-sm text-muted-foreground">Chưa có ảnh</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function formSupportedKinds() {
  return Object.keys(SCHEMAS);
}

