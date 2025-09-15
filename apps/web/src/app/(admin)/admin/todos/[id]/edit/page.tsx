"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

export default function AdminTodosEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id as unknown as Id<"todos">;
  const data = useQuery(api.todos.getById, { id });
  const updateText = useMutation(api.todos.updateText);
  const toggle = useMutation(api.todos.toggle);

  const [text, setText] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (data) {
      setText(data.text);
      setCompleted(data.completed);
    }
  }, [data]);

  async function onSubmit() {
    if (!data) return;
    const ops: Promise<any>[] = [];
    const trimmed = text.trim();
    if (!trimmed) return toast.error("Vui lòng nhập nội dung");
    if (trimmed !== data.text) ops.push(updateText({ id: data._id, text: trimmed }));
    if (completed !== data.completed) ops.push(toggle({ id: data._id, completed }));
    if (ops.length === 0) return toast.message("Không có thay đổi");
    await Promise.all(ops);
    toast.success("Cập nhật thành công");
    router.push("/admin/todos");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Sửa công việc</h1>
      <Card className="p-4 space-y-4">
        {data === undefined ? (
          <div className="text-muted-foreground">Đang tải...</div>
        ) : !data ? (
          <div className="text-red-600">Không tìm thấy công việc</div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm" htmlFor="text">Nội dung</label>
              <Input id="text" value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="completed" checked={completed} onCheckedChange={(v) => setCompleted(Boolean(v))} />
              <label htmlFor="completed">Đã hoàn thành</label>
            </div>
            <div className="flex gap-2">
              <Button onClick={onSubmit}>Lưu</Button>
              <Button variant="secondary" onClick={() => router.back()}>Hủy</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

