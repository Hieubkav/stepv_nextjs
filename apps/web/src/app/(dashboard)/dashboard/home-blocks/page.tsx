"use client";

// KISS: Quản lý blocks của trang 'home' (không thêm/xóa), chỉ reorder Up/Down, toggle visible, set status, edit JSON data.
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, FileJson, Lightbulb } from "lucide-react";

// KISS: Mau JSON goi y theo kind de chen nhanh
const JSON_TEMPLATES: Record<string, any> = {
  hero: {
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
  services: {
    title: "Dịch vụ",
    subtitle: "Những gì chúng tôi làm",
    items: [
      { icon: "", title: "Render 3D", description: "Mô tả ngắn" },
    ],
  },
  stats: {
    items: [
      { label: "Dự án", value: 120 },
      { label: "Khách hàng", value: 48 },
    ],
  },
  gallery: { images: [{ url: "/images/sample.jpg", alt: "Mẫu" }] },
  whyChooseUs: { title: "Vì sao chọn chúng tôi", items: [{ title: "Chất lượng", description: "..." }] },
  why3DVisuals: { title: "Tại sao 3D?", items: [{ title: "Nổi bật", description: "..." }] },
  turning: { title: "Chuyển đổi", items: [{ title: "Bước 1", description: "..." }] },
  weWork: { title: "Quy trình", items: [{ title: "Bước 1", description: "..." }] },
  stayControl: { title: "Kiểm soát", items: [{ title: "Tối ưu", description: "..." }] },
  contactForm: { title: "Liên hệ", recipientEmail: "hello@example.com" },
  wordSlider: { words: ["Từ khoá 1", "Từ khoá 2"] },
  yourAdvice: { title: "Lời khuyên", content: "..." },
};

type Block = any; // KISS: tránh phức tạp hoá types, dùng any cho UI

export default function HomeBlocksPage() {
  const page = useQuery(api.pages.getBySlug, { slug: "home" });
  const pageId = page?._id as any;
  const blocks = useQuery(api.pageBlocks.getForPage, page?._id ? { pageId: page._id as any } : "skip");

  const seed = useMutation(api.seed.seedHome);
  const reorder = useMutation(api.pageBlocks.reorder);
  const toggleVisibility = useMutation(api.pageBlocks.toggleVisibility);
  const setStatus = useMutation(api.pageBlocks.setStatus);
  const update = useMutation(api.pageBlocks.update);

  // Editor state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Block | null>(null);
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    if (!editing) return;
    setJsonText(JSON.stringify(editing.data ?? {}, null, 2));
  }, [editing?._id]);

  async function ensureSeed() {
    try {
      const res = await seed();
      if ((res as any)?.ok) toast.success("Khoi tao du lieu trang chu thanh cong");
    } catch {
      toast.error("Khoi tao that bai");
    }
  }

  async function move(id: string, dir: "up" | "down") {
    if (!blocks || !pageId) return;
    const ids = blocks.map((b) => b._id as any);
    const idx = ids.findIndex((x) => String(x) === String(id));
    if (idx < 0) return;
    const swapWith = dir === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= ids.length) return;
    const next = [...ids];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    await reorder({ pageId, orderedIds: next });
  }

  async function onToggleVisible(b: Block) {
    await toggleVisibility({ id: b._id as any, isVisible: !b.isVisible });
  }

  async function onSetStatus(b: Block, status: "draft" | "published") {
    await setStatus({ id: b._id as any, status });
  }

  async function onSaveJson() {
    if (!editing) return;
    try {
      const data = JSON.parse(jsonText || "{}");
      await update({ id: editing._id as any, data });
      setOpen(false);
      toast.success("Da luu noi dung block");
    } catch {
      toast.error("JSON khong hop le");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Home Blocks</h1>
        <p className="text-sm text-muted-foreground mt-1">Quan ly thu tu, hien thi va noi dung cac block cua trang chu.</p>
      </div>

      {!page && (
        <Card>
          <CardHeader>
            <CardTitle>Chua co trang 'home'</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={ensureSeed}>Khoi tao du lieu mau</Button>
          </CardContent>
        </Card>
      )}

      {page && (
        <Card>
          <CardHeader>
            <CardTitle>Danh sach block</CardTitle>
          </CardHeader>
          <CardContent>
            {!blocks && <div className="text-sm text-muted-foreground">Dang tai...</div>}
            {blocks && blocks.length === 0 && (
              <div className="text-sm text-muted-foreground">Chua co block. Hay khoi tao du lieu.</div>
            )}
            {blocks && blocks.length > 0 && (
              <div className="divide-y rounded-md border">
                {blocks.map((b, i) => (
                  <div key={String(b._id)} className="flex items-center gap-3 p-3">
                    <div className="w-8 text-muted-foreground text-sm">{i + 1}</div>
                    <div className="flex-1">
                      <div className="font-medium">{b.kind}</div>
                      <div className="text-xs text-muted-foreground">order: {b.order} • updated: {new Date(b.updatedAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={b.status === "published" ? "default" : "outline"}>{b.status}</Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => onSetStatus(b, b.status === "published" ? "draft" : "published")}
                          title={b.status === "published" ? "Chuyen ve draft" : "Publish"}>
                          {b.status === "published" ? "D" : "P"}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Checkbox id={`vis-${b._id}`} checked={b.isVisible} onCheckedChange={() => onToggleVisible(b)} />
                        <label htmlFor={`vis-${b._id}`} className="text-muted-foreground">Visible</label>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { setEditing(b); setOpen(true); }}>Edit JSON</Button>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => move(b._id as any, "up")} disabled={i === 0} title="Len">
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => move(b._id as any, "down")} disabled={i === (blocks.length - 1)} title="Xuong">
                          <ChevronDown className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="size-4" /> Edit data: {editing?.kind}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const k = editing?.kind || "";
                const tpl = JSON_TEMPLATES[k];
                if (!tpl) return toast.message("Chưa có mẫu cho kind này");
                setJsonText(JSON.stringify(tpl, null, 2));
              }}
            >
              <Lightbulb className="size-4 mr-1" /> Chen mau JSON
            </Button>
          </div>
          <Textarea className="mt-3" rows={16} value={jsonText} onChange={(e) => setJsonText(e.target.value)} />
          <DialogFooter className="justify-end">
            <Button onClick={onSaveJson}>Luu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
