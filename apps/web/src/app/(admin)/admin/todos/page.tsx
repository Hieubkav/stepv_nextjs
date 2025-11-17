"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

type Status = "all" | "active" | "completed";

type TodoItem = {
  _id: Id<"todos">;
  text: string;
  completed: boolean;
  _creationTime: number;
};

type TodosResponse = {
  items: TodoItem[];
  total: number;
};

export default function AdminTodosListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const args = useMemo(
    () => ({ search: search || undefined, status, offset: (page - 1) * pageSize, limit: pageSize }),
    [search, status, page]
  );

  const data = useQuery(api.todos.list, args) as TodosResponse | undefined;
  const toggleTodo = useMutation(api.todos.toggle);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const bulkToggle = useMutation(api.todos.bulkToggle);
  const bulkDelete = useMutation(api.todos.bulkDelete);

  const [selected, setSelected] = useState<string[]>([]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const items = data?.items ?? [];
  const idsOnPage = items.map((t) => String(t._id));
  const allSelectedOnPage = idsOnPage.length > 0 && idsOnPage.every((id) => selected.includes(id));

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
  }

  function toggleSelectPage(checked: boolean) {
    setSelected((prev) => (checked ? Array.from(new Set([...prev, ...idsOnPage])) : prev.filter((x) => !idsOnPage.includes(x))));
  }

  async function onBulkDelete() {
    const ids = selected.filter((id) => idsOnPage.includes(id));
    if (ids.length === 0) return;
    await bulkDelete({ ids: ids as any });
    setSelected((prev) => prev.filter((x) => !ids.includes(x)));
    toast.success("Đã xóa các mục đã chọn");
  }

  async function onBulkToggle(completed: boolean) {
    const ids = selected.filter((id) => idsOnPage.includes(id));
    if (ids.length === 0) return;
    await bulkToggle({ ids: ids as any, completed });
    toast.success(completed ? "Đã đánh dấu hoàn thành" : "Đã bỏ đánh dấu hoàn thành");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Công việc</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/todos/new">
              <Plus className="size-4 mr-1.5" /> Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm công việc..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-8 w-64"
            />
          </div>
          <div className="ml-auto flex gap-2">
            {(["all", "active", "completed"] as const).map((s) => (
              <Button
                key={s}
                variant={status === s ? "default" : "secondary"}
                onClick={() => {
                  setPage(1);
                  setStatus(s);
                }}
              >
                {s === "all" ? "Tất cả" : s === "active" ? "Chưa xong" : "Đã xong"}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelectedOnPage}
            onCheckedChange={(v) => toggleSelectPage(Boolean(v))}
            aria-label="Chọn tất cả trong trang"
          />
          <span className="text-sm text-muted-foreground">Chọn tất cả trong trang</span>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" disabled={selected.length === 0} onClick={() => onBulkToggle(true)}>
              Đánh dấu đã xong
            </Button>
            <Button variant="outline" disabled={selected.length === 0} onClick={() => onBulkToggle(false)}>
              Đánh dấu chưa xong
            </Button>
            <Button variant="destructive" disabled={selected.length === 0} onClick={onBulkDelete}>
              Xóa đã chọn
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 pr-2 text-left font-medium">Chọn</th>
                <th className="py-2 pr-2 text-left font-medium">Xong</th>
                <th className="py-2 px-2 text-left font-medium">Nội dung</th>
                <th className="py-2 px-2 text-left font-medium">Tạo lúc</th>
                <th className="py-2 pl-2 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((todo) => {
                const id = todo._id as unknown as string;
                const checked = selected.includes(id);
                return (
                  <tr key={id} className="border-b last:border-0">
                    <td className="py-2 pr-2 align-middle">
                      <Checkbox checked={checked} onCheckedChange={(v) => toggleSelect(id, Boolean(v))} />
                    </td>
                    <td className="py-2 pr-2 align-middle">
                      <Checkbox checked={todo.completed} onCheckedChange={(v) => toggleTodo({ id: todo._id, completed: Boolean(v) })} />
                    </td>
                    <td className="py-2 px-2 align-middle">
                      <span className={todo.completed ? "line-through text-muted-foreground" : undefined}>{todo.text}</span>
                    </td>
                    <td className="py-2 px-2 align-middle text-muted-foreground">
                      {new Date(todo._creationTime).toLocaleString()}
                    </td>
                    <td className="py-2 pl-2 align-middle text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/todos/${id}/edit`}>
                              <Pencil className="size-4 mr-2" /> Sửa
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => { await deleteTodo({ id: todo._id }); toast.success("Đã xóa 1 mục"); }} className="text-red-600">
                            <Trash2 className="size-4 mr-2" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {data === undefined && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    Đang tải...
                  </td>
                </tr>
              )}
              {data && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    Không có công việc phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {total > 0
              ? `Hiển thị ${args.offset + 1}–${Math.min(args.offset + pageSize, total)} / ${total}`
              : ""}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Trước
            </Button>
            <div className="text-sm tabular-nums">
              Trang {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
