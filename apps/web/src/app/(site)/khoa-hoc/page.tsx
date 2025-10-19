import Link from "next/link";
import type { Route } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@dohy/backend/convex/_generated/api";

type CourseListItem = Awaited<ReturnType<typeof loadCourses>>[number];

export const dynamic = "force-dynamic";

async function loadCourses() {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.warn("Khong tim thay CONVEX_URL de tai danh sach khoa hoc");
    return [];
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const courses = await client.query(api.courses.listCourses, { includeInactive: true });
    return courses.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Khong the tai danh sach khoa hoc", error);
    return [];
  }
}

function renderRow(course: CourseListItem, index: number) {
  const detailHref = `/khoa-hoc/${course.order}` as Route;
  return (
    <tr key={String(course._id)} className="border-b border-border text-sm last:border-none">
      <td className="px-3 py-2 text-center text-muted-foreground">{index + 1}</td>
      <td className="px-3 py-2 font-medium">
        <Link href={detailHref} className="text-primary hover:underline">
          {course.title}
        </Link>
      </td>
      <td className="px-3 py-2 text-muted-foreground">{course.subtitle ?? "—"}</td>
      <td className="px-3 py-2 text-center">{course.order}</td>
      <td className="px-3 py-2 text-center">{course.active ? "Đang mở" : "Đã ẩn"}</td>
      <td className="px-3 py-2 text-center">
        <Link
          href={detailHref}
          className="inline-flex items-center justify-center rounded border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10"
        >
          Mở chi tiết
        </Link>
      </td>
    </tr>
  );
}

export default async function KhoaHocPage() {
  const courses = await loadCourses();

  return (
    <main className="mx-auto max-w-4xl px-4 pt-32 md:pt-36 lg:pt-40 pb-16">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Danh sách khóa học</h1>
        <p className="text-sm text-muted-foreground">
          Chọn khóa học bên dưới để xem chi tiết. Thứ tự đường dẫn dùng giá trị cột Order (số).
        </p>
      </header>
      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-center">#</th>
              <th className="px-3 py-2">Khóa học</th>
              <th className="px-3 py-2">Mô tả ngắn</th>
              <th className="px-3 py-2 text-center">Order</th>
              <th className="px-3 py-2 text-center">Trạng thái</th>
              <th className="px-3 py-2 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Chưa có khóa học nào được hiển thị.
                </td>
              </tr>
            ) : (
              courses.map(renderRow)
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
