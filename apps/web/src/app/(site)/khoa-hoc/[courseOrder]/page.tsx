import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@dohy/backend/convex/_generated/api";

type PageParams = Promise<{ courseOrder: string }>;

type CourseDetailResult = Awaited<ReturnType<typeof loadCourseDetail>>;

export const dynamic = "force-dynamic";

async function loadCourseDetail(order: number) {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.warn("Khong tim thay CONVEX_URL de tai chi tiet khoa hoc");
    return {
      convexUrl: null as string | null,
      list: [] as Array<{ order: number }>,
      course: null,
      detail: null,
      reason: "MISSING_CONVEX_URL",
    };
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const list = await client.query(api.courses.listCourses, { includeInactive: true });
    const course = list.find((item) => item.order === order) ?? null;

    let detail: Awaited<ReturnType<typeof client.query<typeof api.courses.getCourseDetail>>> | null = null;
    let reason: string | null = null;

    if (course) {
      try {
        detail = await client.query(api.courses.getCourseDetail, {
          id: course._id,
          includeInactive: true,
        });
        if (!detail) {
          reason = "DETAIL_NULL";
        }
      } catch (error) {
        console.error("Khong the tai chi tiet khoa hoc", error);
        reason = error instanceof Error ? error.message : "UNKNOWN_DETAIL_ERROR";
      }
    } else {
      reason = "COURSE_BY_ORDER_NOT_FOUND";
    }

    return {
      convexUrl,
      list,
      course,
      detail,
      reason,
    };
  } catch (error) {
    console.error("Khong the tai danh sach khoa hoc", error);
    return {
      convexUrl,
      list: [] as Array<{ order: number }>,
      course: null,
      detail: null,
      reason: error instanceof Error ? error.message : "UNKNOWN_LIST_ERROR",
    };
  }
}

export default async function CourseDetailPage({ params }: { params: PageParams }) {
  const { courseOrder } = await params;
  const numericOrder = Number(courseOrder);
  if (!Number.isFinite(numericOrder)) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 space-y-6">
        <Link href="/khoa-hoc" className="text-sm text-primary hover:underline">
          &larr; Quay lại danh sách
        </Link>
        <section className="rounded-lg border border-border bg-background p-4">
          <h1 className="text-lg font-semibold">Order không hợp lệ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tham số `{courseOrder}` không thể chuyển thành số. Vui lòng kiểm tra lại đường dẫn.
          </p>
        </section>
      </main>
    );
  }

  const result: CourseDetailResult = await loadCourseDetail(numericOrder);
  const payload = {
    course: result.detail?.course ?? null,
    chapters: result.detail?.chapters ?? [],
    debug: {
      reason: result.reason,
      convexUrl: result.convexUrl,
      matchedCourse: result.course,
      availableOrders: result.list.map((item) => item.order),
    },
  };
  const json = JSON.stringify(payload, null, 2);

  const title = result.course?.title ?? `Khóa học order ${numericOrder}`;

  return (
    <main className="mx-auto max-w-4xl px-4 pt-32 md:pt-36 lg:pt-40 pb-16 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Đường dẫn đang sử dụng Order = {numericOrder}. Trạng thái:{" "}
            {result.detail ? "Đã tải dữ liệu chi tiết" : "Không tìm thấy chi tiết, xem mục debug bên dưới"}.
          </p>
        </div>
        <Link href="/khoa-hoc" className="text-sm text-primary hover:underline">
          &larr; Quay lại danh sách
        </Link>
      </div>
      <section className="rounded-lg border border-border bg-background p-4">
        <header className="mb-3">
          <h2 className="text-lg font-semibold">Dữ liệu khóa học (JSON)</h2>
          <p className="text-xs text-muted-foreground">
            Toàn bộ dữ liệu trả về từ Convex cho khóa học này kèm thông tin debug (order, lý do, danh sách order hiện có).
          </p>
        </header>
        <pre className="whitespace-pre-wrap break-words rounded bg-muted/60 p-4 text-[13px] leading-relaxed">
{json}
        </pre>
      </section>
    </main>
  );
}
