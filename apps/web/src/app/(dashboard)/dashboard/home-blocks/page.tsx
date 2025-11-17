"use client";

// KISS: Quản lý blocks của trang 'home' (không thêm/xóa), có bulk actions, reorder Up/Down, toggle visible
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Doc } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { getTemplate } from "@/components/blocks/block-templates";

type Block = Doc<"page_blocks">;

export default function HomeBlocksPage() {
  const page = useQuery(api.pages.getBySlug, { slug: "home" });
  const blocks = useQuery(
    api.pageBlocks.getForPage,
    page?._id ? { pageId: page._id as any } : "skip"
  ) as Block[] | undefined;

  const seed = useMutation(api.seed.seedHome);
  const reorder = useMutation(api.pageBlocks.reorder);
  const toggleVisibility = useMutation(api.pageBlocks.toggleVisibility);
  const update = useMutation(api.pageBlocks.update);
  const bulkToggleVisibility = useMutation(api.pageBlocks.bulkToggleVisibility);

  const [selected, setSelected] = useState<string[]>([]);

  async function ensureSeed() {
    try {
      const res = await seed();
      if ((res as any)?.ok) toast.success("Khởi tạo dữ liệu trang chủ thành công");
    } catch {
      toast.error("Khởi tạo thất bại");
    }
  }

  async function move(id: string, dir: "up" | "down") {
    if (!blocks || !page?._id) return;
    const ids = blocks.map((b) => b._id as any);
    const idx = ids.findIndex((x) => String(x) === String(id));
    if (idx < 0) return;
    const swapWith = dir === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= ids.length) return;
    const next = [...ids];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    await reorder({ pageId: page._id as any, orderedIds: next });
  }

  async function onToggleVisible(b: Block) {
    await toggleVisibility({ id: b._id as any, isVisible: !b.isVisible });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Khối giao diện</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý thứ tự, hiển thị và nội dung các block của trang chủ.</p>
      </div>

      {!page && (
        <Card>
          <CardHeader>
            <CardTitle>Chưa có trang 'home'</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={ensureSeed}>Khởi tạo dữ liệu mẫu</Button>
          </CardContent>
        </Card>
      )}

      {page && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Danh sách block</CardTitle>
              <Button asChild>
                <Link href="/dashboard/home-blocks/new">Thêm block</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!blocks && <div className="text-sm text-muted-foreground">Đang tải...</div>}
            {blocks && blocks.length === 0 && (
              <div className="text-sm text-muted-foreground">Chưa có block. Hãy khởi tạo dữ liệu.</div>
            )}
            {blocks && blocks.length > 0 && (
              <div className="space-y-2">
                {/* Bulk toolbar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">Đã chọn: {selected.length}</div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (selected.length === 0) return;
                          await bulkToggleVisibility({ ids: selected as any, isVisible: true });
                          toast.success("Đã hiện các block đã chọn");
                        }}
                        disabled={selected.length === 0}
                      >
                        Hiện
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (selected.length === 0) return;
                          await bulkToggleVisibility({ ids: selected as any, isVisible: false });
                          toast.success("Đã ẩn các block đã chọn");
                        }}
                        disabled={selected.length === 0}
                      >
                        Ẩn
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (selected.length === 0 || !blocks) return;
                          for (const id of selected) {
                            const b = blocks.find((x) => String(x._id as any) === String(id));
                            if (!b) continue;
                            const tpl = getTemplate(b.kind);
                            if (!tpl) continue;
                            await update({ id: b._id as any, data: tpl });
                          }
                          toast.success("Đã chèn mẫu JSON cho các block đã chọn");
                        }}
                        disabled={selected.length === 0}
                      >
                        Chèn mẫu JSON
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="divide-y rounded-md border">
                  {/* Header row */}
                  <div className="flex items-center gap-3 p-3 bg-muted/30">
                    <div className="w-8 flex items-center justify-center">
                      <input
                        type="checkbox"
                        aria-label="chọn tất cả"
                        onChange={(e) => {
                          const checked = e.currentTarget.checked;
                          const idsOnPage = blocks.map((x) => String(x._id as any));
                          setSelected((prev) => (checked ? Array.from(new Set([...prev, ...idsOnPage])) : prev.filter((x) => !idsOnPage.includes(x))));
                        }}
                      />
                    </div>
                    <div className="w-8 text-muted-foreground text-sm">#</div>
                      <div className="flex-1 text-sm font-medium">Loại</div>
                      <div className="w-28 text-sm">Hiển thị</div>
                      <div className="w-36 text-sm">Hành động</div>
                  </div>

                  {blocks.map((b, i) => (
                    <div key={String(b._id)} className="flex items-center gap-3 p-3">
                      <div className="w-8 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(String(b._id as any))}
                          onChange={(e) => {
                            const checked = e.currentTarget.checked;
                            const id = String(b._id as any);
                            setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
                          }}
                        />
                      </div>
                      <div className="w-8 text-muted-foreground text-sm">{i + 1}</div>
                      <div className="flex-1">
                        <div className="font-medium">{b.kind}</div>
                        <div className="text-xs text-muted-foreground">order: {b.order} · updated: {new Date(b.updatedAt).toLocaleString()}</div>
                      </div>
                      <div className="w-28 flex items-center gap-2 text-sm">
                        <Checkbox id={`vis-${b._id}`} checked={b.isVisible} onCheckedChange={() => onToggleVisible(b)} />
                        <label htmlFor={`vis-${b._id}`} className="text-muted-foreground">Hiển thị</label>
                      </div>
                      <div className="w-36 flex items-center gap-1">
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/dashboard/home-blocks/${String(b._id)}`}>Sửa</Link>
                         </Button>
                        <Button variant="outline" size="icon" onClick={() => move(b._id as any, "up")} disabled={i === 0} title="Lên">
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => move(b._id as any, "down")} disabled={i === (blocks.length - 1)} title="Xuống">
                          <ChevronDown className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
