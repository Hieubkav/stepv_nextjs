"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { BlockForm, hasBlockSchema } from "@/components/blocks/block-form";
import { getTemplate } from "@/components/blocks/block-templates";

export function HomeBlockEditor({ id }: { id: string }) {
  const router = useRouter();
  const block = useQuery(api.pageBlocks.getById, id ? { id: id as any } : "skip");
  const update = useMutation(api.pageBlocks.update);

  const [mode, setMode] = useState<"form" | "json">("form");
  const [formData, setFormData] = useState<any>({});
  const [jsonText, setJsonText] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [active, setActive] = useState<boolean>(true);

  useEffect(() => {
    if (!block?._id) return;
    const data = block.data ?? {};
    setFormData(data);
    setJsonText(JSON.stringify(data, null, 2));
    setIsVisible(!!block.isVisible);
    setActive(!!block.active);
    setMode(hasBlockSchema(block.kind) ? "form" : "json");
  }, [block?._id]);

  async function onSave() {
    if (!block?._id) return;
    try {
      const data = mode === "form" ? formData ?? {} : JSON.parse(jsonText || "{}");
      await update({ id: block._id as any, data, isVisible, active });
      toast.success("Đã lưu block");
      // router.push("/dashboard/home-blocks"); // removed: keep user on the page after save
    } catch (e) {
      toast.error("Không thể lưu. Kiểm tra JSON hoặc dữ liệu.");
    }
  }

  if (!block) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/home-blocks"><ArrowLeft className="size-4" /> Quay lại</Link>
          </Button>
          <div className="text-sm text-muted-foreground">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (block === null) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/home-blocks"><ArrowLeft className="size-4" /> Quay lại</Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Không tìm thấy block</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/home-blocks"><ArrowLeft className="size-4" /> Quay lại</Link>
        </Button>
        <h1 className="text-xl font-semibold">Chỉnh sửa block</h1>
        <div className="ms-auto flex items-center gap-1 rounded border p-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "form" ? "default" : "ghost"}
            onClick={() => setMode("form")}
            disabled={!hasBlockSchema(block.kind)}
            title={hasBlockSchema(block.kind) ? "Dùng giao diện form" : "Loại này chưa có biểu mẫu"}
          >
            Form
          </Button>
          <Button type="button" size="sm" variant={mode === "json" ? "default" : "ghost"} onClick={() => setMode("json")}>
            JSON
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kind: {block.kind}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="visible" checked={isVisible} onCheckedChange={() => setIsVisible((v) => !v)} />
              <Label htmlFor="visible">Hiển thị</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="active" checked={active} onCheckedChange={() => setActive((v) => !v)} />
              <Label htmlFor="active">Kích hoạt</Label>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const tpl = getTemplate(block.kind);
                if (!tpl) return toast.message("Loại này chưa có mẫu");
                setFormData(tpl);
                setJsonText(JSON.stringify(tpl, null, 2));
              }}
            >
              <Lightbulb className="size-4 mr-1" /> Chèn mẫu
            </Button>
            {mode === "json" && hasBlockSchema(block.kind) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonText || "{}");
                    setFormData(parsed);
                    toast.success("Đã áp dụng JSON vào form");
                  } catch {
                    toast.error("JSON không hợp lệ");
                  }
                }}
              >
                Áp dụng JSON vào form
              </Button>
            )}
          </div>

          {mode === "form" ? (
            <BlockForm
              kind={block.kind}
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
            <Button onClick={onSave}>Lưu</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
