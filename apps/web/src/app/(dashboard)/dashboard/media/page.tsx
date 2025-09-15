"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMediaModal } from "@/context/media-modal-provider";
import { toast } from "sonner";
import { Pencil, ImageUp, Trash2, ExternalLink } from "lucide-react";

type MediaDoc = any;

export default function MediaPage() {
  const list = useQuery(api.media.list, {});
  const remove = useMutation(api.media.remove);
  const forceRemove = useMutation((api as any).media.forceRemove);
  const update = useMutation(api.media.update);
  const { toggle } = useMediaModal();

  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<MediaDoc | null>(null);
  const [title, setTitle] = useState("");
  const replaceTargetId = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const items = list ?? [];
  const allIdsOnPage = useMemo(() => items.map((x: any) => String(x._id)), [items]);

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
  }

  async function onBulkDelete() {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map((id) => remove({ id: id as any })));
      setSelected([]);
      toast.success("Đã xóa các mục đã chọn");
    } catch (e: any) {
      toast.error(e?.message ?? "Lỗi xóa hàng loạt");
    }
  }

  function openEdit(doc: MediaDoc) {
    setEditing(doc);
    setTitle(doc.title || "");
  }

  async function onSaveTitle() {
    if (!editing) return;
    try {
      await update({ id: editing._id as any, title: title || undefined });
      setEditing(null);
      toast.success("Đã cập nhật tiêu đề");
    } catch (e: any) {
      toast.error(e?.message ?? "Lỗi cập nhật");
    }
  }

  function onPickReplace(id: string) {
    replaceTargetId.current = id;
    fileInputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.currentTarget.value = ""; // reset for same-file reselect
    const id = replaceTargetId.current;
    if (!f || !id) return;
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("id", id);
      const res = await fetch("/api/media/replace", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Replace failed");
      toast.success("Đã thay ảnh");
    } catch (e: any) {
      toast.error(e?.message ?? "Lỗi thay ảnh");
    } finally {
      replaceTargetId.current = null;
    }
  }

  function fmtBytes(bytes?: number) {
    if (!bytes || bytes <= 0) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  }

  function aspect(width?: number, height?: number) {
    if (!width || !height) return "—";
    // Hiển thị tỉ lệ nguyên gốc (không rút gọn)
    return `${width}:${height}`;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Thư viện</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const on = selected.length < allIdsOnPage.length;
            setSelected(on ? allIdsOnPage : []);
          }}>
            {selected.length < allIdsOnPage.length ? "Chọn tất cả" : "Bỏ chọn tất cả"}
          </Button>
          <Button variant="destructive" disabled={selected.length === 0} onClick={onBulkDelete}>Xóa đã chọn</Button>
          <Button onClick={toggle}>Thêm media</Button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            <div className="flex items-center gap-3 p-3 bg-muted/30 text-sm text-muted-foreground">
              <div className="w-8" />
              <div className="w-16">Loại</div>
              <div className="w-28">Xem trước</div>
              <div className="flex-1">Tiêu đề</div>
              <div className="w-28">Kích thước</div>
              <div className="w-28">Tỉ lệ</div>
              <div className="w-64">Link</div>
              <div className="w-36">Hành động</div>
            </div>

            {items.map((m: any) => (
              <div key={String(m._id)} className="flex items-center gap-3 p-3">
                <div className="w-8 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(String(m._id))}
                    onChange={(e) => toggleSelect(String(m._id), e.currentTarget.checked)}
                  />
                </div>
                <div className="w-16 text-sm font-medium capitalize">{m.kind}</div>
                <div className="w-28">
                  {m.kind === "image" ? (
                    <img src={m.url} alt={m.title || "image"} className="w-28 h-16 object-cover rounded" />
                  ) : (
                    <a href={m.externalUrl} target="_blank" className="block w-28 h-16 bg-muted rounded text-xs flex items-center justify-center">Video</a>
                  )}
                </div>
                <div className="flex-1 truncate">{m.title || (m.kind === "image" ? "Ảnh" : "Video")}</div>
                <div className="w-28 text-sm text-muted-foreground">{m.kind === "image" ? fmtBytes(m.sizeBytes) : "—"}</div>
                <div className="w-28 text-sm text-muted-foreground whitespace-nowrap">{m.kind === "image" ? aspect(m.width, m.height) : "—"}</div>
                <div className="w-64 text-xs text-muted-foreground break-all">
                  {m.kind === "image" ? (
                    <a href={(m as any).url} target="_blank" className="underline" title={(m as any).url}>{(m as any).url}</a>
                  ) : (
                    <a href={(m as any).externalUrl} target="_blank" className="underline" title={(m as any).externalUrl}>{(m as any).externalUrl}</a>
                  )}
                </div>
                <div className="w-36 flex items-center gap-2">
                  <Button size="icon" variant="outline" title="Sửa tiêu đề" aria-label="Sửa tiêu đề" onClick={() => openEdit(m)}>
                    <Pencil className="size-4" />
                  </Button>
                  {m.kind === "image" && (
                    <Button size="icon" variant="outline" title="Thay ảnh" aria-label="Thay ảnh" onClick={() => onPickReplace(String(m._id))}>
                      <ImageUp className="size-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    title="Mở trong tab mới"
                    aria-label="Mở trong tab mới"
                    onClick={() => {
                      const href = m.kind === "image" ? (m as any).url : (m as any).externalUrl;
                      if (href) window.open(href, "_blank");
                    }}
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                  <Button size="icon" variant="destructive" title="Xóa" aria-label="Xóa" onClick={async () => {
                    try {
                      await remove({ id: m._id });
                    } catch {
                      await forceRemove({ id: m._id as any });
                    }
                  }}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa tiêu đề</DialogTitle>
          </DialogHeader>
          <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          <DialogFooter>
            <Button onClick={onSaveTitle}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
