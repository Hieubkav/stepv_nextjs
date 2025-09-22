"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@dohy/backend/convex/_generated/api";
import type { Id } from "@dohy/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";

const toLower = (value: string | undefined | null) =>
  (value ?? "").toString().toLowerCase();

type StudentDoc = {
  _id: Id<"students">;
  account: string;
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  order: number;
  active: boolean;
};

export default function StudentsListPage() {
  const [search, setSearch] = useState("");
  const students = useQuery(api.students.listStudents, {
    search: search.trim() ? search : undefined,
  }) as StudentDoc[] | undefined;
  const updateStudent = useMutation(api.students.updateStudent);
  const setStudentActive = useMutation(api.students.setStudentActive);
  const reorderStudents = useMutation(api.students.reorderStudents);
  const deleteStudent = useMutation(api.students.deleteStudent);

  const sorted = useMemo(() => {
    if (!students) return [] as StudentDoc[];
    return [...students].sort((a, b) => a.order - b.order);
  }, [students]);

  async function toggleActive(student: StudentDoc) {
    try {
      await setStudentActive({ id: student._id, active: !student.active });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể cập nhật trạng thái");
    }
  }

  async function swapOrder(current: StudentDoc, target: StudentDoc) {
    try {
      await updateStudent({ id: current._id, order: target.order });
      await updateStudent({ id: target._id, order: current.order });
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể đổi thứ tự");
    }
  }

  async function remove(student: StudentDoc) {
    if (!window.confirm(`Xóa học viên "${student.fullName}"?`)) return;
    try {
      const result = await deleteStudent({ id: student._id });
      if (!result?.ok) {
        toast.error("Không thể xóa học viên");
        return;
      }
      toast.success("Đã xóa học viên");
    } catch (error: any) {
      toast.error(error?.message ?? "Không thể xóa học viên");
    }
  }

  async function handleReorder(direction: "up" | "down", student: StudentDoc) {
    const index = sorted.findIndex((item) => item._id === student._id);
    if (index === -1) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sorted.length) return;
    await swapOrder(student, sorted[nextIndex]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Học viên</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý account học viên + thông tin liên hệ, phục vụ cấp quyền khóa học.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <Input
            placeholder="Tìm kiếm tên, email, tags..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:w-72"
          />
          <Button asChild>
            <Link href="/dashboard/students/new">
              <Plus className="mr-2 size-4" />
              Thêm học viên
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!students && <div className="text-sm text-muted-foreground">Đang tải...</div>}
          {students && sorted.length === 0 && (
            <div className="text-sm text-muted-foreground">Chưa có học viên nào.</div>
          )}
          {students && sorted.length > 0 && (
            <div className="space-y-3">
              {sorted.map((student, index) => (
                <div
                  key={String(student._id)}
                  className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{student.fullName}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        account: {student.account}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        order #{student.order}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                        {student.active ? "active" : "inactive"}
                      </span>
                    </div>
                    {student.email && (
                      <div className="text-xs text-muted-foreground">Email: {student.email}</div>
                    )}
                    {student.phone && (
                      <div className="text-xs text-muted-foreground">Phone: {student.phone}</div>
                    )}
                    {student.tags && student.tags.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Tags: {student.tags.map((tag) => `#${tag}`).join(" ")}
                      </div>
                    )}
                    {student.notes && (
                      <div className="text-xs text-muted-foreground">Ghi chú: {student.notes}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <Checkbox checked={student.active} onCheckedChange={() => toggleActive(student)} />
                      <span>{student.active ? "Đang hoạt động" : "Đang khóa"}</span>
                    </label>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/students/${student._id}/edit`}>
                        <Pencil className="mr-2 size-4" />
                        Sửa
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleReorder("up", student)}
                      disabled={index === 0}
                      title="Lên"
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleReorder("down", student)}
                      disabled={index === sorted.length - 1}
                      title="Xuống"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => remove(student)} title="Xóa">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
