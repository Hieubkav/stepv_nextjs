"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminTodosNewPage() {
  const [text, setText] = useState("");
  const create = useMutation(api.todos.create);
  const router = useRouter();

  async function onSubmit() {
    const value = text.trim();
    if (!value) return toast.error("Vui lòng nhập nội dung");
    await create({ text: value });
    toast.success("Tạo công việc thành công");
    router.push("/admin/todos");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Thêm công việc</h1>
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm" htmlFor="text">Nội dung</label>
          <Input id="text" placeholder="Nhập nội dung công việc" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSubmit()} />
        </div>
        <div className="flex gap-2">
          <Button onClick={onSubmit}>Lưu</Button>
          <Button variant="secondary" onClick={() => router.back()}>Hủy</Button>
        </div>
      </Card>
    </div>
  );
}

