"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react";

type PostDoc = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnailId?: string;
  author?: string;
  tags?: string[];
  viewCount: number;
  order: number;
  active: boolean;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
};

type SortColumn = "title" | "viewCount" | "order" | "createdAt" | null;
type SortDirection = "asc" | "desc";

export default function PostListPage() {
  const posts = useQuery(api.posts.listPosts, {}) as PostDoc[] | undefined;
  const setPostActive = useMutation(api.posts.setPostActive);
  const deletePost = useMutation(api.posts.deletePost);

  const [selected, setSelected] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const items = posts ?? [];

  const sortedItems = useMemo(() => {
    let result = [...items];

    if (sortColumn) {
      result.sort((a: any, b: any) => {
        let aVal: any;
        let bVal: any;

        switch (sortColumn) {
          case "title":
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          case "viewCount":
            aVal = a.viewCount || 0;
            bVal = b.viewCount || 0;
            break;
          case "order":
            aVal = a.order || 0;
            bVal = b.order || 0;
            break;
          case "createdAt":
            aVal = a.createdAt || 0;
            bVal = b.createdAt || 0;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, sortColumn, sortDirection]);

  const allIdsOnPage = useMemo(() => sortedItems.map((x) => String(x._id)), [sortedItems]);

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
  }

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  function SortIcon({ column }: { column: SortColumn }) {
    if (sortColumn !== column) {
      return <ArrowUpDown className="size-3.5 ml-1 inline" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="size-3.5 ml-1 inline" />
    ) : (
      <ArrowDown className="size-3.5 ml-1 inline" />
    );
  }

  async function onBulkDelete() {
    if (selected.length === 0) return;
    if (!window.confirm(`Xóa ${selected.length} bài viết đã chọn?`)) return;
    try {
      await Promise.all(selected.map((id) => deletePost({ id: id as any })));
      setSelected([]);
      toast.success("Đã xóa các mục đã chọn");
    } catch (e: any) {
      toast.error(e?.message ?? "Lỗi xóa hàng loạt");
    }
  }

  async function handleToggleActive(post: PostDoc) {
    try {
      await setPostActive({ id: post._id as any, active: !post.active });
      toast.success(post.active ? "Đã ẩn bài viết" : "Đã xuất bản bài viết");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function handleDelete(post: PostDoc) {
    if (!window.confirm(`Xóa bài viết "${post.title}"?`)) return;
    try {
      await deletePost({ id: post._id as any });
      toast.success("Đã xóa bài viết");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa bài viết");
    }
  }

  function formatDate(timestamp?: number) {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleDateString("vi-VN");
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quản lý bài viết</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const on = selected.length < allIdsOnPage.length;
            setSelected(on ? allIdsOnPage : []);
          }}>
            {selected.length < allIdsOnPage.length ? "Chọn tất cả" : "Bỏ chọn tất cả"}
          </Button>
          <Button variant="destructive" disabled={selected.length === 0} onClick={onBulkDelete}>
            Xóa đã chọn
          </Button>
          <Button asChild>
            <Link href="/dashboard/post/new">
              <Plus className="mr-2 size-4" />
              Thêm bài viết
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài viết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-md border">
            <div className="flex items-center gap-3 p-3 bg-muted/30 text-sm text-muted-foreground">
              <div className="w-8" />
              <button
                onClick={() => handleSort("title")}
                className="flex-1 text-left hover:text-foreground transition-colors cursor-pointer"
              >
                Tiêu đề
                <SortIcon column="title" />
              </button>
              <button
                onClick={() => handleSort("viewCount")}
                className="w-24 text-left hover:text-foreground transition-colors cursor-pointer"
              >
                Lượt xem
                <SortIcon column="viewCount" />
              </button>
              <div className="w-24">Trạng thái</div>
              <button
                onClick={() => handleSort("createdAt")}
                className="w-28 text-left hover:text-foreground transition-colors cursor-pointer"
              >
                Ngày tạo
                <SortIcon column="createdAt" />
              </button>
              <div className="w-32">Hành động</div>
            </div>

            {sortedItems.map((post) => (
              <div key={String(post._id)} className="flex items-center gap-3 p-3">
                <div className="w-8 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(String(post._id))}
                    onChange={(e) => toggleSelect(String(post._id), e.currentTarget.checked)}
                  />
                </div>
                <div className="flex-1 truncate font-medium">{post.title}</div>
                <div className="w-24 text-sm flex items-center gap-1">
                  <Eye className="size-3.5 text-muted-foreground" />
                  {post.viewCount ?? 0}
                </div>
                <div className="w-24">
                  <button
                    onClick={() => handleToggleActive(post)}
                    className={`text-xs px-2 py-1 rounded ${
                      post.active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                    title={post.active ? "Click để ẩn" : "Click để xuất bản"}
                  >
                    {post.active ? "Đã xuất bản" : "Bản nháp"}
                  </button>
                </div>
                <div className="w-28 text-sm text-muted-foreground">{formatDate(post.createdAt)}</div>
                <div className="w-32 flex items-center gap-1.5">
                  <Button size="icon" variant="outline" title="Sửa" aria-label="Sửa" asChild>
                    <Link href={`/dashboard/post/${post._id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    title="Xóa"
                    aria-label="Xóa"
                    onClick={() => handleDelete(post)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}

            {sortedItems.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Chưa có bài viết nào
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
