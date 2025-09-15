"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { BlockForm, formSupportedKinds, hasBlockSchema } from "@/components/blocks/block-form";
import { getTemplate } from "@/components/blocks/block-templates";

export default function HomeBlockCreatePage() {
  const router = useRouter();

  const page = useQuery(api.pages.getBySlug, { slug: "home" });
  const blocks = useQuery(api.pageBlocks.getForPage, page?._id ? { pageId: page._id as any } : "skip");
  const create = useMutation(api.pageBlocks.create);

  const kinds = formSupportedKinds();
  const [kind, setKind] = useState<string>(kinds[0] || "hero");
  const [mode, setMode] = useState<"form" | "json">("form");
  const [formData, setFormData] = useState<any>(() => getTemplate(kinds[0] || "") || {});
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(getTemplate(kinds[0] || "") || {}, null, 2));
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [active, setActive] = useState<boolean>(true);

  useEffect(() => {
    const tpl = getTemplate(kind) || {};
    setFormData(tpl);
    setJsonText(JSON.stringify(tpl, null, 2));
    setMode(hasBlockSchema(kind) ? "form" : "json");
  }, [kind]);

  const nextOrder = useMemo(() => (blocks?.length ?? 0), [blocks?.length]);

  async function onCreate() {
    if (!page?._id) return toast.error("Chưa có trang 'home'");
    try {
      const data = mode === "form" ? (formData ?? {}) : JSON.parse(jsonText || "{}");
      const id = await create({
        pageId: page._id as any,
        kind,
        order: nextOrder,
        isVisible,
        active,
        data,
      } as any);
      if (id?._id) {
        toast.success("Đã tạo block");
        router.push(`/dashboard/home-blocks/${String(id._id)}`);
      } else {
        toast.success("Đã tạo block");
        router.push(`/dashboard/home-blocks`);
      }
    } catch (e) {
      toast.error("Không thể tạo. Kiểm tra JSON hoặc dữ liệu.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/home-blocks"><ArrowLeft className="size-4" /> Quay lại</Link>
        </Button>
        <h1 className="text-xl font-semibold">Tạo block mới</h1>
        <div className="ms-auto flex items-center gap-1 rounded border p-1">
          <Button type="button" size="sm" variant={mode === "form" ? "default" : "ghost"} onClick={() => setMode("form")} disabled={!hasBlockSchema(kind)}>
            Form
          </Button>
          <Button type="button" size="sm" variant={mode === "json" ? "default" : "ghost"} onClick={() => setMode("json")}>
            JSON
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kind</Label>
              <select
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                {kinds.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="visible" checked={isVisible} onCheckedChange={() => setIsVisible((v) => !v)} />
              <Label htmlFor="visible">Visible</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="active" checked={active} onCheckedChange={() => setActive((v) => !v)} />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="space-y-1">
              <Label>Order kế tiếp</Label>
              <Input value={nextOrder} readOnly />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const tpl = getTemplate(kind);
                if (!tpl) return toast.message("Chưa có mẫu cho kind này");
                setFormData(tpl);
                setJsonText(JSON.stringify(tpl, null, 2));
              }}
            >
              <Lightbulb className="size-4 mr-1" /> Chèn mẫu
            </Button>
          </div>

          {mode === "form" ? (
            <BlockForm
              kind={kind}
              value={formData}
              onChange={(v) => {
                setFormData(v);
                setJsonText(JSON.stringify(v ?? {}, null, 2));
              }}
            />
          ) : (
            <div className="space-y-2">
              <Label>JSON</Label>
              <Textarea rows={20} value={jsonText} onChange={(e) => setJsonText(e.target.value)} />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/home-blocks">Hủy</Link>
            </Button>
            <Button onClick={onCreate}>Tạo</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

